import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, ArrowRight, Star } from 'lucide-react'
import { ROUTES } from '@/constants/routes'

const heroStats = [
  { value: '4.50% APY', label: 'High-Yield Savings*' },
  { value: '0% fees', label: 'On everyday checking' },
  { value: '24/7', label: 'Digital & mobile banking' },
]

const Hero: React.FC = () => (
  <section className="relative overflow-hidden bg-evermont-blue text-white">
    {/* subtle grid + glow */}
    <div
      className="absolute inset-0 opacity-[0.07]"
      style={{
        backgroundImage:
          'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
        backgroundSize: '56px 56px',
      }}
      aria-hidden
    />
    <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-evermont-gold/20 blur-3xl" aria-hidden />

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-xs font-semibold tracking-wide">
          <ShieldCheck className="h-4 w-4 text-evermont-gold" />
          Member-first digital banking
        </span>
        <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight">
          Your money.{' '}
          <span className="text-evermont-gold">Your community.</span>{' '}
          Your future.
        </h1>
        <p className="mt-6 text-lg text-gray-200 leading-relaxed max-w-xl">
          Evermont brings your checking, savings, investing, retirement, lending and crypto together
          in one secure, beautifully simple experience — built on credit-union principles and priced
          for members, not shareholders.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            to={ROUTES.REGISTER}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-evermont-gold text-[#1a1a2e] font-semibold hover:brightness-110 transition shadow-lg shadow-gold/20"
          >
            Become a Member <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg border-2 border-white/70 text-white font-semibold hover:bg-white/10 transition"
          >
            Sign In
          </Link>
        </div>
        <p className="mt-6 text-xs text-gray-300">
          *Illustrative demo rates. Evermont is a demonstration project and is not a licensed
          financial institution.
        </p>
      </div>

      {/* Professional banking visual — mock member overview card */}
      <div className="relative hidden lg:block" aria-hidden>
        <div className="relative z-10 mx-auto w-[26rem] rounded-2xl bg-white shadow-2xl shadow-black/30 p-6 text-evermont-dark">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-evermont-muted">Total financial position</p>
              <p className="text-3xl font-bold text-evermont-blue mt-1">$57,400.00</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700 rounded px-2 py-1">
              +2.4% this month
            </span>
          </div>
          {[
            { name: 'Evermont Checking', num: '****4821', amount: '$10,000.00' },
            { name: 'High-Yield Savings', num: '****9037', amount: '$5,000.00' },
            { name: 'Investments', num: '****2264', amount: '$15,000.00' },
            { name: '401(k) Retirement', num: '****6118', amount: '$25,000.00' },
          ].map((row) => (
            <div key={row.num} className="flex items-center justify-between py-3 border-t border-gray-100">
              <div>
                <p className="text-sm font-semibold">{row.name}</p>
                <p className="text-xs text-evermont-muted">{row.num}</p>
              </div>
              <p className="text-sm font-bold">{row.amount}</p>
            </div>
          ))}
          <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-evermont-blue">Available funds</span>
            <span className="text-sm font-bold text-evermont-blue">$15,000.00</span>
          </div>
        </div>
        <div className="absolute -bottom-8 -left-4 z-20 w-64 rounded-xl bg-[#050440] border border-white/10 shadow-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 text-evermont-gold" />
            <p className="text-xs font-semibold">Member Spotlight</p>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            “Evermont made moving my checking, savings and 401(k) into one view effortless.”
          </p>
          <p className="mt-2 text-[10px] text-gray-400">— R. Moore, member since 2024 (demo)</p>
        </div>
      </div>
    </div>

    {/* stat strip */}
    <div className="relative border-t border-white/10 bg-[#050440]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
        {heroStats.map((stat) => (
          <div key={stat.label} className="py-6 px-6 text-center">
            <p className="text-2xl font-bold text-evermont-gold">{stat.value}</p>
            <p className="text-sm text-gray-300 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export default Hero
