import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { PageMeta } from '@/components/PageMeta';
const initialForm = { fullName: '', phone: '', dateOfBirth: '', address: '', city: '', state: '', zipCode: '', ssn: '', email: '', password: '' };
export const OpenCheckingPage = () => {
    const [form, setForm] = useState(initialForm);
    const [governmentId, setGovernmentId] = useState(null);
    const [proofOfAddress, setProofOfAddress] = useState(null);
    const [status, setStatus] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
    const handleSubmit = async (event) => {
        event.preventDefault();
        setStatus(null);
        setError(null);
        if (!governmentId || !proofOfAddress) {
            setError('Please provide both requested verification documents.');
            return;
        }
        if (form.password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        setLoading(true);
        try {
            const { data, error: authError } = await supabase.auth.signUp({ email: form.email.trim().toLowerCase(), password: form.password, options: { data: { full_name: form.fullName.trim() } } });
            if (authError || !data.user)
                throw new Error('We could not create your application. Please check your details and try again.');
            const userId = data.user.id;
            const { error: profileError } = await supabase.from('profiles').upsert({ id: userId, email: form.email.trim().toLowerCase(), full_name: form.fullName.trim(), phone_number: form.phone.trim(), date_of_birth: form.dateOfBirth || null, address: form.address.trim(), city: form.city.trim(), state: form.state.trim(), zip_code: form.zipCode.trim(), ssn: form.ssn.trim(), account_type: 'checking', verification_status: 'pending' }, { onConflict: 'id' });
            if (profileError)
                throw new Error('Your account was created, but we could not save the application details.');
            for (const [file, type] of [[governmentId, 'government-id'], [proofOfAddress, 'proof-of-address']]) {
                const path = `${userId}/${type}-${crypto.randomUUID()}-${file.name}`;
                const { error: uploadError } = await supabase.storage.from('verification-documents').upload(path, file, { upsert: false });
                if (uploadError)
                    throw new Error('Your details were saved, but a verification document could not be uploaded.');
                const { error: documentError } = await supabase.from('verification_documents').insert({ user_id: userId, document_type: type, file_path: path, status: 'pending' });
                if (documentError)
                    throw new Error('Your details were saved, but document verification could not be completed.');
            }
            setStatus(data.session ? 'Your checking account application was submitted.' : 'Your application was submitted. Check your email to confirm your account before signing in.');
            setForm(initialForm);
            setGovernmentId(null);
            setProofOfAddress(null);
        }
        catch (submissionError) {
            setError(submissionError instanceof Error ? submissionError.message : 'We could not submit your application.');
        }
        finally {
            setLoading(false);
        }
    };
    return _jsxs(_Fragment, { children: [_jsx(PageMeta, { title: "Open a Checking Account | Evermont Credit Union", description: "Apply for an Evermont checking account through a secure application designed to collect the information needed for account review." }), _jsxs("div", { className: "min-h-screen bg-[#f8fafc] text-[#101533]", children: [_jsx("header", { className: "sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur", children: _jsxs("div", { className: "mx-auto flex max-w-7xl items-center justify-between px-5 py-4", children: [_jsx(Link, { to: "/", className: "text-lg font-bold tracking-[-0.04em] text-[#0504AA]", children: "EVERMONT" }), _jsx(Link, { to: "https://v0-evermont.vercel.app/login", className: "text-sm font-semibold text-[#0504AA]", children: "Sign In" })] }) }), _jsxs("main", { className: "mx-auto max-w-4xl px-5 py-12 lg:py-20", children: [_jsxs("div", { className: "mb-10 max-w-2xl", children: [_jsx("p", { className: "text-sm font-bold uppercase tracking-[0.18em] text-[#C9A227]", children: "Open a checking account" }), _jsx("h1", { className: "mt-3 text-4xl font-semibold tracking-tight sm:text-5xl", children: "Start your Evermont application." }), _jsx("p", { className: "mt-5 leading-7 text-slate-600", children: "Complete the secure form below. We'll review your information and contact you about next steps." })] }), error && _jsx("div", { role: "alert", className: "mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700", children: error }), status && _jsx("div", { role: "status", className: "mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700", children: status }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10", children: [_jsxs("fieldset", { className: "grid gap-5 sm:grid-cols-2", children: [_jsx("legend", { className: "mb-4 text-xl font-semibold sm:col-span-2", children: "Your information" }), [['fullName', 'Full legal name'], ['phone', 'Phone number'], ['dateOfBirth', 'Date of birth'], ['address', 'Street address'], ['city', 'City'], ['state', 'State'], ['zipCode', 'ZIP code'], ['ssn', 'Social Security number']].map(([field, label]) => _jsxs("label", { className: "text-sm font-semibold text-slate-700", children: [label, _jsx("input", { required: true, type: field === 'dateOfBirth' ? 'date' : 'text', value: form[field], onChange: update(field), className: "mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal outline-none focus:border-[#0504AA]" })] }, field))] }), _jsxs("fieldset", { className: "grid gap-5 sm:grid-cols-2", children: [_jsx("legend", { className: "mb-4 text-xl font-semibold sm:col-span-2", children: "Secure access" }), _jsxs("label", { className: "text-sm font-semibold text-slate-700", children: ["Email", _jsx("input", { required: true, type: "email", value: form.email, onChange: update('email'), className: "mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal outline-none focus:border-[#0504AA]" })] }), _jsxs("label", { className: "text-sm font-semibold text-slate-700", children: ["Password", _jsx("input", { required: true, minLength: 8, type: "password", value: form.password, onChange: update('password'), className: "mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal outline-none focus:border-[#0504AA]" })] })] }), _jsxs("fieldset", { className: "grid gap-5 sm:grid-cols-2", children: [_jsx("legend", { className: "mb-4 text-xl font-semibold sm:col-span-2", children: "Verification documents" }), _jsxs("label", { className: "text-sm font-semibold text-slate-700", children: ["Government ID", _jsx("input", { required: true, type: "file", accept: "image/*,.pdf", onChange: (event) => setGovernmentId(event.target.files?.[0] ?? null), className: "mt-2 block w-full rounded-lg border border-slate-300 p-2 font-normal" })] }), _jsxs("label", { className: "text-sm font-semibold text-slate-700", children: ["Proof of address", _jsx("input", { required: true, type: "file", accept: "image/*,.pdf", onChange: (event) => setProofOfAddress(event.target.files?.[0] ?? null), className: "mt-2 block w-full rounded-lg border border-slate-300 p-2 font-normal" })] })] }), _jsx("button", { disabled: loading, className: "w-full rounded-full bg-[#0504AA] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0807c8] disabled:opacity-60", children: loading ? 'Submitting application...' : 'Submit application' }), _jsx("p", { className: "text-xs leading-5 text-slate-500", children: "Your documents are uploaded to the private verification-documents storage area and are not publicly listed." })] })] }), _jsx("footer", { className: "border-t border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500", children: _jsx("a", { href: "https://youtube.com/@evermontcreditunion?si=gYPXAQ9YUDMAiKL4", target: "_blank", rel: "noopener noreferrer", className: "font-semibold text-[#0504AA]", children: "Evermont on YouTube" }) })] })] });
};
export default OpenCheckingPage;
