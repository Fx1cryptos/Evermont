import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Button = ({ variant = 'primary', size = 'md', loading = false, className = '', disabled, children, ...props }) => {
    const baseStyles = 'font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2';
    const variants = {
        primary: 'bg-evermont-blue text-white hover:bg-blue-700 disabled:bg-gray-400',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 disabled:bg-gray-300',
        outline: 'border-2 border-evermont-blue text-evermont-blue hover:bg-blue-50 disabled:border-gray-400 disabled:text-gray-400',
        danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400',
    };
    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };
    return (_jsxs("button", { className: `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`, disabled: disabled || loading, ...props, children: [loading && _jsx("span", { className: "animate-spin", children: "\u23F3" }), children] }));
};
