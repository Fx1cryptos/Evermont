import { AdminRole } from '@/types/admin'

const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  SUPER_ADMIN: ['*'],
  ADMIN: [
    'members:view',
    'members:update',
    'accounts:view',
    'accounts:update_status',
    'transactions:view',
    'transactions:review',
    'support:view',
    'support:manage',
    'audit_logs:view',
  ],
  OPERATIONS: [
    'members:view',
    'accounts:view',
    'transactions:view',
    'transactions:review',
    'support:view',
    'audit_logs:view',
  ],
  SUPPORT: [
    'members:view',
    'accounts:view',
    'support:view',
    'support:manage',
  ],
  COMPLIANCE: [
    'members:view',
    'accounts:view',
    'transactions:view',
    'audit_logs:view',
    'security:view',
  ],
  READ_ONLY: [
    'members:view',
    'accounts:view',
    'transactions:view',
  ],
}

export const adminAuthService = {
  hasPermission(role: AdminRole, requiredPermission: string): boolean {
    const permissions = ROLE_PERMISSIONS[role]
    if (!permissions) return false
    if (permissions.includes('*')) return true
    return permissions.includes(requiredPermission)
  },

  canViewMembers(role: AdminRole): boolean {
    return this.hasPermission(role, 'members:view')
  },

  canEditMembers(role: AdminRole): boolean {
    return this.hasPermission(role, 'members:update')
  },

  canViewAccounts(role: AdminRole): boolean {
    return this.hasPermission(role, 'accounts:view')
  },

  canUpdateAccountStatus(role: AdminRole): boolean {
    return this.hasPermission(role, 'accounts:update_status')
  },

  canViewTransactions(role: AdminRole): boolean {
    return this.hasPermission(role, 'transactions:view')
  },

  canReviewTransactions(role: AdminRole): boolean {
    return this.hasPermission(role, 'transactions:review')
  },

  canViewSupport(role: AdminRole): boolean {
    return this.hasPermission(role, 'support:view')
  },

  canManageSupport(role: AdminRole): boolean {
    return this.hasPermission(role, 'support:manage')
  },

  canViewAuditLogs(role: AdminRole): boolean {
    return this.hasPermission(role, 'audit_logs:view')
  },

  canViewSecurity(role: AdminRole): boolean {
    return this.hasPermission(role, 'security:view')
  },
}
