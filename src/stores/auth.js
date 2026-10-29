/**
 * Auth Store (Pinia)
 * Supports frictionless free mode for testing, as well as Spotify OAuth.
 */
import { defineStore } from 'pinia'
import {
  redirectToSpotifyAuthorize,
  exchangeCodeForToken,
  refreshAccessToken,
  getValidAccessToken,
  clearAuth
} from '../auth/auth.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // Default to free mode so the user can test the app freely without any hurdles
    isFreeMode: localStorage.getItem('spotify_logged_out') !== 'true',
    accessToken: localStorage.getItem('spotify_access_token') || 'free_test_token',
    refreshToken: localStorage.getItem('spotify_refresh_token') || null,
    expiresAt: Number(localStorage.getItem('spotify_token_expires_at')) || (Date.now() + 864000000),
    isLoading: false,
    error: null
  }),

  getters: {
    /**
     * User is authenticated if in free mode OR if active Spotify token exists
     */
    isAuthenticated: (state) => {
      if (state.isFreeMode) return true
      if (!state.accessToken && !state.refreshToken) return false
      return (state.expiresAt > Date.now()) || !!state.refreshToken
    }
  },

  actions: {
    /**
     * Enter free listening mode
     */
    enterFreeMode() {
      this.isFreeMode = true
      this.accessToken = 'free_test_token'
      localStorage.removeItem('spotify_logged_out')
      localStorage.setItem('spotify_access_token', 'free_test_token')
    },

    /**
     * Start the Spotify OAuth login flow
     */
    async login() {
      this.error = null
      try {
        await redirectToSpotifyAuthorize()
      } catch (err) {
        this.error = err.message
        throw err
      }
    },

    /**
     * Complete the login flow from the /callback route
     */
    async handleCallback(code) {
      this.isLoading = true
      this.error = null
      try {
        const tokens = await exchangeCodeForToken(code)
        this.accessToken = tokens.accessToken
        this.refreshToken = tokens.refreshToken
        this.expiresAt = tokens.expiresAt
        this.isFreeMode = false
        localStorage.removeItem('spotify_logged_out')
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Renew access token
     */
    async refreshTokenAction() {
      if (this.isFreeMode) return this.accessToken

      const newToken = await refreshAccessToken()
      if (newToken) {
        this.accessToken = newToken
        this.expiresAt = Number(localStorage.getItem('spotify_token_expires_at')) || 0
        this.refreshToken = localStorage.getItem('spotify_refresh_token') || null
      } else {
        this.logout()
      }
      return newToken
    },

    /**
     * Gets a valid token
     */
    async getValidToken() {
      if (this.isFreeMode) return this.accessToken

      const token = await getValidAccessToken()
      if (token && token !== this.accessToken) {
        this.accessToken = token
        this.expiresAt = Number(localStorage.getItem('spotify_token_expires_at')) || 0
      } else if (!token) {
        this.logout()
      }
      return token
    },

    /**
     * Log out
     */
    logout() {
      clearAuth()
      this.isFreeMode = false
      this.accessToken = null
      this.refreshToken = null
      this.expiresAt = 0
      localStorage.setItem('spotify_logged_out', 'true')
    }
  }
})
