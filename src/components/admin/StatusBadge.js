import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
const statusStyles = {
    active: { bg: 'bg-green-100', text: 'text-green-800', icon: _jsx(CheckCircle, { size: 14 }) },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: _jsx(AlertTriangle, { size: 14 }) },
    suspended: { bg: 'bg-red-100', text: 'text-red-800', icon: _jsx(AlertCircle, { size: 14 }) },
    failed: { bg: 'bg-red-100', text: 'text-red-800', icon: _jsx(AlertCircle, { size: 14 }) },
    completed: { bg: 'bg-green-100', text: 'text-green-800', icon: _jsx(CheckCircle, { size: 14 }) },
    warning: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: _jsx(AlertTriangle, { size: 14 }) },
    critical: { bg: 'bg-red-100', text: 'text-red-800', icon: _jsx(AlertCircle, { size: 14 }) },
    info: { bg: 'bg-blue-100', text: 'text-blue-800', icon: _jsx(Info, { size: 14 }) },
};
export const StatusBadge = ({ status, label }) => {
    const style = statusStyles[status];
    return (_jsxs("span", { className: `inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`, children: [style.icon, label] }));
};
