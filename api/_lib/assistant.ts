import { isHumanComplaint } from '../../shared/supportCategories.js'
import type { SupabaseClient } from '@supabase/supabase-js'

// The provider only receives topic labels. Only the reviewed answer strings below can reach a member.
const knowledge = {
  login: 'Use Member Sign In with your existing email. Choose Forgot Password if you need a recovery link.',
  beneficiaries: 'Open Beneficiaries in the banking menu to view recipients linked to your membership.',
  navigation: 'Use the member sidebar or mobile menu for accounts, transaction history, activation and support.',
  activation:
    'Open Activation in your member portal to review your verification status and payment history. A support agent can review an outstanding requirement.',
  statements: 'Open Statements to view the documents available for your accounts.',
  security:
    'Open Profile & Security to manage your sign-in settings. Never share a password, PIN, card security code, or sign-in code in chat.',
  transactions:
    'Open Transaction History for activity returned for your accounts. For help with a specific entry, request a human agent.',
  human: 'A member support agent can review this question. Use Request a human to continue with the team.',
}
export async function approvedAnswer(messages: string[]): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY
  const model = process.env.GEMINI_MODEL
  if (!key || !model || !/^gemini-[a-z0-9.-]+$/.test(model)) return null
  const signals = messages.map((message) =>
    Object.keys(knowledge).filter((topic) => message.toLowerCase().includes(topic.replace(/s$/, ''))),
  )
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
                    JSON.stringify(signals) +
                    '. If ambiguous or empty select human.',
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0,
            responseMimeType: 'text/x.enum',
            responseSchema: { type: 'STRING', enum: Object.keys(knowledge) },
          },
        }),
        signal: AbortSignal.timeout(6000),
      },
    )
    if (!response.ok) return null
    const answer = (await response.json()).candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    return typeof answer === 'string' &&
      Object.prototype.hasOwnProperty.call(knowledge, answer) &&
      (answer === 'human' || signals[signals.length - 1]?.includes(answer))
      ? knowledge[answer as keyof typeof knowledge]
      : knowledge.human
  } catch {
    return null
  }
}

export async function assistMember(client: SupabaseClient, ticket: string, member: string) {
  const { data: conversation, error } = await client
    .from('support_conversations')
    .select('id,human_requested,status,assigned_to,subject')
    .eq('id', ticket)
    .eq('user_id', member)
    .maybeSingle()
  if (
    error ||
    !conversation ||
    isHumanComplaint(conversation.subject) ||
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
  if (readError || turns?.[0]?.sender_role !== 'member') return false
  if (!process.env.GEMINI_API_KEY || !process.env.GEMINI_MODEL) {
    await client.from('support_conversations').update({human_requested:true,status:'pending_support'})
      .eq('id',ticket).eq('user_id',member).is('assigned_to',null).not('status','in','(resolved,closed)')
    return false
  }
  const claim = await client.rpc('claim_support_assistant', {
    p_ticket: ticket,
    p_member: member,
    p_message: turns[0].id,
  })
  if (claim.error || claim.data !== true) return false
  const answer = await approvedAnswer(
    turns
      .filter((turn) => turn.sender_role === 'member')
      .reverse()
      .map((turn) => String(turn.body)),
  )
  if (!answer || answer === knowledge.human) {
    await client.from('support_conversations').update({human_requested:true,status:'pending_support'})
      .eq('id',ticket).eq('user_id',member).is('assigned_to',null).not('status','in','(resolved,closed)')
    return false
  }
  const result = await client.rpc('complete_support_assistant', {
    p_ticket: ticket,
    p_member: member,
    p_message: turns[0].id,
    p_body: answer,
  })
  return !result.error && result.data === true
}
