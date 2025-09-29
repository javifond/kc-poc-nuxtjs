<template>
  <KeycloakMain />
</template>

<script setup lang="ts">
// This route handles Keycloak authentication URLs
// It directly renders the KeycloakMain component to handle the auth flow
console.log('Keycloak auth route loaded:', window.location.href)
</script>
