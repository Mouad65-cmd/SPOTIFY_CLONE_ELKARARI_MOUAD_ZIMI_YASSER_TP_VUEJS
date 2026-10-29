<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { searchTracks } from '../api/spotify.js'
import SearchBar from '../components/SearchBar.vue'
import TrackCard from '../components/TrackCard.vue'

const route = useRoute()

// Search and pagination state
const searchQuery = ref('daft punk')
const tracks = ref([])
const totalTracks = ref(0)
const offset = ref(0)

// UI and loading states
const isLoading = ref(false)
const isLoadingMore = ref(false)
const errorMessage = ref('')
const searchBarRef = ref(null)

/**
 * Perform a fresh search for tracks (resets offset and existing items)
 */
async function executeSearch(query) {
  if (!query || !query.trim()) {
    tracks.value = []
    totalTracks.value = 0
    errorMessage.value = ''
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  offset.value = 0

  try {
    const data = await searchTracks(query.trim(), 0)
    tracks.value = data.items || []
    totalTracks.value = data.total || 0
  } catch (err) {
    errorMessage.value = err.message || 'An error occurred while fetching tracks.'
    tracks.value = []
    totalTracks.value = 0
  } finally {
    isLoading.value = false
  }
}

/**
 * Load 10 more tracks using the offset parameter
 */
async function loadMore() {
  if (isLoadingMore.value || !hasMore.value) return

  isLoadingMore.value = true
  errorMessage.value = ''
  const nextOffset = tracks.value.length

  try {
    const data = await searchTracks(searchQuery.value.trim(), nextOffset)
    if (data.items?.length) {
      tracks.value = [...tracks.value, ...data.items]
      totalTracks.value = data.total || totalTracks.value
      offset.value = nextOffset
    }
  } catch (err) {
    errorMessage.value = err.message || 'Failed to load more tracks.'
  } finally {
    isLoadingMore.value = false
  }
}

// Check if more items can be loaded (Spotify search API limits offset to 1000)
const hasMore = ref(false)
watch([tracks, totalTracks], () => {
  hasMore.value = tracks.value.length < totalTracks.value && tracks.value.length < 1000
})

// Trigger search when user types (debounced by SearchBar)
function onSearchInput(query) {
  searchQuery.value = query
  executeSearch(query)
}

// Watch for search focus trigger from Sidebar
watch(
  () => route.query.focus,
  () => {
    searchBarRef.value?.focusInput()
  }
)

// On initial mount: search "daft punk" by default
onMounted(() => {
  executeSearch(searchQuery.value)
})
</script>

<template>
  <div class="home-view">
    <!-- Top Header with SearchBar -->
    <header class="home-header">
      <SearchBar
        ref="searchBarRef"
        v-model="searchQuery"
        placeholder="What do you want to play?"
        @search="onSearchInput"
      />
    </header>

    <!-- Main Content Area -->
    <main class="home-content">
      <!-- Section Header -->
      <div class="results-header">
        <h2 v-if="searchQuery.trim()" class="section-title">
          Results for <span class="highlight">"{{ searchQuery }}"</span>
        </h2>
        <h2 v-else class="section-title">Search tracks</h2>

        <span v-if="!isLoading && totalTracks > 0" class="results-count">
          {{ totalTracks.toLocaleString() }} tracks found
        </span>
      </div>

      <!-- Error State (Rate limit 429, Network error, etc.) -->
      <div v-if="errorMessage" class="error-container">
        <div class="error-box">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <div class="error-details">
            <h4>Something went wrong</h4>
            <p>{{ errorMessage }}</p>
          </div>
          <button type="button" class="retry-button" @click="executeSearch(searchQuery)">
            Try again
          </button>
        </div>
      </div>

      <!-- Loading Skeletons (Initial / New Query) -->
      <div v-if="isLoading" class="tracks-grid">
        <TrackCard v-for="n in 10" :key="n" :is-skeleton="true" />
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!errorMessage && tracks.length === 0 && searchQuery.trim()"
        class="empty-state"
      >
        <svg viewBox="0 0 24 24" width="64" height="64" fill="currentColor">
          <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <h3>No results found for "{{ searchQuery }}"</h3>
        <p>Please make sure your words are spelled correctly or use less or different keywords.</p>
      </div>

      <!-- Tracks Grid -->
      <div v-else-if="tracks.length > 0" class="tracks-grid">
        <TrackCard
          v-for="track in tracks"
          :key="track.id"
          :track="track"
        />
      </div>

      <!-- Load More Button -->
      <div v-if="!isLoading && hasMore" class="load-more-container">
        <button
          type="button"
          class="load-more-button"
          :disabled="isLoadingMore"
          @click="loadMore"
        >
          <span v-if="isLoadingMore" class="button-spinner"></span>
          <span>{{ isLoadingMore ? 'Loading more...' : 'Load more' }}</span>
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.home-header {
  position: sticky;
  top: 0;
  height: var(--header-height);
  background-color: rgba(18, 18, 18, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  padding: 0 32px;
  z-index: 20;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.home-content {
  flex: 1;
  padding: 24px 32px 48px;
  max-width: 1600px;
  width: 100%;
}

.results-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-base);
}

.section-title .highlight {
  color: #ffffff;
}

.results-count {
  font-size: 0.9rem;
  color: var(--color-text-subdued);
}

/* Responsive Grid */
.tracks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

/* Error banner */
.error-container {
  margin: 20px 0;
}

.error-box {
  background-color: rgba(233, 20, 41, 0.12);
  border: 1px solid rgba(233, 20, 41, 0.4);
  color: #ffffff;
  padding: 16px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.error-box svg {
  color: var(--color-danger);
  flex-shrink: 0;
}

.error-details {
  flex: 1;
}

.error-details h4 {
  font-size: 1rem;
  margin-bottom: 2px;
}

.error-details p {
  color: #ffb4b4;
  font-size: 0.88rem;
}

.retry-button {
  padding: 8px 16px;
  background-color: #ffffff;
  color: #000000;
  border-radius: 500px;
  font-weight: 700;
  font-size: 0.85rem;
  transition: all var(--transition-fast);
}

.retry-button:hover {
  transform: scale(1.05);
  background-color: #f0f0f0;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 24px;
  color: var(--color-text-subdued);
}

.empty-state svg {
  margin-bottom: 16px;
  opacity: 0.4;
}

.empty-state h3 {
  color: var(--color-text-base);
  font-size: 1.3rem;
  margin-bottom: 8px;
}

.empty-state p {
  max-width: 440px;
  margin: 0 auto;
  font-size: 0.95rem;
  line-height: 1.4;
}

/* Load more */
.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.load-more-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 32px;
  background-color: #242424;
  color: #ffffff;
  border-radius: 500px;
  font-weight: 700;
  font-size: 0.95rem;
  border: 1px solid #383838;
  transition: all var(--transition-fast);
}

.load-more-button:hover:not(:disabled) {
  background-color: #333333;
  border-color: #555555;
  transform: scale(1.03);
}

.load-more-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #555555;
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .home-header {
    padding: 0 16px;
  }

  .home-content {
    padding: 16px 16px 32px;
  }

  .tracks-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }
}
</style>
