// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/main.scss'],
  ssr: false,
  nitro: {
    preset: 'netlify-static',
    routeRules: {
      '/auth/**': {
        redirect: {
          to: 'https://kc-njs.netlify.app/auth/**',
          statusCode: 302
        }
      }
    }
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