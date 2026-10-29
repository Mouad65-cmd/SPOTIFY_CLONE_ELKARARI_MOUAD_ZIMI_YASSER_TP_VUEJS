/**
 * PKCE Helper Module
 * Generates cryptographic random verifier and code challenge using Web Crypto API.
 */

/**
 * Generate a random string for the code_verifier (between 43 and 128 characters).
 * Uses Web Crypto API for cryptographic randomness.
 * @param {number} length
 * @returns {string}
 */
export function generateRandomString(length = 64) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  const values = crypto.getRandomValues(new Uint8Array(length))
  let result = ''
  for (let i = 0; i < length; i++) {
    result += possible[values[i] % possible.length]
  }
  return result
}

/**
 * Generate the code_challenge from code_verifier using SHA-256 and base64url encoding.
 * 1. Hashes the verifier with SHA-256
 * 2. Encodes the binary digest to base64
 * 3. Converts base64 to base64url (replaces +, / and strips padding =)
 * @param {string} verifier
 * @returns {Promise<string>}
 */
export async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)

  // Convert binary ArrayBuffer to ASCII binary string
  const bytes = new Uint8Array(digest)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }

  // Base64 encode and convert to RFC 7636 URL-safe Base64URL string
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}
