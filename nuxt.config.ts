import process from 'node:process'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@vite-pwa/nuxt', 'nuxt-auth-utils'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      title: 'Atelier Index — каталог fashion-брендов',
      meta: [
        { name: 'description', content: 'Открывайте независимые fashion-бренды со всего мира и собирайте свою библиотеку.' },
        { name: 'theme-color', content: '#fbf4f1' }
      ],
      link: [
        { rel: 'icon', href: '/icon.svg', type: 'image/svg+xml' }
      ],
      script: [
        {
          innerHTML: `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.dataset.theme=t;}catch(e){}})();`
        }
      ]
    }
  },
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || 'postgres://fashion:fashion@localhost:54329/fashion'
  },
  pwa: {
    registerType: 'prompt',
    manifest: {
      name: 'Atelier Index',
      short_name: 'Atelier',
      description: 'Каталог независимых fashion-брендов',
      theme_color: '#fbf4f1',
      background_color: '#fbf4f1',
      display: 'standalone',
      start_url: '/',
      lang: 'ru',
      icons: [
        { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }
      ]
    },
    workbox: {
      // Каталог отрисовывается на сервере и меняется — сохранённая копия «/» показывала бы старые бренды
    navigateFallback: null,
      globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}'],
      runtimeCaching: [
        {
          urlPattern: ({ request }) => request.destination === 'image',
          handler: 'CacheFirst',
          options: {
            cacheName: 'brand-images',
            expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 }
          }
        }
      ]
    },
    // В разработке сервис-воркер отдавал устаревший HTML главной и ломал страницу
    devOptions: { enabled: false, type: 'module' }
  }
})
