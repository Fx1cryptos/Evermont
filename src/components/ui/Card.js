import { jsx as _jsx } from "react/jsx-runtime";
export const Card = ({ className = '', children }) => {
    return (_jsx("div", { className: `bg-white rounded-lg shadow-sm border border-evermont-border p-6 ${className}`, children: children }));
};
