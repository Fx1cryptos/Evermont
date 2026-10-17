import React, { useState } from 'react'
import { Bot, X, Send, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

type Message = { role: 'user' | 'assistant'; text: string }

const initialMessage: Message = { role: 'assistant', text: 'Hi, I’m EVERMONT Assistant. I can help you navigate public product information. This is an AI assistant, not a financial advisor.' }

export const EvermontAssistant: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([initialMessage])

  const send = async () => {
    const question = input.trim()
    if (!question || loading) return
    setMessages(current => [...current, { role: 'user', text: question }])
    setInput('')
    setLoading(true)
    try {
      const response = await fetch('/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question }) })
      const payload = await response.json()
      setMessages(current => [...current, { role: 'assistant', text: response.ok ? payload.answer : payload.error }])
    } catch {
      setMessages(current => [...current, { role: 'assistant', text: 'Assistant is temporarily unavailable. Please contact support for current details.' }])
    } finally {
      setLoading(false)
    }
  }

  return <div className="fixed bottom-5 right-5 z-50">
    <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? 'Close EVERMONT Assistant' : 'Open EVERMONT Assistant'} className="flex size-14 items-center justify-center rounded-full bg-[#0504AA] text-white shadow-xl">{open ? <X /> : <Bot />}</button>
    {open && <div className="absolute bottom-16 right-0 flex h-[min(520px,calc(100vh-110px))] w-[min(360px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
      <div className="bg-[#101533] p-4 text-white"><p className="font-semibold">EVERMONT Assistant</p><p className="mt-1 text-xs text-slate-300">AI assistant · public information only</p></div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`rounded-xl p-3 text-sm leading-6 ${message.role === 'user' ? 'ml-8 bg-[#edf1ff]' : 'mr-4 bg-slate-100'}`}>{message.text}</div>)}{loading && <div className="mr-4 rounded-xl bg-slate-100 p-3 text-sm text-slate-500">Thinking…</div>}<Link to="/banking/private-savings" className="inline-flex items-center gap-2 text-xs font-semibold text-[#0504AA]">Explore savings <ArrowRight className="size-3" /></Link></div>
      <form onSubmit={event => { event.preventDefault(); void send() }} className="flex gap-2 border-t border-slate-200 p-3"><input value={input} onChange={event => setInput(event.target.value)} placeholder="Ask about public information" aria-label="Ask EVERMONT Assistant" maxLength={1000} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0504AA]" /><button type="submit" disabled={loading || !input.trim()} aria-label="Send question" className="rounded-xl bg-[#0504AA] px-3 text-white disabled:opacity-50"><Send className="size-4" /></button></form>
    </div>}
  </div>
}
