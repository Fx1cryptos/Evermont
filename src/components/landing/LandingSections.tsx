import React from 'react'
import {
  Wallet,
  PiggyBank,
  TrendingUp,
  Landmark,
  Bitcoin,
  Car,
  Home,
  ShieldCheck,
  Lock,
  Eye,
  Fingerprint,
  Smartphone,
  BellRing,
  CreditCard,
  Send,
  Calculator,
  LineChart,
  BookOpen,
  HeartHandshake,
  ArrowRight,
  Check,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

/* ---------- shared section primitives ---------- */

const SectionHeading: React.FC<{ eyebrow: string; title: string; sub?: string; light?: boolean }> = ({
  eyebrow,
  title,
  sub,
  light,
}) => (
  <div className="max-w-2xl mx-auto text-center mb-12">
    <p className={`text-xs font-bold uppercase tracking-[0.25em] ${light ? 'text-evermont-gold' : 'text-evermont-blue'}`}>
      {eyebrow}
    </p>
    <h2 className={`mt-3 text-3xl lg:text-4xl font-bold tracking-tight ${light ? 'text-white' : 'text-evermont-dark'}`}>
      {title}
    </h2>
    {sub && <p className={`mt-4 text-base leading-relaxed ${light ? 'text-gray-300' : 'text-evermont-muted'}`}>{sub}</p>}
  </div>
)

const FeatureCard: React.FC<{ Icon: React.ElementType; title: string; points: string[]; footnote?: string }> = ({
  Icon,
  title,
  points,
  footnote,
}) => (
  <div className="bg-white rounded-2xl border border-evermont-border shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 p-7">
    <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center mb-5">
      <Icon className="h-6 w-6 text-evermont-blue" />
    </div>
    <h3 className="text-lg font-semibold text-evermont-dark mb-3">{title}</h3>
    <ul className="space-y-2.5">
      {points.map((p) => (
        <li key={p} className="flex items-start gap-2.5 text-sm text-evermont-muted">
          <Check className="h-4 w-4 text-evermont-gold mt-0.5 shrink-0" />
          <span>{p}</span>
        </li>
      ))}
    </ul>
    {footnote && <p className="mt-4 text-[11px] text-gray-400">{footnote}</p>}
  </div>
)

/* ---------- 1. checking & savings ---------- */

export const AccountsSection: React.FC = () => (
  <section id="accounts" className="py-20 bg-evermont-light">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Everyday accounts"
        title="Checking & savings that work harder"
        sub="No minimum-balance games or hidden fees — just straightforward accounts built for how you actually bank."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <FeatureCard
          Icon={Wallet}
          title="Evermont Checking"
          points={[
            'No monthly maintenance fees',
            'No minimum balance requirement',
            'Fee-free access at 55,000+ ATMs (demo)',
            'Instant mobile check deposit',
          ]}
        />
        <FeatureCard
          Icon={PiggyBank}
          title="High-Yield Savings"
          points={[
            '4.50% APY* on every dollar',
            'Automatic savings rules',
            'Goal tracking with progress bars',
            'Compounding monthly interest',
          ]}
          footnote="*Illustrative APY for demo purposes only."
        />
      </div>
    </div>
  </section>
)

/* ---------- 2. investments & retirement ---------- */

export const InvestingSection: React.FC = () => (
  <section id="investing" className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Grow your future"
        title="Investments & retirement planning"
        sub="Low-cost index funds, IRAs and 401(k) rollovers with planning tools that keep your goals on track."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard
          Icon={TrendingUp}
          title="Brokerage & ETFs"
          points={['Commission-free ETF trading*', 'Fractional shares', 'Auto-invest recurring plans', 'Real-time performance charts']}
          footnote="*Demo environment — no real securities are traded."
        />
        <FeatureCard
          Icon={Landmark}
          title="401(k) & Rollovers"
          points={['Consolidate old employer plans', 'Target-date fund lineup', 'Employer-match tracking', 'Contribution insights']}
        />
        <FeatureCard
          Icon={LineChart}
          title="IRAs & Goals"
          points={['Traditional & Roth IRAs', 'Retirement readiness score', 'Contribution-limit tracker', 'Tax-smart withdrawal guides']}
        />
      </div>
    </div>
  </section>
)

/* ---------- 3. lending ---------- */

export const LendingSection: React.FC = () => (
  <section id="lending" className="py-20 bg-evermont-light">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="When you need it"
        title="Personal, auto & home lending"
        sub="Transparent rates, quick decisions and payments that fit your budget — applied for right from your dashboard."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { Icon: CreditCard, title: 'Personal Loans', rate: '9.49% APR*', desc: 'Debt consolidation, home projects and unexpected expenses up to $50,000.' },
          { Icon: Car, title: 'Auto Loans', rate: '5.99% APR*', desc: 'New and used vehicle financing with pre-approval in minutes.' },
          { Icon: Home, title: 'Home Loans', rate: '6.12% APR*', desc: 'Purchase and refinance mortgages with local servicing and flexible terms.' },
        ].map((loan) => (
          <div key={loan.title} className="bg-white rounded-2xl border border-evermont-border shadow-sm p-7 flex flex-col">
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center mb-5">
              <loan.Icon className="h-6 w-6 text-evermont-blue" />
            </div>
            <span className="inline-flex self-start rounded-full bg-evermont-gold/15 text-[#8a6f14] text-xs font-bold px-3 py-1">
              {loan.rate}
            </span>
            <h3 className="text-lg font-semibold text-evermont-dark mt-4 mb-2">{loan.title}</h3>
            <p className="text-sm text-evermont-muted leading-relaxed flex-1">{loan.desc}</p>
            <span className="mt-5 text-sm font-semibold text-evermont-blue inline-flex items-center gap-1.5">
              Check your rate <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        ))}
      </div>
      <p className="mt-8 text-center text-xs text-gray-400">
        *Rates shown are illustrative examples for the demo experience only.
      </p>
    </div>
  </section>
)

