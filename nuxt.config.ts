// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/main.scss'],
  ssr: false,
  nitro: {
    preset: 'netlify-static'
  },
  router: {
    options: {
      // Exclude auth and realms paths from client-side routing
      // This prevents Nuxt router from intercepting OIDC redirects
      strict: false,
      // Additional option to handle external redirects
      linkExactActiveClass: 'exact-active',
      linkActiveClass: 'active'
    }
  },
  // Add route rules to exclude auth paths from prerendering
  routeRules: {
    '/auth/**': { prerender: false },
    '/realms/**': { prerender: false }
  },
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },
  experimental: {
    payloadExtraction: false
  },
  build: {
    transpile: []
  },
  vite: {
    build: {
      rollupOptions: {
        external: ['oxc-parser']
      }
    },
    optimizeDeps: {
      exclude: ['oxc-parser']
    }
  }
})