import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const { render, prerenderPaths } = await import(path.join(root, 'dist/server/entry-server.js'))
const templatePath = path.join(root, 'dist/index.html')
const template = fs.readFileSync(templatePath, 'utf8')
const titles = new Map()

for (const route of prerenderPaths) {
  const { html, helmet } = render(route)
  const head = `${helmet.title}${helmet.meta}${helmet.link}${helmet.script}`
  const title = helmet.title.toString().replace(/<[^>]+>/g, '').trim()
  if (!title) throw new Error(`Prerender produced an empty title for ${route}`)
  if ([...titles.values()].includes(title)) throw new Error(`Duplicate title "${title}" on ${route}`)
  titles.set(route, title)

  let page = template
    .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
    .replace(/<meta\s+name="description"[^>]*>\s*/i, '')
    .replace('</head>', `${head}\n</head>`)
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`)

  if (!page.includes('<title') || !page.includes('rel="canonical"') || !page.includes('property="og:title"')) {
    throw new Error(`Prerendered head is incomplete for ${route}`)
  }
  if (!page.includes('content="index,follow"') || page.includes('noindex')) {
    throw new Error(`Prerendered robots tag is not indexable for ${route}`)
  }

  const file = route === '/' ? templatePath : path.join(root, 'dist', `${route.slice(1)}.html`)
  fs.writeFileSync(file, page)
  console.log(`prerendered ${route} -> ${path.basename(file)} | ${title}`)
}
