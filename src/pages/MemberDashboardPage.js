import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/constants/routes';
import { accountService } from '@/services/accountService';
import { profileService } from '@/services/profileService';
import { supabase } from '@/lib/supabase';
const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0);
const date = (value) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(value));
export const MemberDashboardPage = () => {
    const { user, loading: authLoading, signOut } = useAuth();
    const [profile, setProfile] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [ledger, setLedger] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!user)
            return;
        let active = true;
        const load = async () => {
            try {
                const [profileData, accountData] = await Promise.all([profileService.getProfile(user.id), accountService.getAccounts(user.id)]);
                const accountIds = accountData.map((account) => account.id);
                const { data, error: ledgerError } = accountIds.length
                    ? await supabase.from('ledger_entries').select('id, created_at, description, category, debit, credit, amount, status, balance_after').eq('member_id', user.id).in('account_id', accountIds).order('created_at', { ascending: false })
                    : { data: [], error: null };
                if (ledgerError)
                    throw ledgerError;
                if (active) {
                    setProfile(profileData);
                    setAccounts(accountData);
                    setLedger((data || []));
                }
            }
            catch {
                if (active)
                    setError('We could not load your member information. Please refresh and try again.');
            }
            finally {
                if (active)
                    setLoading(false);
            }
        };
        void load();
        return () => { active = false; };
    }, [user]);
    const availableBalance = useMemo(() => accounts.reduce((total, account) => total + Number(account.balance), 0), [accounts]);
    const downloadStatement = () => {
        const rows = ledger.map((entry) => `${date(entry.created_at)}\t${entry.description}\t${entry.status}\t${money(entry.amount)}\t${money(entry.balance_after)}`);
        const content = ['Evermont Credit Union — Prototype statement data', 'Balances and history are simulated. Evermont is not a licensed bank.', '', 'Date\tDescription\tStatus\tAmount\tBalance after', ...rows].join('\n');
        const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = 'evermont-prototype-statement.txt';
        link.click();
        URL.revokeObjectURL(url);
    };
    if (authLoading || (user && loading))
        return _jsx("main", { className: "flex min-h-screen items-center justify-center bg-[#f8fafc] text-sm text-slate-600", children: "Loading your member portal..." });
    if (!user)
        return _jsx("main", { className: "flex min-h-screen items-center justify-center bg-[#f8fafc]", children: _jsx(Link, { className: "rounded-full bg-[#0504AA] px-5 py-3 font-semibold text-white", to: ROUTES.LOGIN, children: "Sign in to member banking" }) });
    return (_jsxs("main", { className: "min-h-screen bg-[#f8fafc] text-[#101533]", children: [_jsx("header", { className: "border-b border-slate-200 bg-white px-5 py-4", children: _jsxs("div", { className: "mx-auto flex max-w-6xl items-center justify-between", children: [_jsx(Link, { to: ROUTES.DASHBOARD, className: "font-semibold tracking-tight text-[#0504AA]", children: "Evermont Member Portal" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("a", { href: "https://evermont.builder.cloud", className: "rounded-full border border-[#0504AA] px-4 py-2 text-sm font-semibold text-[#0504AA] transition-colors hover:bg-[#0504AA] hover:text-white", children: "Visit the public site" }), _jsxs("button", { type: "button", onClick: () => void signOut(), className: "inline-flex items-center gap-2 text-sm font-semibold text-slate-600", children: [_jsx(LogOut, { className: "size-4" }), "Sign out"] })] })] }) }), _jsxs("section", { className: "mx-auto max-w-6xl px-5 py-10", children: [_jsxs("div", { className: "flex flex-col justify-between gap-5 sm:flex-row sm:items-end", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-bold uppercase tracking-[0.18em] text-[#C9A227]", children: "Secure member banking" }), _jsxs("h1", { className: "mt-3 text-4xl font-semibold tracking-[-0.04em]", children: ["Welcome, ", profile?.firstName || user.firstName, "."] }), _jsx("p", { className: "mt-3 text-sm text-slate-600", children: profile?.email || user.email })] }), _jsxs("button", { type: "button", onClick: downloadStatement, className: "inline-flex items-center justify-center gap-2 rounded-full border border-[#0504AA] px-5 py-3 text-sm font-semibold text-[#0504AA]", children: [_jsx(Download, { className: "size-4" }), "Download prototype statement"] })] }), _jsx("div", { className: "mt-7 rounded-2xl border border-[#eadca7] bg-[#fffaf0] p-4 text-sm text-[#5f4c00]", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(ShieldCheck, { className: "mt-0.5 size-5 shrink-0" }), _jsx("p", { children: "Prototype notice: balances and history are simulated. Evermont is not a licensed bank. Pending entries are not completed payments and are excluded from available balance." })] }) }), error && _jsx("p", { role: "alert", className: "mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700", children: error }), _jsxs("div", { className: "mt-8 grid gap-5 md:grid-cols-[0.8fr_1.2fr]", children: [_jsxs("section", { className: "rounded-2xl bg-[#101533] p-6 text-white", children: [_jsx("p", { className: "text-sm text-slate-300", children: "Available balance" }), _jsx("p", { className: "mt-3 text-4xl font-semibold", children: money(availableBalance) }), _jsxs("p", { className: "mt-5 text-xs text-slate-400", children: ["Across ", accounts.length, " account", accounts.length === 1 ? '' : 's'] })] }), _jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6", children: [_jsx("h2", { className: "text-lg font-semibold", children: "Your accounts" }), _jsx("div", { className: "mt-4 flex flex-col gap-3", children: accounts.length ? accounts.map((account) => _jsxs("div", { className: "flex items-center justify-between rounded-xl bg-slate-50 p-4", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold capitalize", children: account.accountType.replace('_', ' ') }), _jsxs("p", { className: "mt-1 text-sm text-slate-500", children: [account.accountNumber, " \u00B7 ", account.status] })] }), _jsx("p", { className: "font-semibold", children: money(account.balance) })] }, account.id)) : _jsx("p", { className: "text-sm text-slate-500", children: "No member accounts are currently available." }) })] })] }), _jsxs("section", { className: "mt-8 rounded-2xl border border-slate-200 bg-white p-6", children: [_jsx("h2", { className: "text-lg font-semibold", children: "Recent activity" }), ledger.length ? _jsx("div", { className: "mt-4 flex flex-col divide-y divide-slate-100", children: ledger.map((entry) => _jsxs("div", { className: "grid gap-2 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: entry.description }), _jsxs("p", { className: "text-sm text-slate-500", children: [date(entry.created_at), " \u00B7 ", entry.category] })] }), _jsxs("p", { className: entry.credit ? 'font-semibold text-emerald-700' : 'font-semibold text-slate-900', children: [entry.credit ? '+' : '-', money(entry.credit || entry.debit || entry.amount)] }), _jsxs("div", { className: "text-left sm:text-right", children: [_jsx("p", { className: "text-sm font-medium", children: entry.status === 'pending' ? 'Pending verification — simulated test data' : entry.status }), _jsxs("p", { className: "text-xs text-slate-500", children: ["Balance after: ", money(entry.balance_after)] })] })] }, entry.id)) }) : _jsx("p", { className: "mt-4 text-sm text-slate-500", children: "No transaction history is available for this member." })] })] })] }));
};
export default MemberDashboardPage;
