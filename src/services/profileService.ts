import { Profile, ValidationError } from '@/types'
import { supabase } from '@/lib/supabase'
import { validateEmail, validateName, validatePhone, validateZipCode } from '@/utils/validation'

const DEMO_PROFILE: Profile = {
  id: 'demo-user',
  email: 'demo@evermont.com',
  firstName: 'Demo',
  lastName: 'Member',
  phone: '(555) 123-4567',
  street: '123 Financial Ave',
  city: 'New York',
  state: 'NY',
  zipCode: '10001',
  country: 'United States',
  createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
}

export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.warn('Failed to fetch profile from Supabase:', error)
        return userId === 'demo-user' ? DEMO_PROFILE : null
      }

      return data
        ? {
            id: data.id,
            email: data.email,
            firstName: data.first_name,
            lastName: data.last_name,
            phone: data.phone,
            street: data.street,
            city: data.city,
            state: data.state,
            zipCode: data.zip_code,
            country: data.country,
            avatarUrl: data.avatar_url,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          }
        : null
    } catch (error) {
      console.error('Error fetching profile:', error)
      return userId === 'demo-user' ? DEMO_PROFILE : null
    }
  },

  validateProfile(profile: Partial<Profile>): ValidationError[] {
    const errors: ValidationError[] = []

    if (profile.email) {
      errors.push(...validateEmail(profile.email))
    }

    if (profile.firstName) {
      errors.push(...validateName(profile.firstName, 'First name'))
    }

    if (profile.lastName) {
      errors.push(...validateName(profile.lastName, 'Last name'))
    }

    if (profile.phone) {
      errors.push(...validatePhone(profile.phone))
    }

    if (profile.zipCode) {
      errors.push(...validateZipCode(profile.zipCode))
    }

    return errors
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const errors = this.validateProfile(updates)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.map((e) => e.message).join(', ')}`)
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          phone: updates.phone,
          street: updates.street,
          city: updates.city,
          state: updates.state,
          zip_code: updates.zipCode,
          country: updates.country,
          avatar_url: updates.avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
        ? {
            id: data.id,
            email: data.email,
            firstName: data.first_name,
            lastName: data.last_name,
            phone: data.phone,
            street: data.street,
            city: data.city,
            state: data.state,
            zipCode: data.zip_code,
            country: data.country,
            avatarUrl: data.avatar_url,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          }
        : updates as Profile
    } catch (error) {
      console.error('Error updating profile:', error)
      throw new Error('Failed to update profile')
    }
  },
}
