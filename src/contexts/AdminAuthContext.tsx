import React from 'react'
import { adminAuthService } from '@/services/adminAuthService'
import { AdminRole } from '@/types/admin'

interface AdminAuthContextType {
  isAdmin: boolean
  role?: AdminRole
  canViewMembers: boolean
  canEditMembers: boolean
  canViewAccounts: boolean
  canViewTransactions: boolean
  canManageSupport: boolean
  canViewAuditLogs: boolean
  canViewSecurity: boolean
}

const AdminAuthContext = React.createContext<AdminAuthContextType | undefined>(undefined)

export const AdminAuthProvider: React.FC<{ children: React.ReactNode; role?: AdminRole }> = ({
  children,
  role,
}) => {
  const isAdmin = Boolean(role)
  const value: AdminAuthContextType = {
    isAdmin,
    role,
    canViewMembers: role ? adminAuthService.canViewMembers(role) : false,
    canEditMembers: role ? adminAuthService.canEditMembers(role) : false,
    canViewAccounts: role ? adminAuthService.canViewAccounts(role) : false,
    canViewTransactions: role ? adminAuthService.canViewTransactions(role) : false,
    canManageSupport: role ? adminAuthService.canManageSupport(role) : false,
    canViewAuditLogs: role ? adminAuthService.canViewAuditLogs(role) : false,
    canViewSecurity: role ? adminAuthService.canViewSecurity(role) : false,
  }

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export const useAdminAuth = () => {
  const context = React.useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return context
}
