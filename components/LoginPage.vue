<template>
  <div class="login-container">
    <form
      id="kc-form-login"
      :action="kcContext.url.loginAction"
      method="post"
      @submit="onSubmit"
      class="login-form"
    >
      <h1 class="login-title">Custom Login</h1>
      
      <div v-if="kcContext.message" class="message-container">
        <p class="message">{{ kcContext.message.summary }}</p>
        <p class="message-type">{{ kcContext.message.type }}</p>
      </div>

      <div class="field-group">
        <label for="email" class="field-label">Email</label>
        <input
          id="email"
          name="email"
          type="text"
          autocomplete="off"
          required
          class="field-input"
        />
      </div>
      
      <div class="field-group">
        <label for="password" class="field-label">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autocomplete="off"
          required
          class="field-input"
        />
      </div>
      
      <button
        type="submit"
        class="login-button"
        :disabled="isLoginButtonDisabled"
      >
        Log In
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  kcContext: any
}

defineProps<Props>()
const isLoginButtonDisabled = ref(false)

const onSubmit = (event: Event) => {
  event.preventDefault()
  isLoginButtonDisabled.value = true
  
  const formElement = event.target as HTMLFormElement
  
  // Rename email to username (same logic as React version)
  const emailInput = formElement.querySelector("input[name='email']") as HTMLInputElement
  if (emailInput) {
    emailInput.setAttribute('name', 'username')
  }
  
  // Submit the form
  formElement.submit()
}
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-title {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
  font-size: 2rem;
  font-weight: bold;
}

.message-container {
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 4px;
  background-color: #f3f4f6;
}

.message {
  margin: 0;
  color: #374151;
}

.message-type {
  margin: 0.5rem 0 0 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.field-group {
  margin-bottom: 1.5rem;
}

.field-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
  font-weight: 500;
}

.field-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
  }
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:hover:not(:disabled) {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>