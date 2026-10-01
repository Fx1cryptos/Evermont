import React from 'react'
import LandingHeader from '@/components/landing/LandingHeader'
import LandingFooter from '@/components/landing/LandingFooter'
import Hero from '@/components/landing/LandingHero'
import {
  AccountsSection,
  InvestingSection,
  LendingSection,
  CryptoSection,
  SecuritySection,
  DigitalBankingSection,
  WellnessSection,
  MembershipCTA,
} from '@/components/landing/LandingSections'

const LandingPage: React.FC = () => (
  <div className="min-h-screen bg-white">
    <LandingHeader />
    <main>
      <Hero />
      <AccountsSection />
      <InvestingSection />
      <LendingSection />
      <CryptoSection />
      <SecuritySection />
      <DigitalBankingSection />
      <WellnessSection />
      <MembershipCTA />
    </main>
    <LandingFooter />
  </div>
)

export default LandingPage
