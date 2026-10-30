import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Bell, Building2, CreditCard, Eye, EyeOff, FileText, Headphones, Landmark, Menu, Receipt, Send, ShieldCheck, Smartphone, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ActivationRequiredModal } from '@/components/member/ActivationRequiredModal';
import { PortalShell } from '@/components/member/PortalShell';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/constants/routes';
import { accountService } from '@/services/accountService';
import { profileService } from '@/services/profileService';
import { supabase } from '@/lib/supabase';
import { useActivationGate } from '@/hooks/useActivationGate';
import { useNotifications } from '@/hooks/useNotifications';
const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0);
const Panel = ({ title, action, children }) => (_jsxs("section", { className: "overflow-hidden rounded-2xl border border-slate-200 bg-white", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-100 px-5 py-3.5", children: [_jsx("h2", { className: "text-sm font-semibold text-[#101533]", children: title }), action] }), children] }));
export const MemberDashboardPage = () => {
    const { user, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [rows, setRows] = useState([]);
    const [hidden, setHidden] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [gateOpen, setGateOpen] = useState(false);
    const [notice, setNotice] = useState('');
    const [gateResult, setGateResult] = useState({ activated: false, fee: null, ratePercent: null });
    const total = useMemo(() => accounts.reduce((sum, account) => sum + Number(account.balance), 0), [accounts]);
    const { check: checkActivation, checking } = useActivationGate(user?.id, total);
    const { unreadCount } = useNotifications(user?.id);
    useEffect(() => {
        if (!user)
            return;
        let active = true;
        void Promise.all([profileService.getProfile(user.id), accountService.getAccounts(user.id)]).then(async ([p, a]) => {
            if (!active)
                return;
            setProfile(p);
            setAccounts(a);
            const ids = a.map(account => account.id);
            if (!ids.length)
                return;
            const { data, error: queryError } = await supabase.from('ledger_entries').select('id,created_at,description,category,debit,credit,amount,status').eq('member_id', user.id).in('account_id', ids).order('created_at', { ascending: false }).limit(6);
            if (queryError)
                setError('We could not load recent activity.');
            else
                setRows((data || []));
        }).catch(() => setError('We could not load your member information.')).finally(() => { if (active)
            setLoading(false); });
        return () => { active = false; };
    }, [user]);
    useEffect(() => {
        if (!user || loading)
            return;
        void checkActivation().then(setGateResult);
    }, [user, loading, checkActivation]);
    const display = (value) => hidden ? '••••••' : money(value);
    const feeLine = gateResult.fee != null
        ? `An activation fee of ${money(gateResult.fee)} is required before transfers and certain services become available.`
        : 'An activation fee is required before transfers and certain services become available.';
    const memberName = [profile?.firstName || user?.firstName, profile?.lastName].filter(Boolean).join(' ');
    const requestMovement = () => {
        setNotice('');
        if (gateResult.activated) {
            setNotice('Transfer and withdraw are not available yet. This prototype does not move money.');
            return;
        }
        setGateOpen(true);
    };
    const services = [
        { label: 'Transfer', subtext: 'Requires activation', icon: Send, gated: true },
        { label: 'Withdraw', subtext: 'Requires activation', icon: WalletCards, gated: true },
        { label: 'ACH', subtext: 'Requires activation', icon: Building2, gated: true },
        { label: 'Mobile Deposit', subtext: 'Requires activation', icon: Smartphone, gated: true },
        { label: 'Check Deposit', subtext: 'Requires activation', icon: FileText, gated: true },
        { label: 'Mobile Debit', subtext: 'Requires activation', icon: CreditCard, gated: true },
        { label: 'Virtual Card', subtext: 'Requires activation', icon: WalletCards, gated: true },
        { label: 'Support', subtext: 'Message the team', icon: Headphones, to: ROUTES.SUPPORT },
        { label: 'Accounts', subtext: 'Open details', icon: Landmark, to: ROUTES.ACCOUNTS },
        { label: 'Activity', subtext: 'Full history', icon: Receipt, to: ROUTES.TRANSACTIONS },
    ];
    if (authLoading || loading)
        return _jsx("main", { className: "flex min-h-screen items-center justify-center bg-[#f6f7fb] text-sm text-slate-500", children: "Loading your member portal..." });
    if (!user)
        return _jsx("main", { className: "p-8", children: _jsx(Link, { to: ROUTES.LOGIN, children: "Sign in to member banking" }) });
    return _jsxs(PortalShell, { title: "Overview", eyebrow: memberName || 'Member', children: [_jsxs("div", { className: "mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_292px]", children: [_jsxs("div", { className: "order-2 space-y-5 lg:order-1", children: [_jsxs("section", { className: "overflow-hidden rounded-2xl border border-slate-200 bg-white", children: [_jsx("div", { className: "bg-[#0504AA] px-5 py-5 text-white sm:px-6", children: _jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[11px] font-semibold uppercase tracking-[.16em] text-[#C9A227]", children: "Total relationship balance" }), _jsx("p", { className: "mt-2 font-semibold tabular-nums tracking-tight text-3xl sm:text-4xl", children: hidden ? '••••••' : money(total) }), _jsx("p", { className: "mt-2 text-sm text-blue-100", children: accounts.length === 1 ? '1 account' : `${accounts.length} accounts` })] }), _jsxs("button", { type: "button", onClick: () => setHidden(!hidden), className: "inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white", children: [hidden ? _jsx(Eye, { className: "size-4" }) : _jsx(EyeOff, { className: "size-4" }), hidden ? 'Show' : 'Hide'] })] }) }), _jsxs("div", { className: "grid grid-cols-2 divide-x divide-y divide-slate-100 sm:grid-cols-4 sm:divide-y-0", children: [_jsx(Link, { to: ROUTES.ACCOUNTS, className: "px-4 py-3 text-center text-sm font-semibold text-[#0504AA] hover:bg-slate-50", children: "Accounts" }), _jsx(Link, { to: ROUTES.TRANSACTIONS, className: "px-4 py-3 text-center text-sm font-semibold text-[#0504AA] hover:bg-slate-50", children: "Activity" }), _jsx("button", { type: "button", disabled: checking, onClick: requestMovement, className: "px-4 py-3 text-center text-sm font-semibold text-[#0504AA] hover:bg-slate-50 disabled:opacity-60", children: "Transfer" }), _jsx("button", { type: "button", disabled: checking, onClick: requestMovement, className: "px-4 py-3 text-center text-sm font-semibold text-[#0504AA] hover:bg-slate-50 disabled:opacity-60", children: "Withdraw" })] }), notice && _jsx("p", { role: "status", className: "border-t border-slate-100 px-5 py-3 text-sm text-slate-600", children: notice })] }), _jsx(Panel, { title: "Accounts", action: _jsx(Link, { to: ROUTES.ACCOUNTS, className: "text-sm font-semibold text-[#0504AA]", children: "View all" }), children: accounts.length ? _jsx("ul", { className: "divide-y divide-slate-100", children: accounts.map(account => (_jsxs("li", { className: "flex items-center gap-3 px-5 py-4", children: [_jsx("span", { className: "flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#0504AA]/8 text-[#0504AA]", children: _jsx(Landmark, { className: "size-4" }) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: "truncate text-sm font-semibold capitalize text-[#101533]", children: account.accountType }), _jsx("p", { className: "truncate text-xs text-slate-500", children: account.accountNumber || 'Account' })] }), _jsx("span", { className: "hidden rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold capitalize text-emerald-700 sm:inline", children: account.status }), _jsx("p", { className: "text-sm font-semibold tabular-nums text-[#101533]", children: display(account.balance) })] }, account.id))) }) : _jsx("p", { className: "px-5 py-8 text-sm text-slate-500", children: "No accounts are available for this member." }) }), _jsx(Panel, { title: "Recent activity", action: _jsx(Link, { to: ROUTES.TRANSACTIONS, className: "text-sm font-semibold text-[#0504AA]", children: "See all" }), children: error ? _jsx("p", { className: "px-5 py-6 text-sm text-red-700", children: error }) : rows.length ? _jsx("ul", { className: "divide-y divide-slate-100", children: rows.map(row => {
                                        const credit = Number(row.credit || 0) > 0;
                                        return _jsxs("li", { className: "flex items-center gap-3 px-5 py-3.5", children: [_jsx("span", { className: `flex size-8 shrink-0 items-center justify-center rounded-full ${credit ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`, children: credit ? _jsx(ArrowDownLeft, { className: "size-3.5" }) : _jsx(ArrowUpRight, { className: "size-3.5" }) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: "truncate text-sm font-medium text-[#101533]", children: row.description }), _jsxs("p", { className: "text-xs text-slate-500", children: [new Date(row.created_at).toLocaleDateString(), " \u00B7 ", _jsx("span", { className: "capitalize", children: row.status })] })] }), _jsxs("p", { className: `shrink-0 text-sm font-semibold tabular-nums ${credit ? 'text-emerald-700' : 'text-[#101533]'}`, children: [credit ? '+' : '−', display(row.credit || row.debit || row.amount)] })] }, row.id);
                                    }) }) : _jsx("p", { className: "px-5 py-8 text-sm text-slate-500", children: "No recent activity is available." }) })] }), _jsxs("aside", { className: "order-1 space-y-5 lg:order-2", children: [!gateResult.activated && _jsxs("section", { className: "rounded-2xl border border-[#C9A227]/40 bg-white p-5", children: [_jsx("p", { className: "text-[11px] font-semibold uppercase tracking-[.16em] text-[#C9A227]", children: "Activation required" }), _jsx("h2", { className: "mt-2 text-base font-semibold leading-6 text-[#101533]", children: "Activate your account to unlock transfers and select services." }), _jsx("p", { className: "mt-2 text-sm leading-6 text-slate-600", children: feeLine }), gateResult.ratePercent != null && _jsxs("p", { className: "mt-2 text-sm text-slate-500", children: ["Calculated at ", gateResult.ratePercent, "% of available balance."] }), _jsxs("div", { className: "mt-4 grid gap-2", children: [_jsx(Link, { to: ROUTES.ACTIVATION, className: "rounded-lg bg-[#0504AA] px-3 py-2.5 text-center text-sm font-semibold text-white", children: "View activation details" }), _jsx(Link, { to: ROUTES.SUPPORT, className: "rounded-lg border border-slate-200 px-3 py-2.5 text-center text-sm font-semibold text-[#0504AA]", children: "Message support" })] })] }), _jsxs("section", { className: "overflow-hidden rounded-2xl border border-slate-200 bg-white", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-100 px-5 py-3.5", children: [_jsx("h2", { className: "text-sm font-semibold", children: "Services" }), _jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-semibold text-slate-500", children: [_jsx(Bell, { className: "size-3.5 text-[#0504AA]" }), unreadCount] })] }), _jsx("ul", { className: "divide-y divide-slate-100", children: services.map(({ label, subtext, icon: Icon, to, gated }) => {
                                            const body = _jsxs("span", { className: "flex items-center gap-3 px-4 py-3", children: [_jsx("span", { className: "flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#0504AA]/8 text-[#0504AA]", children: _jsx(Icon, { className: "size-4" }) }), _jsxs("span", { className: "min-w-0", children: [_jsx("span", { className: "block text-sm font-semibold text-[#101533]", children: label }), _jsx("span", { className: "block text-xs text-slate-500", children: subtext })] })] });
                                            return _jsx("li", { children: to
                                                    ? _jsx(Link, { to: to, className: "block hover:bg-slate-50", children: body })
                                                    : _jsx("button", { type: "button", onClick: gated ? requestMovement : undefined, className: "block w-full text-left hover:bg-slate-50", children: body }) }, label);
                                        }) })] })] })] }), _jsx("nav", { className: "fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1.5 md:hidden", "aria-label": "Mobile banking navigation", children: _jsxs("div", { className: "mx-auto grid max-w-md grid-cols-4", children: [_jsxs(Link, { to: ROUTES.DASHBOARD, className: "flex flex-col items-center gap-1 py-2 text-[11px] font-semibold text-[#0504AA]", children: [_jsx(Landmark, { className: "size-4" }), "Overview"] }), _jsxs(Link, { to: ROUTES.ACCOUNTS, className: "flex flex-col items-center gap-1 py-2 text-[11px] font-semibold text-slate-500", children: [_jsx(WalletCards, { className: "size-4" }), "Accounts"] }), _jsxs("button", { type: "button", onClick: requestMovement, className: "flex flex-col items-center gap-1 py-2 text-[11px] font-semibold text-slate-500", children: [_jsx(Send, { className: "size-4" }), "Transfer"] }), _jsxs(Link, { to: ROUTES.TRANSACTIONS, className: "flex flex-col items-center gap-1 py-2 text-[11px] font-semibold text-slate-500", children: [_jsx(Menu, { className: "size-4" }), "Activity"] })] }) }), _jsxs("div", { className: "mb-16 mt-6 flex items-center gap-2 text-xs text-slate-400 md:mb-0", children: [_jsx(ShieldCheck, { className: "size-3.5 text-[#0504AA]" }), "Member information stays in your signed-in session."] }), _jsx(ActivationRequiredModal, { open: gateOpen, fee: gateResult.fee, ratePercent: gateResult.ratePercent, onClose: () => setGateOpen(false) })] });
};
export default MemberDashboardPage;
