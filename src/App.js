import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { MemberDetailPage } from '@/pages/admin/MemberDetailPage';
import { AccountHistoryPage } from '@/pages/admin/AccountHistoryPage';
import { Login } from '@/pages/auth/Login';
import { HomePage } from '@/pages/HomePage';
import { ROUTES } from '@/constants/routes';
export const App = () => {
    return (_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: ROUTES.LOGIN, element: _jsx(Login, {}) }), _jsx(Route, { path: "/admin", element: _jsx(AdminDashboardPage, {}) }), _jsx(Route, { path: "/admin/members/:id", element: _jsx(MemberDetailPage, {}) }), _jsx(Route, { path: "/admin/accounts/:id", element: _jsx(AccountHistoryPage, {}) })] }) }));
};
