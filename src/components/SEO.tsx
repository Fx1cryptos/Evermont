import { Helmet } from 'react-helmet-async'
import { canonicalUrl, LOGO_PATH, MAILING_ADDRESS, SITE_NAME, SITE_URL, SUPPORT_EMAIL, SUPPORT_PHONE_SCHEMA } from '@/content/publicPages'

type SEOProps = {
  title: string
  description: string
  path?: string
  image?: string
  noIndex?: boolean
  jsonLd?: boolean
}

export const SEO: React.FC<SEOProps> = ({ title, description, path = '/', image, noIndex = false, jsonLd = false }) => {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
  const url = canonicalUrl(path)
  const shareImage = image ? (image.startsWith('http') ? image : `${SITE_URL}${image}`) : `${SITE_URL}${LOGO_PATH}`
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}${LOGO_PATH}`,
    email: SUPPORT_EMAIL,
    telephone: SUPPORT_PHONE_SCHEMA,
    description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: MAILING_ADDRESS[1],
      addressLocality: 'South Burlington',
      addressRegion: 'VT',
      postalCode: '05407-2147',
      addressCountry: 'US',
    },
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
      <meta property="og:image" content={shareImage} />
      <meta property="og:image:alt" content={image ? `${SITE_NAME} page banner` : 'Evermont Credit Union logo'} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={shareImage} />
      <link rel="canonical" href={url} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index,follow'} />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(organization)}</script>}
    </Helmet>
  )
}
