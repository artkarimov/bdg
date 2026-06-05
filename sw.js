// Service Worker — кэширует оболочку приложения для офлайн-работы.
// Данные грузятся из Google Sheets и НЕ кэшируются (всегда свежие).
const CACHE = 'budget-app-v2';
const SHELL = ['index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // Запросы к Google (Apps Script / Sheets) — всегда из сети, не кэшируем
  if (url.includes('script.google.com') || url.includes('google.com')) {
    return; // браузер сам сходит в сеть
  }
  // Оболочка приложения — сначала кэш, потом сеть
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).catch(() => caches.match('index.html')))
  );
});
