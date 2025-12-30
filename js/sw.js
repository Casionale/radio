const CACHE_NAME = 'r29-station-pwa-v2'; // Увеличил версию для новой адаптации
const API_CACHE_NAME = 'r29-station-api-v2';
const STATIC_CACHE_NAME = 'r29-station-static-v2';

const urlsToCache = [
  '/',
  '/index.html',
  '/style/styles.css',
  '/js/radio_manager.js',
  '/js/app.js',
  '/js/audio_visualizer.js',
  '/assets/images/icons/favicon-96x96.png',
  '/assets/images/icons/favicon.svg',
  '/assets/images/icons/favicon.ico',
  '/assets/images/icons/apple-touch-icon.png',
  '/assets/images/site.webmanifest',
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
  '/assets/images/icons/icon-maskable.svg',
  // Если в новой версии добавлены файлы (например, новые изображения или JS), добавьте их пути сюда
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Caching static files for r29.station');
        return cache.addAll(urlsToCache);
      }),
      caches.open(API_CACHE_NAME).then(() => {
        console.log('API cache initialized');
      })
    ])
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) =>
          name !== STATIC_CACHE_NAME &&
          name !== API_CACHE_NAME &&
          name !== CACHE_NAME // Keep old cache for migration
        ).map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Стратегия для API запросов (Network-first с кэшем как fallback)
  if (url.pathname.includes('/api/') || url.hostname.includes('radio.bakasenpai.ru') || url.hostname.includes('s1.cloudmu.id')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Кэшируем успешные API ответы
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Возвращаем кэшированную версию при ошибке сети
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || new Response(JSON.stringify({ error: 'Offline', message: 'Нет подключения к интернету' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
  }
  // Стратегия для статических файлов (Cache-first)
  else if (event.request.destination === 'style' ||
           event.request.destination === 'script' ||
           event.request.destination === 'image' ||
           event.request.destination === 'font' ||
           urlsToCache.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request).then((fetchResponse) => {
            if (fetchResponse.status === 200) {
              const responseClone = fetchResponse.clone();
              caches.open(STATIC_CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
            return fetchResponse;
          });
        })
    );
  }
  // Стратегия для HTML страниц (Network-first)
  else if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || caches.match('/index.html');
          });
        })
    );
  }
  // Для остальных запросов - обычное поведение
  else {
    event.respondWith(fetch(event.request));
  }
});

// Обработка push-уведомлений
self.addEventListener('push', event => {
  console.log('Push received:', event);

  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Новое уведомление от r29.station',
      icon: data.icon || '/assets/images/icons/favicon-192x192.png',
      badge: '/assets/images/icons/favicon-96x96.png',
      tag: data.tag || 'r29-station-push',
      requireInteraction: data.requireInteraction || false,
      data: data.data || {}
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'r29.station', options)
    );
  }
});

// Обработка клика по уведомлению
self.addEventListener('notificationclick', event => {
  console.log('Notification click received:', event);

  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});

// Background Sync для синхронизации данных
self.addEventListener('sync', event => {
  console.log('Background sync triggered:', event.tag);

  if (event.tag === 'background-sync-stations') {
    event.waitUntil(syncStationsData());
  } else if (event.tag === 'background-sync-api') {
    event.waitUntil(syncApiData());
  }
});

// Функция синхронизации данных радиостанций
async function syncStationsData() {
  try {
    console.log('Syncing stations data...');

    // Здесь можно реализовать синхронизацию с сервером
    // Например, отправка локальных изменений на сервер

    // Очищаем устаревший кэш API
    await cleanExpiredCache();

    console.log('Stations data sync completed');
  } catch (error) {
    console.error('Stations sync failed:', error);
    throw error; // Повторяем попытку позже
  }
}

// Функция синхронизации API данных
async function syncApiData() {
  try {
    console.log('Syncing API data...');

    // Здесь можно реализовать синхронизацию API данных
    // Например, предварительная загрузка популярных станций

    console.log('API data sync completed');
  } catch (error) {
    console.error('API sync failed:', error);
    throw error; // Повторяем попытку позже
  }
}

// Функция очистки устаревшего кэша (добавляем в глобальную область видимости)
async function cleanExpiredCache() {
  return new Promise((resolve, reject) => {
    const transaction = this.db?.transaction(['apiCache'], 'readwrite');
    if (!transaction) {
      resolve(); // IndexedDB не инициализирован в SW
      return;
    }

    const store = transaction.objectStore('apiCache');
    const request = store.openCursor();

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        const cached = cursor.value;
        if ((Date.now() - cached.timestamp) >= cached.ttl) {
          cursor.delete();
        }
        cursor.continue();
      } else {
        resolve();
      }
    };

    request.onerror = () => reject(request.error);
  });
}