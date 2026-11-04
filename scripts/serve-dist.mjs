// Local static server that mimics the Vercel config: clean URLs -> <path>/index.html,
// private prefixes -> app.html (SPA shell, noindex), everything else -> 404.html with status 404.
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const vercel = JSON.parse(fs.readFileSync(path.resolve(dist, '..', 'vercel.json'), 'utf8'))
const privatePatterns = (vercel.rewrites || []).map((rule) => new RegExp('^' + rule.source.replace(/\/:rest\*/g, '(?:/.*)?') + '$'))
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.jpeg': 'image/jpeg', '.xml': 'application/xml', '.txt': 'text/plain' }
const port = Number(process.env.PORT || 4173)

const within = (file) => file.startsWith(dist + path.sep) || file === dist

http.createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/\/+$/, '') || '/'
  const send = (file, status = 200, extra = {}) => { res.writeHead(status, { 'content-type': types[path.extname(file)] || 'application/octet-stream', ...extra }); fs.createReadStream(file).pipe(res) }
  if (privatePatterns.some((pattern) => pattern.test(url))) return send(path.join(dist, 'app.html'), 200, { 'x-robots-tag': 'noindex, nofollow' })
  const direct = path.join(dist, url)
  if (!within(direct)) { res.writeHead(400); return res.end() }
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return send(direct)
  const clean = url === '/' ? path.join(dist, 'index.html') : path.join(dist, `${url.replace(/^\//, '')}.html`)
  if (within(clean) && fs.existsSync(clean)) return send(clean)
  const index = path.join(direct, 'index.html')
  if (within(index) && fs.existsSync(index)) return send(index)
  return send(path.join(dist, '404.html'), 404)
}).listen(port, () => console.log(`serving dist on http://localhost:${port}`))
