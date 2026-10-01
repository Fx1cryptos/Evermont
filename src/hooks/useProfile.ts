import { useEffect, useState } from 'react'
import { Profile } from '@/types'
import { profileService } from '@/services/profileService'

export const useProfile = (userId: string | undefined) => {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await profileService.getProfile(userId)
        setProfile(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!userId) return
    try {
      setError(null)
      const updated = await profileService.updateProfile(userId, updates)
      setProfile(updated)
      return updated
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile'
      setError(message)
      throw err
    }
  }

  return { profile, loading, error, updateProfile }
}
