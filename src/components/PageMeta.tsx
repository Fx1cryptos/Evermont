import { SEO } from './SEO'

type PageMetaProps = {
  title: string
  description: string
  path?: string
  canonical?: string
  noIndex?: boolean
  jsonLd?: boolean
}

export const PageMeta: React.FC<PageMetaProps> = ({ title, description, path, canonical, noIndex, jsonLd }) => {
  const resolvedPath = path ?? canonical?.replace('https://evermontcredit.online', '') ?? '/'
  return <SEO title={title} description={description} path={resolvedPath || '/'} noIndex={noIndex} jsonLd={jsonLd} />
}
