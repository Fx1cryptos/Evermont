export const BANKING_SERVICES = {
  ach: {
    type: 'ach',
    title: 'ACH Transfer',
    path: '/services/ach',
    description: 'Prepare a transfer request to another U.S. bank account.',
  },
  mobile: {
    type: 'mobile_deposit',
    title: 'Mobile Deposit',
    path: '/services/mobile-deposit',
    description: 'Prepare a deposit request with front and back images.',
  },
  check: {
    type: 'check_deposit',
    title: 'Check Deposit',
    path: '/services/check-deposit',
    description: 'Prepare a check deposit request to one of your accounts.',
  },
  wire: {
    type: 'wire',
    title: 'Wire Transfer',
    path: '/services/wire',
    description: 'Prepare a wire request. Nothing is sent from this page.',
  },
} as const

export type BankingServiceKey = keyof typeof BANKING_SERVICES

export const BANKING_SERVICE_PATHS = Object.values(BANKING_SERVICES).map((service) => service.path)

export function bankingServiceForPath(path: string): (typeof BANKING_SERVICES)[BankingServiceKey] | null {
  return Object.values(BANKING_SERVICES).find((service) => service.path === path) ?? null
}

export const ACTIVATION_REQUIRED_TITLE = 'Account Activation Required'
export const ACTIVATION_REQUIRED_BODY = 'Your account must be activated before you can access this banking service. Please complete your account activation to unlock ACH transfers, mobile deposits, check deposits, and wire transfers.'
export const ACTIVATE_ACCOUNT_LABEL = 'Activate My Account'

/** ABA routing checksum, weights 3-7-1. */
export function isValidAbaRouting(value: string): boolean {
  if (!/^\d{9}$/.test(value)) return false
  const digits = value.split('').map(Number)
  const sum = 3 * (digits[0] + digits[3] + digits[6]) + 7 * (digits[1] + digits[4] + digits[7]) + (digits[2] + digits[5] + digits[8])
  return sum % 10 === 0
}

/** ISO 9362 BIC: 8 or 11 characters. */
export function isValidSwiftBic(value: string): boolean {
  return /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(value.trim().toUpperCase())
}

export function parseAmount(value: string): number | null {
  if (!/^\d+(\.\d{1,2})?$/.test(value.trim())) return null
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) return null
  return amount
}

export function accountLast4(value: string): string | null {
  const digits = value.replace(/\D/g, '')
  if (digits.length < 4 || digits.length > 17) return null
  return digits.slice(-4)
}

export function maskAccount(value: string): string {
  const last4 = accountLast4(value)
  return last4 ? `••••${last4}` : '••••'
}
