const C = "kv-app-v3";
const T = "kv-tiles-v1";
const APP = ["./", "index.html", "map.html", "manifest.webmanifest", "photo_30754442754_x.jpg"];
const TH = ["cartocdn.com", "arcgisonline.com", "tile.openstreetmap.org"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(C)
      .then(c => Promise.allSettled(APP.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(k => Promise.all(k.filter(x => x !== C && x !== T).map(x => caches.delete(x))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);

  if (TH.some(h => u.hostname.endsWith(h))) {
    e.respondWith(
      caches.open(T).then(async c => {
        const m = await c.match(r.url);
        if (m) return m;
        try {
          const n = await fetch(r.url, { mode: "cors" });
          if (n.ok) c.put(r.url, n.clone());
          return n;
        } catch (x) {
          try { return await fetch(r); } catch (y) { return Response.error(); }
        }
      })
    );
    return;
  }

  if (u.origin === location.origin) {
    e.respondWith((async () => {
      const c = await caches.open(C);
      if (r.mode === "navigate") {
        try {
          const n = await fetch(r);
          if (n.ok) c.put("index.html", n.clone());
          return n;
        } catch (x) {
          return (await c.match("index.html")) || (await c.match("./")) || Response.error();
        }
      }
      const m = await c.match(r, { ignoreSearch: true });
      const nP = fetch(r).then(n => {
        if (n.ok) c.put(r, n.clone());
        return n;
      }).catch(() => m);
      return m || nP;
    })());
  }
});