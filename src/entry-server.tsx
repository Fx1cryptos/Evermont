import { renderToString } from 'react-dom/server'
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async'
import { StaticRouter } from 'react-router-dom/server'
import { prerenderPaths } from '@/content/publicPages'
import { AppRoutes } from '@/App'

export { prerenderPaths }

export function render(url: string) {
  const helmetContext: { helmet?: HelmetServerState } = {}
  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <AppRoutes />
      </StaticRouter>
    </HelmetProvider>,
  )
  if (!helmetContext.helmet) throw new Error(`Missing document head for ${url}`)
  return { html, helmet: helmetContext.helmet }
}
