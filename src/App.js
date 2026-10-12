import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { MemberDetailPage } from '@/pages/admin/MemberDetailPage';
import { AccountHistoryPage } from '@/pages/admin/AccountHistoryPage';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { MemberDashboardPage } from '@/pages/MemberDashboardPage';
import { TransactionsPage } from '@/pages/TransactionsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AccountsPage } from '@/pages/AccountsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ServicePage } from '@/pages/ServicePage';
import { ROUTES } from '@/constants/routes';
const PortalEntry = () => {
    const { user, loading } = useAuth();
    if (loading)
        return _jsx("main", { className: "flex min-h-screen items-center justify-center text-sm text-slate-600", children: "Loading member portal..." });
    return _jsx(Navigate, { to: user ? ROUTES.DASHBOARD : ROUTES.LOGIN, replace: true });
};
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading)
        return _jsx("main", { className: "flex min-h-screen items-center justify-center text-sm text-slate-600", children: "Loading member portal..." });
    return user ? _jsx(_Fragment, { children: children }) : _jsx(Navigate, { to: ROUTES.LOGIN, replace: true });
};
export const App = () => {
    return (_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(PortalEntry, {}) }), _jsx(Route, { path: "/sign-in", element: _jsx(Login, {}) }), _jsx(Route, { path: "/signup", element: _jsx(Register, {}) }), _jsx(Route, { path: ROUTES.LOGIN, element: _jsx(Login, {}) }), _jsx(Route, { path: ROUTES.REGISTER, element: _jsx(Register, {}) }), _jsx(Route, { path: ROUTES.DASHBOARD, element: _jsx(ProtectedRoute, { children: _jsx(MemberDashboardPage, {}) }) }), _jsx(Route, { path: ROUTES.ACCOUNTS, element: _jsx(ProtectedRoute, { children: _jsx(AccountsPage, {}) }) }), _jsx(Route, { path: ROUTES.SETTINGS, element: _jsx(ProtectedRoute, { children: _jsx(SettingsPage, {}) }) }), _jsx(Route, { path: ROUTES.TRANSACTIONS, element: _jsx(ProtectedRoute, { children: _jsx(TransactionsPage, {}) }) }), _jsx(Route, { path: ROUTES.PROFILE, element: _jsx(ProtectedRoute, { children: _jsx(ProfilePage, {}) }) }), _jsx(Route, { path: "/services/:service", element: _jsx(ServicePage, {}) }), _jsx(Route, { path: "/admin", element: _jsx(AdminDashboardPage, {}) }), _jsx(Route, { path: "/admin/members/:id", element: _jsx(MemberDetailPage, {}) }), _jsx(Route, { path: "/admin/accounts/:id", element: _jsx(AccountHistoryPage, {}) })] }) }));
};
