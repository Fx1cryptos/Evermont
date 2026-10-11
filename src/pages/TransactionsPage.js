import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { PortalShell } from '@/components/member/PortalShell';
import { useAuth } from '@/contexts/AuthContext';
import { accountService } from '@/services/accountService';
import { supabase } from '@/lib/supabase';
const money = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(v) || 0);
export const TransactionsPage = () => {
    const { user } = useAuth();
    const [rows, setRows] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => { if (!user)
        return; let active = true; void accountService.getAccounts(user.id).then(async (a) => { if (active)
        setAccounts(a); const ids = a.map(x => x.id); if (!ids.length) {
        setLoading(false);
        return;
    } ; const { data, error: e } = await supabase.from('ledger_entries').select('id,account_id,created_at,description,category,debit,credit,amount,status,reference_id,balance_after').eq('member_id', user.id).in('account_id', ids).order('created_at', { ascending: false }); if (!active)
        return; if (e)
        setError('We could not load your transactions. Please try again.');
    else
        setRows((data || [])); setLoading(false); }); return () => { active = false; }; }, [user]);
    const filtered = useMemo(() => rows.filter(r => (status === 'all' || r.status === status) && (`${r.description} ${r.category} ${r.reference_id || ''}`).toLowerCase().includes(query.toLowerCase())), [rows, query, status]);
    return _jsxs(PortalShell, { title: "Transaction history", eyebrow: "Account activity", children: [_jsxs("div", { className: "mt-7 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row", children: [_jsxs("label", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute left-3 top-3 size-4 text-slate-400" }), _jsx("input", { "aria-label": "Search transactions", value: query, onChange: e => setQuery(e.target.value), placeholder: "Search description, category or reference", className: "w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3" })] }), _jsxs("select", { value: status, onChange: e => setStatus(e.target.value), className: "rounded-xl border border-slate-200 px-3", children: [_jsx("option", { value: "all", children: "All statuses" }), _jsx("option", { value: "completed", children: "Completed" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "failed", children: "Failed" })] })] }), error && _jsx("p", { role: "alert", className: "mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700", children: error }), _jsx("section", { className: "mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white", children: loading ? _jsx("p", { className: "p-8 text-slate-500", children: "Loading your activity..." }) : !filtered.length ? _jsx("p", { className: "p-8 text-slate-500", children: "No transactions match your search." }) : _jsx("div", { className: "divide-y divide-slate-100", children: filtered.map(r => { const credit = Number(r.credit || 0) > 0; return _jsxs("div", { className: "flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: r.description }), _jsxs("p", { className: "mt-1 text-sm text-slate-500", children: [new Date(r.created_at).toLocaleString(), " \u00B7 ", r.category, " \u00B7 ", accounts.find(a => a.id === r.account_id)?.accountType || 'Account'] }), _jsxs("p", { className: "mt-1 text-xs text-slate-400", children: [r.reference_id || 'Reference unavailable', " \u00B7 ", r.status] })] }), _jsxs("p", { className: `text-lg font-semibold ${credit ? 'text-emerald-700' : 'text-slate-900'}`, children: [credit ? '+' : '-', money(r.credit || r.debit || r.amount)] })] }, r.id); }) }) })] });
};
