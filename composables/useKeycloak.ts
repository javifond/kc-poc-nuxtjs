import Keycloak, { KeycloakInstance, KeycloakProfile, KeycloakTokenParsed } from 'keycloak-js'
import { ref, computed, onMounted, onBeforeUnmount, readonly } from 'vue'

// Adjust these to your realm/client
const KEYCLOAK_REALM = 'demo1'
const KEYCLOAK_CLIENT_ID = 'web-demo1'
const TENANT_ID = 'demo1'
const KEYCLOAK_BASE_URL = 'https://casino-citizen.eks-dev01.gigndvr.com/auth'
const KEYCLOAK_FE_BASE_URL = 'https://kc-njs.netlify.app/'

const getRedirectUri = () => {
    const { protocol, hostname, port, pathname } = window.location
    return `${protocol}//${hostname}${port ? `:${port}` : ''}${pathname}`
}

let kc: KeycloakInstance | null = null
let refreshTimer: ReturnType<typeof setInterval> | null = null

export const useKeycloak = () => {
    const isAuthenticated = ref(false)
    const isLoading = ref(true)
    const error = ref<string | null>(null)

    const token = ref<string | undefined>(undefined)
    const tokenParsed = ref<KeycloakTokenParsed | undefined>(undefined)
    const profile = ref<KeycloakProfile | null>(null)

    const ready = computed(() => !isLoading.value && error.value == null)

    const init = async () => {
        try {
            isLoading.value = true
            error.value = null

            if (!kc) {
                kc = new Keycloak({
                    url: KEYCLOAK_BASE_URL,
                    realm: KEYCLOAK_REALM,
                    clientId: KEYCLOAK_CLIENT_ID,
                })
            }

            const authenticated = await kc.init({
                // onLoad: 'login-required',
                pkceMethod: 'S256',
                checkLoginIframe: false, // avoid iframe checks in static hosting
                enableLogging: false,
                flow: 'standard',
                redirectUri: getRedirectUri(),
                // silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
            })

            isAuthenticated.value = !!authenticated
            token.value = kc.token
            tokenParsed.value = kc.tokenParsed

            if (authenticated) {
                try {
                    const userProfile = await kc.loadUserProfile()
                    profile.value = userProfile
                } catch (e) {
                    // profile load is optional
                    console.warn('Keycloak profile load failed:', e)
                }
            }

            // Set up token refresh every 20s (refresh if expiring < 60s)
            if (refreshTimer) clearInterval(refreshTimer)
            refreshTimer = setInterval(async () => {
                if (!kc) return
                try {
                    const refreshed = await kc.updateToken(60)
                    if (refreshed) {
                        token.value = kc.token
                        tokenParsed.value = kc.tokenParsed
                    }
                } catch (e) {
                    console.error('Token refresh failed:', e)
                    isAuthenticated.value = false
                    token.value = undefined
                    tokenParsed.value = undefined
                }
            }, 20000)

            isLoading.value = false
            return authenticated
        } catch (e: any) {
            console.error('Keycloak init error:', e)
            error.value = e?.message || 'Keycloak init failed'
            isLoading.value = false
            return false
        }
    }

    const login = async () => {
        if (!kc) return
        // const redirectUri = `${window.location.origin}${window.location.pathname}`
        const loginUrl = await kc.createLoginUrl({
            redirectUri: getRedirectUri(),
            scope: `openid ${TENANT_ID}`,
            prompt: 'login',
        })
        if (loginUrl) {
            window.location.href = loginUrl
        }
    }

    const logout = async () => {
        if (!kc) return
        // const redirectUri = `${window.location.origin}${window.location.pathname}`
        return kc.logout({ redirectUri: getRedirectUri() })
    }

    const getToken = () => token.value

    onMounted(() => {
        init()
    })

    onBeforeUnmount(() => {
        if (refreshTimer) clearInterval(refreshTimer)
    })

    const user = computed(() => profile.value)

    return {
        // state
        ready,
        isAuthenticated: readonly(isAuthenticated),
        isLoading: readonly(isLoading),
        error: readonly(error),
        token: readonly(token),
        tokenParsed: readonly(tokenParsed),
        profile: readonly(profile),
        user: readonly(user),

        // actions
        init,
        login,
        logout,
        getToken,
    }
}
