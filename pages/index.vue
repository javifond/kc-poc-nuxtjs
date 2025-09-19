<template>
  <div class="container">
    <div v-if="isAuthenticated" class="text-center">
      <h1 class="title">Welcome!</h1>
      <p class="subtitle">
        <strong>{{ user?.profile?.name }}</strong>, you are logged in! 🚀
      </p>
      <button @click="logout" class="btn btn-danger">
        Logout
      </button>
    </div>
    
    <div v-else class="text-center">
      <h1 class="main-title">GiG - Keycloak Custom Themed Pages</h1>
      <h2 class="subtitle">Login with Keycloak</h2>
      <p class="mb-4">This application allows users to authenticate using Keycloak, providing a seamless login experience.</p>
      <p class="mb-4">
        For more information, check the repository 
        <a href="https://github.com/GiGInnovationLabs/endeavour-kc-usage-example" target="_blank" class="link">
          README
        </a> file.
      </p>
      <p class="mb-6">Ensure you have the necessary permissions to access the Keycloak features.</p>
      
      <h3 class="section-title">Click the button below to login</h3>
      <button @click="() => login('keycloak')" class="btn btn-primary">
        Login
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { loggedIn, user, login, logout } = useOidcAuth()

// Map to match the current template expectations
const isAuthenticated = loggedIn
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.main-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
}

.btn-danger:hover {
  background-color: #dc2626;
}

.link {
  color: #3b82f6;
  text-decoration: underline;
}
</style>