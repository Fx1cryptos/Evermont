// Build-time prerender: renders each public route to dist/<route>.html (index.html for /)
// with that route's <title> inside the Primary SEO marker. Vercel cleanUrls serves those
// files without the .html suffix. Portal, auth, and admin routes stay on app.html (noindex).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const ssrEntry = path.join(root, 'dist-ssr', 'entry-server.js')
const { render, PUBLIC_ROUTES, SITE_URL } = await import(pathToFileURL(ssrEntry).href)

const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
// Strip template-level SEO tags; Helmet output supplies per-route ones.
const base = template
  .replace(/<title>[\s\S]*?<\/title>/, '')
  .replace(/\s*<meta (name|property)="(description|robots|og:[^"]+|twitter:[^"]+)"[^>]*>/g, '')
  .replace(/\s*<link rel="canonical"[^>]*>/g, '')

const SEO_MARKER = '<!-- Primary SEO -->'

const page = (url) => {
  const { html, head } = render(url)
  if (!head.includes('<title')) throw new Error(`Prerender produced no <title> for ${url}`)
  if (!base.includes(SEO_MARKER)) throw new Error('index.html is missing the Primary SEO marker')
  return base
    .replace(SEO_MARKER, `${SEO_MARKER}\n${head}`)
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`)
}

// trailingSlash:false + cleanUrls:true serves /about from about.html, not about/index.html.
const outFile = (routePath) => routePath === '/'
  ? path.join(dist, 'index.html')
  : path.join(dist, `${routePath.replace(/^\//, '')}.html`)

const today = new Date().toISOString().slice(0, 10)
for (const r of PUBLIC_ROUTES) {
  const out = outFile(r.path)
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, page(r.path))
}
fs.writeFileSync(path.join(dist, '404.html'), page('/__not-found__'))
// SPA shell for client-only (portal/auth/admin) routes: noindex.
fs.writeFileSync(path.join(dist, 'app.html'), base.replace(SEO_MARKER, `${SEO_MARKER}\n  <title>Evermont Credit Union</title>\n  <meta name="robots" content="noindex, nofollow" />`))

const urls = PUBLIC_ROUTES.map(r => `  <url>\n    <loc>${SITE_URL}${r.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${r.path === '/' ? 'weekly' : 'monthly'}</changefreq>\n    <priority>${r.path === '/' ? '1.0' : '0.7'}</priority>\n  </url>`).join('\n')
fs.writeFileSync(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`)
fs.rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true })
console.log(`prerendered ${PUBLIC_ROUTES.length} public routes + 404.html, app.html, sitemap.xml`)
