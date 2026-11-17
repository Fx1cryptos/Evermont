import React, { useEffect, useRef, useState } from 'react'
import {
  ArrowUpRight,
  Bell,
  CreditCard,
  FileText,
  Headphones,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Send,
  Settings,
  ShieldCheck,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { LOGO_PATH, SITE_NAME, SITE_POSITIONING, SITE_TAGLINE, SITE_TAGLINE_SECOND, SUPPORT_EMAIL } from '@/config/site'
import { useAuth } from '@/contexts/AuthContext'

const navigation = [
  {
    label: 'YOUR WEALTH',
    links: [
      { label: 'Overview', to: ROUTES.DASHBOARD, icon: LayoutDashboard },
      { label: 'My accounts', to: ROUTES.ACCOUNTS, icon: WalletCards },
      { label: 'Transactions', to: ROUTES.TRANSACTIONS, icon: Receipt },
    ],
  },
  {
    label: 'BANKING',
    links: [
      { label: 'Transfers & payments', to: '/services/transfer', icon: Send },
      { label: 'Beneficiaries', to: ROUTES.BENEFICIARIES, icon: UserRound },
      { label: 'Cards', to: '/services/virtual-card', icon: CreditCard },
      { label: 'Statements', to: '/statements', icon: FileText },
    ],
  },
  {
    label: 'YOUR MEMBERSHIP',
    links: [
      { label: 'Activation', to: ROUTES.ACTIVATION, icon: ShieldCheck },
      { label: 'Profile & security', to: ROUTES.PROFILE, icon: UserRound },
      { label: 'Security settings', to: ROUTES.SETTINGS, icon: Settings },
      { label: 'Help & support', to: ROUTES.SUPPORT, icon: Headphones },
    ],
  },
]

const navClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] ${
    isActive
      ? 'bg-[#0504AA] text-white shadow-sm shadow-[#0504AA]/20'
      : 'text-slate-600 hover:bg-[#0504AA]/[0.06] hover:text-[#0504AA]'
  }`

export const PortalShell: React.FC<React.PropsWithChildren<{ title: string; eyebrow?: string }>> = ({
  title,
  eyebrow = 'Member portal',
  children,
}) => {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [signOutError, setSignOutError] = useState('')
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLElement>(null)
  const drawerWasOpen = useRef(false)
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'Member'
  const initials = displayName
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('')

  useEffect(() => {
    if (!open) {
      if (drawerWasOpen.current) {
        drawerWasOpen.current = false
        menuButtonRef.current?.focus()
      }
      return
    }
    drawerWasOpen.current = true
    const focusable = () => Array.from(
      drawerRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') || [],
    )
    focusable()[0]?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        return
      }
      if (event.key !== 'Tab') return
      const items = focusable()
      const first = items[0]
      const last = items[items.length - 1]
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const handleSignOut = async () => {
    setSignOutError('')
    try {
      await signOut()
      navigate(ROUTES.LOGIN, { replace: true })
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : 'We could not sign you out. Please try again.')
    }
  }

  const brand = (onNavigate?: () => void) => (
    <Link
      to={ROUTES.DASHBOARD}
      onClick={onNavigate}
      className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
      aria-label={`${SITE_NAME} member overview`}
    >
      <img src={LOGO_PATH} alt="" width={42} height={42} className="size-[42px] shrink-0 rounded-xl object-contain" />
      <span className="min-w-0">
        <strong className="block truncate text-[13px] font-bold tracking-[.08em] text-[#111B36]">EVERMONT</strong>
        <small className="mt-0.5 block truncate text-[9px] font-semibold uppercase tracking-[.12em] text-[#8A6A14]">
          {SITE_POSITIONING}
        </small>
      </span>
    </Link>
  )

  const links = (onNavigate?: () => void) => (
    <nav className="space-y-6" aria-label="Member navigation">
      {navigation.map(group => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-[9px] font-bold tracking-[.18em] text-slate-400">{group.label}</p>
          <div className="grid gap-1">
            {group.links.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === ROUTES.DASHBOARD}
                className={navClass}
                onClick={onNavigate}
              >
                <Icon className="size-[17px] shrink-0 opacity-80" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  )

  const memberIdentity = (compact = false) => (
    <div className={`flex min-w-0 items-center ${compact ? 'gap-2.5' : 'gap-3'}`}>
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#C9A227]/35 bg-[#F8F5EC] text-xs font-bold text-[#0504AA]"
        aria-hidden="true"
      >
        {initials || 'M'}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-semibold text-[#17213C]">{displayName}</span>
        {user?.email && <span className="mt-0.5 block truncate text-[11px] text-slate-500">{user.email}</span>}
      </span>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F5F6F9] text-[#17213C]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[276px] flex-col border-r border-slate-200/80 bg-white px-5 pb-5 pt-6 lg:flex">
        {brand()}
        <div className="mt-7 rounded-xl border border-[#E8E2D2] bg-[#FAF9F5] px-4 py-3.5">
          <p className="text-[11px] font-semibold leading-5 text-[#41485A]">{SITE_TAGLINE}</p>
          <p className="mt-1 text-[10px] leading-4 text-slate-500">{SITE_TAGLINE_SECOND}</p>
        </div>
        <div className="mt-7 min-h-0 flex-1 overflow-y-auto pr-1">{links()}</div>
        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="px-2">{memberIdentity(true)}</div>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="mt-3 flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-[13px] font-medium text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </button>
          {signOutError && <p role="alert" className="mt-2 px-3 text-xs text-rose-700">{signOutError}</p>}
        </div>
      </aside>

      <div className="min-h-screen lg:ml-[276px]">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
          <div className="mx-auto flex min-h-[76px] max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-9">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(true)}
                ref={menuButtonRef}
                className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-[#C9A227] hover:text-[#0504AA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] lg:hidden"
                aria-label="Open member navigation"
                aria-expanded={open}
                aria-controls="mobile-member-navigation"
              >
                <Menu className="size-[18px]" aria-hidden="true" />
              </button>
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-[.2em] text-[#927421]">{eyebrow}</p>
                <h1 className="mt-1 truncate text-base font-semibold tracking-[-.02em] text-[#17213C] sm:text-lg">{title}</h1>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3 sm:gap-5">
              <Link
                to="/alerts"
                className="relative flex size-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-[#0504AA]/[0.06] hover:text-[#0504AA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
                aria-label="Notifications"
              >
                <Bell className="size-[19px]" aria-hidden="true" />
              </Link>
              <span className="hidden h-8 w-px bg-slate-200 sm:block" aria-hidden="true" />
              <div className="hidden max-w-[220px] sm:block">{memberIdentity()}</div>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="hidden min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:border-[#C9A227] hover:text-[#0504AA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] xl:flex"
              >
                <LogOut className="size-4" aria-hidden="true" />
                Sign out
              </button>
            </div>
          </div>
          {signOutError && <p role="alert" className="px-6 pb-3 text-right text-xs text-rose-700">{signOutError}</p>}
        </header>

        {open && (
          <div
            className="fixed inset-0 z-50 bg-[#10182D]/45 backdrop-blur-[2px] lg:hidden"
            onClick={() => setOpen(false)}
          >
            <section
              id="mobile-member-navigation"
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Member navigation"
              className="flex h-full w-[min(88vw,340px)] flex-col overflow-y-auto bg-white px-5 pb-5 pt-6 shadow-2xl"
              onClick={event => event.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3">
                {brand(() => setOpen(false))}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close member navigation"
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
                >
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-8 flex-1">{links(() => setOpen(false))}</div>
              <div className="mt-6 border-t border-slate-100 pt-4">
                {memberIdentity()}
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  className="mt-4 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  Sign out
                </button>
              </div>
            </section>
          </div>
        )}

        <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 lg:px-9 lg:py-9">
          {children}
        </main>
        <footer className="border-t border-slate-200/80 bg-white px-4 py-5 sm:px-6 lg:px-9">
          <div className="mx-auto flex max-w-[1500px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <img src={LOGO_PATH} alt="" width={30} height={30} className="size-[30px] rounded-lg object-contain" />
              <div className="text-[10px] leading-4 text-slate-500">
                <p className="font-semibold tracking-wide text-[#17213C]">{SITE_NAME}</p>
                <p>{SITE_TAGLINE} {SITE_TAGLINE_SECOND}</p>
              </div>
            </div>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0504AA] hover:text-[#8A6A14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
            >
              Contact support <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
          </div>
        </footer>
      </div>
    </div>
  )
}

export const SupportCard: React.FC = () => (
  <aside className="rounded-2xl border border-slate-200 bg-white p-5">
    <p className="font-semibold text-[#0504AA]">Support</p>
    <p className="mt-1 text-sm text-slate-600">Message the member support team. This does not submit a transaction.</p>
    <Link to={ROUTES.SUPPORT} className="mt-3 inline-block text-sm font-semibold text-[#0504AA] hover:text-[#8A6A14]">
      Open support
    </Link>
  </aside>
)
