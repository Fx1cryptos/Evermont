import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const AdminTable = ({ columns, data, isLoading = false, emptyMessage = 'No data available', }) => {
    if (isLoading) {
        return (_jsx("div", { className: "bg-white rounded-lg border border-evermont-border p-6 text-center", children: _jsx("p", { className: "text-gray-500", children: "Loading..." }) }));
    }
    if (!data || data.length === 0) {
        return (_jsx("div", { className: "bg-white rounded-lg border border-evermont-border p-6 text-center", children: _jsx("p", { className: "text-gray-500", children: emptyMessage }) }));
    }
    return (_jsx("div", { className: "bg-white rounded-lg border border-evermont-border overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsx("tr", { className: "border-b border-evermont-border bg-gray-50", children: columns.map((col) => (_jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-700", children: col.label }, col.key))) }) }), _jsx("tbody", { children: data.map((row, idx) => (_jsx("tr", { className: "border-b border-evermont-border hover:bg-gray-50", children: columns.map((col) => {
                            const value = row[col.key];
                            return (_jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: col.render ? col.render(value, row) : String(value) }, col.key));
                        }) }, idx))) })] }) }));
};
