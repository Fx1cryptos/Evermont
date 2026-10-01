import React from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { EVERMONT_COLORS } from '@/constants/design'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const features = [
  {
    title: 'Secure Banking',
    description: 'Bank with confidence using industry-standard encryption and multi-factor authentication.',
  },
  {
    title: 'Member-Focused',
    description: 'Built around the needs of our members, not shareholders. Better rates, fewer fees.',
  },
  {
    title: 'Digital-First',
    description: 'Manage your money anytime, anywhere with a clean and intuitive digital experience.',
  },
  {
    title: 'Community Driven',
    description: 'Your deposits stay in the community, funding local loans and financial education.',
  },
]

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-evermont-light">
      {/* Header */}
      <header className="bg-evermont-blue text-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">Evermont</span>
            <span className="text-evermont-gold text-sm font-medium">Credit Union</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link to={ROUTES.LOGIN}>
              <Button variant="outline" size="sm" className="text-white border-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
            <Link to={ROUTES.REGISTER}>
              <Button variant="secondary" size="sm">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-evermont-blue text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Your money. Your community. Your future.
          </h1>
          <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
            Evermont Credit Union is a modern digital banking platform built on traditional
            credit-union principles — member-focused, community-driven, and designed for the future.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to={ROUTES.REGISTER}>
              <Button size="lg" variant="secondary">
                Open an Account
              </Button>
            </Link>
            <Link to={ROUTES.LOGIN}>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-evermont-dark mb-12">
            Why Evermont?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title}>
                <h3 className="text-lg font-semibold text-evermont-blue mb-2">{feature.title}</h3>
                <p className="text-sm text-evermont-muted">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-evermont-dark text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to join Evermont?</h2>
          <p className="text-gray-300 mb-8">
            Become a member today and experience banking that puts you first.
          </p>
          <Link to={ROUTES.REGISTER}>
            <Button size="lg" variant="secondary">
              Become a Member
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-evermont-dark text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm">
          <p>
            Evermont Credit Union is a fictional project and is not a licensed or regulated financial institution.
          </p>
          <p className="mt-2">© {new Date().getFullYear()} Evermont Credit Union. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
