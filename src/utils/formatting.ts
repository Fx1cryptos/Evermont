export const accountTypeLabel = (accountType: string): string => {
  const labels: Record<string, string> = {
    checking: 'Checking',
    savings: 'Savings',
    money_market: 'Money Market',
    investment: 'Investments',
    retirement_401k: '401(k)',
    crypto: 'Crypto',
    loan: 'Loan',
    personal_loan: 'Personal Loan',
    auto_loan: 'Auto Loan',
    home_loan: 'Home Loan',
    crypto_loan: 'Crypto-Backed Loan',
  }
  return labels[accountType] ?? accountType
}

export const isLoanType = (accountType: string): boolean =>
  accountType.endsWith('_loan') || accountType === 'loan'

export const formatCurrency = (amount: string | number, currency: string = 'USD'): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(numAmount)
}

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export const formatTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export const maskAccountNumber = (accountNumber: string): string => {
  if (accountNumber.length <= 4) return accountNumber
  return `****${accountNumber.slice(-4)}`
}

export const timeAgo = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000)
  
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  
  return formatDate(d)
}
