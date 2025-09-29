import { UserManager, User, WebStorageStateStore, OidcClient } from 'oidc-client-ts'
import { ref, computed, onMounted, readonly } from 'vue'

const AUTH_ENDPOINT = 'https://casino-citizen.eks-dev01.gigndvr.com/auth/'
const KEYCLOAK_REALM = 'demo1'
const KEYCLOAK_CLIENT_ID = 'web-demo1'
const TENANT_ID = 'demo1'

export const useAuth = () => {
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!user.value)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  let userManager: UserManager

  // Calculate redirect URI like React implementation
  const getRedirectUri = () => {
    const { protocol, hostname, port, pathname } = window.location
    console.log('Redirect URI:', `${protocol}//${hostname}${port ? `:${port}` : ''}${pathname}`)
    return `${protocol}//${hostname}${port ? `:${port}` : ''}${pathname}`
  }

  // Clean up URL parameters after authentication
  const onSigninCallback = () => {
    const url = new URL(window.location.href)
    const params = new URLSearchParams(url.search)

    params.delete('state')
    params.delete('session_state')
    params.delete('code')

    const newUrl = `${url.pathname}${params.toString() ? '?' + params.toString() : ''}`

    console.log('Cleaning URL to:', newUrl)

    window.history.replaceState({}, '', newUrl)
  }

  // OIDC Configuration with integrated callback handling
  const oidcConfig = computed(() => ({
    authority: `${AUTH_ENDPOINT}realms/${KEYCLOAK_REALM}`,
    client_id: KEYCLOAK_CLIENT_ID,
    redirect_uri: getRedirectUri(),
    scope: `openid ${TENANT_ID}`,
    userStore: new WebStorageStateStore({ store: window.localStorage }),
    onSigninCallback,
    automaticSilentRenew: false,
    accessTokenExpiringNotificationTimeInSeconds: 30,
    response_type: "code",
    loadUserInfo: true,
  }))

  // Initialize UserManager
  const initUserManager = () => {
    if (!userManager) {
      userManager = new UserManager(oidcConfig.value)

      // Handle user loaded events
      userManager.events.addUserLoaded((loadedUser) => {
        user.value = loadedUser
      })

      // Handle user unloaded events
      userManager.events.addUserUnloaded(() => {
        user.value = null
      })

      // Handle silent renew errors
      userManager.events.addSilentRenewError((error) => {
        console.error('Silent renew error:', error)
      })
    }
  }

  // Login function - use OidcClient createSigninRequest and direct redirect
  const login = async () => {
    try {
      isLoading.value = true
      error.value = null

      if (!userManager) {
        initUserManager()
      }

      // Create OidcClient instance with same config to access createSigninRequest
      const oidcClient = new OidcClient(oidcConfig.value)

      // Use OIDC client's proper createSigninRequest method
      const signinRequest = await oidcClient.createSigninRequest({})
      console.log('OIDC signin request created, redirecting to:', signinRequest.url)

      // Use static HTML page to bypass Nuxt routing completely
      // window.location.href = signinRequest.url
      // window.history.replaceState({}, '', signinRequest.url)
      window.location.href = signinRequest.url
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      console.error('Login error:', err)
      isLoading.value = false
    }
  }

  // Logout function
  const logout = async () => {
    try {
      isLoading.value = true
      error.value = null

      if (userManager) {
        await userManager.signoutRedirect({
          post_logout_redirect_uri: getRedirectUri(),
        })
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Logout failed'
      console.error('Logout error:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Check for existing user session
  const checkAuth = async () => {
    if (!userManager) {
      initUserManager()
    }

    try {
      isLoading.value = true
      const existingUser = await userManager.getUser()
      console.log('Checking existing user:', existingUser)
      
      if (existingUser && !existingUser.expired) {
        user.value = existingUser
        console.log('User authenticated:', existingUser.profile)
      } else {
        user.value = null
        console.log('No valid user session found')
      }
    } catch (err) {
      console.error('Auth check error:', err)
      user.value = null
    } finally {
      isLoading.value = false
    }
  }

  // Initialize on mount
  onMounted(async () => {
    initUserManager()

    // Check if this is a callback from authentication
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.has('code') && urlParams.has('state')) {
      console.log('Processing OIDC callback')
      try {
        isLoading.value = true
        const callbackUser = await userManager.signinRedirectCallback()
        user.value = callbackUser
        console.log('Callback successful:', callbackUser.profile)
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Callback handling failed'
        console.error('Callback error:', err)
      } finally {
        isLoading.value = false
      }
    } else {
      // Check for existing session
      await checkAuth()
    }
  })

  return {
    user: readonly(user),
    isAuthenticated,
    isLoading: readonly(isLoading),
    error: readonly(error),
    login,
    logout,
    checkAuth
  }
}