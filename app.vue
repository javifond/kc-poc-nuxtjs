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
import { ref, onMounted } from 'vue'

// Detect if we're in Keycloak theme mode (client-side only)
const isKeycloakMode = ref(false)

onMounted(() => {
  const keycloakDebugMode = false // Set to true for local theme development
  isKeycloakMode.value = (window as any).kcContext !== undefined || keycloakDebugMode
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