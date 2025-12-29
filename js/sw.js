const CACHE_NAME = 'r29-station-pwa-v2'; // Увеличил версию для новой адаптации
const urlsToCache = [
  '/',
  '/index.html',
  '/style/styles.css',
  '/js/radio_manager.js',
  '/js/app.js',
  '/js/audio_visualizer.js',
  '/assets/images/favicon-96x96.png',
  '/assets/images/favicon.svg',
  '/assets/images/favicon.ico',
  '/assets/images/apple-touch-icon.png',
  '/assets/images/site.webmanifest',
  '/assets/images/og-preview.png',
  '/assets/images/header_logo.svg',
  '/assets/images/arrowAs.svg',
  '/assets/images/preloaderRad.png',
  '/assets/images/preloader.png',
  '/assets/images/albom.png',
  '/assets/images/dw.svg',
  '/assets/images/vol1.svg',
  '/assets/images/vol2.svg',
  '/assets/images/vol3.svg',
  '/assets/images/img_neco.png',
  // Если в новой версии добавлены файлы (например, новые изображения или JS), добавьте их пути сюда
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching files for r29.station updated version');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request).then((fetchResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
      .catch(() => {
        // Оффлайн-фоллбек: Можно добавить кастомную оффлайн-страницу для новой версии
        return caches.match('/index.html'); // Вернуть главную страницу
      })
  );
});