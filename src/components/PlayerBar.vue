<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { usePlayerStore } from '../stores/player.js'
import { useFavoritesStore } from '../stores/favorites.js'
import { formatDuration } from '../api/spotify.js'

const playerStore = usePlayerStore()
const favoritesStore = useFavoritesStore()

const audioElement = ref(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(30)
const volume = ref(0.7)
const isMuted = ref(false)

const currentTrack = computed(() => playerStore.currentTrack)

const albumCover = computed(() => {
  return currentTrack.value?.album?.images?.[1]?.url || currentTrack.value?.album?.images?.[0]?.url || ''
})

const artistsNames = computed(() => {
  return currentTrack.value?.artists?.map((a) => a.name).join(', ') || ''
})

const isFavorite = computed(() => {
  return currentTrack.value ? favoritesStore.isFavorite(currentTrack.value.id) : false
})

// Auto-play when track changes
watch(
  () => currentTrack.value?.id,
  () => {
    if (currentTrack.value?.preview_url) {
      currentTime.value = 0
      isPlaying.value = true
      // Small tick for DOM audio element update
      setTimeout(() => {
        if (audioElement.value) {
          audioElement.value.volume = volume.value
          audioElement.value.play().catch(() => {
            isPlaying.value = false
          })
        }
      }, 50)
    }
  }
)

function togglePlay() {
  if (!audioElement.value) return
  if (isPlaying.value) {
    audioElement.value.pause()
    isPlaying.value = false
  } else {
    audioElement.value.play()
    isPlaying.value = true
  }
}

function onTimeUpdate() {
  if (audioElement.value) {
    currentTime.value = audioElement.value.currentTime
    if (audioElement.value.duration) {
      duration.value = audioElement.value.duration
    }
  }
}

function onEnded() {
  isPlaying.value = false
  currentTime.value = 0
}

function onSeek(event) {
  const seekTime = Number(event.target.value)
  if (audioElement.value) {
    audioElement.value.currentTime = seekTime
    currentTime.value = seekTime
  }
}

function onVolumeChange(event) {
  const val = Number(event.target.value)
  volume.value = val
  if (audioElement.value) {
    audioElement.value.volume = val
  }
  isMuted.value = val === 0
}

function toggleMute() {
  if (!audioElement.value) return
  if (isMuted.value) {
    isMuted.value = false
    audioElement.value.volume = volume.value || 0.5
  } else {
    isMuted.value = true
    audioElement.value.volume = 0
  }
}

function toggleFavorite() {
  if (currentTrack.value) {
    favoritesStore.toggleFavorite(currentTrack.value)
  }
}

function onClose() {
  if (audioElement.value) {
    audioElement.value.pause()
  }
  playerStore.closePlayer()
}

onBeforeUnmount(() => {
  if (audioElement.value) {
    audioElement.value.pause()
  }
})
</script>

<template>
  <div v-if="currentTrack" class="player-bar-container">
    <!-- HTML5 Audio Controller -->
    <audio
      v-if="currentTrack.preview_url"
      ref="audioElement"
      :src="currentTrack.preview_url"
      @timeupdate="onTimeUpdate"
      @ended="onEnded"
    ></audio>

    <div class="player-bar-content">
      <!-- 1. Left: Track Info & Heart -->
      <div class="track-info-side">
        <img
          v-if="albumCover"
          :src="albumCover"
          :alt="currentTrack.name"
          class="track-cover"
        />
        <div class="track-text">
          <span class="track-title" :title="currentTrack.name">
            {{ currentTrack.name }}
          </span>
          <span class="track-artist" :title="artistsNames">
            {{ artistsNames }}
          </span>
        </div>
        <button
          type="button"
          class="heart-button"
          :class="{ 'is-favorite': isFavorite }"
          :title="isFavorite ? 'Remove from favorites' : 'Save to favorites'"
          @click="toggleFavorite"
        >
          <svg v-if="isFavorite" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      </div>

      <!-- 2. Center: Controls & Playback Bar -->
      <div class="player-controls-center">
        <!-- Play / Pause Controls -->
        <div class="controls-buttons">
          <button
            type="button"
            class="play-toggle-btn"
            :title="isPlaying ? 'Pause' : 'Play'"
            @click="togglePlay"
          >
            <!-- Pause SVG -->
            <svg v-if="isPlaying" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
            <!-- Play SVG -->
            <svg v-else viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="m8 5 11 7-11 7V5z"/>
            </svg>
          </button>
        </div>

        <!-- Timeline Progress Bar -->
        <div class="playback-timeline">
          <span class="time-label">{{ formatDuration(currentTime * 1000) }}</span>
          <input
            type="range"
            min="0"
            :max="duration"
            step="0.1"
            :value="currentTime"
            class="timeline-slider"
            @input="onSeek"
          />
          <span class="time-label">{{ formatDuration(duration * 1000) }}</span>
        </div>
      </div>

      <!-- 3. Right: Volume & Dismiss -->
      <div class="player-actions-right">
        <!-- Volume Control -->
        <button
          type="button"
          class="volume-btn"
          :title="isMuted ? 'Unmute' : 'Mute'"
          @click="toggleMute"
        >
          <svg v-if="isMuted || volume === 0" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27l4.73 4.73H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          :value="isMuted ? 0 : volume"
          class="volume-slider"
          @input="onVolumeChange"
        />

        <!-- Close Player Button -->
        <button
          type="button"
          class="close-btn"
          title="Dismiss player"
          @click="onClose"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.player-bar-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--player-height);
  background-color: #181818;
  border-top: 1px solid #282828;
  padding: 0 16px;
  z-index: 1000;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
}

.player-bar-content {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

/* Left side */
.track-info-side {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 30%;
  min-width: 180px;
}

.track-cover {
  width: 56px;
  height: 56px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}

.track-text {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.track-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text-base);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  font-size: 0.78rem;
  color: var(--color-text-subdued);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.heart-button {
  color: var(--color-text-subdued);
  transition: all var(--transition-fast);
  padding: 4px;
}

.heart-button:hover,
.heart-button.is-favorite {
  color: var(--color-primary);
  transform: scale(1.1);
}

/* Center Controls */
.player-controls-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 40%;
  max-width: 540px;
}

.controls-buttons {
  display: flex;
  align-items: center;
  gap: 16px;
}

.play-toggle-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #ffffff;
  color: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition-fast), background-color var(--transition-fast);
}

.play-toggle-btn:hover {
  transform: scale(1.08);
  background-color: var(--color-primary);
}

.playback-timeline {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.time-label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
  min-width: 32px;
}

.timeline-slider,
.volume-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: #4d4d4d;
  outline: none;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.timeline-slider:hover,
.volume-slider:hover {
  background: var(--color-primary);
}

.timeline-slider::-webkit-slider-thumb,
.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
}

/* Right Actions */
.player-actions-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  width: 30%;
  min-width: 140px;
}

.volume-btn {
  color: var(--color-text-subdued);
  transition: color var(--transition-fast);
}

.volume-btn:hover {
  color: #ffffff;
}

.volume-slider {
  width: 90px;
}

.close-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-subdued);
  background: #242424;
  margin-left: 6px;
  transition: all var(--transition-fast);
}

.close-btn:hover {
  color: #ffffff;
  background: #333333;
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .player-bar-container {
    bottom: 56px;
    height: 72px;
    padding: 0 12px;
  }

  .playback-timeline,
  .player-actions-right {
    display: none;
  }

  .track-info-side {
    width: auto;
    flex: 1;
  }

  .player-controls-center {
    width: auto;
  }
}
</style>
