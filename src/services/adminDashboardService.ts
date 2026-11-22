import { DashboardMetrics, SecurityEvent } from '@/types/admin'

export const adminDashboardService = {
  async getMetrics(): Promise<DashboardMetrics | null> {
    // In production, this would fetch real metrics from the backend
    return null
  },

  async getSecurityEvents(): Promise<SecurityEvent[]> {
    // In production, this would fetch real security events
    return []
  },
}
