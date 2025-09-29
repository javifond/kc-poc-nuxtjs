<template>
  <div>
    <ClientOnly>
      <KeycloakMain v-if="isKeycloakMode" />
      <NuxtPage v-else />
      <template #fallback>
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useKeycloakMode } from './composables/useKeycloakMode'
import { useRoute } from 'vue-router'

// Use shared Keycloak mode state
const { isKeycloakMode: sharedKeycloakMode } = useKeycloakMode()
const route = useRoute()

// Check if current route is a Keycloak auth route
const isKeycloakRoute = computed(() => {
  const path = route.path
  return path.includes('/auth/realms/') || path.includes('/realms/')
})

// Combined Keycloak mode detection
const isKeycloakMode = computed(() => {
  return sharedKeycloakMode.value || isKeycloakRoute.value
})

onMounted(() => {
  const keycloakDebugMode = false // Set to true for local theme development
  
  // Check for existing kcContext on mount
  if ((window as any).kcContext !== undefined || keycloakDebugMode) {
    sharedKeycloakMode.value = true
  }
  
  console.log('App mounted - isKeycloakMode:', isKeycloakMode.value)
  console.log('Current route:', route.path)
  console.log('Is Keycloak route:', isKeycloakRoute.value)
})
</script>

<style>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>