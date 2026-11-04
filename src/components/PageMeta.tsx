import { SEO } from './SEO'

type PageMetaProps = {
  title: string
  description: string
  path?: string
  image?: string
  canonical?: string
  noIndex?: boolean
  jsonLd?: boolean
}

export const PageMeta: React.FC<PageMetaProps> = ({ title, description, path, image, canonical, noIndex, jsonLd }) => {
  const resolvedPath = path ?? canonical?.replace('https://evermontcredit.online', '') ?? '/'
  return <SEO title={title} description={description} path={resolvedPath || '/'} image={image} noIndex={noIndex} jsonLd={jsonLd} />
}
