import type { RouterConfig } from '@nuxt/schema'
import type { RouteRecordRaw } from 'vue-router'

// Router configuration to handle external OIDC redirects
export default <RouterConfig>{
  routes: (_routes): RouteRecordRaw[] => [
    // Catch any route that looks like a Keycloak OIDC URL and redirect externally
    {
      name: 'oidc-external-redirect',
      path: '/auth/realms/:realm/protocol/openid-connect/:action',
      component: () => null, // Dummy component since we redirect before rendering
      beforeEnter(to) {
        // Reconstruct the full external URL
        const baseUrl = 'https://casino-citizen.eks-dev01.gigndvr.com'
        const fullUrl = baseUrl + to.fullPath

        console.log('Router intercepted OIDC URL, redirecting externally:', fullUrl)

        // Use window.location.replace for external redirect
        window.location.replace(fullUrl)

        // Return false to prevent Vue Router from handling this route
        return false
      }
    },
    // Also catch any URLs that start with the auth endpoint
    {
      name: 'auth-external-redirect',
      path: '/auth/:pathMatch(.*)*',
      component: () => null, // Dummy component since we redirect before rendering
      beforeEnter(to) {
        // Check if this looks like a Keycloak URL pattern
        if (to.path.includes('/realms/') && to.path.includes('/protocol/openid-connect/')) {
          const baseUrl = 'https://casino-citizen.eks-dev01.gigndvr.com'
          const fullUrl = baseUrl + to.fullPath

          console.log('Router intercepted auth URL, redirecting externally:', fullUrl)

          // Use window.location.replace for external redirect
          window.location.replace(fullUrl)

          // Return false to prevent Vue Router from handling this route
          return false
        }

        // Let other /auth routes pass through normally
        return true
      }
    }
  ]
}