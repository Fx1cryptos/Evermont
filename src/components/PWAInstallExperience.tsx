import { useEffect, useRef, useState } from 'react'
import { ArrowDownToLine, ChevronRight, Home, Share, Smartphone, X } from 'lucide-react'

const DISMISSED_KEY = 'evermont-install-invitation-dismissed'
const INSTALL_EVENT = 'evermont:open-install'

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export const requestEvermontInstall = () => window.dispatchEvent(new Event(INSTALL_EVENT))

const isIosDevice = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent)
const isInstalled = () => window.matchMedia('(display-mode: standalone)').matches || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
const wasDismissed = () => {
  try { return Boolean(window.localStorage.getItem(DISMISSED_KEY)) } catch { return false }
}
const saveInstallPreference = (value: string) => {
  try { window.localStorage.setItem(DISMISSED_KEY, value) } catch { return }
}

export const PWAInstallExperience = () => {
  const [invitationOpen, setInvitationOpen] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null)
  const [ios, setIos] = useState(false)
  const [manualInstructions, setManualInstructions] = useState(false)
  const [installed, setInstalled] = useState(false)
  const dialogRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const installedAtStart = isInstalled()
    setInstalled(installedAtStart)
    setIos(isIosDevice() || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1))

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as InstallPromptEvent)
    }
    const handleInstalled = () => {
      setInstalled(true)
      setInvitationOpen(false)
      setInstallPrompt(null)
      saveInstallPreference('installed')
    }
    const openInvitation = () => {
      if (!isInstalled()) setInvitationOpen(true)
    }
    const shouldWelcome = window.location.pathname === '/' && !wasDismissed() && !installedAtStart
    const welcomeTimer = shouldWelcome ? window.setTimeout(() => setInvitationOpen(true), 900) : undefined

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleInstalled)
    window.addEventListener(INSTALL_EVENT, openInvitation)

    return () => {
      if (welcomeTimer) window.clearTimeout(welcomeTimer)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleInstalled)
      window.removeEventListener(INSTALL_EVENT, openInvitation)
    }
  }, [])

  useEffect(() => {
    if (!invitationOpen) return
    const previousFocus = document.activeElement as HTMLElement | null
    dialogRef.current?.querySelector<HTMLElement>('button')?.focus()
    return () => previousFocus?.focus()
  }, [invitationOpen])

  const dismiss = () => {
    saveInstallPreference('dismissed')
    setInvitationOpen(false)
  }

  const install = async () => {
    if (installPrompt) {
      await installPrompt.prompt()
      const choice = await installPrompt.userChoice
      if (choice.outcome === 'accepted') setInstalled(true)
      setInstallPrompt(null)
      setInvitationOpen(false)
      saveInstallPreference(choice.outcome === 'accepted' ? 'installed' : 'dismissed')
      return
    }
    if (ios) return
    setManualInstructions(true)
  }

  if (!invitationOpen || installed) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#07143D]/55 p-3 backdrop-blur-sm sm:items-center sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) dismiss() }}>
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="install-title" onKeyDown={(event) => {
        if (event.key === 'Escape') { event.preventDefault(); dismiss(); return }
        if (event.key === 'Tab') {
          const controls = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled])')
          if (!controls?.length) return
          const first = controls[0]
          const last = controls[controls.length - 1]
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
        }
      }} className="install-dialog relative max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-x-hidden overflow-y-auto rounded-[1.75rem] bg-white shadow-2xl">
        <button type="button" onClick={dismiss} aria-label="Close installation invitation" className="absolute right-4 top-4 z-10 inline-flex size-10 items-center justify-center rounded-full bg-white/90 text-[#07143D] ring-1 ring-slate-200 transition hover:bg-slate-100"><X className="size-5" /></button>
        <div className="bg-[#07143D] px-6 pb-5 pt-6 text-white">
          <div className="flex items-center gap-3">
            <img src="/images/evermont-logo.jpeg" alt="Evermont Credit Union" className="size-12 rounded-xl object-cover" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E5CB7A]">EVERMONT CREDIT UNION</p>
          </div>
          <div className="mt-5 flex size-12 items-center justify-center rounded-2xl border border-[#C8A43D]/50 bg-[#C8A43D]/10 text-[#E5CB7A]"><Smartphone className="size-7" /></div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#E5CB7A]">A convenient place on your home screen</p>
          <h2 id="install-title" className="mt-2 font-serif text-3xl leading-tight">Take Evermont with you.</h2>
          <p className="mt-2 text-sm leading-5 text-blue-100">Add Evermont to your home screen for convenient, app-like access. Your member account stays in the separate portal.</p>
        </div>
        <div className="p-6 sm:p-7">
          {ios || manualInstructions ? (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-[#07143D]">{ios ? 'Install Evermont on your iPhone or iPad' : 'Install Evermont from your browser'}</h3>
              <ol className="mt-4 space-y-3">
                {ios ? <>
                  <li className="flex items-center gap-3 text-sm text-slate-700"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F5F7FB] text-[#080A9F]"><ChevronRight className="size-4" /></span>Open Evermont in Safari.</li>
                  <li className="flex items-center gap-3 text-sm text-slate-700"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F5F7FB] text-[#080A9F]"><Share className="size-4" /></span>Tap the Share icon in Safari.</li>
                  <li className="flex items-center gap-3 text-sm text-slate-700"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F5F7FB] text-[#080A9F]"><Home className="size-4" /></span>Choose “Add to Home Screen,” then tap Add.</li>
                </> : <>
                  <li className="flex items-center gap-3 text-sm text-slate-700"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F5F7FB] text-[#080A9F]"><ChevronRight className="size-4" /></span>Open your browser menu.</li>
                  <li className="flex items-center gap-3 text-sm text-slate-700"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F5F7FB] text-[#080A9F]"><Smartphone className="size-4" /></span>Choose “Install app” or “Add to Home screen.”</li>
                  <li className="flex items-center gap-3 text-sm text-slate-700"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F5F7FB] text-[#080A9F]"><Home className="size-4" /></span>Confirm to add Evermont to your device.</li>
                </>}
              </ol>
              <button type="button" onClick={dismiss} className="mt-6 w-full rounded-full bg-[#080A9F] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#07143D]">GOT IT</button>
            </div>
          ) : (
            <>
              <button type="button" onClick={() => void install()} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#080A9F] px-5 py-3.5 text-sm font-bold tracking-[0.06em] text-white transition hover:bg-[#07143D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8A43D]">
                <ArrowDownToLine className="size-4" /> INSTALL EVERMONT
              </button>
              {!installPrompt && <p className="mt-3 text-center text-xs leading-5 text-slate-500">If your browser doesn&apos;t show an install prompt, open its menu and select “Install app” or “Add to Home screen.”</p>}
              <button type="button" onClick={dismiss} className="mt-3 w-full rounded-full px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-[#F5F7FB]">MAYBE LATER</button>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
