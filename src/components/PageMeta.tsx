import { SEO } from './SEO'

type PageMetaProps = {
  title: string
  description: string
  canonical?: string
  noIndex?: boolean
}

export const PageMeta: React.FC<PageMetaProps> = ({ title, description, canonical, noIndex }) => (
  <SEO title={title} description={description} path={canonical?.replace('https://evermontcredit.online', '') || '/'} noIndex={noIndex} />
)

