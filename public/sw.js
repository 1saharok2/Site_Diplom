const CACHE_NAME = 'electronic-store-v1.2.0';
const urlsToCache = [
  '/',
  '/static/css/main.chunk.css',
  '/static/js/main.chunk.js',
  '/static/js/bundle.js',
  '/images/placeholder.jpg',
  '/manifest.json'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('🛠 Service Worker: Установка');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Кэшируем основные ресурсы');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Все ресурсы закэшированы');
        return self.skipWaiting();
      })
  );
});

// Активация и очистка старых кэшей
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Активация');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑 Удаляем старый кэш:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker активирован');
      return self.clients.claim();
    })
  );
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
  // Пропускаем не-GET запросы и chrome-extension
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Возвращаем кэшированную версию, если есть
        if (response) {
          return response;
        }

        // Клонируем запрос
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Проверяем валидность ответа
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Клонируем ответ
          const responseToCache = response.clone();

          // Кэшируем новый ресурс
          caches.open(CACHE_NAME)
            .then((cache) => {
              // Не кэшируем данные API, только статические ресурсы
              if (!event.request.url.includes('/api/') && 
                  !event.request.url.includes('/graphql')) {
                cache.put(event.request, responseToCache);
              }
            });

          return response;
        }).catch(() => {
          // Fallback для страниц - возвращаем оффлайн страницу если есть
          if (event.request.destination === 'document') {
            return caches.match('/offline.html');
          }
          return null;
        });
      })
  );
});

// Фоновая синхронизация (для будущего использования)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Фоновая синхронизация');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Здесь можно добавить логику фоновой синхронизации
  console.log('Выполняем фоновую синхронизацию...');
}