import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ledgerService } from '@/services/ledgerService';
const money = (value) => value == null
    ? '—'
    : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value));
export const AccountHistoryPage = () => {
    const { id } = useParams();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        const load = async () => {
            if (!id) {
                setLoading(false);
                setError('Account not found.');
                return;
            }
            try {
                setRows(await ledgerService.getAccountHistory(id));
            }
            catch {
                console.error('Failed to load account history');
                setError('Account history could not be loaded from the ledger.');
            }
            finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);
    if (loading) {
        return (_jsx(AdminLayout, { staffName: "Administrator", staffRole: "ADMIN", children: _jsx("div", { className: "p-6", children: "Loading account history..." }) }));
    }
    return (_jsx(AdminLayout, { staffName: "Administrator", staffRole: "ADMIN", children: _jsxs("div", { className: "p-6", children: [_jsx("h1", { className: "text-2xl font-bold mb-4", children: "Account history" }), _jsx("div", { className: "mb-4 text-sm text-red-600 font-semibold", children: "Prototype notice: this page reads ledger entries for the selected account. It does not move money and is not a claim of chartered-bank deposit insurance or live settlement." }), error && _jsx("p", { role: "alert", className: "mb-4 text-sm text-red-700", children: error }), _jsx("div", { className: "overflow-auto rounded-lg border border-evermont-border bg-white", children: _jsxs("table", { className: "min-w-full text-sm", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "p-3 text-left", children: "Date" }), _jsx("th", { className: "p-3 text-left", children: "Reference" }), _jsx("th", { className: "p-3 text-left", children: "Description" }), _jsx("th", { className: "p-3 text-left", children: "Type" }), _jsx("th", { className: "p-3 text-left", children: "Deposit" }), _jsx("th", { className: "p-3 text-left", children: "Withdrawal" }), _jsx("th", { className: "p-3 text-left", children: "Status" }), _jsx("th", { className: "p-3 text-left", children: "Balance after" })] }) }), _jsxs("tbody", { children: [!rows.length && _jsx("tr", { children: _jsx("td", { className: "p-6 text-slate-500", colSpan: 8, children: "No ledger entries are posted for this account." }) }), rows.map((row) => (_jsxs("tr", { className: "border-t", children: [_jsx("td", { className: "p-3", children: row.createdAt ? new Date(row.createdAt).toLocaleString() : '—' }), _jsx("td", { className: "p-3", children: row.referenceId || '—' }), _jsx("td", { className: "p-3", children: row.description }), _jsx("td", { className: "p-3", children: row.entryType || '—' }), _jsx("td", { className: "p-3", children: row.direction === 'credit' ? money(row.displayAmount) : '—' }), _jsx("td", { className: "p-3", children: row.direction === 'debit' ? money(row.displayAmount) : '—' }), _jsx("td", { className: "p-3", children: row.status || '—' }), _jsx("td", { className: "p-3", children: money(row.balanceAfter) })] }, row.id)))] })] }) })] }) }));
};
