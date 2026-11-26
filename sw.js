// Service worker Jejak Latihan (versi cache diisi otomatis saat penerbitan)
const V = 'jl-__BUILD__';
const SHELL = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== V).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;
  if (r.mode === 'navigate') {
    // Halaman: coba internet dulu supaya versi baru langsung terpakai, cadangan dari cache saat luring
    e.respondWith(
      fetch(r).then((res) => { const c = res.clone(); caches.open(V).then((x) => x.put('index.html', c)); return res; })
        .catch(() => caches.match('index.html'))
    );
    return;
  }
  // Berkas lain: cache dulu, lalu internet
  e.respondWith(
    caches.match(r).then((m) => m || fetch(r).then((res) => { const c = res.clone(); caches.open(V).then((x) => x.put(r, c)); return res; }))
  );
});
