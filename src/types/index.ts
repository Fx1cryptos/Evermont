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
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (token: string, password: string) => Promise<void>
}

export interface Account {
  id: string
  userId: string
  accountNumber: string
  accountType: 'checking' | 'savings' | 'money_market'
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

export interface Notification {
  id: string
  userId: string
  type: 'transaction' | 'security' | 'promotional'
  title: string
  message: string
  read: boolean
  createdAt: string
}
