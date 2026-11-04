import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PortalShell } from '@/components/member/PortalShell'
import { FileField, ReviewList, TextField } from '@/components/member/banking/ServiceFields'
import { useAuth } from '@/contexts/AuthContext'
import { useActivationGate } from '@/hooks/useActivationGate'
import { accountService } from '@/services/accountService'
import { insertPendingServiceRequest, serviceImageBucketReady, serviceRequestTableReady, type ServiceRequestDraft } from '@/services/serviceRequestService'
import { ACTIVATE_ACCOUNT_LABEL, ACTIVATION_REQUIRED_BODY, ACTIVATION_REQUIRED_TITLE, accountLast4, isValidAbaRouting, isValidSwiftBic, maskAccount, parseAmount, type BankingServiceKey, BANKING_SERVICES } from '@/lib/bankingServices'
import { ROUTES } from '@/constants/routes'
import type { Account } from '@/types'

type Step = 'edit' | 'review'

const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

export const MemberBankingServicePage: React.FC<{ service: BankingServiceKey }> = ({ service }) => {
  const meta = BANKING_SERVICES[service]
  const { user, loading: authLoading } = useAuth()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [accountsError, setAccountsError] = useState('')
  const [accountsLoading, setAccountsLoading] = useState(true)
  const total = useMemo(() => accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0), [accounts])
  const { check } = useActivationGate(user?.id, total)
  const [gate, setGate] = useState<'loading' | 'error' | 'closed' | 'open'>('loading')
  const [fee, setFee] = useState<number | null>(null)

  useEffect(() => {
    if (!user) return
    let active = true
    setAccountsLoading(true)
    accountService.getAccounts(user.id).then((rows) => {
      if (!active) return
      setAccounts(rows)
    }).catch(() => {
      if (active) setAccountsError('We could not load your accounts.')
    }).finally(() => { if (active) setAccountsLoading(false) })
    return () => { active = false }
  }, [user])

  useEffect(() => {
    if (!user || accountsLoading) return
    let active = true
    setGate('loading')
    check().then((result) => {
      if (!active) return
      setFee(result.fee)
      setGate(result.activated ? 'open' : 'closed')
    }).catch(() => { if (active) setGate('error') })
    return () => { active = false }
  }, [user, accountsLoading, check])

  if (authLoading || (user && (accountsLoading || gate === 'loading'))) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb] text-sm text-slate-500">Checking your account…</main>
  }
  if (!user) return <main className="p-8"><Link to={ROUTES.LOGIN}>Sign in</Link></main>

  return (
    <PortalShell title={meta.title} eyebrow="Banking service">
      <div className="mx-auto max-w-xl space-y-5">
        <p className="text-sm leading-6 text-slate-600">{meta.description}</p>
        {accountsError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{accountsError}</p>}
        {gate === 'error' && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">We could not verify activation. This service stays closed.</p>}
        {gate === 'closed' && (
          <section className="rounded-2xl border border-[#C9A227] bg-white p-6" aria-labelledby="activation-required-title">
            <h2 id="activation-required-title" className="text-xl font-semibold text-[#0504AA]">{ACTIVATION_REQUIRED_TITLE}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{ACTIVATION_REQUIRED_BODY}</p>
            {fee != null && <p className="mt-3 text-sm text-slate-600">Recorded activation fee: {money(fee)}.</p>}
            <Link to={`${ROUTES.ACTIVATION}?next=${encodeURIComponent(meta.path)}`} className="mt-5 inline-flex rounded-xl bg-[#0504AA] px-4 py-2.5 text-sm font-semibold text-white">{ACTIVATE_ACCOUNT_LABEL}</Link>
          </section>
        )}
        {gate === 'open' && <ServiceForm service={service} memberId={user.id} accounts={accounts} />}
      </div>
    </PortalShell>
  )
}

const ServiceForm: React.FC<{ service: BankingServiceKey; memberId: string; accounts: Account[] }> = ({ service, memberId, accounts }) => {
  if (service === 'ach') return <AchForm memberId={memberId} />
  if (service === 'mobile') return <MobileForm memberId={memberId} />
  if (service === 'check') return <CheckForm memberId={memberId} accounts={accounts} />
  return <WireForm memberId={memberId} />
}

const IntegrationNotice: React.FC = () => (
  <p role="status" className="rounded-xl border border-[#C9A227] bg-[#fffaf0] px-4 py-3 text-sm text-[#101533]">Awaiting banking integration. Final submission is disabled. No money is moved and no ledger entry is created.</p>
)

