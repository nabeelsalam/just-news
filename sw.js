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
const newsApiCacheName = 'news-api-cache';

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
  let cache;


  try {
    let res = await fetch(req);
    if (req.url.includes('mediastack')) {
      cache = await caches.open(newsApiCacheName);
    } else {
      cache = await caches.open(dynamicCacheName);
    }
    cache.put(req, res.clone());
    return res;
  } catch (err) {
    let res = await caches.match(req);
    if (res) {
      return res;
    } else {
      if (req.url.includes('news')) {
        let res = await caches.match('./offline.json');
        return res;
      }
    }

  }
}