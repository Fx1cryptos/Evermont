import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { MemberDetailPage } from '@/pages/admin/MemberDetailPage';
import { AccountHistoryPage } from '@/pages/admin/AccountHistoryPage';
import { ROUTES } from '@/constants/routes';
const AdminPage = ({ children }) => {
    const { user, loading: authLoading } = useAuth();
    const [authorized, setAuthorized] = useState(null);
    useEffect(() => {
        let active = true;
        const checkRole = async () => {
            if (!user) {
                if (active)
                    setAuthorized(false);
                return;
            }
            const { data } = await supabase.from('admin_roles').select('role').eq('user_id', user.id).maybeSingle();
            if (active)
                setAuthorized(Boolean(data?.role));
        };
        if (!authLoading)
            void checkRole();
        return () => { active = false; };
    }, [authLoading, user]);
    if (authLoading || (user && authorized === null))
        return _jsx("div", { className: "min-h-screen bg-[#f3f6fc] p-8 text-slate-600", role: "status", "aria-live": "polite", children: "Verifying administrator access\u2026" });
    if (!user || !authorized)
        return _jsx(Navigate, { to: ROUTES.LOGIN, replace: true });
    return _jsx(_Fragment, { children: children });
};
export const AdminRoutes = () => {
    const { pathname } = useLocation();
    const content = pathname.startsWith('/admin/members/')
        ? _jsx(MemberDetailPage, {})
        : pathname.startsWith('/admin/accounts/')
            ? _jsx(AccountHistoryPage, {})
            : _jsx(AdminDashboardPage, {});
    return _jsx(AdminPage, { children: content });
};
export default AdminRoutes;
