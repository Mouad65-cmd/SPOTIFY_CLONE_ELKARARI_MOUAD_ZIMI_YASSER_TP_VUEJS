/**
 * Spotify Authentication with PKCE (Proof Key for Code Exchange)
 * Runs entirely in the browser without any backend or client secret.
 */
import { generateRandomString, generateCodeChallenge } from './pkce.js'

// Environment configuration
export const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || ''
export const REDIRECT_URI = 'http://127.0.0.1:5173/callback'
const SPOTIFY_AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize'
const SPOTIFY_TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token'

// LocalStorage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'spotify_access_token',
  REFRESH_TOKEN: 'spotify_refresh_token',
  EXPIRES_AT: 'spotify_token_expires_at',
  CODE_VERIFIER: 'spotify_code_verifier'
}

/**
 * Initiates the PKCE OAuth2 flow by redirecting the user to Spotify's login.
 */
export async function redirectToSpotifyAuthorize() {
  if (!CLIENT_ID) {
    throw new Error('Spotify Client ID is not configured. Please set VITE_SPOTIFY_CLIENT_ID in your .env file.')
  }

  // 1. Generate and store code_verifier
  const codeVerifier = generateRandomString(64)
  localStorage.setItem(STORAGE_KEYS.CODE_VERIFIER, codeVerifier)

  // 2. Generate code_challenge from verifier
  const codeChallenge = await generateCodeChallenge(codeVerifier)

  // 3. Build authorization URL
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    scope: 'user-read-private user-read-email'
  })

  // 4. Redirect browser to Spotify
  window.location.href = `${SPOTIFY_AUTH_ENDPOINT}?${params.toString()}`
}

/**
 * Exchanges the authorization code received in the callback for access & refresh tokens.
 * @param {string} code - The code parameter from the callback URL
 * @returns {Promise<{accessToken: string, refreshToken: string, expiresAt: number}>}
 */
export async function exchangeCodeForToken(code) {
  const codeVerifier = localStorage.getItem(STORAGE_KEYS.CODE_VERIFIER)
  if (!codeVerifier) {
    throw new Error('Code verifier not found in localStorage. Please initiate login again.')
  }

  const payload = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifier
  })

  const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: payload.toString()
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error_description || data.error || 'Failed to exchange authorization code for token.')
  }

  // Save tokens and calculate expiration timestamp (expires_in is in seconds)
  const expiresAt = Date.now() + (data.expires_in * 1000)
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token)
  localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, String(expiresAt))
  if (data.refresh_token) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token)
  }

  // Code verifier is single-use, remove it
  localStorage.removeItem(STORAGE_KEYS.CODE_VERIFIER)

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) || '',
    expiresAt
  }
}

/**
 * Refreshes an expired access token using the stored refresh token.
 * @returns {Promise<string|null>} The new access token, or null if refresh failed
 */
export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
  if (!refreshToken) {
    clearAuth()
    return null
  }

  const payload = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'refresh_token',
    refresh_token: refreshToken
  })

  try {
    const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: payload.toString()
    })

    const data = await response.json()

    if (!response.ok) {
      // Refresh token expired or revoked
      clearAuth()
      return null
    }

    const expiresAt = Date.now() + (data.expires_in * 1000)
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token)
    localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, String(expiresAt))

    // Spotify may optionally return a new refresh token
    if (data.refresh_token) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token)
    }

    return data.access_token
  } catch (err) {
    console.error('Error refreshing token:', err)
    clearAuth()
    return null
  }
}

/**
 * Returns a valid access token. Automatically refreshes if token is expired or about to expire (within 60s).
 * @returns {Promise<string|null>}
 */
export async function getValidAccessToken() {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  const expiresAt = Number(localStorage.getItem(STORAGE_KEYS.EXPIRES_AT) || 0)
  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)

  if (!token && !refreshToken) {
    return null
  }

  // Refresh if token expires in less than 60 seconds
  const isExpiringSoon = Date.now() > (expiresAt - 60000)
  if (isExpiringSoon && refreshToken) {
    return await refreshAccessToken()
  }

  return token
}

/**
 * Clears all authentication data from localStorage.
 */
export function clearAuth() {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT)
  localStorage.removeItem(STORAGE_KEYS.CODE_VERIFIER)
}
