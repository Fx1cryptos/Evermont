import React from 'react'
import logoUrl from '@/assets/logo.jpg'

interface LogoProps {
  /** 'dark' renders white text for blue/gradient backgrounds; 'light' for white backgrounds */
  variant?: 'dark' | 'light'
  size?: 'sm' | 'md' | 'lg'
  showWordmark?: boolean
  className?: string
}

const sizeMap = {
  sm: { img: 'h-8 w-8', word: 'text-base', sub: 'text-[9px]' },
  md: { img: 'h-10 w-10', word: 'text-lg', sub: 'text-[10px]' },
  lg: { img: 'h-14 w-14', word: 'text-2xl', sub: 'text-xs' },
}

const Logo: React.FC<LogoProps> = ({ variant = 'light', size = 'md', showWordmark = true, className = '' }) => {
  const s = sizeMap[size]
  const wordColor = variant === 'dark' ? 'text-white' : 'text-evermont-blue'
  const subColor = variant === 'dark' ? 'text-evermont-gold' : 'text-evermont-gold'

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className={`${s.img} shrink-0 overflow-hidden rounded-full ring-2 ring-white/20 shadow-sm`}
      >
        <img src={logoUrl} alt="Evermont Credit Union logo" className="h-full w-full object-cover" />
      </span>
      {showWordmark && (
        <span className="leading-none">
          <span className={`block ${s.word} font-bold tracking-[0.18em] ${wordColor}`}>EVERMONT</span>
          <span className={`block ${s.sub} font-semibold tracking-[0.32em] mt-1 ${subColor}`}>
            CREDIT UNION
          </span>
        </span>
      )}
    </span>
  )
}

export default Logo
