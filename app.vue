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
  
  // Check every 100ms for kcContext changes (in case it's set asynchronously)
  const interval = setInterval(checkKcContext, 100)
  
  // Clean up interval after 5 seconds (should be enough time for kcContext to be set)
  setTimeout(() => {
    clearInterval(interval)
    console.log('Stopped checking for kcContext changes')
  }, 5000)
  
  // Also check on window events that might indicate kcContext is ready
  const handleWindowLoad = () => {
    checkKcContext()
  }
  
  window.addEventListener('load', handleWindowLoad)
  
  // Cleanup
  return () => {
    clearInterval(interval)
    window.removeEventListener('load', handleWindowLoad)
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