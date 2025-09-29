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
import { ref, onMounted, computed, watchEffect } from 'vue'

// Detect if we're in Keycloak theme mode (client-side only)
const kcContextExists = ref(false)
const keycloakDebugMode = false // Set to true for local theme development

// Make it reactive by checking kcContext periodically
const isKeycloakMode = computed(() => kcContextExists.value || keycloakDebugMode)

onMounted(() => {
  // Initial check
  kcContextExists.value = (window as any).kcContext !== undefined
  console.log('Initial kcContext check:', kcContextExists.value, (window as any).kcContext)
  
  // Set up a watcher to detect when kcContext becomes available
  const checkKcContext = () => {
    const hasKcContext = (window as any).kcContext !== undefined
    if (hasKcContext !== kcContextExists.value) {
      console.log('kcContext changed:', hasKcContext, (window as any).kcContext)
      kcContextExists.value = hasKcContext
    }
  }
  
  // Check continuously for kcContext changes (don't stop after 5 seconds)
  const interval = setInterval(checkKcContext, 200)
  
  // Listen for navigation events that might indicate kcContext changes
  const handlePopState = () => {
    console.log('Navigation detected, checking kcContext')
    setTimeout(checkKcContext, 100) // Small delay to let kcContext be set
  }
  
  const handleHashChange = () => {
    console.log('Hash change detected, checking kcContext')
    setTimeout(checkKcContext, 100)
  }
  
  const handleFocus = () => {
    console.log('Window focus detected, checking kcContext')
    checkKcContext()
  }
  
  // Listen for various events that might indicate page changes
  window.addEventListener('popstate', handlePopState)
  window.addEventListener('hashchange', handleHashChange)
  window.addEventListener('focus', handleFocus)
  window.addEventListener('load', checkKcContext)
  
  // Also listen for custom events from authentication
  const handleAuthComplete = () => {
    console.log('Auth complete event, checking kcContext')
    setTimeout(checkKcContext, 100)
  }
  
  window.addEventListener('auth-complete', handleAuthComplete)
  
  // Cleanup
  return () => {
    clearInterval(interval)
    window.removeEventListener('popstate', handlePopState)
    window.removeEventListener('hashchange', handleHashChange)
    window.removeEventListener('focus', handleFocus)
    window.removeEventListener('load', checkKcContext)
    window.removeEventListener('auth-complete', handleAuthComplete)
  }
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