/* ---------- 4. crypto ---------- */

export const CryptoSection: React.FC = () => (
  <section id="crypto" className="py-20 bg-[#050440] text-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        light
        eyebrow="Modern money"
        title="A crypto account built for confidence"
        sub="Buy, sell and hold major cryptocurrencies inside your Evermont dashboard — with clear pricing and custody education."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { Icon: Bitcoin, title: 'Buy & sell major coins', desc: 'Bitcoin, Ethereum and more with recurring auto-buys from your checking account.' },
          { Icon: Lock, title: 'Custodied & monitored', desc: 'Assets are held with a simulated qualified custodian, with real-time balance visibility.' },
          { Icon: BookOpen, title: 'Learn before you leap', desc: 'Built-in lessons on volatility, custody and tax reporting — because crypto is not for everyone.' },
        ].map((card) => (
          <div key={card.title} className="rounded-2xl bg-white/5 border border-white/10 p-7">
            <div className="h-12 w-12 rounded-xl bg-evermont-gold/15 flex items-center justify-center mb-5">
              <card.Icon className="h-6 w-6 text-evermont-gold" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
            <p className="text-sm text-gray-300 leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>
      <p className="mt-8 text-center text-xs text-gray-400">
        Crypto is highly volatile and involves risk, including possible loss of principal. Demo
        environment — no real digital assets are bought, sold or held.
      </p>
    </div>
  </section>
)

/* ---------- 5. security ---------- */

export const SecuritySection: React.FC = () => (
  <section id="security" className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Bank-grade protection"
        title="Security & privacy, by design"
        sub="Multiple layers of protection guard your account — and your data is never sold."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { Icon: Lock, title: '256-bit encryption', desc: 'All traffic and data at rest are encrypted end-to-end.' },
          { Icon: Fingerprint, title: 'Multi-factor auth', desc: 'Sign-in verification, device memory and biometric support.' },
          { Icon: Eye, title: '24/7 monitoring', desc: 'Real-time fraud detection with instant account alerts.' },
          { Icon: ShieldCheck, title: 'Your data stays yours', desc: 'We never sell personal information to third parties.' },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-evermont-border bg-evermont-light/60 p-6">
            <div className="h-11 w-11 rounded-xl bg-evermont-blue flex items-center justify-center mb-4">
              <item.Icon className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-sm font-bold text-evermont-dark mb-1.5">{item.title}</h3>
            <p className="text-sm text-evermont-muted leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

/* ---------- 6. digital banking ---------- */

export const DigitalBankingSection: React.FC = () => (
  <section className="py-20 bg-evermont-light">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Anywhere banking"
        title="Digital banking on your schedule"
        sub="Everything you can do at a branch, you can do from your phone — in seconds."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { Icon: Smartphone, title: 'Mobile check deposit', desc: 'Snap a photo, funds post with clear timelines.' },
          { Icon: Send, title: 'Instant transfers', desc: 'Move money between accounts and to members instantly.' },
          { Icon: BellRing, title: 'Smart alerts', desc: 'Balance, transaction and bill reminders, your way.' },
          { Icon: Calculator, title: 'Built-in tools', desc: 'Budgets, goals and loan calculators in every view.' },
        ].map((item) => (
          <div key={item.title} className="bg-white rounded-2xl border border-evermont-border shadow-sm p-6">
            <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
              <item.Icon className="h-5 w-5 text-evermont-blue" />
            </div>
            <h3 className="text-sm font-bold text-evermont-dark mb-1.5">{item.title}</h3>
            <p className="text-sm text-evermont-muted leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

/* ---------- 7. financial wellness ---------- */

export const WellnessSection: React.FC = () => (
  <section className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-evermont-blue">Financial wellness</p>
        <h2 className="mt-3 text-3xl lg:text-4xl font-bold text-evermont-dark tracking-tight">
          Tools and coaching for every step
        </h2>
        <p className="mt-4 text-base text-evermont-muted leading-relaxed">
          Money confidence isn't built overnight. Evermont members get practical, judgment-free
          guidance to budget better, borrow smarter and plan further ahead.
        </p>
        <ul className="mt-6 space-y-3.5">
          {[
            'Free credit-score monitoring and insights',
            'Interactive budgeting and cash-flow planner',
            'First-time homebuyer and car-buying guides',
            'One-on-one financial coaching sessions (demo)',
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-evermont-dark">
              <span className="mt-0.5 h-5 w-5 rounded-full bg-evermont-gold/15 flex items-center justify-center shrink-0">
                <Check className="h-3 w-3 text-[#8a6f14]" />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[
          { Icon: HeartHandshake, title: 'Coaching', desc: 'Friendly experts for budget reviews and major money decisions.' },
          { Icon: Calculator, title: 'Calculators', desc: 'Loan, savings and retirement calculators with live previews.' },
          { Icon: BookOpen, title: 'Learning hub', desc: 'Bite-sized courses from checking basics to estate planning.' },
          { Icon: PiggyBank, title: 'Goal tracking', desc: 'Set savings goals and watch progress bars fill in real time.' },
        ].map((item) => (
          <div key={item.title} className="bg-evermont-light rounded-2xl border border-evermont-border p-6">
            <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center mb-4 shadow-sm">
              <item.Icon className="h-5 w-5 text-evermont-blue" />
            </div>
            <h3 className="text-sm font-bold text-evermont-dark mb-1.5">{item.title}</h3>
            <p className="text-sm text-evermont-muted leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

/* ---------- 8. membership CTA ---------- */

export const MembershipCTA: React.FC = () => (
  <section className="relative overflow-hidden bg-evermont-blue py-20 text-white">
    <div
      className="absolute inset-0 opacity-[0.07]"
      style={{
        backgroundImage:
          'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
        backgroundSize: '56px 56px',
      }}
      aria-hidden
    />
    <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
      <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">Ready to bank the Evermont way?</h2>
      <p className="mt-4 text-lg text-gray-200 leading-relaxed">
        Open your account in minutes and experience a credit union built around your community and
        your future.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          to={ROUTES.REGISTER}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-evermont-gold text-[#1a1a2e] font-semibold hover:brightness-110 transition shadow-lg"
        >
          Become a Member <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to={ROUTES.LOGIN}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg border-2 border-white/70 font-semibold hover:bg-white/10 transition"
        >
          Sign In
        </Link>
      </div>
    </div>
  </section>
)
