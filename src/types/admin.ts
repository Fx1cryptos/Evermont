export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'OPERATIONS' | 'SUPPORT' | 'COMPLIANCE' | 'READ_ONLY'

export interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: AdminRole
  status: 'active' | 'inactive' | 'suspended'
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export interface AdminPermission {
  resource: string
  action: 'view' | 'create' | 'update' | 'delete' | 'review' | 'approve'
}

export interface AuditLog {
  id: string
  staffId: string
  action: string
  resourceType: string
  resourceId: string
  details: Record<string, unknown>
  status: 'success' | 'failure'
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface SupportConversation {
  id: string
  memberId: string
  topic: string
  status: 'AI_ASSISTED' | 'HUMAN_REQUIRED' | 'IN_REVIEW' | 'RESOLVED'
  aiAssisted: boolean
  assignedStaff?: string
  createdAt: string
  updatedAt: string
  messageCount: number
}

export interface SecurityEvent {
  id: string
  type: string
  severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL'
  description: string
  affectedUserId?: string
  details: Record<string, unknown>
  resolved: boolean
  createdAt: string
}

export interface DashboardMetrics {
  members: {
    total: number
    active: number
    pending: number
    suspended: number
  }
  accounts: {
    total: number
    checking: number
    savings: number
    linkedExternal: number
  }
  transactions: {
    today: number
    pending: number
    completed: number
    failed: number
    flagged: number
  }
  support: {
    openConversations: number
    aiAssisted: number
    humanEscalations: number
    resolved: number
  }
  security: {
    recentLogins: number
    failedAttempts: number
    alerts: number
    criticalEvents: number
  }
}
