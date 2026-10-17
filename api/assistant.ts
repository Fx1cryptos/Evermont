import OpenAI from 'openai'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const systemPrompt = `You are EVERMONT Assistant for the public Evermont Credit Union website. Answer only general questions about public website content and navigation. Never access or claim access to member accounts, private data, balances, transactions, applications, or internal systems. Do not provide personalized financial, tax, legal, investment, lending, or credit advice. Do not invent rates, fees, eligibility, guarantees, regulatory status, or product availability. If current terms are requested, direct the visitor to Contact Support. Keep responses concise and helpful.`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const question = typeof req.body?.question === 'string' ? req.body.question.trim() : ''
  if (!question || question.length > 1000) return res.status(400).json({ error: 'Please provide a question under 1,000 characters.' })
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: 'Assistant is temporarily unavailable.' })

  try {
    const response = await client.responses.create({
      model: 'gpt-4o-mini',
      instructions: systemPrompt,
      input: question,
      max_output_tokens: 220,
    })
    return res.status(200).json({ answer: response.output_text })
  } catch (error) {
    console.error('[v0] Assistant request failed', error)
    return res.status(502).json({ error: 'Assistant is temporarily unavailable. Please contact support for current details.' })
  }
}
