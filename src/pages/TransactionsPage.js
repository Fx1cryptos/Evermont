import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { PortalShell } from '@/components/member/PortalShell';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0);
const debitCategories = new Set(['withdrawal', 'fee', 'transfer-out', 'ach']);
const creditCategories = new Set(['deposit', 'interest', 'opening_balance', 'transfer']);
const isCredit = (row) => {
    const credit = Number(row.credit || 0);
    const debit = Number(row.debit || 0);
    if (credit > 0 && debit <= 0)
        return true;
    if (debit > 0 && credit <= 0)
        return false;
    const category = (row.category || '').toLowerCase();
    if (debitCategories.has(category))
        return false;
    if (creditCategories.has(category))
        return true;
    return credit >= debit;
};
export const TransactionsPage = () => {
    const { user } = useAuth();
    const [rows, setRows] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('all');
    const [activityType, setActivityType] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        if (!user)
            return;
        let active = true;
        void (async () => {
            const { data: accountRows, error: accountError } = await supabase.from('accounts').select('id,account_type,account_number').eq('user_id', user.id).order('created_at', { ascending: false });
            if (!active)
                return;
            if (accountError) {
                setError('We could not load your accounts. Please try again.');
                setLoading(false);
                return;
            }
            const owned = (accountRows || []).map(row => ({ id: row.id, accountType: row.account_type, accountNumber: row.account_number }));
            setAccounts(owned);
            const ids = owned.map(row => row.id);
            if (!ids.length) {
                setLoading(false);
                return;
            }
            const { data, error: ledgerError } = await supabase.from('ledger_entries').select('id,account_id,created_at,description,category,debit,credit,amount,status,reference_id,balance_after').eq('member_id', user.id).in('account_id', ids).order('created_at', { ascending: false });
            if (!active)
                return;
            if (ledgerError)
                setError('We could not load your transactions. Please try again.');
            else
                setRows((data || []));
            setLoading(false);
        })();
        return () => { active = false; };
    }, [user]);
    const filtered = useMemo(() => rows.filter(row => {
        const matchesStatus = status === 'all' || row.status === status;
        const haystack = `${row.description} ${row.category} ${row.reference_id || ''}`.toLowerCase();
        const matchesQuery = haystack.includes(query.toLowerCase());
        const credit = isCredit(row);
        const matchesType = activityType === 'all' || (activityType === 'deposits' ? credit : !credit);
        return matchesStatus && matchesQuery && matchesType;
    }), [rows, query, status, activityType]);
    const emptyMessage = query
        ? 'No transactions match your search'
        : activityType === 'deposits'
            ? 'No deposits found'
            : activityType === 'withdrawals'
                ? 'No withdrawals found'
                : 'No transactions match your search';
    return _jsxs(PortalShell, { title: "Transaction history", eyebrow: "Account activity", children: [_jsxs("div", { className: "mt-7 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_180px_220px]", children: [_jsxs("label", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-3 size-4 text-slate-400" }), _jsx("input", { "aria-label": "Search transactions", value: query, onChange: event => setQuery(event.target.value), placeholder: "Search description, category or reference", className: "w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3" })] }), _jsxs("select", { "aria-label": "Filter by status", value: status, onChange: event => setStatus(event.target.value), className: "rounded-xl border border-slate-200 px-3", children: [_jsx("option", { value: "all", children: "All statuses" }), _jsx("option", { value: "completed", children: "Completed" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "failed", children: "Failed" })] }), _jsxs("select", { "aria-label": "Filter by type", value: activityType, onChange: event => setActivityType(event.target.value), className: "rounded-xl border border-slate-200 px-3", children: [_jsx("option", { value: "all", children: "All activity" }), _jsx("option", { value: "deposits", children: "Deposits / Credits" }), _jsx("option", { value: "withdrawals", children: "Withdrawals / Debits" })] })] }), error && _jsx("p", { role: "alert", className: "mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700", children: error }), _jsx("section", { className: "mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm", children: loading ? _jsx("p", { className: "p-8 text-slate-500", children: "Loading your activity..." }) : !filtered.length ? _jsx("p", { className: "p-8 text-slate-500", children: emptyMessage }) : _jsxs(_Fragment, { children: [_jsxs("div", { className: "hidden grid-cols-[140px_1.4fr_.8fr_.8fr_.7fr_140px] gap-3 border-b border-slate-100 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 lg:grid", children: [_jsx("span", { children: "Date" }), _jsx("span", { children: "Description" }), _jsx("span", { children: "Category" }), _jsx("span", { children: "Account" }), _jsx("span", { children: "Status" }), _jsx("span", { className: "text-right", children: "Amount" })] }), _jsx("div", { className: "divide-y divide-slate-100", children: filtered.map(row => {
                                const credit = isCredit(row);
                                const account = accounts.find(item => item.id === row.account_id);
                                return _jsxs("div", { className: "grid gap-2 p-5 lg:grid-cols-[140px_1.4fr_.8fr_.8fr_.7fr_140px] lg:items-center", children: [_jsx("p", { className: "text-sm text-slate-500", children: new Date(row.created_at).toLocaleDateString() }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: row.description }), _jsxs("p", { className: "mt-1 text-xs text-slate-400 lg:hidden", children: [row.category, " \u00B7 ", account?.accountNumber || account?.accountType || 'Account', " \u00B7 ", row.reference_id || 'Reference unavailable'] })] }), _jsx("p", { className: "hidden text-sm capitalize text-slate-600 lg:block", children: row.category || 'General' }), _jsx("p", { className: "hidden text-sm text-slate-600 lg:block", children: account?.accountNumber || account?.accountType || 'Account' }), _jsx("p", { className: "text-xs font-semibold capitalize text-slate-500 lg:text-sm", children: row.status }), _jsxs("p", { className: `text-lg font-semibold lg:text-right ${credit ? 'text-emerald-700' : 'text-slate-900'}`, children: [credit ? '+' : '−', money(row.credit || row.debit || row.amount)] })] }, row.id);
                            }) })] }) })] });
};
export default TransactionsPage;
