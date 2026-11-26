import { isHumanComplaint } from '../../shared/supportCategories.js'
import type { SupabaseClient } from '@supabase/supabase-js'

export type Article = { topic: string; keywords: string; answer: string }
const human = 'A member support agent can review this question.'
export async function approvedAnswer(messages: string[], articles: Article[]): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY
  const model = process.env.GEMINI_MODEL
  if (!key || !model || !/^gemini-[a-z0-9.-]+$/.test(model)) return null
  // Treat stored article data as input too; malformed rows never reach Gemini or a member.
  articles = articles.filter(a => a && typeof a.topic === 'string' && a.topic !== 'human' &&
    /^[a-z][a-z0-9_-]{0,39}$/.test(a.topic) && typeof a.keywords === 'string' && a.keywords.trim() &&
    a.keywords.length <= 500 && typeof a.answer === 'string' && a.answer.trim() && a.answer.length <= 2000)
  const latest = messages[messages.length-1]?.toLowerCase() ?? ''
  if (/\b(fraud(?:ulent)?|disput(?:e|ed|ing)|stolen|lost|unauthori[sz]ed|compromised|scam(?:med)?|balance|urgent|overcharged|otp|pin|cvv|human|representative|charged|declined|disputed|refund|reversed|unrecognized|missing|unresolved|unsuccessful|failed)\b|\d{4,}/i.test(latest)) return human
  const signals = messages.map(message => articles.filter(article =>
    article.keywords.split(',').some(word => word.trim() && message.toLowerCase().includes(word.trim().toLowerCase()))
  ).map(article => article.topic))
  const current = signals[signals.length - 1] ?? []
  const followup = /^(where (is|can i find) (it|that)|how do i find (it|that)|tell me more)[?.! ]*$/i.test(latest.trim())
  const topics = current.length || !followup ? current : signals[signals.length - 2] ?? []
  const candidates = articles.filter(a => topics.includes(a.topic)).slice(0,8)
  if (!candidates.length) return human
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    'Select one help topic for the newest turn. Topics by turn (oldest first): ' +
                    JSON.stringify(signals) + '. Approved references: ' + JSON.stringify(candidates.map(a => [a.topic,a.answer])) +
                    '. If ambiguous or empty select human.',
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0,
            responseMimeType: 'text/x.enum',
            responseSchema: { type: 'STRING', enum: [...candidates.map(a=>a.topic),'human'] },
          },
        }),
        signal: AbortSignal.timeout(6000),
      },
    )
    if (!response.ok) return null
    const answer = (await response.json()).candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    return candidates.find(a => a.topic === answer)?.answer ?? human
  } catch {
    return null
  }
}

export async function assistMember(client: SupabaseClient, ticket: string, member: string, expectedMessage?: string) {
  const { data: conversation, error } = await client
    .from('support_conversations')
    .select('id,human_requested,status,assigned_to,subject,assistant_resumed')
    .eq('id', ticket)
    .eq('user_id', member)
    .maybeSingle()
  if (error) throw new Error('Could not read support conversation')
  if (
    !conversation ||
    (isHumanComplaint(conversation.subject) && !conversation.assistant_resumed) ||
    conversation.human_requested ||
    conversation.assigned_to ||
    ['resolved', 'closed'].includes(conversation.status)
  )
    return false
  const { data: turns, error: readError } = await client
    .from('support_messages')
    .select('id,body,sender_role')
    .eq('conversation_id', ticket)
    .eq('is_internal', false)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(5)
  if (readError) throw new Error('Could not read support messages')
  if (turns?.[0]?.sender_role !== 'member') return false
  if (expectedMessage && turns[0].id !== expectedMessage) return false
  const turn = {p_ticket:ticket,p_member:member,p_message:turns[0].id,p_lease:crypto.randomUUID()}
  const claim = await client.rpc('claim_support_assistant', turn)
  if (claim.error) throw new Error('Could not claim support turn')
  if (claim.data !== true) return false
  async function finish(body: string | null) {
    const result = await client.rpc('complete_support_assistant',{...turn,p_body:body})
    if (result.error) throw new Error('Could not persist support handling')
    return result.data === true && body !== null
  }
  if (!process.env.GEMINI_API_KEY || !process.env.GEMINI_MODEL) return finish(null)
  const articles = await client.from('support_knowledge_articles').select('topic,keywords,answer')
    .eq('published',true).order('topic')
  // This read-only support tool uses the conversation already verified against the JWT owner.
  // No financial records or member identifiers are sent to the model.
  const status = ({open:'Open',pending_support:'Awaiting human support',pending_member:'Waiting for member'} as Record<string,string>)[conversation.status]
  const refs = (articles.data ?? []).map(a => a?.topic === 'ticket_status' && status
    ? {...a,answer:a.answer + ' Current ticket status: ' + status + '.'} : a)
  const answer = articles.error ? null : await approvedAnswer(
    turns
      .filter((turn) => turn.sender_role === 'member')
      .reverse()
      .map((turn) => String(turn.body)), refs,
  )
  return finish(!answer || answer === human ? null : answer)
}

// A skipped turn (for example, a staff takeover) is a successful recovery scan.
export async function recoverExpiredSupportTurns(client: SupabaseClient): Promise<boolean> {
  const { data, error } = await client.rpc('expired_support_turns')
  if (error) return false

  let healthy = true
  for (const turn of data ?? []) {
    try {
      await assistMember(client, turn.ticket, turn.member, turn.message)
    } catch {
      healthy = false
    }
  }
  return healthy
}
