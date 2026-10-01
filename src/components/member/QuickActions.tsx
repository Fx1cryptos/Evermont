import React, { useState } from 'react'
import { Repeat, ArrowDownLeft, ArrowUpRight, Receipt, Send, QrCode, Link2, Landmark } from 'lucide-react'
import { Account } from '@/types'
import ActionModal, { QuickActionDef } from '@/components/member/ActionModal'

const ACTIONS: QuickActionDef[] = [
  {
    id: 'transfer',
    label: 'Transfer Money',
    description: 'Move funds between your Evermont accounts instantly.',
    fields: [
      { name: 'from', label: 'From account', type: 'select', options: ['account'] },
      { name: 'to', label: 'To account', type: 'select', options: ['account'] },
      { name: 'amount', label: 'Amount', type: 'currency' },
      { name: 'note', label: 'Note (optional)', type: 'text', placeholder: 'e.g. Monthly savings' },
    ],
    successNote: 'Your internal transfer has been scheduled and will post immediately.',
  },
  {
    id: 'deposit',
    label: 'Deposit',
    description: 'Add money to an Evermont account.',
    fields: [
      { name: 'to', label: 'Deposit into', type: 'select', options: ['account'] },
      { name: 'amount', label: 'Amount', type: 'currency' },
      {
        name: 'method',
        label: 'Deposit method',
        type: 'select',
        options: ['Mobile check deposit', 'Direct deposit', 'Cash at branch'],
      },
    ],
    successNote: 'Your deposit request was received. Funds availability depends on the deposit method.',
  },
  {
    id: 'withdraw',
    label: 'Withdraw',
    description: 'Take cash out of an Evermont account.',
    fields: [
      { name: 'from', label: 'Withdraw from', type: 'select', options: ['account'] },
      { name: 'amount', label: 'Amount', type: 'currency' },
      { name: 'method', label: 'Method', type: 'select', options: ['ATM withdrawal', 'In-branch withdrawal', 'Cash-back at register'] },
    ],
    successNote: 'Your withdrawal was approved. Show this confirmation at the ATM or branch.',
  },
  {
    id: 'bill',
    label: 'Pay a Bill',
    description: 'Schedule a one-time payment to a biller.',
    fields: [
      { name: 'biller', label: 'Biller name', type: 'text', placeholder: 'e.g. City Power & Light' },
      { name: 'from', label: 'Pay from', type: 'select', options: ['account'] },
      { name: 'amount', label: 'Amount', type: 'currency' },
      { name: 'date', label: 'Payment date', type: 'date' },
    ],
    successNote: 'Your bill payment is scheduled. You will receive an alert when it posts.',
  },
  {
    id: 'send',
    label: 'Send Money',
    description: 'Send funds to another person with Zelle-style instant pay.',
    fields: [
      { name: 'recipient', label: 'Recipient name or email', type: 'text', placeholder: 'e.g. jordan@example.com' },
      { name: 'from', label: 'Send from', type: 'select', options: ['account'] },
      { name: 'amount', label: 'Amount', type: 'currency' },
    ],
    successNote: 'Money sent. The recipient will be notified instantly.',
  },
  {
    id: 'receive',
    label: 'Receive Money',
    description: 'Share your member details so someone can pay you.',
    fields: [],
    shareable: true,
    successNote: '',
  },
  {
    id: 'link',
    label: 'Link External Account',
    description: 'Connect an account at another bank to move money in and out.',
    fields: [
      { name: 'bank', label: 'Bank name', type: 'text', placeholder: 'e.g. First National Bank' },
      { name: 'accountNumber', label: 'Account number (last 4)', type: 'text', placeholder: '0000' },
      { name: 'routing', label: 'Routing number', type: 'text', placeholder: '000000000' },
    ],
    successNote: 'Verification micro-deposits have been initiated. Linking completes in 1–2 business days.',
  },
  {
    id: 'loan',
    label: 'Apply for Loan',
    description: 'Check your rate on a personal, auto, home or crypto-backed loan.',
    fields: [
      {
        name: 'type',
        label: 'Loan type',
        type: 'select',
        options: ['Personal Loan', 'Auto Loan', 'Home Loan', 'Crypto-Backed Loan'],
      },
      { name: 'amount', label: 'Requested amount', type: 'currency' },
      { name: 'term', label: 'Term', type: 'select', options: ['12 months', '24 months', '36 months', '60 months', '360 months'] },
      { name: 'income', label: 'Annual income', type: 'currency' },
    ],
    successNote: 'Your application was submitted. A lending specialist will follow up with your decision.',
  },
]

const ICONS = {
  transfer: Repeat,
  deposit: ArrowDownLeft,
  withdraw: ArrowUpRight,
  bill: Receipt,
  send: Send,
  receive: QrCode,
  link: Link2,
  loan: Landmark,
} as const

const QuickActions: React.FC<{ accounts: Account[] }> = ({ accounts }) => {
  const [active, setActive] = useState<QuickActionDef | null>(null)

  return (
    <>
      <div className="grid grid-cols-4 gap-3 sm:gap-4">
        {ACTIONS.map((action) => {
          const Icon = ICONS[action.id as keyof typeof ICONS]
          return (
            <button
              key={action.id}
              onClick={() => setActive(action)}
              className="group flex flex-col items-center gap-2 rounded-xl bg-white border border-evermont-border p-3 sm:p-4 shadow-sm hover:shadow-md hover:border-evermont-blue/40 hover:-translate-y-0.5 transition-all duration-200"
            >
              <span className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-blue-50 group-hover:bg-evermont-blue flex items-center justify-center transition-colors">
                <Icon className="h-5 w-5 text-evermont-blue group-hover:text-white transition-colors" />
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-evermont-dark text-center leading-tight">
                {action.label}
              </span>
            </button>
          )
        })}
      </div>
      <ActionModal action={active} accounts={accounts} onClose={() => setActive(null)} />
    </>
  )
}

export default QuickActions
