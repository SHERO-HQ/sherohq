// SHERO Service Worker — Cache strategies for offline-capable PWA

const CACHE_VERSION = "v3";
const STATIC_CACHE = `shero-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `shero-dynamic-${CACHE_VERSION}`;

// Assets to pre-cache on install (app shell)
const PRECACHE_ASSETS = [
  "/",
  "/offline",
  "/favicon.ico",
  "/favicon.svg",
  "/favicon-96x96.png",
  "/apple-touch-icon.png",
  "/web-app-manifest-192x192.png",
  "/web-app-manifest-512x512.png",
  "/site.webmanifest",
  "/admin.webmanifest",
];

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) =>
        // Use individual adds so one failure doesn't block the rest
        Promise.allSettled(PRECACHE_ASSETS.map((url) => cache.add(url))),
      )
      .then(() => self.skipWaiting()),
  );
});

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, chrome-extension, and cross-origin requests
  if (
    request.method !== "GET" ||
    !url.origin.startsWith("http") ||
    (url.origin !== self.location.origin &&
      !url.pathname.startsWith("/uploads/"))
  )
    return;

  // 1. API calls → network-first (no cache)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkOnly(request));
    return;
  }

  // 2. Next.js built assets (_next/static) → network-first
  // Prevents caching unhashed dev chunks which break HMR and hydration
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(networkFirstAsset(request, STATIC_CACHE));
    return;
  }

  // 3. Images & icons → cache-first with dynamic cache
  if (
    request.destination === "image" ||
    url.pathname.startsWith("/images/") ||
    url.pathname.startsWith("/uploads/")
  ) {
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
    return;
  }

  // 4. HTML navigation → network-first, fallback to cache, then /offline
  if (request.mode === "navigate") {
    event.respondWith(networkFirstNav(request));
    return;
  }

  // 5. Everything else → stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
});

// ─── Strategies ───────────────────────────────────────────────────────────────

async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch {
    return new Response(JSON.stringify({ error: "offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function networkFirstAsset(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response("Offline", { status: 503 });
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

async function networkFirstNav(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Fall back to the cached home page or offline page
    return (
      (await caches.match("/offline")) ||
      (await caches.match("/")) ||
      new Response("You appear to be offline.", {
        status: 503,
        headers: { "Content-Type": "text/plain" },
      })
    );
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  return (
    cached || (await fetchPromise) || new Response("Offline", { status: 503 })
  );
}
