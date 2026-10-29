<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFavoritesStore } from '../stores/favorites.js'
import TrackCard from '../components/TrackCard.vue'

const router = useRouter()
const favoritesStore = useFavoritesStore()

const favorites = computed(() => favoritesStore.favorites)
const count = computed(() => favoritesStore.count)

function goToHome() {
  router.push('/')
}
</script>

<template>
  <div class="favorites-view">
    <!-- Header Banner -->
    <header class="favorites-header">
      <div class="header-icon-box">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
          <path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>
      <div class="header-info">
        <span class="header-tag">PLAYLIST</span>
        <h1 class="header-title">Favorite Songs</h1>
        <p class="header-meta">
          <span>{{ count }} {{ count === 1 ? 'song' : 'songs' }}</span>
          <span class="separator">•</span>
          <span>Saved in browser</span>
        </p>
      </div>
    </header>

    <!-- Main Content -->
    <main class="favorites-content">
      <!-- Empty State -->
      <div v-if="count === 0" class="empty-favorites">
        <div class="empty-icon-wrap">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <h2>Songs you love will show up here</h2>
        <p>Save songs you like by tapping the heart icon on any track card.</p>
        <button type="button" class="find-songs-button" @click="goToHome">
          Find songs
        </button>
      </div>

      <!-- Favorites Grid -->
      <div v-else class="tracks-grid">
        <TrackCard
          v-for="track in favorites"
          :key="track.id"
          :track="track"
        />
      </div>
    </main>
  </div>
</template>

<style scoped>
.favorites-view {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.favorites-header {
  display: flex;
  align-items: flex-end;
  gap: 28px;
  padding: 60px 32px 32px;
  background: linear-gradient(180deg, #441771 0%, #121212 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.header-icon-box {
  width: 140px;
  height: 140px;
  background: linear-gradient(135deg, #450af5, #c4efd9);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  flex-shrink: 0;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.header-tag {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: #ffffff;
}

.header-title {
  font-size: 2.8rem;
  font-weight: 900;
  color: #ffffff;
  line-height: 1;
  letter-spacing: -1px;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--color-text-subdued);
  font-weight: 500;
}

.separator {
  font-size: 0.6rem;
}

.favorites-content {
  flex: 1;
  padding: 32px;
  max-width: 1600px;
  width: 100%;
}

.tracks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

/* Empty State */
.empty-favorites {
  text-align: center;
  padding: 60px 24px;
  max-width: 500px;
  margin: 0 auto;
}

.empty-icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #242424;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: var(--color-text-subdued);
}

.empty-favorites h2 {
  font-size: 1.4rem;
  margin-bottom: 8px;
}

.empty-favorites p {
  color: var(--color-text-subdued);
  margin-bottom: 24px;
  font-size: 0.95rem;
}

.find-songs-button {
  padding: 12px 32px;
  background-color: #ffffff;
  color: #000000;
  border-radius: 500px;
  font-weight: 700;
  font-size: 0.95rem;
  transition: all var(--transition-fast);
}

.find-songs-button:hover {
  background-color: #f0f0f0;
  transform: scale(1.04);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .favorites-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 32px 16px 24px;
    gap: 16px;
  }

  .header-icon-box {
    width: 100px;
    height: 100px;
  }

  .header-title {
    font-size: 1.8rem;
  }

  .header-meta {
    justify-content: center;
  }

  .favorites-content {
    padding: 16px;
  }

  .tracks-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }
}
</style>
