import {
  ShoppingBag,
  Fuel,
  Home,
  Film,
  Zap,
  Banknote,
  ArrowLeftRight,
  PiggyBank,
  TrendingUp,
  Bitcoin,
  GraduationCap,
  Car,
  CreditCard,
  Utensils,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

export interface MerchantInfo {
  category: string
  Icon: LucideIcon
  /** tailwind classes for the icon chip */
  chip: string
}

const MERCHANT_RULES: Array<{ match: RegExp; info: MerchantInfo }> = [
  { match: /whole foods|grocer|market|trader|kroger|safeway/i, info: { category: 'Groceries', Icon: ShoppingBag, chip: 'bg-emerald-100 text-emerald-700' } },
  { match: /shell|gas|fuel|chevron|exxon/i, info: { category: 'Fuel', Icon: Fuel, chip: 'bg-orange-100 text-orange-700' } },
  { match: /rent|oakwood|apartment|mortgage/i, info: { category: 'Housing', Icon: Home, chip: 'bg-indigo-100 text-indigo-700' } },
  { match: /netflix|hulu|spotify|subscription|streaming/i, info: { category: 'Subscriptions', Icon: Film, chip: 'bg-rose-100 text-rose-700' } },
  { match: /power|light|electric|utility|water|internet|comcast/i, info: { category: 'Utilities', Icon: Zap, chip: 'bg-amber-100 text-amber-700' } },
  { match: /payroll|direct deposit|salary|employer/i, info: { category: 'Income', Icon: Banknote, chip: 'bg-green-100 text-green-700' } },
  { match: /transfer/i, info: { category: 'Transfers', Icon: ArrowLeftRight, chip: 'bg-blue-100 text-blue-700' } },
  { match: /savings|auto-save|interest payment/i, info: { category: 'Savings', Icon: PiggyBank, chip: 'bg-teal-100 text-teal-700' } },
  { match: /401\(k\)|retirement/i, info: { category: 'Retirement', Icon: GraduationCap, chip: 'bg-purple-100 text-purple-700' } },
  { match: /dividend|etf|index fund|buy|sell|brokerage/i, info: { category: 'Investments', Icon: TrendingUp, chip: 'bg-sky-100 text-sky-700' } },
  { match: /btc|eth|crypto|bitcoin|ethereum/i, info: { category: 'Crypto', Icon: Bitcoin, chip: 'bg-orange-100 text-orange-700' } },
  { match: /auto|car|vehicle|dealership/i, info: { category: 'Auto', Icon: Car, chip: 'bg-slate-100 text-slate-700' } },
  { match: /loan payment|auto-debit|loan/i, info: { category: 'Loan Payment', Icon: CreditCard, chip: 'bg-red-100 text-red-700' } },
  { match: /restaurant|cafe|coffee|grill|pizza/i, info: { category: 'Dining', Icon: Utensils, chip: 'bg-amber-100 text-amber-700' } },
]

const FALLBACK: MerchantInfo = { category: 'General', Icon: Wallet, chip: 'bg-gray-100 text-gray-600' }

export const merchantInfo = (description: string): MerchantInfo =>
  MERCHANT_RULES.find((rule) => rule.match.test(description))?.info ?? FALLBACK