const ReviewActions: React.FC<{
  busy: boolean
  ready: boolean | null
  error: string
  onBack: () => void
  onSubmit: () => void
}> = ({ busy, ready, error, onBack, onSubmit }) => (
  <div className="space-y-3">
    {ready === false && <IntegrationNotice />}
    {ready === null && <p className="text-sm text-slate-500">Checking whether requests can be saved…</p>}
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    <div className="flex flex-col gap-3 sm:flex-row">
      <button type="button" onClick={onBack} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-[#0504AA]">Back</button>
      <button type="button" onClick={onSubmit} disabled={busy || ready !== true} aria-disabled={busy || ready !== true} className="rounded-xl bg-[#0504AA] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Checking…' : ready === true ? 'Save pending request' : 'Awaiting banking integration'}</button>
    </div>
  </div>
)

function useIntegration(needsImages: boolean) {
  const [ready, setReady] = useState<boolean | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    Promise.all([serviceRequestTableReady(), needsImages ? serviceImageBucketReady() : Promise.resolve(true)]).then(([table, images]) => {
      if (active) setReady(table && images)
    }).catch(() => {
      if (!active) return
      setReady(false)
      setError('We could not confirm that service requests are available. Submission stays disabled.')
    })
    return () => { active = false }
  }, [needsImages])
  return { ready, error }
}

async function saveRequest(memberId: string, draft: ServiceRequestDraft, setMessage: (value: string) => void, setError: (value: string) => void, setBusy: (value: boolean) => void) {
  setBusy(true)
  setError('')
  try {
    await insertPendingServiceRequest(memberId, draft)
    setMessage('The request was saved as pending. No transfer or deposit was sent, and your balance is unchanged.')
  } catch {
    setError('The request was not saved. No money was moved.')
  } finally {
    setBusy(false)
  }
}

const AchForm: React.FC<{ memberId: string }> = ({ memberId }) => {
  const [step, setStep] = useState<Step>('edit')
  const [fields, setFields] = useState({ recipient: '', bankName: '', routing: '', account: '', amount: '', description: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [saveError, setSaveError] = useState('')
  const { ready, error: integrationError } = useIntegration(false)
  const set = (key: keyof typeof fields) => (value: string) => setFields((current) => ({ ...current, [key]: value }))

  const review = () => {
    const next: Record<string, string> = {}
    if (!fields.recipient.trim()) next.recipient = 'Enter the recipient name.'
    if (!fields.bankName.trim()) next.bankName = 'Enter the bank name.'
    if (!isValidAbaRouting(fields.routing)) next.routing = 'Enter a 9-digit routing number with a valid ABA checksum.'
    if (!accountLast4(fields.account)) next.account = 'Enter an account number of 4 to 17 digits.'
    if (parseAmount(fields.amount) == null) next.amount = 'Enter an amount greater than 0.00.'
    if (!fields.description.trim()) next.description = 'Enter a description.'
    setErrors(next)
    if (Object.keys(next).length === 0) setStep('review')
  }

  if (message) return <p role="status" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#101533]">{message}</p>

  if (step === 'review') {
    const amount = parseAmount(fields.amount) || 0
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#0504AA]">Review ACH request</h2>
        <ReviewList rows={[
          { label: 'Recipient', value: fields.recipient.trim() },
          { label: 'Bank', value: fields.bankName.trim() },
          { label: 'Routing', value: `••••${fields.routing.slice(-4)}` },
          { label: 'Account', value: maskAccount(fields.account) },
          { label: 'Amount', value: money(amount) },
          { label: 'Description', value: fields.description.trim() },
        ]} />
        <ReviewActions busy={busy} ready={ready} error={saveError || integrationError} onBack={() => setStep('edit')} onSubmit={() => void saveRequest(memberId, {
          serviceType: 'ach',
          amount,
          summary: `ACH to ${fields.recipient.trim()} at ${fields.bankName.trim()}: ${fields.description.trim()}`,
          accountLast4: accountLast4(fields.account),
        }, setMessage, setSaveError, setBusy)} />
      </div>
    )
  }

  return (
    <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); review() }} noValidate>
      <TextField id="ach-recipient" label="Recipient" value={fields.recipient} onChange={set('recipient')} error={errors.recipient} autoComplete="name" required />
      <TextField id="ach-bank" label="Bank name" value={fields.bankName} onChange={set('bankName')} error={errors.bankName} required />
      <TextField id="ach-routing" label="Routing number" value={fields.routing} onChange={set('routing')} error={errors.routing} inputMode="numeric" autoComplete="off" required />
      <TextField id="ach-account" label="Account number" value={fields.account} onChange={set('account')} error={errors.account} inputMode="numeric" autoComplete="off" required />
      <TextField id="ach-amount" label="Amount" value={fields.amount} onChange={set('amount')} error={errors.amount} inputMode="decimal" required />
      <TextField id="ach-description" label="Description" value={fields.description} onChange={set('description')} error={errors.description} required />
      <button type="submit" className="rounded-xl bg-[#0504AA] px-4 py-2.5 text-sm font-semibold text-white">Review request</button>
    </form>
  )
}

