import { useState } from 'react'
import useSWR from 'swr'
import { PortalShell } from '@/components/member/PortalShell'
import { useAuth } from '@/contexts/AuthContext'
import { maskAccount } from '@/lib/bankingServices'
import { accountService } from '@/services/accountService'
import { transactionService } from '@/services/transactionService'

export function StatementsPage() {
  const { user } = useAuth()
  const accounts = useSWR(user ? ['statement-accounts', user.id] : null, ([, owner]) => accountService.getAccounts(owner))
  const [selected, select] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const account = accounts.data?.find(a => a.id === selected) || accounts.data?.[0]

  async function download() {
    if (!user || !account || account.userId !== user.id || busy) return
    setBusy(true); setNotice('')
    try {
      const rows = await transactionService.getTransactions(user.id, { accountId: account.id, limit: 50 })
      if (!rows.length) { setNotice('No activity was returned for this account.'); return }
      if (rows.some(row => row.memberId !== user.id || row.accountId !== account.id || row.isSample)) throw Error()
      const { data, error } = await (await import('@/lib/supabase')).supabase.auth.getUser()
      if (error || data.user?.id !== user.id) throw Error()
      const { jsPDF } = await import('jspdf')
      const pdf = new jsPDF()
      pdf.setFontSize(16)
      pdf.text('EVERMONT | Account activity', 16, 20)
      pdf.setFontSize(10)
      pdf.text(account.accountType + ' / ending ' + String(account.accountNumber).slice(-4) + ' / ' + account.currency, 16, 30)
      pdf.text('Recent activity report. Not an issued monthly statement.', 16, 37)
      let y = 49
      for (const row of rows) {
        const parts = [row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'Date unavailable', row.description || 'Ledger entry', row.direction + ' ' + row.displayAmount]
        if (row.balanceAfter != null) parts.push('Balance: ' + row.balanceAfter)
        for (const line of pdf.splitTextToSize(parts.join('   |   '), 174)) {
          if (y > 275) { pdf.addPage(); y = 20 }
          pdf.text(line, 16, y); y += 5
        }
        y += 4
      }
      pdf.save('evermont-account-activity.pdf')
      setNotice('Your activity PDF is ready.')
    } catch { setNotice('The report could not be prepared. Please retry.') }
    finally { setBusy(false) }
  }
  return <PortalShell title="Statements" eyebrow="Member documents"><section className="max-w-2xl rounded-2xl border bg-white p-6 shadow-sm">
    <h2 className="text-xl font-semibold">Account activity PDF</h2>
    <p className="my-3 text-sm text-slate-600">Download up to 50 recent entries for one account. Issued monthly statements are currently unavailable.</p>
    {accounts.isLoading ? <p>Loading accounts…</p> : accounts.error ? <button onClick={() => void accounts.mutate()}>Accounts unavailable. Retry</button> : !account ? <p>No accounts available.</p> :
    <><label className="grid gap-2 text-sm font-semibold">Account<select className="rounded-lg border p-3" value={account.id} disabled={busy} onChange={e => {select(e.target.value);setNotice('')}}>{accounts.data?.map(a => <option key={a.id} value={a.id}>{a.accountType} {maskAccount(a.accountNumber || '')}</option>)}</select></label>
    <button className="mt-4 rounded-lg bg-[#0504AA] px-4 py-2 font-semibold text-white" disabled={busy} onClick={() => void download()}>{busy ? 'Preparing…' : 'Download activity PDF'}</button></>}
    <p role="status" className="mt-3 text-sm">{notice}</p></section></PortalShell>
}
