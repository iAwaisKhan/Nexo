const CACHE_NAME = 'aura-v1';
const ASSETS = [
    './',
    './index.html',
    './src/styles.css',
    './src/app.js',
    './src/js/state.js',
    './src/js/utils.js',
    './src/js/ui.js',
    './src/js/storage.js',
    './src/js/db.js',
    './src/js/init.js',
    './src/js/events.js',
    './src/js/dashboard.js',
    './src/js/clock.js',
    './src/js/quotes.js',
    './src/js/visuals.js',
    './src/js/scroll.js',
    './src/js/settings.js',
    './src/js/notes.js',
    './src/js/tasks.js',
    './src/js/snippets.js',
    './src/js/resources.js',
    './src/js/pomodoro.js',
    './src/js/search.js',
    './src/js/legacy-logic.js',
    'https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.29/bundled/lenis.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;0,8..60,700;1,8..60,400&family=JetBrains+Mono:wght@400;500&display=swap'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request).then((response) => {
                // If it's a valid response, maybe add to cache for future use if it's an asset
                // For simplicity, we just return the fetch response here if not in cache
                return response;
            });
        })
    );
});
