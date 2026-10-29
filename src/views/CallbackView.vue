<script setup>
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const errorMessage = ref('')
const isProcessing = ref(true)

onMounted(async () => {
  const code = route.query.code
  const error = route.query.error

  if (error) {
    isProcessing.value = false
    errorMessage.value = `Spotify authorization failed: ${error}`
    return
  }

  if (!code) {
    isProcessing.value = false
    errorMessage.value = 'No authorization code received from Spotify.'
    return
  }

  try {
    // Exchange the authorization code for access and refresh tokens
    await authStore.handleCallback(code)
    // Successful login: redirect to Home
    router.replace('/')
  } catch (err) {
    isProcessing.value = false
    errorMessage.value = err.message || 'Failed to exchange authorization code.'
  }
})

function goToLogin() {
  router.push('/login')
}
</script>

<template>
  <div class="callback-container">
    <div class="callback-card">
      <!-- Loading State -->
      <div v-if="isProcessing" class="loading-state">
        <div class="spinner"></div>
        <h2>Connecting to Spotify...</h2>
        <p>Completing secure PKCE authentication.</p>
      </div>

      <!-- Error State -->
      <div v-else class="error-state">
        <div class="error-icon">⚠️</div>
        <h2>Authentication Error</h2>
        <p class="error-text">{{ errorMessage }}</p>
        <button type="button" class="back-button" @click="goToLogin">
          Back to Login
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.callback-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: var(--color-bg-base);
}

.callback-card {
  width: 100%;
  max-width: 440px;
  background-color: var(--color-bg-elevated);
  border-radius: 16px;
  padding: 40px 32px;
  text-align: center;
  border: 1px solid #282828;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #282828;
  border-top-color: var(--color-primary);
  border-radius: 50%;
  margin: 0 auto 24px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 8px;
}

p {
  color: var(--color-text-subdued);
  font-size: 0.95rem;
}

.error-state .error-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.error-text {
  color: #ff8585;
  margin: 12px 0 24px;
  word-break: break-word;
}

.back-button {
  display: inline-block;
  padding: 12px 28px;
  background-color: var(--color-primary);
  color: #000000;
  font-weight: 700;
  border-radius: 500px;
  transition: all var(--transition-fast);
}

.back-button:hover {
  background-color: var(--color-primary-hover);
  transform: scale(1.02);
}
</style>
