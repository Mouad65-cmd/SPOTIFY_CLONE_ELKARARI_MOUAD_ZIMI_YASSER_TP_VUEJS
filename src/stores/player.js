/**
 * Player Store (Pinia)
 * Manages the currently playing track in the bottom player bar.
 */
import { defineStore } from 'pinia'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    // Currently selected track object or null
    currentTrack: null
  }),

  actions: {
    /**
     * Set the current track to be played in the bottom player bar
     * @param {Object} track - The Spotify track object
     */
    playTrack(track) {
      if (!track || !track.id) return
      this.currentTrack = track
    },

    /**
     * Close or dismiss the player bar
     */
    closePlayer() {
      this.currentTrack = null
    }
  }
})
