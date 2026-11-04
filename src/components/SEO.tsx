import { Helmet } from 'react-helmet-async'

type SEOProps = {
  title: string
  description: string
  path?: string
  noIndex?: boolean
}

const siteName = 'Evermont Credit Union'
const siteUrl = 'https://evermontcredit.online'

export const SEO: React.FC<SEOProps> = ({ title, description, path = '/', noIndex = false }) => {
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`
  const url = `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={`${siteUrl}/images/evermont-logo.jpeg`} />
      <meta property="og:image:alt" content="Evermont Credit Union logo" />
      <meta name="twitter:image" content={`${siteUrl}/images/evermont-logo.jpeg`} />
      <script type="application/ld+json">{JSON.stringify({ '@context': 'https://schema.org', '@type': ['Organization', 'FinancialService'], name: siteName, description, url: siteUrl, email: 'support@evermontcredit.online', logo: `${siteUrl}/images/evermont-logo.jpeg`, sameAs: ['https://www.instagram.com/evermontcreditunion', 'https://www.facebook.com/share/1GupMnFfkt/'] })}</script>
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  )
}
