import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { PortalShell, SupportCard } from '@/components/member/PortalShell';
import { useAuth } from '@/contexts/AuthContext';
export const SettingsPage = () => { const { updatePassword } = useAuth(); const [next, setNext] = useState(''); const [confirm, setConfirm] = useState(''); const [message, setMessage] = useState(''); const [saving, setSaving] = useState(false); const submit = async (event) => { event.preventDefault(); setMessage(''); if (next.length < 8)
    return setMessage('Your new password must be at least 8 characters.'); if (next !== confirm)
    return setMessage('New passwords do not match.'); setSaving(true); try {
    await updatePassword('', next);
    setMessage('Password updated successfully.');
    setNext('');
    setConfirm('');
}
catch {
    setMessage('We could not update your password. Please verify your current session and try again.');
}
finally {
    setSaving(false);
} }; return _jsx(PortalShell, { title: "Settings", eyebrow: "Preferences and security", children: _jsxs("div", { className: "mt-7 grid gap-5 lg:grid-cols-[1fr_320px]", children: [_jsxs("div", { className: "space-y-5", children: [_jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "rounded-xl bg-blue-50 p-3 text-[#0504AA]", children: _jsx(LockKeyhole, { className: "size-5" }) }), _jsxs("div", { children: [_jsx("h2", { className: "font-semibold", children: "Change password" }), _jsx("p", { className: "text-sm text-slate-500", children: "Use a unique password to keep your member account secure." })] })] }), _jsxs("form", { onSubmit: submit, className: "mt-6 grid gap-4 sm:max-w-lg", children: [_jsxs("label", { className: "text-sm font-semibold", children: ["New password", _jsx("input", { required: true, type: "password", value: next, onChange: event => setNext(event.target.value), className: "mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-[#0504AA]" })] }), _jsxs("label", { className: "text-sm font-semibold", children: ["Confirm new password", _jsx("input", { required: true, type: "password", value: confirm, onChange: event => setConfirm(event.target.value), className: "mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-[#0504AA]" })] }), message && _jsx("p", { role: "status", className: "rounded-xl bg-slate-50 p-3 text-sm text-slate-700", children: message }), _jsx("button", { disabled: saving, className: "w-fit rounded-xl bg-[#0504AA] px-5 py-3 font-semibold text-white disabled:opacity-60", children: saving ? 'Updating...' : 'Update password' })] })] }), _jsx("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(ShieldCheck, { className: "mt-0.5 size-5 text-[#0504AA]" }), _jsxs("div", { children: [_jsx("h2", { className: "font-semibold", children: "Account security" }), _jsx("p", { className: "mt-1 text-sm leading-6 text-slate-500", children: "Your session and member records are managed through the existing Supabase Auth integration." })] })] }) })] }), _jsx(SupportCard, {})] }) }); };
