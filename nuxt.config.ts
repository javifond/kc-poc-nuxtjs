export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/main.scss'],
  ssr: false,
  nitro: {
    preset: 'static'
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