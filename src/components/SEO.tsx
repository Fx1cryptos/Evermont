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
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  )
}
