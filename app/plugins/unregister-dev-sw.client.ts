// Раньше сервис-воркер PWA работал и в разработке и закешировал старый HTML главной страницы.
// Отключение в конфиге не удаляет уже установленный воркер — снимаем его и чистим его кеши.
export default defineNuxtPlugin(() => {
  if (!import.meta.dev || !('serviceWorker' in navigator)) return

  navigator.serviceWorker.getRegistrations().then(async (registrations) => {
    if (!registrations.length) return
    await Promise.all(registrations.map(registration => registration.unregister()))
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map(key => caches.delete(key)))
    }
    // Текущая страница могла прийти из кеша — перезагружаем один раз уже с сервера
    window.location.reload()
  })
})
