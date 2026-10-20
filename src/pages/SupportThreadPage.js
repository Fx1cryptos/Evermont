import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { PortalShell } from '@/components/member/PortalShell';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/constants/routes';
import { supabase } from '@/lib/supabase';
import { supportService } from '@/services/supportService';
export const SupportThreadPage = () => {
    const { user } = useAuth();
    const { id = '' } = useParams();
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [body, setBody] = useState('');
    const [error, setError] = useState('');
    const [sending, setSending] = useState(false);
    const load = async () => { if (!user || !id)
        return; const [conversationResult, messageResult] = await Promise.all([supportService.getConversation(user.id, id), supportService.listMessages(user.id, id)]); if (conversationResult.error || messageResult.error)
        setError('We could not load this conversation.');
    else {
        setConversation(conversationResult.data);
        setMessages(messageResult.data);
    } };
    useEffect(() => { void load(); if (!id)
        return; const channel = supabase.channel(`support-${id}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `conversation_id=eq.${id}` }, () => { void load(); }).subscribe(); return () => { void supabase.removeChannel(channel); }; }, [user, id]);
    const send = async (event) => { event.preventDefault(); if (!user || !id || !body.trim())
        return; setSending(true); const result = await supportService.sendMessage(user.id, id, body); setSending(false); if (result.error)
        setError('Message could not be sent.');
    else {
        setBody('');
        await load();
    } };
    return _jsxs(PortalShell, { title: conversation?.subject || 'Support conversation', eyebrow: "Member support", children: [_jsxs(Link, { to: ROUTES.SUPPORT, className: "mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0504AA]", children: [_jsx(ArrowLeft, { className: "size-4" }), "All conversations"] }), error && _jsx("p", { role: "alert", className: "mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700", children: error }), _jsxs("section", { className: "mt-5 flex min-h-[420px] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm", children: [_jsx("div", { className: "flex-1 space-y-4 p-5 sm:p-8", children: messages.map(message => _jsx("div", { className: `flex ${message.sender_role === 'member' ? 'justify-end' : 'justify-start'}`, children: _jsxs("div", { className: `max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.sender_role === 'member' ? 'bg-[#0504AA] text-white' : 'bg-slate-100 text-[#101533]'}`, children: [_jsx("p", { className: "mb-1 text-[11px] font-bold uppercase tracking-wider opacity-70", children: message.sender_role === 'member' ? 'You' : 'Evermont Support' }), message.body, _jsx("p", { className: "mt-2 text-[10px] opacity-60", children: new Date(message.created_at).toLocaleString() })] }) }, message.id)) }), _jsxs("form", { onSubmit: send, className: "flex gap-3 border-t border-slate-100 p-4", children: [_jsx("textarea", { value: body, onChange: e => setBody(e.target.value), rows: 2, maxLength: 4000, required: true, placeholder: "Write a secure message...", "aria-label": "Message", className: "min-w-0 flex-1 resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#0504AA]" }), _jsx("button", { disabled: sending, "aria-label": "Send message", className: "self-end rounded-xl bg-[#0504AA] p-3 text-white disabled:opacity-60", children: _jsx(Send, { className: "size-5" }) })] })] })] });
};
export default SupportThreadPage;