const MobileForm: React.FC<{ memberId: string }> = ({ memberId }) => {
  const [step, setStep] = useState<Step>('edit')
  const [amount, setAmount] = useState('')
  const [front, setFront] = useState<File | null>(null)
  const [back, setBack] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [saveError, setSaveError] = useState('')
  const { ready, error: integrationError } = useIntegration(true)

  const review = () => {
    const next: Record<string, string> = {}
    if (parseAmount(amount) == null) next.amount = 'Enter an amount greater than 0.00.'
    if (!front) next.front = 'Add an image of the front.'
    if (!back) next.back = 'Add an image of the back.'
    setErrors(next)
    if (Object.keys(next).length === 0) setStep('review')
  }

  if (message) return <p role="status" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">{message}</p>
  if (step === 'review') {
    const value = parseAmount(amount) || 0
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#0504AA]">Review mobile deposit</h2>
        <ReviewList rows={[
          { label: 'Amount', value: money(value) },
          { label: 'Front', value: front?.name || 'Missing' },
          { label: 'Back', value: back?.name || 'Missing' },
        ]} />
        <p className="text-xs text-slate-500">Images stay on this device until a private storage bucket is available. They are not uploaded while submission is disabled.</p>
        <ReviewActions busy={busy} ready={ready} error={saveError || integrationError} onBack={() => setStep('edit')} onSubmit={() => void saveRequest(memberId, {
          serviceType: 'mobile_deposit',
          amount: value,
          summary: 'Mobile deposit request with front and back images held locally.',
        }, setMessage, setSaveError, setBusy)} />
      </div>
    )
  }
  return (
    <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); review() }} noValidate>
      <TextField id="mobile-amount" label="Amount" value={amount} onChange={setAmount} error={errors.amount} inputMode="decimal" required />
      <FileField id="mobile-front" label="Front image" file={front} onChange={setFront} error={errors.front} required />
      <FileField id="mobile-back" label="Back image" file={back} onChange={setBack} error={errors.back} required />
      <button type="submit" className="rounded-xl bg-[#0504AA] px-4 py-2.5 text-sm font-semibold text-white">Review request</button>
    </form>
  )
}

const CheckForm: React.FC<{ memberId: string; accounts: Account[] }> = ({ memberId, accounts }) => {
  const [step, setStep] = useState<Step>('edit')
  const [checkNumber, setCheckNumber] = useState('')
  const [amount, setAmount] = useState('')
  const [accountId, setAccountId] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [saveError, setSaveError] = useState('')
  const { ready, error: integrationError } = useIntegration(Boolean(image))
  const selected = accounts.find((account) => account.id === accountId)

  if (accounts.length === 0) {
    return <p className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">No deposit accounts were returned for this member. A check deposit cannot be prepared.</p>
  }

  const review = () => {
    const next: Record<string, string> = {}
    if (!/^\d{1,12}$/.test(checkNumber.trim())) next.checkNumber = 'Enter the check number.'
    if (parseAmount(amount) == null) next.amount = 'Enter an amount greater than 0.00.'
    if (!selected) next.account = 'Select one of your accounts.'
    setErrors(next)
    if (Object.keys(next).length === 0) setStep('review')
  }

  if (message) return <p role="status" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">{message}</p>
  if (step === 'review' && selected) {
    const value = parseAmount(amount) || 0
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#0504AA]">Review check deposit</h2>
        <ReviewList rows={[
          { label: 'Check number', value: checkNumber.trim() },
          { label: 'Amount', value: money(value) },
          { label: 'Account', value: `${selected.accountType} ${maskAccount(selected.accountNumber)}` },
          { label: 'Image', value: image?.name || 'None' },
        ]} />
        <ReviewActions busy={busy} ready={ready} error={saveError || integrationError} onBack={() => setStep('edit')} onSubmit={() => void saveRequest(memberId, {
          serviceType: 'check_deposit',
          amount: value,
          summary: `Check ${checkNumber.trim()} to account ending ${accountLast4(selected.accountNumber) || 'unknown'}.`,
          accountLast4: accountLast4(selected.accountNumber),
          depositAccountId: selected.id,
        }, setMessage, setSaveError, setBusy)} />
      </div>
    )
  }

  return (
    <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); review() }} noValidate>
      <TextField id="check-number" label="Check number" value={checkNumber} onChange={setCheckNumber} error={errors.checkNumber} inputMode="numeric" required />
      <TextField id="check-amount" label="Amount" value={amount} onChange={setAmount} error={errors.amount} inputMode="decimal" required />
      <div>
        <label htmlFor="check-account" className="block text-sm font-semibold text-[#101533]">Deposit account</label>
        <select id="check-account" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" value={accountId} aria-invalid={Boolean(errors.account)} onChange={(event) => setAccountId(event.target.value)}>
          <option value="">Select an account</option>
          {accounts.map((account) => <option key={account.id} value={account.id}>{account.accountType} {maskAccount(account.accountNumber)}</option>)}
        </select>
        {errors.account && <p className="mt-1 text-sm text-red-700">{errors.account}</p>}
      </div>
      <FileField id="check-image" label="Check image (optional)" file={image} onChange={setImage} />
      <button type="submit" className="rounded-xl bg-[#0504AA] px-4 py-2.5 text-sm font-semibold text-white">Review request</button>
    </form>
  )
}

