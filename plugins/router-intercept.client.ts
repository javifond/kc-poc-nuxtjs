export default defineNuxtPlugin(() => {
  const router = useRouter()

  // Intercept router navigation before it happens
  router.beforeEach((to) => {
    // Check if this is an external auth URL that should bypass the router
    if (to.path.startsWith('/auth/realms/') && to.path.includes('/protocol/openid-connect/')) {
      console.log('Router plugin intercepting external auth URL:', to.fullPath)

      // Construct the full external URL
      const externalUrl = `https://kc-njs.netlify.app${to.fullPath}`

      console.log('Redirecting to external URL:', externalUrl)

      // Force external redirect
      window.location.href = externalUrl

      // Prevent the route from continuing
      return false
    }

    // Allow other routes to proceed normally
    return true
  })
})