import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Input = ({ label, error, helpText, className = '', ...props }) => {
    return (_jsxs("div", { className: "w-full", children: [label && _jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: label }), _jsx("input", { className: `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-evermont-gold focus:border-transparent ${error ? 'border-red-500' : 'border-evermont-border'} ${className}`, ...props }), error && _jsx("p", { className: "text-red-500 text-sm mt-1", children: error }), helpText && _jsx("p", { className: "text-gray-500 text-sm mt-1", children: helpText })] }));
};
