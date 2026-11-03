import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { PortalShell } from '@/components/member/PortalShell';
import { useAuth } from '@/contexts/AuthContext';
import { accountService } from '@/services/accountService';
import { transactionService } from '@/services/transactionService';
const PAGE_SIZE = 10;
const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0);
const posted = (value) => (value == null ? '—' : money(value));
export const TransactionsPage = () => {
    const { user } = useAuth();
    const [rows, setRows] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('all');
    const [activityType, setActivityType] = useState('all');
    const [page, setPage] = useState(0);
    const [openId, setOpenId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        if (!user)
            return;
        let active = true;
        void (async () => {
            setLoading(true);
            setError('');
            try {
                const [owned, activity] = await Promise.all([
                    accountService.getAccounts(user.id).catch(() => []),
                    transactionService.getTransactions(user.id),
                ]);
                if (!active)
                    return;
                setAccounts(owned);
                setRows(activity);
            }
            catch {
                if (active) {
                    setRows([]);
                    setError('We could not load your transactions. Please try again.');
                }
            }
            finally {
                if (active)
                    setLoading(false);
            }
        })();
        return () => { active = false; };
    }, [user]);
    useEffect(() => {
        setPage(0);
        setOpenId(null);
    }, [query, status, activityType]);
    const filtered = useMemo(() => rows.filter(row => {
        const matchesStatus = status === 'all' || row.status === status;
        const haystack = `${row.description} ${row.category} ${row.entryType} ${row.referenceId}`.toLowerCase();
        const matchesQuery = haystack.includes(query.trim().toLowerCase());
        const matchesType = activityType === 'all' || (activityType === 'deposits' ? row.direction === 'credit' : row.direction === 'debit');
        return matchesStatus && matchesQuery && matchesType;
    }), [rows, query, status, activityType]);
    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, pageCount - 1);
    const visible = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
    const filtersActive = Boolean(query.trim()) || status !== 'all' || activityType !== 'all';
    const emptyMessage = !rows.length && !filtersActive
        ? 'No transactions yet. Posted ledger activity will appear here.'
        : query.trim()
            ? 'No transactions match your search'
            : activityType === 'deposits'
                ? 'No deposits found'
                : activityType === 'withdrawals'
                    ? 'No withdrawals found'
                    : 'No transactions match your filters';
    return _jsxs(PortalShell, { title: "Transaction history", eyebrow: "Account activity", children: [_jsxs("div", { className: "mt-7 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_180px_220px]", children: [_jsxs("label", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-3 size-4 text-slate-400" }), _jsx("input", { "aria-label": "Search transactions", value: query, onChange: event => setQuery(event.target.value), placeholder: "Search description, category or reference", className: "w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3" })] }), _jsxs("select", { "aria-label": "Filter by status", value: status, onChange: event => setStatus(event.target.value), className: "rounded-xl border border-slate-200 px-3", children: [_jsx("option", { value: "all", children: "All statuses" }), _jsx("option", { value: "completed", children: "Completed" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "failed", children: "Failed" }), _jsx("option", { value: "reversed", children: "Reversed" })] }), _jsxs("select", { "aria-label": "Filter by type", value: activityType, onChange: event => setActivityType(event.target.value), className: "rounded-xl border border-slate-200 px-3", children: [_jsx("option", { value: "all", children: "All activity" }), _jsx("option", { value: "deposits", children: "Deposits / Credits" }), _jsx("option", { value: "withdrawals", children: "Withdrawals / Debits" })] })] }), error && _jsx("p", { role: "alert", className: "mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700", children: error }), _jsx("section", { className: "mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm", children: loading ? _jsx("p", { className: "p-8 text-slate-500", children: "Loading your activity..." }) : error ? null : !filtered.length ? _jsx("p", { className: "p-8 text-slate-500", children: emptyMessage }) : _jsxs(_Fragment, { children: [_jsxs("div", { className: "hidden grid-cols-[140px_1.4fr_.8fr_.8fr_.7fr_140px] gap-3 border-b border-slate-100 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 lg:grid", children: [_jsx("span", { children: "Date" }), _jsx("span", { children: "Description" }), _jsx("span", { children: "Category" }), _jsx("span", { children: "Account" }), _jsx("span", { children: "Status" }), _jsx("span", { className: "text-right", children: "Amount" })] }), _jsx("div", { className: "divide-y divide-slate-100", children: visible.map(row => {
                                const credit = row.direction === 'credit';
                                const account = accounts.find(item => item.id === row.accountId);
                                const open = openId === row.id;
                                const detailId = `transaction-${row.id}`;
                                return _jsxs("div", { className: "p-5", children: [_jsxs("div", { className: "grid gap-2 lg:grid-cols-[140px_1.4fr_.8fr_.8fr_.7fr_140px] lg:items-center", children: [_jsx("p", { className: "text-sm text-slate-500", children: row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—' }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: row.description || 'Ledger entry' }), _jsx("p", { className: "mt-1 text-xs text-slate-400", children: row.referenceId || 'Reference unavailable' }), _jsxs("p", { className: "mt-1 text-xs text-slate-400 lg:hidden", children: [row.category || 'General', " \u00B7 ", account?.accountNumber || account?.accountType || 'Account'] })] }), _jsx("p", { className: "hidden text-sm capitalize text-slate-600 lg:block", children: row.category || 'General' }), _jsx("p", { className: "hidden text-sm text-slate-600 lg:block", children: account?.accountNumber || account?.accountType || 'Account' }), _jsx("p", { className: "text-xs font-semibold capitalize text-slate-500 lg:text-sm", children: row.status || '—' }), _jsxs("div", { className: "flex items-center justify-between gap-3 lg:block lg:text-right", children: [_jsxs("p", { className: `text-lg font-semibold ${credit ? 'text-emerald-700' : 'text-slate-900'}`, children: [credit ? '+' : '−', money(row.displayAmount)] }), _jsx("button", { type: "button", "aria-expanded": open, "aria-controls": detailId, onClick: () => setOpenId(open ? null : row.id), className: "text-xs font-semibold text-[#0504AA] lg:mt-1", children: open ? 'Hide details' : 'View details' })] })] }), open && _jsxs("dl", { id: detailId, className: "mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2", children: [_jsxs("div", { children: [_jsx("dt", { className: "text-xs uppercase tracking-wide text-slate-400", children: "Entry type" }), _jsx("dd", { className: "mt-1 capitalize text-slate-700", children: row.entryType || '—' })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-xs uppercase tracking-wide text-slate-400", children: "Reference" }), _jsx("dd", { className: "mt-1 text-slate-700", children: row.referenceId || '—' })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-xs uppercase tracking-wide text-slate-400", children: "Amount" }), _jsx("dd", { className: "mt-1 text-slate-700", children: posted(row.amount) })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-xs uppercase tracking-wide text-slate-400", children: "Debit" }), _jsx("dd", { className: "mt-1 text-slate-700", children: posted(row.debit) })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-xs uppercase tracking-wide text-slate-400", children: "Credit" }), _jsx("dd", { className: "mt-1 text-slate-700", children: posted(row.credit) })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-xs uppercase tracking-wide text-slate-400", children: "Balance after" }), _jsx("dd", { className: "mt-1 text-slate-700", children: posted(row.balanceAfter) })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-xs uppercase tracking-wide text-slate-400", children: "Posted" }), _jsx("dd", { className: "mt-1 text-slate-700", children: row.createdAt ? new Date(row.createdAt).toLocaleString() : '—' })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-xs uppercase tracking-wide text-slate-400", children: "Status" }), _jsx("dd", { className: "mt-1 capitalize text-slate-700", children: row.status || '—' })] })] })] }, row.id);
                            }) }), _jsxs("div", { className: "flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-sm text-slate-500", children: [_jsxs("p", { children: ["Showing ", safePage * PAGE_SIZE + 1, "\u2013", safePage * PAGE_SIZE + visible.length, " of ", filtered.length] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { type: "button", onClick: () => setPage(current => Math.max(0, current - 1)), disabled: safePage === 0, className: "rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-[#0504AA] disabled:opacity-40", children: "Previous" }), _jsx("button", { type: "button", onClick: () => setPage(current => Math.min(pageCount - 1, current + 1)), disabled: safePage >= pageCount - 1, className: "rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-[#0504AA] disabled:opacity-40", children: "Next" })] })] })] }) })] });
};
export default TransactionsPage;
