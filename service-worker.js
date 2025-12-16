// Service Worker para Flappy Bird PWA
const CACHE_NAME = 'flappy-bird-v1';

// Archivos a cachear para funcionamiento offline
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/game.js',
    '/js/bird.js',
    '/js/pipes.js',
    '/js/background.js',
    '/js/collision.js',
    '/js/score.js',
    '/js/input.js',
    '/js/audio.js',
    '/js/loader.js',
    '/resources/music.mp3',
    '/icons/icon-192.svg',
    '/icons/icon-512.svg',
    '/manifest.json'
];

// Instalación: cachear todos los recursos
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Cacheando archivos');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Activación: limpiar caches antiguos
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activado');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Eliminando cache antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch: servir desde cache, con fallback a red
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Si está en cache, devolver desde cache
                if (cachedResponse) {
                    return cachedResponse;
                }
                // Si no, ir a la red
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Cachear nuevos recursos dinámicamente
                        if (networkResponse && networkResponse.status === 200) {
                            const responseClone = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseClone);
                                });
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // Fallback para páginas offline
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});