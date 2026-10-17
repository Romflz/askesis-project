// Askesis service worker: makes the app installable and shows the daily
// reminder push. It deliberately caches nothing, so a deploy is never stale.

// Take over straight away instead of waiting for every open tab to close.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

// The reminder job (apps/api/src/push.ts) sends JSON: { title, body, url, tag }.
// Every field has a fallback, and a payload that isn't JSON becomes the body.
self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { body: event.data ? event.data.text() : '' }
  }
  const title = data.title || 'Time for Askesis'
  // waitUntil keeps the worker alive until the notification is on screen.
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || 'Your cards are ready.',
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-96.png',
      // One reminder per day: a newer one replaces an unread older one, and
      // renotify still alerts for the replacement.
      tag: data.tag || 'askesis-daily',
      renotify: true,
      // Read back on click to choose the page to open.
      data: { url: data.url || '/dashboard' },
    }),
  )
})

// A click reuses an open Askesis tab if there is one (focused, then sent to the
// notification's page), and opens a new window otherwise.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = new URL(event.notification.data?.url || '/dashboard', self.location.origin).href
  event.waitUntil(
    (async () => {
      // includeUncontrolled also finds tabs opened before this worker took over.
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      const open = windows.find((w) => new URL(w.url).origin === self.location.origin)
      if (open) {
        await open.focus()
        return open.navigate(url)
      }
      return self.clients.openWindow(url)
    })(),
  )
})
