import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const MetricCard = ({ title, value, subtitle, icon, variant = 'default', }) => {
    const variantStyles = {
        default: 'border-evermont-border bg-white',
        success: 'border-green-200 bg-green-50',
        warning: 'border-yellow-200 bg-yellow-50',
        danger: 'border-red-200 bg-red-50',
    };
    return (_jsx("div", { className: `rounded-lg border ${variantStyles[variant]} p-6`, children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: title }), _jsx("p", { className: "text-3xl font-bold text-gray-900 mt-2", children: value }), subtitle && _jsx("p", { className: "text-xs text-gray-500 mt-1", children: subtitle })] }), icon && _jsx("div", { className: "text-2xl opacity-50", children: icon })] }) }));
};
