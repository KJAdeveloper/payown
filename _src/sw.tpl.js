/* Service worker: offline app shell only.
   - Invoice data is never cached: pay links carry the invoice in the URL fragment (#i=...), which browsers
     never send in requests, so this worker cannot see or store it. Saved invoices live in IndexedDB.
   - Pages are network-first (fresh deploys win), keyed by path only, so ?id= and #i= routing are untouched.
   - Static shell files are stale-while-revalidate; fonts + QR library are cached at runtime. */
const VERSION = "__VERSION__";
const SHELL = __SHELL__;
const CACHE = "shell-" + VERSION;
const RUNTIME = "runtime-v1";
const CDN = /^(fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.jsdelivr\.net)$/;

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== RUNTIME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function pageKey(p) {
  if (p === "/" || p === "/index" || p === "/index.html") return "/";
  if (p === "/i" || p === "/i/" || p === "/i.html") return "/i";
  return null;
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    if (req.mode === "navigate") {
      const key = pageKey(url.pathname);
      if (!key) return;
      e.respondWith(
        fetch(req)
          .then((res) => {
            if (res.ok && res.type === "basic" && !res.redirected) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(key, copy));
            }
            return res;
          })
          .catch(() => caches.match(key).then((hit) => hit || caches.match("/")))
      );
      return;
    }
    if (SHELL.indexOf(url.pathname) !== -1) {
      e.respondWith(
        caches.open(CACHE).then((c) =>
          c.match(url.pathname).then((hit) => {
            const net = fetch(req)
              .then((res) => { if (res.ok) c.put(url.pathname, res.clone()); return res; })
              .catch(() => hit);
            return hit || net;
          })
        )
      );
    }
    return;
  }

  if (CDN.test(url.hostname)) {
    e.respondWith(
      caches.open(RUNTIME).then((c) =>
        c.match(req).then((hit) =>
          hit || fetch(req).then((res) => { if (res.ok || res.type === "opaque") c.put(req, res.clone()); return res; })
        )
      )
    );
  }
});