const WireForm: React.FC<{ memberId: string }> = ({ memberId }) => {
  const [step, setStep] = useState<Step>('edit')
  const [fields, setFields] = useState({ beneficiary: '', bank: '', account: '', swift: '', routing: '', amount: '', purpose: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [saveError, setSaveError] = useState('')
  const { ready, error: integrationError } = useIntegration(false)
  const set = (key: keyof typeof fields) => (value: string) => setFields((current) => ({ ...current, [key]: value }))

  const review = () => {
    const next: Record<string, string> = {}
    if (!fields.beneficiary.trim()) next.beneficiary = 'Enter the beneficiary name.'
    if (!fields.bank.trim()) next.bank = 'Enter the beneficiary bank.'
    if (!accountLast4(fields.account)) next.account = 'Enter account information of 4 to 17 digits.'
    const swift = fields.swift.trim().toUpperCase()
    const routing = fields.routing.trim()
    if (!swift && !routing) next.swift = 'Enter a SWIFT/BIC or a routing number.'
    if (swift && !isValidSwiftBic(swift)) next.swift = 'Enter a valid 8 or 11 character SWIFT/BIC.'
    if (routing && !isValidAbaRouting(routing)) next.routing = 'Enter a 9-digit routing number with a valid ABA checksum.'
    if (parseAmount(fields.amount) == null) next.amount = 'Enter an amount greater than 0.00.'
    if (!fields.purpose.trim()) next.purpose = 'Enter the purpose.'
    setErrors(next)
    if (Object.keys(next).length === 0) setStep('review')
  }

  if (message) return <p role="status" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">{message}</p>
  if (step === 'review') {
    const amount = parseAmount(fields.amount) || 0
    const swift = fields.swift.trim().toUpperCase()
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#0504AA]">Review wire request</h2>
        <ReviewList rows={[
          { label: 'Beneficiary', value: fields.beneficiary.trim() },
          { label: 'Bank', value: fields.bank.trim() },
          { label: 'Account', value: maskAccount(fields.account) },
          { label: 'SWIFT/BIC', value: swift || 'Not provided' },
          { label: 'Routing', value: fields.routing ? `••••${fields.routing.slice(-4)}` : 'Not provided' },
          { label: 'Amount', value: money(amount) },
          { label: 'Purpose', value: fields.purpose.trim() },
        ]} />
        <ReviewActions busy={busy} ready={ready} error={saveError || integrationError} onBack={() => setStep('edit')} onSubmit={() => void saveRequest(memberId, {
          serviceType: 'wire',
          amount,
          summary: `Wire to ${fields.beneficiary.trim()} at ${fields.bank.trim()}: ${fields.purpose.trim()}`,
          accountLast4: accountLast4(fields.account),
        }, setMessage, setSaveError, setBusy)} />
      </div>
    )
  }

  return (
    <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); review() }} noValidate>
      <TextField id="wire-beneficiary" label="Beneficiary name" value={fields.beneficiary} onChange={set('beneficiary')} error={errors.beneficiary} autoComplete="name" required />
      <TextField id="wire-bank" label="Beneficiary bank" value={fields.bank} onChange={set('bank')} error={errors.bank} required />
      <TextField id="wire-account" label="Account information" value={fields.account} onChange={set('account')} error={errors.account} inputMode="numeric" autoComplete="off" required />
      <TextField id="wire-swift" label="SWIFT/BIC" value={fields.swift} onChange={set('swift')} error={errors.swift} autoComplete="off" />
      <TextField id="wire-routing" label="Routing number" value={fields.routing} onChange={set('routing')} error={errors.routing} inputMode="numeric" autoComplete="off" />
      <TextField id="wire-amount" label="Amount" value={fields.amount} onChange={set('amount')} error={errors.amount} inputMode="decimal" required />
      <TextField id="wire-purpose" label="Purpose" value={fields.purpose} onChange={set('purpose')} error={errors.purpose} required />
      <button type="submit" className="rounded-xl bg-[#0504AA] px-4 py-2.5 text-sm font-semibold text-white">Review request</button>
    </form>
  )
}
