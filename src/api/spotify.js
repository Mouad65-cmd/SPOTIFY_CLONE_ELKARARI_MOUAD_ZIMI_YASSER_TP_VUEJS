/**
 * Free Music Search API (No API Key or Backend Required)
 * Uses the free iTunes Music API with full CORS support and real audio previews.
 * Returns data mapped to the standard Spotify Track schema.
 */

// In-memory search cache to support smooth 10-item offset pagination
const searchCache = new Map()

/**
 * Searches for tracks using the free public Music API.
 * - 100% Free, NO API key or OAuth needed.
 * - Slices into chunks of 10 tracks to fulfill the 10-item limit and offset pagination requirement.
 * 
 * @param {string} query - Search keyword
 * @param {number} offset - Pagination offset (0, 10, 20, ...)
 * @returns {Promise<{items: Array, total: number, offset: number, limit: number}>}
 */
export async function searchTracks(query, offset = 0) {
  if (!query || !query.trim()) {
    return { items: [], total: 0, offset: 0, limit: 10 }
  }

  const cleanQuery = query.trim().toLowerCase()

  // 1. Fetch fresh list if starting a new search (offset === 0) or cache miss
  if (offset === 0 || !searchCache.has(cleanQuery)) {
    const endpoint = `https://itunes.apple.com/search?term=${encodeURIComponent(cleanQuery)}&entity=song&limit=60`

    let response
    try {
      response = await fetch(endpoint)
    } catch (err) {
      throw new Error('Network error. Please check your internet connection.')
    }

    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.')
    }

    if (!response.ok) {
      throw new Error(`Music API error (${response.status})`)
    }

    const data = await response.json()
    const rawResults = data.results || []

    // Map to standard Spotify track format
    const mappedTracks = rawResults.map((item) => ({
      id: String(item.trackId),
      name: item.trackName,
      artists: [{ name: item.artistName }],
      album: {
        name: item.collectionName || item.trackName,
        images: [
          // High-resolution artwork
          { url: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : '' },
          // Medium-resolution artwork
          { url: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '300x300bb') : '' }
        ]
      },
      duration_ms: item.trackTimeMillis || 180000,
      preview_url: item.previewUrl || ''
    }))

    searchCache.set(cleanQuery, mappedTracks)
  }

  // 2. Paginate 10 items per request
  const allTracks = searchCache.get(cleanQuery) || []
  const paginatedItems = allTracks.slice(offset, offset + 10)

  return {
    items: paginatedItems,
    total: allTracks.length,
    offset: offset,
    limit: 10
  }
}

/**
 * Format milliseconds into mm:ss display
 * @param {number} ms - Milliseconds
 * @returns {string} e.g. "3:45"
 */
export function formatDuration(ms) {
  if (!ms || isNaN(ms)) return '0:00'
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}
