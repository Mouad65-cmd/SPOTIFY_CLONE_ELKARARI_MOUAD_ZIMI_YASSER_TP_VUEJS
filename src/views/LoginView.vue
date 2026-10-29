<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { CLIENT_ID } from '../auth/auth.js'

const router = useRouter()
const authStore = useAuthStore()

const errorMessage = ref('')
const isConfigured = ref(!!CLIENT_ID && CLIENT_ID !== 'your_spotify_client_id_here')

function handleFreeEnter() {
  authStore.enterFreeMode()
  router.push('/')
}

async function handleSpotifyLogin() {
  errorMessage.value = ''
  try {
    await authStore.login()
  } catch (err) {
    errorMessage.value = err.message || 'Failed to start Spotify login.'
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Spotify Brand Icon -->
      <div class="logo-wrapper">
        <svg class="spotify-logo" viewBox="0 0 24 24" width="64" height="64" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.627.627 0 0 1-.86.208c-2.355-1.439-5.318-1.764-8.81-0.965a.626.626 0 1 1-.28-1.222c3.819-.874 7.106-.503 9.742 1.119.29.177.385.558.208.86zm1.225-2.723a.784.784 0 0 1-1.077.258c-2.695-1.656-6.804-2.134-9.99-1.167a.785.785 0 0 1-.453-1.503c3.642-1.106 8.187-.577 11.262 1.314.368.227.485.714.258 1.098zm.105-2.836C14.689 8.924 9.38 8.747 6.29 9.684a.94.94 0 0 1-.55-1.8c3.541-1.074 9.39-.873 13.14 1.353a.94.94 0 0 1-.964 1.628z"/>
        </svg>
      </div>

      <h1 class="login-title">Spotify Music Search</h1>
      <p class="login-subtitle">
        Search millions of tracks and play real audio previews directly in your browser.
      </p>

      <!-- Error Message -->
      <div v-if="errorMessage" class="error-banner">
        {{ errorMessage }}
      </div>

      <!-- Free Instant Access Button -->
      <button
        type="button"
        class="free-enter-button"
        @click="handleFreeEnter"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="m8 5 11 7-11 7V5z"/>
        </svg>
        <span>Enter Free Mode (No Login Required)</span>
      </button>

      <!-- Divider -->
      <div class="divider">
        <span>OPTIONAL SPOTIFY ACCOUNT</span>
      </div>

      <!-- Spotify OAuth Button -->
      <button
        type="button"
        class="login-button"
        :disabled="!isConfigured"
        @click="handleSpotifyLogin"
      >
        <span>Log in with Spotify (PKCE)</span>
      </button>

      <div class="login-footer">
        <p>100% Free & Open Access • Live Search • Real Audio Previews</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: radial-gradient(circle at top, #1e3a29 0%, #121212 65%);
}

.login-card {
  width: 100%;
  max-width: 480px;
  background-color: var(--color-bg-elevated);
  border-radius: 16px;
  padding: 44px 32px;
  text-align: center;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.6);
  border: 1px solid #282828;
}

.logo-wrapper {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.spotify-logo {
  color: var(--color-primary);
}

.login-title {
  font-size: 1.9rem;
  font-weight: 800;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.login-subtitle {
  color: var(--color-text-subdued);
  font-size: 0.95rem;
  line-height: 1.4;
  margin-bottom: 28px;
}

.free-enter-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 16px 28px;
  background-color: var(--color-primary);
  color: #000000;
  font-size: 1.05rem;
  font-weight: 700;
  border-radius: 500px;
  transition: all var(--transition-fast);
  box-shadow: 0 4px 14px rgba(29, 185, 84, 0.4);
}

.free-enter-button:hover {
  background-color: var(--color-primary-hover);
  transform: scale(1.02);
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 24px 0 18px;
  color: var(--color-text-muted);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #282828;
}

.divider span {
  padding: 0 12px;
}

.login-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px 24px;
  background-color: transparent;
  color: var(--color-text-subdued);
  border: 1px solid #383838;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 500px;
  transition: all var(--transition-fast);
}

.login-button:hover:not(:disabled) {
  color: #ffffff;
  border-color: #666666;
}

.login-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.error-banner {
  background-color: rgba(233, 20, 41, 0.2);
  border: 1px solid var(--color-danger);
  color: #ffffff;
  padding: 10px;
  border-radius: 6px;
  font-size: 0.85rem;
  margin-bottom: 16px;
}

.login-footer {
  margin-top: 28px;
  font-size: 0.78rem;
  color: var(--color-text-muted);
}
</style>
