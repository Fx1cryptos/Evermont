import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle, Clock3, CreditCard, MessageCircle, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PortalShell } from '@/components/member/PortalShell';
import { useAuth } from '@/contexts/AuthContext';
import { useActivationGate } from '@/hooks/useActivationGate';
import { accountService } from '@/services/accountService';
import { activationService } from '@/services/activationService';
import { ROUTES } from '@/constants/routes';
const money = (value, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(value) || 0);
const statusStyles = {
    pending: 'bg-amber-50 text-amber-700', processing: 'bg-blue-50 text-blue-700', succeeded: 'bg-emerald-50 text-emerald-700', failed: 'bg-red-50 text-red-700', refunded: 'bg-slate-100 text-slate-700',
};
const statusLabel = (status) => status.charAt(0).toUpperCase() + status.slice(1);
export const ActivationPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const availableBalance = useMemo(() => accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0), [accounts]);
    const { check } = useActivationGate(user?.id, availableBalance);
    const [activation, setActivation] = useState({ activated: false, fee: null, ratePercent: null });
    useEffect(() => {
        if (!user)
            return;
        let active = true;
        const load = async () => {
            setLoading(true);
            const [accountResult, paymentResult] = await Promise.all([accountService.getAccounts(user.id), activationService.listPaymentHistory(user.id)]);
            const status = await check();
            if (!active)
                return;
            setAccounts(accountResult);
            setPayments(paymentResult.data);
            setActivation(status);
            if (paymentResult.error)
                setError('We could not load your payment history.');
            setLoading(false);
        };
        void load();
        return () => { active = false; };
    }, [user, check]);
    return _jsxs(PortalShell, { title: "Activation & upgrade", eyebrow: "Account security", children: [_jsxs("div", { className: "mt-7 grid gap-6 lg:grid-cols-[1fr_320px]", children: [_jsxs("section", { className: "rounded-2xl border border-[#C9A227]/50 bg-white p-6 shadow-sm sm:p-8", children: [_jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-bold uppercase tracking-[.18em] text-[#C9A227]", children: "Current status" }), _jsx("h2", { className: "mt-2 text-2xl font-semibold text-[#0504AA]", children: activation.activated ? 'Activated' : 'Activation required' })] }), _jsx("div", { className: "rounded-2xl bg-[#0504AA]/10 p-3 text-[#0504AA]", children: activation.activated ? _jsx(CheckCircle, { className: "size-6" }) : _jsx(ShieldCheck, { className: "size-6" }) })] }), _jsx("p", { className: "mt-4 text-sm leading-6 text-slate-600", children: activation.activated ? 'Your member account is activated. Payment history remains available below.' : 'Contact Evermont Support to confirm the secure activation process for your account.' }), !activation.activated && activation.fee !== null && _jsxs("div", { className: "mt-6 rounded-2xl bg-[#fffaf0] p-5", children: [_jsx("p", { className: "text-sm font-semibold text-slate-600", children: "Calculated activation fee" }), _jsx("p", { className: "mt-1 text-3xl font-semibold text-[#0504AA]", children: money(activation.fee) }), activation.ratePercent !== null && _jsxs("p", { className: "mt-1 text-xs text-slate-500", children: ["Calculated at ", activation.ratePercent, "% of available balance."] })] }), _jsxs("div", { className: "mt-6 flex flex-col gap-3 sm:flex-row", children: [_jsxs("button", { type: "button", onClick: () => navigate(ROUTES.SUPPORT), className: "inline-flex items-center justify-center gap-2 rounded-xl bg-[#0504AA] px-5 py-3 text-sm font-semibold text-white shadow-sm", children: [_jsx(MessageCircle, { className: "size-4" }), "Contact Support about Activation"] }), _jsxs(Link, { to: ROUTES.ACCOUNTS, className: "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700", children: [_jsx(ArrowLeft, { className: "size-4" }), "Back to Accounts"] })] })] }), _jsxs("aside", { className: "rounded-2xl bg-[#0504AA] p-6 text-white shadow-sm", children: [_jsx(CreditCard, { className: "size-6 text-[#C9A227]" }), _jsx("h2", { className: "mt-5 text-lg font-semibold", children: "Secure payment history" }), _jsx("p", { className: "mt-2 text-sm leading-6 text-blue-100", children: "Only recorded payment attempts for your member account are shown. No payment can be initiated from this page." })] })] }), _jsxs("section", { className: "mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm", children: [_jsxs("div", { className: "border-b border-slate-100 px-6 py-5 sm:px-8", children: [_jsx("h2", { className: "text-xl font-semibold text-[#0504AA]", children: "Payment history" }), _jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Activation payment attempts associated with your account." })] }), loading ? _jsx("p", { className: "p-6 text-sm text-slate-500", children: "Loading payment history..." }) : error ? _jsx("p", { role: "alert", className: "p-6 text-sm text-red-700", children: error }) : payments.length === 0 ? _jsxs("div", { className: "p-10 text-center", children: [_jsx(Clock3, { className: "mx-auto size-8 text-slate-300" }), _jsx("p", { className: "mt-3 text-sm font-semibold text-slate-700", children: "No payment records yet" }), _jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Your activation payment attempts will appear here." })] }) : _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full min-w-[680px] text-left text-sm", children: [_jsx("thead", { className: "bg-slate-50 text-xs uppercase tracking-wider text-slate-500", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-4 font-semibold", children: "Date" }), _jsx("th", { className: "px-6 py-4 font-semibold", children: "Amount" }), _jsx("th", { className: "px-6 py-4 font-semibold", children: "Method" }), _jsx("th", { className: "px-6 py-4 font-semibold", children: "Reference" }), _jsx("th", { className: "px-6 py-4 font-semibold", children: "Status" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: payments.map(payment => _jsxs("tr", { children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-slate-600", children: new Date(payment.created_at).toLocaleDateString() }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap font-semibold text-[#101533]", children: money(payment.amount, payment.currency) }), _jsx("td", { className: "px-6 py-4 text-slate-600", children: payment.payment_method || '—' }), _jsx("td", { className: "px-6 py-4 font-mono text-xs text-slate-500", children: payment.payment_reference || '—' }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: `inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[payment.status] || statusStyles.pending}`, children: statusLabel(payment.status) }) })] }, payment.id)) })] }) })] })] });
};
export default ActivationPage;
