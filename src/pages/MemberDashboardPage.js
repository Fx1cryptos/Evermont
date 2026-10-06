import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/constants/routes';
export const MemberDashboardPage = () => {
    const { user, signOut } = useAuth();
    return (_jsxs("main", { className: "min-h-screen bg-gray-50", children: [_jsx("header", { className: "border-b border-evermont-border bg-white px-6 py-4", children: _jsxs("div", { className: "mx-auto flex max-w-6xl items-center justify-between", children: [_jsx(Link, { to: ROUTES.HOME, className: "text-lg font-bold text-evermont-blue", children: "EVERMONT" }), _jsx("button", { type: "button", onClick: () => void signOut(), className: "text-sm font-medium text-evermont-blue hover:underline", children: "Sign out" })] }) }), _jsxs("section", { className: "mx-auto max-w-6xl px-6 py-10", children: [_jsx("p", { className: "text-sm font-medium text-evermont-blue", children: "Member dashboard" }), _jsxs("h1", { className: "mt-2 text-3xl font-bold text-gray-900", children: ["Welcome", user?.firstName ? `, ${user.firstName}` : '', "."] }), _jsxs("div", { className: "mt-8 rounded-lg border border-evermont-border bg-white p-6 shadow-sm", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Your Evermont membership" }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: "Your account is ready. Account details and balances will appear here once they are available." })] })] })] }));
};
