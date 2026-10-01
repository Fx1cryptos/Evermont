import { DashboardMetrics, SecurityEvent } from '@/types/admin'

// Demo dashboard data when real backend data is not available
const DEMO_METRICS: DashboardMetrics = {
  members: {
    total: 1247,
    active: 1089,
    pending: 98,
    suspended: 60,
  },
  accounts: {
    total: 2134,
    checking: 1245,
    savings: 789,
    linkedExternal: 100,
  },
  transactions: {
    today: 342,
    pending: 12,
    completed: 320,
    failed: 10,
    flagged: 3,
  },
  support: {
    openConversations: 18,
    aiAssisted: 245,
    humanEscalations: 42,
    resolved: 203,
  },
  security: {
    recentLogins: 89,
    failedAttempts: 7,
    alerts: 3,
    criticalEvents: 0,
  },
}

const DEMO_SECURITY_EVENTS: SecurityEvent[] = [
  {
    id: '1',
    type: 'FAILED_LOGIN_ATTEMPT',
    severity: 'WARNING',
    description: 'Multiple failed login attempts from IP 192.168.1.100',
    details: { attempts: 3, ipAddress: '192.168.1.100' },
    resolved: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    type: 'UNUSUAL_TRANSACTION',
    severity: 'HIGH',
    description: 'Large transaction amount flagged for review',
    affectedUserId: 'member-123',
    details: { amount: '15000.00', type: 'transfer' },
    resolved: false,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: 'ADMIN_ACTION',
    severity: 'INFO',
    description: 'Account status changed',
    details: { previousStatus: 'active', newStatus: 'suspended', reason: 'compliance review' },
    resolved: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const adminDashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    // In production, this would fetch real metrics from the backend
    return DEMO_METRICS
  },

  async getSecurityEvents(): Promise<SecurityEvent[]> {
    // In production, this would fetch real security events
    return DEMO_SECURITY_EVENTS
  },
}
