<template>
  <KeycloakMain />
</template>

<script setup lang="ts">
// This catch-all route handles any Keycloak authentication URLs under /auth/
// It directly renders the KeycloakMain component to handle the auth flow

console.log('Keycloak auth catch-all route loaded:', window.location.href)
</script>
