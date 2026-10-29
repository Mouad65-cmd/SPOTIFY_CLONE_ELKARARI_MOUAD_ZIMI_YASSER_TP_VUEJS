<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useFavoritesStore } from '../stores/favorites.js'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const favoritesStore = useFavoritesStore()

const favoritesCount = computed(() => favoritesStore.count)

function onSearchClick() {
  // If already on Home, navigate to trigger search focus
  router.push({ path: '/', query: { focus: Date.now() } })
}

function onLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <aside class="sidebar-container">
    <!-- Spotify Logo & Title -->
    <div class="sidebar-header">
      <router-link to="/" class="brand-link">
        <svg class="spotify-logo-icon" viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.627.627 0 0 1-.86.208c-2.355-1.439-5.318-1.764-8.81-0.965a.626.626 0 1 1-.28-1.222c3.819-.874 7.106-.503 9.742 1.119.29.177.385.558.208.86zm1.225-2.723a.784.784 0 0 1-1.077.258c-2.695-1.656-6.804-2.134-9.99-1.167a.785.785 0 0 1-.453-1.503c3.642-1.106 8.187-.577 11.262 1.314.368.227.485.714.258 1.098zm.105-2.836C14.689 8.924 9.38 8.747 6.29 9.684a.94.94 0 0 1-.55-1.8c3.541-1.074 9.39-.873 13.14 1.353a.94.94 0 0 1-.964 1.628z"/>
        </svg>
        <span class="brand-title">Spotify</span>
      </router-link>
    </div>

    <!-- Navigation Menu -->
    <nav class="sidebar-nav">
      <!-- Home Link -->
      <router-link
        to="/"
        class="nav-item"
        :class="{ active: route.path === '/' && !route.query.focus }"
      >
        <svg class="nav-icon" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h5v-6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6h5V7.577l-7.5-4.33zm8 5.606V21a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-5h-2v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8.853a1 1 0 0 1 .5-.866l8-4.619a1 1 0 0 1 1 0l8 4.62a1 1 0 0 1 .5.865z" />
        </svg>
        <span class="nav-text">Home</span>
      </router-link>

      <!-- Search Link -->
      <a
        href="#"
        class="nav-item"
        :class="{ active: route.path === '/' && route.query.focus }"
        @click.prevent="onSearchClick"
      >
        <svg class="nav-icon" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M10.533 1.278.472 11.34a.75.75 0 0 0 1.06 1.06l10.062-10.06a.75.75 0 0 0-1.06-1.062zm-3.033 9a6 6 0 1 1 0-12 6 6 0 0 1 0 12zm0-1.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z" />
        </svg>
        <span class="nav-text">Search</span>
      </a>

      <!-- Favorites Link -->
      <router-link
        to="/favorites"
        class="nav-item"
        :class="{ active: route.path === '/favorites' }"
      >
        <svg class="nav-icon" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <span class="nav-text">Favorites</span>
        <span v-if="favoritesCount > 0" class="badge">{{ favoritesCount }}</span>
      </router-link>
    </nav>

    <!-- Logout / User Footer -->
    <div class="sidebar-footer">
      <button type="button" class="logout-button" title="Log out" @click="onLogout">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
        </svg>
        <span class="logout-text">Log out</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar-container {
  width: var(--sidebar-width);
  background-color: #000000;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  padding: 24px 16px;
  z-index: 50;
  border-right: 1px solid #1a1a1a;
}

.sidebar-header {
  margin-bottom: 24px;
  padding: 0 8px;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ffffff;
}

.spotify-logo-icon {
  color: var(--color-primary);
}

.brand-title {
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 12px;
  border-radius: 6px;
  color: var(--color-text-subdued);
  font-weight: 600;
  font-size: 0.95rem;
  transition: all var(--transition-fast);
}

.nav-item:hover {
  color: var(--color-text-base);
  background-color: #121212;
}

.nav-item.active {
  color: #ffffff;
  background-color: #181818;
}

.nav-icon {
  flex-shrink: 0;
}

.badge {
  margin-left: auto;
  background-color: var(--color-primary);
  color: #000000;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 500px;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #1f1f1f;
}

.logout-button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 6px;
  color: var(--color-text-subdued);
  font-weight: 600;
  font-size: 0.9rem;
  transition: all var(--transition-fast);
}

.logout-button:hover {
  color: var(--color-danger);
  background-color: #1a1a1a;
}

/* ==========================================================================
   Mobile Responsive Styles (Bottom Navigation Bar)
   ========================================================================== */
@media (max-width: 768px) {
  .sidebar-container {
    width: 100%;
    height: 56px;
    top: auto;
    bottom: 0;
    right: 0;
    flex-direction: row;
    align-items: center;
    padding: 0;
    border-right: none;
    border-top: 1px solid #282828;
    background-color: #121212;
  }

  .sidebar-header {
    display: none;
  }

  .sidebar-nav {
    flex-direction: row;
    justify-content: space-around;
    width: 100%;
    gap: 0;
  }

  .nav-item {
    flex-direction: column;
    gap: 4px;
    padding: 6px 8px;
    font-size: 0.7rem;
    position: relative;
    border-radius: 0;
  }

  .nav-item.active {
    background: transparent;
    color: var(--color-primary);
  }

  .badge {
    position: absolute;
    top: 4px;
    right: 12px;
    padding: 1px 5px;
    font-size: 0.65rem;
  }

  .sidebar-footer {
    display: none;
  }
}
</style>
