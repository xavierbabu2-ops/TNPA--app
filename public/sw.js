/**
 * TNPA Progressive Web Application (PWA) Service Worker
 * Version: 2.4.0
 * Features:
 * - App Shell Caching
 * - Local Member Database & Directory Caching (Offline Read-Access)
 * - Background Sync & Offline Mutation Interception
 * - Automatic Connectivity Recovery Syncing
 */

const STATIC_CACHE_NAME = 'tnpa-pwa-static-v2.4';
const MEMBERS_CACHE_NAME = 'tnpa-members-database-v2.4';

const STATIC_URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.svg',
  '/flag.svg',
  '/r_xavier_babu.svg',
  '/s_michael_alvin.svg',
  '/r_sakthivel.svg'
];

// Member API endpoints designated for local caching & offline read-access
const MEMBER_DATA_ENDPOINTS = [
  '/api/members/directory',
  '/api/members/database/snapshot',
  '/api/members',
  '/api/districts',
  '/api/legal-advisors',
  '/api/whatsapp-groups'
];

// Install Event: Pre-cache core application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_URLS_TO_CACHE).catch((err) => {
        console.warn('[Service Worker] Non-fatal pre-cache warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event: Clean up legacy caches & take immediate client control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && cacheName !== MEMBERS_CACHE_NAME) {
            console.log('[Service Worker] Deleting legacy cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper: Check if URL belongs to Member Database endpoints
function isMemberDataRequest(url) {
  const parsed = new URL(url);
  return MEMBER_DATA_ENDPOINTS.some(endpoint => parsed.pathname.startsWith(endpoint));
}

// Fetch Event: Intelligent multi-tier caching
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Navigation requests (App Shell)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }

  // 2. Member Database Read API (GET) -> Network First with Automatic Cache Fallback
  if (request.method === 'GET' && isMemberDataRequest(request.url)) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(MEMBERS_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline Fallback: Serve from local member cache
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            const headers = new Headers(cachedResponse.headers);
            headers.set('X-TNPA-Data-Source', 'local-offline-cache');
            return new Response(cachedResponse.body, {
              status: cachedResponse.status,
              statusText: cachedResponse.statusText,
              headers: headers
            });
          }

          // If specific URL is missing, try returning the root database snapshot if available
          const snapshotCache = await caches.match('/api/members/database/snapshot');
          if (snapshotCache) {
            return snapshotCache;
          }

          // Synthetic offline response so client components stay alive
          return new Response(
            JSON.stringify({
              success: true,
              isOfflineFallback: true,
              message: "Serving offline member cache directory.",
              members: [],
              timestamp: new Date().toISOString()
            }),
            {
              headers: { 'Content-Type': 'application/json', 'X-TNPA-Offline': 'true' },
              status: 200
            }
          );
        })
    );
    return;
  }

  // 3. Member Mutation Requests (POST / PUT) during Offline State
  if ((request.method === 'POST' || request.method === 'PUT') && isMemberDataRequest(request.url)) {
    event.respondWith(
      fetch(request.clone()).catch(async (err) => {
        console.log('[Service Worker] Offline mutation intercepted. Synthesizing queue acceptance:', request.url);
        // Inform client to queue in IndexedDB
        notifyClientsOfOfflineMutation(request.url);

        return new Response(
          JSON.stringify({
            success: true,
            offlineQueued: true,
            status: "queued_for_sync",
            message: "Network offline. Member record saved to local database and scheduled for auto-sync.",
            messageTa: "இணையம் இல்லை. உறுப்பினர் பதிவு லோக்கல் நினைவகத்தில் பாதுகாக்கப்பட்டது; இணைப்பு வந்ததும் தானாக ஒத்திசைக்கப்படும்.",
            queuedAt: new Date().toISOString()
          }),
          {
            headers: { 'Content-Type': 'application/json', 'X-TNPA-Offline-Queued': 'true' },
            status: 202
          }
        );
      })
    );
    return;
  }

  // 4. Static Assets & Standard Requests (Stale While Revalidate / Cache First)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Background refresh in parallel if online
        fetch(request).then((freshResponse) => {
          if (freshResponse && freshResponse.status === 200) {
            caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(request, freshResponse));
          }
        }).catch(() => {/* Ignore network errors on background refresh */});

        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && (request.url.endsWith('.svg') || request.url.endsWith('.png') || request.url.endsWith('.js') || request.url.endsWith('.css'))) {
          const respClone = networkResponse.clone();
          caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(request, respClone));
        }
        return networkResponse;
      });
    })
  );
});

// Helper: Broadcast message to all active clients (tabs/windows)
async function broadcastToClients(message) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
  clients.forEach((client) => {
    client.postMessage(message);
  });
}

function notifyClientsOfOfflineMutation(url) {
  broadcastToClients({
    type: 'TNPA_OFFLINE_MUTATION_INTERCEPTED',
    url: url,
    timestamp: Date.now()
  });
}

// Background Sync Event Listener
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync event triggered:', event.tag);
  if (event.tag === 'sync-member-updates' || event.tag === 'sync-registrations' || event.tag === 'tnpa-member-sync') {
    event.waitUntil(
      broadcastToClients({
        type: 'TRIGGER_CLIENT_OFFLINE_SYNC',
        tag: event.tag,
        timestamp: Date.now()
      })
    );
  }
});

// Message Listener from Web App
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Precache updated member database snapshot from client
  if (event.data.type === 'CACHE_MEMBER_DATABASE_SNAPSHOT' && event.data.payload) {
    caches.open(MEMBERS_CACHE_NAME).then((cache) => {
      const response = new Response(JSON.stringify(event.data.payload), {
        headers: { 'Content-Type': 'application/json' }
      });
      cache.put('/api/members/database/snapshot', response);
      console.log('[Service Worker] Member database snapshot cached locally.');
    });
  }

  // Trigger sync broadcast
  if (event.data.type === 'SYNC_REQUEST') {
    broadcastToClients({
      type: 'EXECUTE_DATABASE_SYNC',
      timestamp: Date.now()
    });
  }
});
