import { useEffect } from 'react'

type PageMetaProps = {
  title: string
  description: string
  canonical?: string
}

export const PageMeta: React.FC<PageMetaProps> = ({ title, description, canonical }) => {
  useEffect(() => {
    document.title = title

    let descriptionMeta = document.querySelector('meta[name="description"]')
    if (!descriptionMeta) {
      descriptionMeta = document.createElement('meta')
      descriptionMeta.setAttribute('name', 'description')
      document.head.appendChild(descriptionMeta)
    }
    descriptionMeta.setAttribute('content', description)

    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]')
      if (!canonicalLink) {
        canonicalLink = document.createElement('link')
        canonicalLink.setAttribute('rel', 'canonical')
        document.head.appendChild(canonicalLink)
      }
      canonicalLink.setAttribute('href', canonical)
    }
  }, [title, description, canonical])

  return null
}
