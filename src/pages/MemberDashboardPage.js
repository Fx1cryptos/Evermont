import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAccounts } from '@/hooks/useAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { ROUTES } from '@/constants/routes';
const money = (value) => {
    const amount = Number(value ?? 0);
    if (!Number.isFinite(amount))
        return '$0.00';
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};
const when = (value) => new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
});
const statusLabel = (status) => {
    if (status === 'pending')
        return 'Pending verification — simulated test data';
    if (status === 'failed')
        return 'Failed';
    return 'Completed';
};
const downloadStatement = (name, accounts, transactions) => {
    const lines = [
        'Evermont Credit Union',
        'SIMULATED PROTOTYPE STATEMENT — NOT A REAL BANK RECORD',
        `Member,"${name.replace(/"/g, '""')}"`,
        '',
        'Accounts',
        'Type,Number,Available balance,Status',
        ...accounts.map((account) => [account.accountType, account.accountNumber, account.balance, account.status].join(',')),
        '',
        'Transactions',
        'Date,Description,Category,Type,Amount,Status,Resulting balance',
        ...transactions.map((item) => [
            item.createdAt,
            `"${item.description.replace(/"/g, '""')}"`,
            item.category ?? '',
            item.type,
            item.amount,
            item.status,
            item.balanceAfter ?? '',
        ].join(',')),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'evermont-simulated-statement.csv';
    link.click();
    URL.revokeObjectURL(url);
};
export const MemberDashboardPage = () => {
    const { user, loading, signOut } = useAuth();
    const { accounts, loading: accountsLoading, error: accountsError } = useAccounts(user?.id);
    const { transactions, loading: transactionsLoading, error: transactionsError } = useTransactions(user?.id);
    const available = accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0);
    const holder = [user?.firstName, user?.lastName].filter(Boolean).join(' ');
    const busy = loading || (!!user && (accountsLoading || transactionsLoading));
    return (_jsxs("main", { className: "min-h-screen bg-[#f5f7fb] text-[#17213b]", children: [_jsx("header", { className: "border-b border-evermont-border bg-white", children: _jsxs("div", { className: "mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4", children: [_jsx(Link, { to: ROUTES.HOME, className: "text-lg font-bold tracking-wide text-evermont-blue", children: "EVERMONT" }), user ? (_jsx("button", { type: "button", onClick: () => void signOut(), className: "text-sm font-semibold text-evermont-blue", children: "Sign out" })) : (_jsx(Link, { to: ROUTES.LOGIN, className: "text-sm font-semibold text-evermont-blue", children: "Sign in" }))] }) }), _jsxs("section", { className: "mx-auto max-w-5xl px-5 py-8", children: [_jsx("p", { className: "text-xs font-bold uppercase tracking-[0.16em] text-evermont-muted", children: "Member account" }), _jsx("h1", { className: "mt-2 text-3xl font-semibold text-evermont-blue", children: holder ? `Welcome, ${holder}` : 'Member dashboard' }), _jsx("p", { className: "mt-3 max-w-2xl text-sm leading-6 text-evermont-muted", children: "Simulated prototype balances and history. Evermont is not a licensed bank, and these figures are not real money." }), !user && !loading && (_jsxs("div", { className: "mt-8 rounded-2xl border border-evermont-border bg-white p-6", children: [_jsx("p", { className: "text-sm text-gray-700", children: "Sign in to view your available balance and transaction history." }), _jsx(Link, { to: ROUTES.LOGIN, className: "mt-4 inline-flex rounded-lg bg-evermont-blue px-4 py-3 text-sm font-semibold text-white", children: "Sign in" })] })), busy && _jsx("p", { className: "mt-8 text-sm text-evermont-blue", children: "Loading your account..." }), user && !busy && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "mt-8 overflow-hidden rounded-2xl bg-evermont-blue text-white shadow-sm", children: [_jsx("div", { className: "h-1 bg-evermont-gold" }), _jsxs("div", { className: "p-6", children: [_jsx("p", { className: "text-xs font-bold uppercase tracking-[0.14em] text-white/70", children: "Available balance" }), _jsx("p", { className: "mt-2 text-4xl font-semibold", children: money(available) }), _jsx("p", { className: "mt-3 text-sm text-white/80", children: "Pending credits are listed below and are not included in this balance." })] })] }), (accountsError || transactionsError) && (_jsx("p", { className: "mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700", children: accountsError || transactionsError })), _jsxs("div", { className: "mt-6 grid gap-4", children: [accounts.map((account) => (_jsxs("article", { className: "rounded-2xl border border-evermont-border bg-white p-5", children: [_jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold capitalize", children: account.accountType.replace('_', ' ') }), _jsxs("p", { className: "mt-1 text-sm text-evermont-muted", children: ["Account ", account.accountNumber] })] }), _jsx("p", { className: "text-lg font-semibold text-evermont-blue", children: money(account.balance) })] }), _jsx("p", { className: "mt-3 text-xs font-semibold uppercase tracking-wide text-evermont-gold", children: account.status })] }, account.id))), accounts.length === 0 && !accountsError && (_jsx("p", { className: "rounded-2xl border border-evermont-border bg-white p-5 text-sm text-evermont-muted", children: "No account is saved for this member yet." }))] }), _jsxs("div", { className: "mt-8 rounded-2xl border border-evermont-border bg-white", children: [_jsxs("div", { className: "flex items-center justify-between gap-3 border-b border-evermont-border px-5 py-4", children: [_jsx("h2", { className: "text-lg font-semibold", children: "Transaction history" }), _jsx("button", { type: "button", onClick: () => downloadStatement(holder || user.email, accounts, transactions), className: "rounded-lg border border-evermont-blue px-3 py-2 text-xs font-semibold text-evermont-blue", children: "Download statement" })] }), _jsxs("div", { className: "divide-y divide-evermont-border", children: [transactions.map((item) => (_jsxs("article", { className: "px-5 py-4", children: [_jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold", children: item.description }), _jsxs("p", { className: "mt-1 text-sm text-evermont-muted", children: [when(item.createdAt), item.category ? ` · ${item.category}` : ''] })] }), _jsxs("p", { className: `font-semibold ${item.type === 'credit' ? 'text-evermont-blue' : 'text-[#17213b]'}`, children: [item.type === 'credit' ? '+' : '−', money(item.amount)] })] }), _jsxs("p", { className: "mt-2 text-xs font-semibold uppercase tracking-wide text-evermont-gold", children: [item.type, " \u00B7 ", statusLabel(item.status)] }), item.balanceAfter && (_jsxs("p", { className: "mt-1 text-sm text-evermont-muted", children: ["Resulting balance ", money(item.balanceAfter)] }))] }, item.id))), transactions.length === 0 && !transactionsError && (_jsx("p", { className: "px-5 py-6 text-sm text-evermont-muted", children: "No transactions are saved for this member yet." }))] })] })] }))] })] }));
};
