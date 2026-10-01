export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  createdAt: string
  updatedAt: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInAsDemo: () => void
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (token: string, password: string) => Promise<void>
}

export interface Profile {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  street?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

export interface Account {
  id: string
  userId: string
  accountNumber: string
  accountType:
    | 'checking'
    | 'savings'
    | 'money_market'
    | 'investment'
    | 'retirement_401k'
    | 'crypto'
    | 'loan'
  balance: string
  currency: string
  status: 'active' | 'inactive' | 'frozen'
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  accountId: string
  type: 'debit' | 'credit'
  amount: string
  description: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
  completedAt: string | null
}

export interface Beneficiary {
  id: string
  userId: string
  name: string
  accountNumber: string
  bankName: string
  createdAt: string
}

export type NotificationType = 'transaction' | 'security' | 'account' | 'system' | 'promotional'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  actionUrl?: string
  createdAt: string
  readAt?: string | null
}

export interface NotificationPreference {
  id: string
  userId: string
  emailTransactions: boolean
  emailSecurity: boolean
  emailPromotional: boolean
  pushTransactions: boolean
  pushSecurity: boolean
  smsTransactions: boolean
  updatedAt: string
}

export interface ValidationError {
  field: string
  message: string
}
