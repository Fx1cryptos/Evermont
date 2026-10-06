import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { adminAuthService } from '@/services/adminAuthService';
const AdminAuthContext = React.createContext(undefined);
export const AdminAuthProvider = ({ children, role, }) => {
    const isAdmin = Boolean(role);
    const value = {
        isAdmin,
        role,
        canViewMembers: role ? adminAuthService.canViewMembers(role) : false,
        canEditMembers: role ? adminAuthService.canEditMembers(role) : false,
        canViewAccounts: role ? adminAuthService.canViewAccounts(role) : false,
        canViewTransactions: role ? adminAuthService.canViewTransactions(role) : false,
        canManageSupport: role ? adminAuthService.canManageSupport(role) : false,
        canViewAuditLogs: role ? adminAuthService.canViewAuditLogs(role) : false,
        canViewSecurity: role ? adminAuthService.canViewSecurity(role) : false,
    };
    return _jsx(AdminAuthContext.Provider, { value: value, children: children });
};
export const useAdminAuth = () => {
    const context = React.useContext(AdminAuthContext);
    if (!context) {
        throw new Error('useAdminAuth must be used within AdminAuthProvider');
    }
    return context;
};
