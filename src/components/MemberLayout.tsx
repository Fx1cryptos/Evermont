import React from 'react'
import MemberHeader from '@/components/member/MemberHeader'
import { DemoBanner } from '@/components/DemoBanner'

const MemberLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-evermont-light">
    <MemberHeader />
    <DemoBanner />
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    <footer className="bg-white border-t border-evermont-border py-4">
      <p className="text-center text-[11px] text-evermont-muted px-4">
        DEMO / SIMULATED DATA — Evermont Credit Union is not a licensed financial institution. No
        real banking or payment activity occurs in this application.
      </p>
    </footer>
  </div>
)

export default MemberLayout
