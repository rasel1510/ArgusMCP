// Self-unregister stale service workers from previous localhost projects
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.registration.unregister().then(() => {
      console.log('Stale localhost service worker cleanly unregistered.');
    })
  );
});
