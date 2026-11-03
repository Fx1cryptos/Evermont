import React from 'react'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'
import { Seo } from '@/components/Seo'
import { routeMeta } from '@/config/site'

export const PublicLayout: React.FC<React.PropsWithChildren<{ path: string }>> = ({ path, children }) => {
  const meta = routeMeta(path)
  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc] text-[#101533]">
      {meta && <Seo title={meta.title} description={meta.description} path={path} />}
      <SiteHeader />
      <main id="main" className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
