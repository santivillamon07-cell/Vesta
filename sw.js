// ── Vesta Service Worker ─────────────────────────────────────────────────
// Estrategia: cache-first con revalidación en segundo plano (stale-while-
// revalidate). Esto permite que Vesta funcione 100% offline y que arranque
// instantáneo, mientras en segundo plano se descarga la versión más nueva
// para la próxima vez que se abra.
//
// IMPORTANTE sobre alarmas: este Service Worker NO puede hacer sonar una
// alarma con el teléfono bloqueado o la app cerrada. Eso solo es posible
// con Push API + un servidor que dispare la notificación (Web Push), algo
// que Vesta no tiene porque no hay backend. Lo que este SW SÍ mejora:
//   1) Que la app cargue instantánea y funcione sin conexión.
//   2) Que las notificaciones se muestren vía registration.showNotification
//      (más confiable en Android/Chrome que "new Notification()" directo).
//   3) Que al tocar la notificación se enfoque/abra la app.

const CACHE_NAME = 'vesta-cache-v2';
const CORE_ASSETS = [
  './',
  './Vesta.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Assets "core" del app shell (HTML/manifest): siempre se sirven network-first
// para que un cambio subido a GitHub se vea de inmediato con conexión.
// Todo lo demás (íconos, assets estáticos) sigue cache-first porque casi
// nunca cambia y así arranca instantáneo.
const NETWORK_FIRST = ['./', './Vesta.html', './manifest.json'];

function isNetworkFirst(url) {
  const path = url.replace(self.location.origin, '') || './';
  return NETWORK_FIRST.some((core) => path === core || path === core.replace('./', '/'));
}

// ── Instalación: precachea el shell de la app ───────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .catch((err) => console.warn('[SW] precache falló:', err))
  );
  self.skipWaiting();
});

// ── Activación: limpia caches viejos de versiones anteriores ───────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch ────────────────────────────────────────────────────────────────
// - HTML/manifest (NETWORK_FIRST): red primero → siempre ves lo último con
//   conexión; si falla la red, cae al caché para que funcione offline.
// - Todo lo demás (íconos, etc.): cache-first + revalidación en segundo
//   plano, como antes, porque no necesita estar "al día" al instante.
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Solo interceptamos GET del mismo origen; el resto pasa directo a red.
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) {
    return;
  }

  // También tratamos las navegaciones (abrir la app / recargar) como
  // network-first, sea cual sea la URL exacta que pida el navegador.
  const networkFirst = req.mode === 'navigate' || isNetworkFirst(req.url);

  if (networkFirst) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        try {
          const fresh = await fetch(req);
          if (fresh && fresh.status === 200) {
            cache.put(req, fresh.clone());
          }
          return fresh;
        } catch (err) {
          // Sin conexión: usamos lo último que quedó guardado.
          const cached = await cache.match(req);
          return cached || new Response('Sin conexión y sin caché disponible.', {
            status: 503,
            statusText: 'Offline',
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        }
      })
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(req);

      const networkFetch = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            cache.put(req, res.clone());
          }
          return res;
        })
        .catch(() => null); // sin conexión: no rompe nada

      // Si hay copia en caché, respondemos al toque y revalidamos atrás.
      if (cached) {
        event.waitUntil(networkFetch);
        return cached;
      }

      // Sin caché todavía: esperamos la red; si falla, no hay nada que dar.
      const fresh = await networkFetch;
      return fresh || new Response('Sin conexión y sin caché disponible.', {
        status: 503,
        statusText: 'Offline',
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    })
  );
});

// ── Notificaciones mostradas por el propio Service Worker ──────────────
// La página le pide al SW que muestre la notificación (más confiable que
// "new Notification()" desde el hilo de la página, sobre todo en Android).
self.addEventListener('message', (event) => {
  const msg = event.data;
  if (!msg || msg.type !== 'SHOW_NOTIFICATION') return;

  const { title, options } = msg;
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ── Click en la notificación: enfoca o abre la app ──────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const tag = event.notification.tag || '';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          client.postMessage({ type: 'NOTIFICATION_CLICK', tag });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('./Vesta.html');
      }
    })
  );
});
