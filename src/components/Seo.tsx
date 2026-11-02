import React from 'react'
import { Helmet } from 'react-helmet-async'
import { absoluteUrl, OG_IMAGE, SITE_NAME } from '@/config/site'

interface SeoProps { title: string; description?: string; path?: string; noindex?: boolean; jsonLd?: Record<string, unknown> }

export const Seo: React.FC<SeoProps> = ({ title, description, path, noindex, jsonLd }) => {
  const url = path ? absoluteUrl(path) : undefined
  return (
    <Helmet prioritizeSeoTags>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'} />
      {url && !noindex && <link rel="canonical" href={url} />}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      {url && <meta property="og:url" content={url} />}
      <meta property="og:image" content={OG_IMAGE} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  )
}

/** Convenience wrapper for private (portal/auth/admin) screens. */
export const NoIndex: React.FC<{ title: string }> = ({ title }) => <Seo title={`${title} | ${SITE_NAME}`} noindex />
