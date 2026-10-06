import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';
export const AccountHistoryPage = () => {
    const { id } = useParams();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const load = async () => {
            if (!supabase || !id)
                return;
            try {
                const { data, error } = await supabase
                    .from('ledger_entries')
                    .select('*')
                    .eq('account_id', id)
                    .order('created_at', { ascending: false });
                if (error)
                    throw error;
                setRows(data ?? []);
            }
            catch (error) {
                console.error('Failed to load account history', error);
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
    return (_jsx(AdminLayout, { staffName: "Administrator", staffRole: "ADMIN", children: _jsxs("div", { className: "p-6", children: [_jsx("h1", { className: "text-2xl font-bold mb-4", children: "Account history" }), _jsx("div", { className: "mb-4 text-sm text-red-600 font-semibold", children: "SIMULATED DATA NOTICE: Prototype financial figures shown here are demo-only and not live customer records." }), _jsx("div", { className: "overflow-auto rounded-lg border border-evermont-border bg-white", children: _jsxs("table", { className: "min-w-full text-sm", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "p-3 text-left", children: "Date" }), _jsx("th", { className: "p-3 text-left", children: "Reference" }), _jsx("th", { className: "p-3 text-left", children: "Description" }), _jsx("th", { className: "p-3 text-left", children: "Type" }), _jsx("th", { className: "p-3 text-left", children: "Deposit" }), _jsx("th", { className: "p-3 text-left", children: "Withdrawal" }), _jsx("th", { className: "p-3 text-left", children: "Status" }), _jsx("th", { className: "p-3 text-left", children: "Balance after" })] }) }), _jsx("tbody", { children: rows.map((row) => (_jsxs("tr", { className: "border-t", children: [_jsx("td", { className: "p-3", children: new Date(row.created_at).toLocaleString() }), _jsx("td", { className: "p-3", children: row.reference_id }), _jsx("td", { className: "p-3", children: row.description }), _jsx("td", { className: "p-3", children: row.entry_type }), _jsx("td", { className: "p-3", children: row.credit ? `$${Number(row.credit).toFixed(2)}` : '-' }), _jsx("td", { className: "p-3", children: row.debit ? `$${Number(row.debit).toFixed(2)}` : '-' }), _jsx("td", { className: "p-3", children: row.status }), _jsxs("td", { className: "p-3", children: ["$", Number(row.balance_after).toFixed(2)] })] }, row.id))) })] }) })] }) }));
};
