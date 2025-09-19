export default defineNuxtConfig({
  modules: ['nuxt-oidc-auth'],
  devtools: { enabled: true },
  css: ['~/assets/css/main.scss'],
  ssr: false,
  nitro: {
    preset: 'netlify-static'
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
  },
  oidc: {
    defaultProvider: 'keycloak',
    providers: {
      keycloak: {
        baseUrl: 'https://kc-njs.netlify.app/auth/realms/demo1',
        clientId: 'web-demo1',
        clientSecret: '', // Not needed for public client
        redirectUri: '/auth/callback'
      }
    },
    middleware: {
      globalMiddlewareEnabled: false // Disable automatic redirects
    }
  }
})