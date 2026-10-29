import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    // Explicitly listen on 127.0.0.1:5173 to match Spotify's PKCE redirect URI
    host: '127.0.0.1',
    port: 5173
  }
})
