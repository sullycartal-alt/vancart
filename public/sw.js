const CACHE_NAME = 'vancart-v1'
const DYNAMIC_CACHE = 'vancart-dynamic-v1'
const IMAGE_CACHE = 'vancart-images-v1'
const IMAGE_MAX = 50
const IMAGE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
]

// ── Install ───────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// ── Activate ──────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  const keep = [CACHE_NAME, DYNAMIC_CACHE, IMAGE_CACHE]
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !keep.includes(k)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

// ── Helpers ───────────────────────────────────────────────────────────────────
function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/fonts/')
  )
}

function isImage(url) {
  return /\.(png|jpg|jpeg|gif|webp|svg|ico)$/i.test(url.pathname)
}

function isApiRequest(url) {
  return url.pathname.startsWith('/api/')
}

function isNavigationRequest(request) {
  return request.mode === 'navigate'
}

async function networkFirst(request, cacheName, timeoutMs = 5000) {
  const cache = await caches.open(cacheName)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(request, { signal: controller.signal })
    clearTimeout(timer)
    if (response.ok) cache.put(request, response.clone())
    return response
  } catch {
    clearTimeout(timer)
    const cached = await cache.match(request)
    if (cached) return cached
    // For navigation, return a basic offline page
    if (isNavigationRequest(request)) {
      return new Response(
        '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hors ligne — VanCart</title><style>body{font-family:system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100svh;margin:0;background:#f9fafb;color:#1a1a1a;text-align:center;padding:2rem}h1{font-size:1.5rem;font-weight:700}p{color:#6b6b6b;margin-top:.5rem}a{margin-top:1.5rem;display:inline-block;padding:.75rem 1.5rem;background:#6C47FF;color:#fff;border-radius:.75rem;text-decoration:none;font-weight:600}</style></head><body><h1>📡 Vous êtes hors ligne</h1><p>Vérifiez votre connexion et réessayez.</p><a href="/">Réessayer</a></body></html>',
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      )
    }
    throw new Error('Network and cache both failed')
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok) cache.put(request, response.clone())
  return response
}

async function cacheFirstWithExpiry(request) {
  const cache = await caches.open(IMAGE_CACHE)
  const cached = await cache.match(request)
  if (cached) {
    const fetchedAt = cached.headers.get('sw-fetched-at')
    if (fetchedAt && Date.now() - parseInt(fetchedAt) < IMAGE_MAX_AGE_MS) {
      return cached
    }
  }
  const response = await fetch(request)
  if (response.ok) {
    // Inject timestamp header
    const headers = new Headers(response.headers)
    headers.set('sw-fetched-at', String(Date.now()))
    const stamped = new Response(await response.blob(), { status: response.status, headers })
    // Enforce max items
    const keys = await cache.keys()
    if (keys.length >= IMAGE_MAX) await cache.delete(keys[0])
    cache.put(request, stamped)
  }
  return response
}

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Only handle same-origin + https (skip chrome-extension, etc.)
  if (event.request.method !== 'GET') {
    // Background sync for failed POST /api/stamps
    if (
      event.request.method === 'POST' &&
      url.pathname === '/api/stamps' &&
      'SyncManager' in self
    ) {
      event.respondWith(
        fetch(event.request.clone()).catch(async () => {
          const body = await event.request.clone().text()
          const db = await openDB()
          await saveStampRequest(db, body)
          await self.registration.sync.register('stamps-sync')
          return new Response(JSON.stringify({ queued: true }), {
            headers: { 'Content-Type': 'application/json' },
          })
        })
      )
    }
    return
  }

  if (url.origin !== self.location.origin) return

  if (isApiRequest(url)) {
    event.respondWith(networkFirst(event.request, DYNAMIC_CACHE, 5000))
  } else if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(event.request, CACHE_NAME))
  } else if (isImage(url)) {
    event.respondWith(cacheFirstWithExpiry(event.request))
  } else if (isNavigationRequest(event.request)) {
    const headers = new Headers(event.request.headers)
    headers.set('x-pwa-standalone', '1')
    const pwaRequest = new Request(event.request.url, {
      method: event.request.method,
      headers,
      credentials: event.request.credentials,
      redirect: event.request.redirect,
    })
    event.respondWith(networkFirst(pwaRequest, DYNAMIC_CACHE))
  } else {
    event.respondWith(networkFirst(event.request, DYNAMIC_CACHE))
  }
})

// ── Background Sync ───────────────────────────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'stamps-sync') {
    event.waitUntil(replayStamps())
  }
})

async function replayStamps() {
  const db = await openDB()
  const requests = await getAllStampRequests(db)
  for (const { id, body } of requests) {
    try {
      const response = await fetch('/api/stamps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      })
      if (response.ok) await deleteStampRequest(db, id)
    } catch {
      // Will retry on next sync
    }
  }
}

// ── Minimal IndexedDB for background sync queue ────────────────────────────────
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('vancart-sync', 1)
    req.onupgradeneeded = () => req.result.createObjectStore('stamps', { keyPath: 'id', autoIncrement: true })
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}
function saveStampRequest(db, body) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('stamps', 'readwrite')
    tx.objectStore('stamps').add({ body, ts: Date.now() })
    tx.oncomplete = resolve
    tx.onerror = () => reject(tx.error)
  })
}
function getAllStampRequests(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('stamps', 'readonly')
    const req = tx.objectStore('stamps').getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}
function deleteStampRequest(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('stamps', 'readwrite')
    tx.objectStore('stamps').delete(id)
    tx.oncomplete = resolve
    tx.onerror = () => reject(tx.error)
  })
}

// ── Push Notifications ────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = { title: 'VanCart', body: 'Vous avez une nouvelle notification.' }
  try {
    if (event.data) data = event.data.json()
  } catch { /* ignore malformed payload */ }

  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [100, 50, 100],
    data: { url: data.url ?? '/' },
    actions: [
      { action: 'open', title: 'Voir ma carte' },
      { action: 'close', title: 'Fermer' },
    ],
  }

  event.waitUntil(self.registration.showNotification(data.title ?? 'VanCart', options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'close') return
  const url = event.notification.data?.url ?? '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url === url && 'focus' in c)
      if (existing) return existing.focus()
      return self.clients.openWindow(url)
    })
  )
})

// ── Message ───────────────────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})
