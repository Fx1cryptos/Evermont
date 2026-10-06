import React from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-evermont-light flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-evermont-blue mb-4">404</h1>
      <p className="text-lg text-evermont-muted mb-8">The page you're looking for doesn't exist.</p>
      <Link to={ROUTES.HOME}>
        <Button>Back to Home</Button>
      </Link>
    </div>
  )
}

export default NotFoundPage
