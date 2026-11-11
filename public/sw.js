const CACHE_NAME = 'evermont-public-v2'
const PUBLIC_PATHS = new Set([
  '/', '/about', '/personal-banking', '/private-wealth', '/services', '/resources', '/contact',
  '/checking', '/savings', '/credit-card', '/loans', '/retirement', '/cryptocurrency',
  '/open-account', '/security', '/privacy', '/terms', '/accessibility', '/disclosures',
])
const SHELL_ASSETS = [
  '/', '/manifest.json', '/images/evermont-logo.jpeg',
  '/images/banners/home.webp', '/images/banners/personal.webp', '/images/banners/wealth.webp', '/images/banners/phone.webp',
  '/favicon.ico', '/favicon.svg', '/icons/favicon-16x16.png', '/icons/favicon-32x32.png',
  '/icons/apple-touch-icon.png', '/icons/evermont-192.png', '/icons/evermont-512.png', '/icons/evermont-maskable-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('evermont-public-') && key !== CACHE_NAME).map((key) => caches.delete(key))))
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/login') || url.pathname.startsWith('/register') || url.pathname.startsWith('/sign-in') || url.pathname.startsWith('/sign-up')) return

  if (request.mode === 'navigate') {
    if (!PUBLIC_PATHS.has(url.pathname)) return
    event.respondWith(
      fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone()
          void caches.open(CACHE_NAME).then((cache) => cache.put(url.pathname, copy))
        }
        return response
      }).catch(async () => (await caches.match(url.pathname)) || (await caches.match('/')))
    )
    return
  }

  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/') || url.pathname.startsWith('/images/')) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone()
        void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
      }
      return response
    })))
  }
})
