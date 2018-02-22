const staticAssets = [
  './',
  './bootstrap.min.css',
  './styles.css',
  './app.js',
  './favicon.ico',
  'offline.json',
  'offline.jpg'
]

const cacheName = 'just-news';

self.addEventListener('install', async e => {
  const cache = await caches.open(cacheName);
  cache.addAll(staticAssets);
});

self.addEventListener('fetch', async e => {
  const req = e.request;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    e.respondWith(cacheFirst(req));
  } else {
    e.respondWith(networkFirst(req));
  }
})

async function cacheFirst(req) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(req);
  return cachedResponse || fetch(req);
}

async function networkFirst(req) {
  const cache = await caches.open(cacheName);
  try {
    let res = await fetch(req);
    cache.put(req, res.clone());
    return res;
  } catch (err) {
    let res = await cache.match(req);
    if (res) {
      return res;
    } else {
      if (req.url.includes('headlines')) {
        let res = await cache.match('./offline.json');
        return res;
      }
    }

  }
}