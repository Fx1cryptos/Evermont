import { Notification, NotificationPreference, NotificationType } from '@/types'
import { supabase } from '@/lib/supabase'


const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    userId: 'demo-user',
    type: 'transaction',
    title: 'Transfer Completed',
    message: 'Your transfer of $500.00 to savings account was completed successfully.',
    read: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    userId: 'demo-user',
    type: 'security',
    title: 'Account Access',
    message: 'Your account was accessed from a new device. If this wasn\'t you, please contact support.',
    read: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    userId: 'demo-user',
    type: 'account',
    title: 'Direct Deposit Received',
    message: 'Your salary deposit of $2,500.00 has been received.',
    read: true,
    readAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
]

const DEFAULT_PREFERENCES: NotificationPreference = {
  id: 'pref-default',
  userId: '',
  emailTransactions: true,
  emailSecurity: true,
  emailPromotional: false,
  pushTransactions: true,
  pushSecurity: true,
  smsTransactions: false,
  updatedAt: new Date().toISOString(),
}

export const notificationService = {
  async getNotifications(userId: string, limit = 20, offset = 0): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
        .range(offset, offset + limit - 1)

      if (error) {
        console.warn('Failed to fetch notifications from Supabase:', error)
        return DEMO_NOTIFICATIONS.slice(offset, offset + limit)
      }

      return (
        data?.map((notif) => ({
          id: notif.id,
          userId: notif.user_id,
          type: notif.type as NotificationType,
          title: notif.title,
          message: notif.message,
          read: notif.read,
          actionUrl: notif.action_url,
          createdAt: notif.created_at,
          readAt: notif.read_at,
        })) || []
      )
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return DEMO_NOTIFICATIONS
    }
  },

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false)

      if (error) {
        console.warn('Failed to fetch unread count:', error)
        return DEMO_NOTIFICATIONS.filter((n) => !n.read).length
      }

      return count || 0
    } catch (error) {
      console.error('Error fetching unread count:', error)
      return DEMO_NOTIFICATIONS.filter((n) => !n.read).length
    }
  },

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw new Error('Failed to mark notification as read')
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('read', false)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      throw new Error('Failed to mark all notifications as read')
    }
  },

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      throw new Error('Failed to delete notification')
    }
  },

  async getPreferences(userId: string): Promise<NotificationPreference> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.warn('Failed to fetch preferences:', error)
        return { ...DEFAULT_PREFERENCES, userId }
      }

      return data
        ? {
            id: data.id,
            userId: data.user_id,
            emailTransactions: data.email_transactions,
            emailSecurity: data.email_security,
            emailPromotional: data.email_promotional,
            pushTransactions: data.push_transactions,
            pushSecurity: data.push_security,
            smsTransactions: data.sms_transactions,
            updatedAt: data.updated_at,
          }
        : { ...DEFAULT_PREFERENCES, userId }
    } catch (error) {
      console.error('Error fetching preferences:', error)
      return { ...DEFAULT_PREFERENCES, userId }
    }
  },

  async updatePreferences(
    userId: string,
    updates: Partial<NotificationPreference>
  ): Promise<NotificationPreference> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .update({
          email_transactions: updates.emailTransactions,
          email_security: updates.emailSecurity,
          email_promotional: updates.emailPromotional,
          push_transactions: updates.pushTransactions,
          push_security: updates.pushSecurity,
          sms_transactions: updates.smsTransactions,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
        ? {
            id: data.id,
            userId: data.user_id,
            emailTransactions: data.email_transactions,
            emailSecurity: data.email_security,
            emailPromotional: data.email_promotional,
            pushTransactions: data.push_transactions,
            pushSecurity: data.push_security,
            smsTransactions: data.sms_transactions,
            updatedAt: data.updated_at,
          }
        : { ...DEFAULT_PREFERENCES, userId, ...updates }
    } catch (error) {
      console.error('Error updating preferences:', error)
      throw new Error('Failed to update notification preferences')
    }
  },
}
