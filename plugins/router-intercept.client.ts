export default defineNuxtPlugin(() => {
  const router = useRouter()
  let isRedirecting = false

  // Intercept router navigation before it happens
  router.beforeEach((to) => {
    // Prevent infinite loops
    if (isRedirecting) {
      return true
    }

    // Check if this is an external auth URL that should bypass the router
    if (to.path.startsWith('/auth/realms/') && to.path.includes('/protocol/openid-connect/')) {
      console.log('Router plugin intercepting external auth URL:', to.fullPath)

      // Set flag to prevent re-interception
      isRedirecting = true

      // Construct the full external URL
      const externalUrl = `https://kc-njs.netlify.app${to.fullPath}`

      console.log('Redirecting to external URL:', externalUrl)

      // Use setTimeout to break out of the current execution context
      setTimeout(() => {
        window.location.replace(externalUrl)
      }, 0)

      // Prevent the route from continuing
      return false
    }

    // Allow other routes to proceed normally
    return true
  })
})