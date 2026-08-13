const CACHE_VERSION = 'ikf-v1';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/style.css',
  './js/main.js',
  './js/core/SaveManager.js',
  './js/core/SceneManager.js',
  './js/core/AudioManager.js',
  './js/core/CloudSync.js',
  './js/data/levels.js',
  './js/data/recipes.js',
  './js/data/upgrades.js',
  './js/data/supabaseConfig.js',
  './js/game/Customer.js',
  './js/game/Order.js',
  './js/game/Plate.js',
  './js/game/Station.js',
  './js/scenes/MenuScene.js',
  './js/scenes/LevelSelectScene.js',
  './js/scenes/ShopScene.js',
  './js/scenes/KitchenScene.js',
  './js/scenes/ResultScene.js',
  './js/scenes/CloudScene.js',
  './js/utils/helpers.js',
  './icons/icon.svg',
  './icons/icon-maskable.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))),
    ).then(() => self.clients.claim()),
  );
});

// Solo intercepta el propio origen — las llamadas a Supabase/esm.sh van directo a la red.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
