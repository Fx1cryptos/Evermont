import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { MetricCard } from '@/components/admin/MetricCard';
import { adminDashboardService } from '@/services/adminDashboardService';
export const AdminDashboardPage = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const load = async () => {
            try {
                const data = await adminDashboardService.getMetrics();
                setMetrics(data);
            }
            catch (error) {
                console.error('Failed to load admin metrics', error);
            }
            finally {
                setLoading(false);
            }
        };
        load();
    }, []);
    if (loading) {
        return (_jsx(AdminLayout, { staffName: "Administrator", staffRole: "ADMIN", children: _jsx("div", { className: "p-6", children: "Loading dashboard..." }) }));
    }
    if (!metrics) {
        return (_jsx(AdminLayout, { staffName: "Administrator", staffRole: "ADMIN", children: _jsx("div", { className: "p-6", children: "Unable to load dashboard metrics." }) }));
    }
    return (_jsx(AdminLayout, { staffName: "Administrator", staffRole: "ADMIN", children: _jsxs("div", { className: "p-6 space-y-6", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Admin Dashboard" }), _jsx("p", { className: "mt-1 text-sm font-semibold text-red-600", children: "SIMULATED DATA NOTICE: Prototype financial figures shown here are demo-only and not live customer records." })] }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4", children: [_jsx(MetricCard, { title: "Total registered members", value: metrics.members.total }), _jsx(MetricCard, { title: "Total accounts", value: metrics.accounts.total }), _jsx(MetricCard, { title: "Checking balances", value: metrics.accounts.checking }), _jsx(MetricCard, { title: "Savings balances", value: metrics.accounts.savings })] }), _jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-2 gap-6", children: [_jsxs("div", { className: "rounded-lg border border-evermont-border bg-white p-6", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Account balances by type" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Checking" }), _jsxs("strong", { children: ["$", metrics.accounts.checking.toLocaleString()] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Savings" }), _jsxs("strong", { children: ["$", metrics.accounts.savings.toLocaleString()] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Linked external" }), _jsxs("strong", { children: ["$", metrics.accounts.linkedExternal.toLocaleString()] })] })] })] }), _jsxs("div", { className: "rounded-lg border border-evermont-border bg-white p-6", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Recent transactions" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Today" }), _jsx("strong", { children: metrics.transactions.today })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Completed" }), _jsx("strong", { children: metrics.transactions.completed })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Pending" }), _jsx("strong", { children: metrics.transactions.pending })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Flagged" }), _jsx("strong", { children: metrics.transactions.flagged })] })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-2 gap-6", children: [_jsxs("div", { className: "rounded-lg border border-evermont-border bg-white p-6", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Pending items" }), _jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [_jsxs("li", { children: ["Document review: ", metrics.transactions.pending] }), _jsxs("li", { children: ["Member verification queue: ", metrics.members.pending] }), _jsxs("li", { children: ["Security alerts: ", metrics.security.alerts] })] })] }), _jsxs("div", { className: "rounded-lg border border-evermont-border bg-white p-6", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Account status" }), _jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [_jsxs("li", { children: ["Active: ", metrics.members.active] }), _jsxs("li", { children: ["Suspended: ", metrics.members.suspended] }), _jsxs("li", { children: ["Security critical events: ", metrics.security.criticalEvents] })] })] })] }), _jsxs("div", { className: "rounded-lg border border-evermont-border bg-white p-6", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Searchable member directory" }), _jsx("div", { className: "mb-4", children: _jsx("input", { type: "text", placeholder: "Search by member name or email", className: "w-full rounded border border-evermont-border px-3 py-2" }) }), _jsx("div", { className: "text-sm text-gray-500", children: "Search is available for prototype member review." })] })] }) }));
};
