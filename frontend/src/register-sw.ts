if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    if (!import.meta.env.PROD) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.filter((registration) => registration.active?.scriptURL === new URL("/service-worker.js", location.origin).href).map((registration) => registration.unregister()),
      );

      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.filter((key) => key.startsWith("spielspot-preview-")).map((key) => caches.delete(key)));
      return;
    }

    await navigator.serviceWorker.register('/service-worker.js')
  })
}
