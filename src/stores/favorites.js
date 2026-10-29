/**
 * Favorites Store (Pinia)
 * Manages user's favorited tracks and persists them to localStorage.
 */
import { defineStore } from 'pinia'

const STORAGE_KEY = 'spotify_favorites'

function loadFavoritesFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (err) {
    console.error('Failed to parse favorites from storage', err)
    return []
  }
}

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    favorites: loadFavoritesFromStorage()
  }),

  getters: {
    /**
     * Check if a specific track is in favorites
     */
    isFavorite: (state) => (trackId) => {
      return state.favorites.some((track) => track.id === trackId)
    },

    /**
     * Total count of favorite tracks
     */
    count: (state) => state.favorites.length
  },

  actions: {
    /**
     * Toggle favorite status of a track
     * @param {Object} track - The Spotify track object
     */
    toggleFavorite(track) {
      if (!track || !track.id) return

      const index = this.favorites.findIndex((t) => t.id === track.id)
      if (index >= 0) {
        // Remove from favorites
        this.favorites.splice(index, 1)
      } else {
        // Add to favorites
        this.favorites.push(track)
      }

      this.saveToStorage()
    },

    /**
     * Persist current favorites list to localStorage
     */
    saveToStorage() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.favorites))
      } catch (err) {
        console.error('Failed to save favorites to localStorage', err)
      }
    }
  }
})
