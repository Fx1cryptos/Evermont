import { Helmet } from 'react-helmet-async'
import { canonicalUrl, LOGO_PATH, SITE_NAME, SITE_URL, SUPPORT_EMAIL } from '@/content/publicPages'

type SEOProps = {
  title: string
  description: string
  path?: string
  noIndex?: boolean
  jsonLd?: boolean
}

export const SEO: React.FC<SEOProps> = ({ title, description, path = '/', noIndex = false, jsonLd = false }) => {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
  const url = canonicalUrl(path)
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}${LOGO_PATH}`,
    email: SUPPORT_EMAIL,
    description,
    sameAs: [
      'https://www.instagram.com/evermontcreditunion',
      'https://www.facebook.com/share/1GupMnFfkt/',
    ],
  }

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={`${SITE_URL}${LOGO_PATH}`} />
      <meta property="og:image:alt" content="Evermont Credit Union logo" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${SITE_URL}${LOGO_PATH}`} />
      <link rel="canonical" href={url} />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(organization)}</script>}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  )
}
