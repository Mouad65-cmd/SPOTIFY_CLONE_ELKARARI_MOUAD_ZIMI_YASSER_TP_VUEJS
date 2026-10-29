<script setup>
import { computed } from 'vue'
import { formatDuration } from '../api/spotify.js'
import { useFavoritesStore } from '../stores/favorites.js'
import { usePlayerStore } from '../stores/player.js'

const props = defineProps({
  track: {
    type: Object,
    default: null
  },
  isSkeleton: {
    type: Boolean,
    default: false
  }
})

const favoritesStore = useFavoritesStore()
const playerStore = usePlayerStore()

// Check if this track is the one currently active in the player
const isCurrentTrack = computed(() => {
  return playerStore.currentTrack?.id === props.track?.id
})

// Check if track is marked as favorite
const isFavorite = computed(() => {
  return props.track ? favoritesStore.isFavorite(props.track.id) : false
})

// Artists joined as a readable string
const artistsNames = computed(() => {
  if (!props.track?.artists) return ''
  return props.track.artists.map((a) => a.name).join(', ')
})

// Best album cover image
const albumImage = computed(() => {
  if (!props.track?.album?.images?.length) return ''
  // Spotify provides images in 3 sizes (640, 300, 64). Middle size (index 1) is ideal for cards
  return props.track.album.images[1]?.url || props.track.album.images[0]?.url || ''
})

// Play this track in the player bar
function onCardClick() {
  if (props.isSkeleton || !props.track) return
  playerStore.playTrack(props.track)
}

// Toggle favorite without triggering card play action
function onToggleFavorite(event) {
  event.stopPropagation()
  if (props.track) {
    favoritesStore.toggleFavorite(props.track)
  }
}
</script>

<template>
  <!-- SKELETON STATE -->
  <div v-if="isSkeleton" class="track-card skeleton-card">
    <div class="image-wrapper skeleton"></div>
    <div class="skeleton skeleton-line title-line"></div>
    <div class="skeleton skeleton-line text-line"></div>
    <div class="skeleton skeleton-line meta-line"></div>
  </div>

  <!-- REAL TRACK CARD -->
  <div
    v-else
    class="track-card"
    :class="{ 'is-active': isCurrentTrack }"
    tabindex="0"
    role="button"
    :aria-label="`Play ${track?.name}`"
    @click="onCardClick"
    @keydown.enter="onCardClick"
    @keydown.space.prevent="onCardClick"
  >
    <!-- Album Art & Play Button Overlay -->
    <div class="image-wrapper">
      <img
        v-if="albumImage"
        :src="albumImage"
        :alt="track?.name"
        class="album-image"
        loading="lazy"
      />
      <div v-else class="image-placeholder">🎵</div>

      <!-- Green Floating Play Button -->
      <button
        type="button"
        class="play-overlay-button"
        title="Play track"
        aria-label="Play track"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z" />
        </svg>
      </button>

      <!-- Favorite Heart Button (Top Right of Cover) -->
      <button
        type="button"
        class="favorite-button"
        :class="{ 'is-favorite': isFavorite }"
        :title="isFavorite ? 'Remove from Favorites' : 'Save to Favorites'"
        :aria-label="isFavorite ? 'Remove from Favorites' : 'Save to Favorites'"
        @click="onToggleFavorite"
      >
        <!-- Heart SVG: Solid if favorited, outline if not -->
        <svg v-if="isFavorite" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </button>
    </div>

    <!-- Track Information -->
    <div class="card-details">
      <h3 class="track-title" :title="track?.name">
        {{ track?.name }}
      </h3>
      <p class="track-artists" :title="artistsNames">
        {{ artistsNames }}
      </p>
      <div class="track-meta">
        <span class="track-album" :title="track?.album?.name">
          {{ track?.album?.name }}
        </span>
        <span class="track-duration">
          {{ formatDuration(track?.duration_ms) }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.track-card {
  position: relative;
  background-color: var(--color-bg-elevated);
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: background-color var(--transition-fast), transform var(--transition-fast);
  outline: none;
}

.track-card:hover,
.track-card:focus-visible {
  background-color: var(--color-bg-card-hover);
  transform: translateY(-2px);
}

.track-card.is-active {
  background-color: #262626;
  border: 1px solid #1DB954;
}

/* Image Container */
.image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 14px;
  background-color: #282828;
}

.album-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  background-color: #333333;
}

/* Floating Green Play Button */
.play-overlay-button {
  position: absolute;
  right: 10px;
  bottom: 10px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translateY(8px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
  transition: all var(--transition-fast);
}

.play-overlay-button:hover {
  background-color: var(--color-primary-hover);
  transform: scale(1.06) translateY(0);
}

.track-card:hover .play-overlay-button,
.track-card:focus-visible .play-overlay-button {
  opacity: 1;
  transform: translateY(0);
}

/* Favorite Heart Button */
.favorite-button {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.65);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all var(--transition-fast);
}

.favorite-button:hover {
  transform: scale(1.15);
  color: var(--color-primary);
}

.favorite-button.is-favorite {
  opacity: 1;
  color: var(--color-primary);
}

.track-card:hover .favorite-button,
.track-card:focus-visible .favorite-button {
  opacity: 1;
}

/* Track Details */
.card-details {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.track-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text-base);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-card.is-active .track-title {
  color: var(--color-primary);
}

.track-artists {
  font-size: 0.85rem;
  color: var(--color-text-subdued);
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-meta {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.track-album {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.track-duration {
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

/* Skeleton Styles */
.skeleton-card {
  pointer-events: none;
}

.skeleton-line {
  height: 14px;
  margin-bottom: 8px;
}

.title-line {
  width: 75%;
  height: 16px;
}

.text-line {
  width: 50%;
}

.meta-line {
  width: 90%;
  margin-top: 6px;
}
</style>
