const staticAssets = [
  './',
  './bootstrap.min.css',
  './styles.css',
  './app.js',
  './favicon.ico',
  './offline.json',
  './offline.jpg'
]

const staticCacheName = 'just-news-static';
const dynamicCacheName = 'just-news-dynamic';

self.addEventListener('install', async e => {
  const cache = await caches.open(staticCacheName);
  cache.addAll(staticAssets);
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', async e => {
  const req = e.request;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    e.respondWith(cacheFirst(req));
  } else {
    e.respondWith(networkFirst(req.clone()));
  }
})

async function cacheFirst(req) {
  const cache = await caches.open(staticCacheName);
  const cachedResponse = await caches.match(req);
  return cachedResponse || fetch(req);
}

async function networkFirst(req) {
  const cache = await caches.open(dynamicCacheName);
  try {
    let res = await fetch(req);
    cache.put(req, res.clone());
    return res;
  } catch (err) {
    let res = await caches.match(req);
    if (res) {
      return res;
    } else {
      if (req.url.includes('headlines')) {
        let res = await caches.match('./offline.json');
        return res;
      }
    }

  }
}