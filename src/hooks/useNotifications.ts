import { useEffect, useState } from 'react'
import { Notification } from '@/types'
import { notificationService } from '@/services/notificationService'

export const useNotifications = (userId: string | undefined) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchNotifications = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await notificationService.getNotifications(userId)
        setNotifications(data)
        const count = await notificationService.getUnreadCount(userId)
        setUnreadCount(count)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load notifications')
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [userId])

  const markAsRead = async (notificationId: string) => {
    if (!userId) return
    try {
      await notificationService.markAsRead(notificationId, userId)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const markAllAsRead = async () => {
    if (!userId) return
    try {
      await notificationService.markAllAsRead(userId)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Error marking all as read:', err)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    if (!userId) return
    try {
      await notificationService.deleteNotification(notificationId, userId)
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      const count = await notificationService.getUnreadCount(userId)
      setUnreadCount(count)
    } catch (err) {
      console.error('Error deleting notification:', err)
    }
  }

  return { notifications, unreadCount, loading, error, markAsRead, markAllAsRead, deleteNotification }
}
