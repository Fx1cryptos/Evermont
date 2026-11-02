import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async'
import { AppRoutes } from './App'
import { AuthProvider } from './contexts/AuthContext'
import { PUBLIC_ROUTES, SITE_URL } from './config/site'

export { PUBLIC_ROUTES, SITE_URL }

export function render(url: string) {
  const helmetContext: { helmet?: HelmetServerState } = {}
  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <AuthProvider>
        <StaticRouter location={url}>
          <AppRoutes />
        </StaticRouter>
      </AuthProvider>
    </HelmetProvider>
  )
  const h = helmetContext.helmet
  const head = h ? [h.title, h.priority, h.meta, h.link, h.script].map(x => x?.toString() ?? '').join('') : ''
  return { html, head }
}
