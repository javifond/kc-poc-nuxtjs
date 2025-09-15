<template>
  <div>
    <LoginPage v-if="kcContext?.pageId === 'login.ftl'" :kc-context="kcContext" />
    <div v-else class="p-8 text-center">
      <h3>Unsupported custom page type (to be implemented): {{ kcContext?.pageId }}</h3>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Get kcContext from window (in real Keycloak environment) or mock data for debug
const kcContext = ref<any>(null)

onMounted(() => {
  // Check for real kcContext from Keycloak
  if ((window as any).kcContext) {
    kcContext.value = (window as any).kcContext
  } else {
    // Mock data for local development
    kcContext.value = {
      pageId: 'login.ftl',
      url: {
        loginAction: '/auth/realms/casino_citizen/login-actions/authenticate',
        resourcesPath: '/auth/resources',
        resourcesCommonPath: '/auth/resources/common',
        loginRestartFlowUrl: '/auth/realms/casino_citizen/login-actions/restart',
        loginUrl: '/auth/realms/casino_citizen/protocol/openid-connect/auth',
        loginResetCredentialsUrl: '/auth/realms/casino_citizen/login-actions/reset-credentials',
        registrationUrl: '/auth/realms/casino_citizen/login-actions/registration'
      },
      realm: {
        name: 'casino_citizen',
        displayName: 'Casino Citizen',
        internationalizationEnabled: false,
        registrationEmailAsUsername: true,
        loginWithEmailAllowed: true,
        rememberMe: false,
        password: true,
        resetPasswordAllowed: true,
        registrationAllowed: true
      },
      client: {
        clientId: 'web-casino_citizen'
      },
      scripts: [],
      isAppInitiatedAction: false,
      auth: {},
      registrationDisabled: false,
      login: {},
      usernameEditDisabled: false,
      social: {
        displayInfo: false
      }
    } as any
  }
})
</script>