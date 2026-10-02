import { AuditLog } from '@/types/admin'
import { supabase } from '@/lib/supabase'

export const auditService = {
  async createAuditLog(
    staffId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    details: Record<string, unknown>
  ): Promise<AuditLog> {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    try {
      if (!supabase) {
        return {
          id,
          staffId,
          action,
          resourceType,
          resourceId,
          details,
          status: 'success',
          timestamp: now,
        }
      }

      const { data, error } = await supabase.from('audit_logs').insert([
        {
          id,
          staff_id: staffId,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          details,
          status: 'success',
          timestamp: now,
        },
      ])

      if (error) {
        console.warn('Failed to create audit log:', error)
      }

      return {
        id,
        staffId,
        action,
        resourceType,
        resourceId,
        details,
        status: 'success',
        timestamp: now,
      }
    } catch (error) {
      console.error('Error creating audit log:', error)
      throw new Error('Failed to create audit log')
    }
  },

  async getAuditLogs(limit = 50, offset = 0): Promise<AuditLog[]> {
    try {
      if (!supabase) {
        return []
      }

      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit)
        .range(offset, offset + limit - 1)

      if (error) {
        console.warn('Failed to fetch audit logs:', error)
        return []
      }

      return (
        data?.map((log) => ({
          id: log.id,
          staffId: log.staff_id,
          action: log.action,
          resourceType: log.resource_type,
          resourceId: log.resource_id,
          details: log.details,
          status: log.status,
          timestamp: log.timestamp,
          metadata: log.metadata,
        })) || []
      )
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      return []
    }
  },

  async getAuditLogsByStaff(staffId: string, limit = 50): Promise<AuditLog[]> {
    try {
      if (!supabase) {
        return []
      }

      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('staff_id', staffId)
        .order('timestamp', { ascending: false })
        .limit(limit)

      if (error) {
        console.warn('Failed to fetch staff audit logs:', error)
        return []
      }

      return (
        data?.map((log) => ({
          id: log.id,
          staffId: log.staff_id,
          action: log.action,
          resourceType: log.resource_type,
          resourceId: log.resource_id,
          details: log.details,
          status: log.status,
          timestamp: log.timestamp,
          metadata: log.metadata,
        })) || []
      )
    } catch (error) {
      console.error('Error fetching staff audit logs:', error)
      return []
    }
  },
}
