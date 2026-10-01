export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  ACCOUNTS: '/accounts',
  ACCOUNT_DETAIL: '/accounts/:accountType',
  TRANSACTIONS: '/transactions',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const

/** Build a concrete path for an account-type detail page, e.g. accountPath('checking') → /accounts/checking */
export const accountPath = (accountType: string): string => `/accounts/${accountType}`
