import { UserManager, User, WebStorageStateStore } from 'oidc-client-ts'
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
    return `${protocol}//${hostname}${port ? `:${port}` : ''}${pathname}`
  }

  // Clean up URL parameters after authentication
  const cleanUpUrl = () => {
    const url = new URL(window.location.href)
    const params = new URLSearchParams(url.search)

    params.delete('state')
    params.delete('session_state')
    params.delete('code')

    const newUrl = `${url.pathname}${params.toString() ? '?' + params.toString() : ''}`
    window.history.replaceState({}, '', newUrl)
  }

  // OIDC Configuration with integrated callback handling
  const oidcConfig = computed(() => ({
    authority: `${AUTH_ENDPOINT}realms/${KEYCLOAK_REALM}`,
    client_id: KEYCLOAK_CLIENT_ID,
    redirect_uri: getRedirectUri(),
    scope: `openid ${TENANT_ID}`,
    userStore: new WebStorageStateStore({ store: window.localStorage }),
    onSigninCallback: () => {
      cleanUpUrl()
    },
    automaticSilentRenew: false,
    accessTokenExpiringNotificationTimeInSeconds: 30,
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

  // Login function
  const login = async () => {
    try {
      isLoading.value = true
      error.value = null

      if (!userManager) {
        initUserManager()
      }

      // Build the authorization URL manually with proper OIDC parameters
      const authUrl = `${oidcConfig.value.authority}/protocol/openid-connect/auth?` +
        new URLSearchParams({
          client_id: oidcConfig.value.client_id,
          redirect_uri: getRedirectUri(),
          response_type: 'code',
          scope: oidcConfig.value.scope,
          state: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        }).toString()

      // Use Nuxt's external navigation to bypass SPA router with context restoration
      const nuxtApp = useNuxtApp()
      await nuxtApp.runWithContext(() => navigateTo(authUrl, { external: true }))
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      console.error('Login error:', err)
    } finally {
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
    if (!userManager) return

    try {
      const existingUser = await userManager.getUser()
      if (existingUser && !existingUser.expired) {
        user.value = existingUser
      }
    } catch (err) {
      console.error('Auth check error:', err)
    }
  }

  // Initialize on mount
  onMounted(() => {
    initUserManager()

    // Check if this is a callback from authentication
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.has('code') && urlParams.has('state')) {
      // Let OIDC client handle the callback via onSigninCallback
      userManager.signinRedirectCallback().then((callbackUser) => {
        user.value = callbackUser
      }).catch((err) => {
        error.value = err instanceof Error ? err.message : 'Callback handling failed'
        console.error('Callback error:', err)
      })
    } else {
      checkAuth()
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