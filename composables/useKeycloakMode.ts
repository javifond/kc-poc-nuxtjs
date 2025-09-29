import { ref } from 'vue'

// Global reactive state for Keycloak mode
export const isKeycloakMode = ref(false)

// Function to enable Keycloak mode (called before redirect)
export const enableKeycloakMode = () => {
  console.log('Enabling Keycloak mode')
  isKeycloakMode.value = true
}

// Function to disable Keycloak mode
export const disableKeycloakMode = () => {
  console.log('Disabling Keycloak mode')
  isKeycloakMode.value = false
}

// Function to check if we're in Keycloak mode
export const useKeycloakMode = () => {
  return {
    isKeycloakMode,
    enableKeycloakMode,
    disableKeycloakMode
  }
}
