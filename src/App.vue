<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePlayerStore } from './stores/player.js'
import Sidebar from './components/Sidebar.vue'
import PlayerBar from './components/PlayerBar.vue'

const route = useRoute()
const playerStore = usePlayerStore()

// Auth and callback pages don't show the standard app shell (Sidebar & PlayerBar)
const isAuthPage = computed(() => {
  return route.path === '/login' || route.path === '/callback'
})

// Whether player bar is actively shown
const hasActivePlayer = computed(() => {
  return !!playerStore.currentTrack
})
</script>

<template>
  <div class="app-layout" :class="{ 'with-player': hasActivePlayer && !isAuthPage }">
    <!-- Sidebar navigation (desktop left / mobile bottom) -->
    <Sidebar v-if="!isAuthPage" />

    <!-- Main View Container -->
    <div class="main-viewport" :class="{ 'auth-viewport': isAuthPage }">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>

    <!-- Bottom Player Bar -->
    <PlayerBar v-if="!isAuthPage" />
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--color-bg-base);
}

.main-viewport {
  flex: 1;
  margin-left: var(--sidebar-width);
  min-width: 0;
  transition: margin-bottom var(--transition-fast);
}

.auth-viewport {
  margin-left: 0;
}

/* Extra bottom padding when player is active so cards are not covered */
.app-layout.with-player .main-viewport {
  padding-bottom: 110px;
}

/* Route transition animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Mobile responsive layout */
@media (max-width: 768px) {
  .main-viewport {
    margin-left: 0;
    padding-bottom: 70px; /* Space for bottom navigation */
  }

  .app-layout.with-player .main-viewport {
    padding-bottom: 160px; /* Space for both player bar & bottom navigation */
  }
}
</style>
