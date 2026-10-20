import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Plus } from 'lucide-react';
import { PortalShell } from '@/components/member/PortalShell';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/constants/routes';
import { supportService } from '@/services/supportService';
const labels = { open: 'Open', pending_support: 'Pending Support', resolved: 'Resolved', closed: 'Closed' };
export const SupportPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [creating, setCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');
    const load = async () => { if (!user)
        return; const result = await supportService.listConversations(user.id); if (result.error)
        setError('We could not load your conversations.');
    else
        setRows(result.data); };
    useEffect(() => { void load(); }, [user]);
    const create = async (event) => { event.preventDefault(); if (!user || !subject.trim() || !body.trim())
        return; setCreating(true); setError(''); const result = await supportService.createConversation(user.id, subject, body); setCreating(false); if (result.error || !result.data) {
        setError('We could not start your conversation.');
        return;
    } ; navigate(`${ROUTES.SUPPORT}/${result.data.id}`); };
    return _jsxs(PortalShell, { title: "Member support", eyebrow: "Help when you need it", children: [_jsxs("div", { className: "mt-7 flex items-center justify-between gap-4", children: [_jsx("p", { className: "max-w-2xl text-slate-600", children: "Private, secure conversations with the Evermont Support team." }), _jsxs("button", { type: "button", onClick: () => setShowForm(!showForm), className: "inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#0504AA] px-4 py-3 text-sm font-semibold text-white shadow-sm", children: [_jsx(Plus, { className: "size-4" }), "New conversation"] })] }), showForm && _jsxs("form", { onSubmit: create, className: "mt-6 rounded-2xl border border-[#C9A227]/50 bg-white p-6 shadow-sm", children: [_jsx("h2", { className: "text-lg font-semibold text-[#0504AA]", children: "Start a conversation" }), _jsxs("div", { className: "mt-4 grid gap-4", children: [_jsx("input", { value: subject, onChange: e => setSubject(e.target.value), required: true, maxLength: 120, placeholder: "Subject", "aria-label": "Subject", className: "rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#0504AA]" }), _jsx("textarea", { value: body, onChange: e => setBody(e.target.value), required: true, maxLength: 4000, placeholder: "How can we help?", "aria-label": "First message", rows: 5, className: "rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#0504AA]" }), _jsx("button", { disabled: creating, className: "w-fit rounded-xl bg-[#0504AA] px-5 py-3 font-semibold text-white disabled:opacity-60", children: creating ? 'Starting...' : 'Send to Support' })] })] }), error && _jsx("p", { role: "alert", className: "mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700", children: error }), _jsx("section", { className: "mt-7 grid gap-3", children: rows.length ? rows.map(row => _jsx(Link, { to: `${ROUTES.SUPPORT}/${row.id}`, className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#C9A227]", children: _jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "font-semibold text-[#101533]", children: row.subject }), _jsxs("p", { className: "mt-1 text-xs text-slate-500", children: ["Updated ", new Date(row.updated_at).toLocaleString()] })] }), _jsx("span", { className: "rounded-full bg-[#0504AA]/10 px-3 py-1 text-xs font-semibold text-[#0504AA]", children: labels[row.status] || 'Open' })] }) }, row.id)) : _jsxs("div", { className: "rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center", children: [_jsx(MessageCircle, { className: "mx-auto size-9 text-[#C9A227]" }), _jsx("h2", { className: "mt-4 text-xl font-semibold text-[#0504AA]", children: "Your support inbox is ready" }), _jsx("p", { className: "mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600", children: "Start a private conversation and our support team will help you with your member experience." })] }) })] });
};
export default SupportPage;
