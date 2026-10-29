# Spotify Web Music App 🎵

A responsive Spotify-inspired web music player built with **Vue 3 (Composition API, `<script setup>`)**, **Vite**, **Vue Router**, and **Pinia**. Runs entirely client-side in the browser.

![Spotify Theme](https://img.shields.io/badge/Theme-Spotify%20Dark-1DB954?style=for-the-badge)
![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-2.2-FFD859?style=for-the-badge)

---

## ✨ Features

- 🔍 **Live Search**: Debounced search (400ms) with animated skeleton placeholders and empty-state messaging.
- 🎵 **Spotify Audio Player Bar**: Custom bottom player bar featuring real streaming audio previews, Play/Pause toggle, interactive timeline scrub bar, and volume controls.
- ❤️ **Favorites System**: Save and remove favorite tracks with instant persistence in `localStorage` and a dedicated `/favorites` view.
- 📄 **Pagination**: Seamless "Load more" button using offset pagination.
- 📱 **Fully Responsive**: Spotify dark theme (`#121212`, `#1DB954`), desktop sidebar, and mobile bottom navigation.
- 🔐 **Dual Auth Support**: Works in Free Open Mode (no API key needed) as well as Spotify Authorization Code Flow with PKCE.

---

## 🛠️ Tech Stack

- **Framework**: Vue 3 (`<script setup>`, Composition API)
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **Build Tool**: Vite
- **Styling**: Pure modern CSS (Variables, Grid, Flexbox, Keyframe Shimmers)

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <YOUR_REPO_URL>
cd SPOTIFY_ELKARARI_MOUAD_ZIMI_YASSER_TP
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```
Open [http://127.0.0.1:5173/](http://127.0.0.1:5173/) in your browser.

---

## 📂 Project Structure

```
src/
├── api/
│   └── spotify.js            # Music search client & pagination
├── auth/
│   ├── pkce.js               # Web Crypto PKCE verifier & challenge generator
│   └── auth.js               # OAuth PKCE exchange and token refresh
├── stores/
│   ├── auth.js               # Pinia store for authentication
│   ├── player.js             # Pinia store for active track playback
│   └── favorites.js          # Pinia store for saved favorites (localStorage)
├── components/
│   ├── SearchBar.vue         # Debounced search bar with clear button
│   ├── TrackCard.vue         # Responsive track card with heart & hover overlay
│   ├── PlayerBar.vue         # Bottom player bar with audio controls & scrub bar
│   └── Sidebar.vue           # Navigation sidebar & mobile bottom bar
├── views/
│   ├── LoginView.vue         # Auth & quick-enter screen
│   ├── CallbackView.vue      # PKCE OAuth token callback handler
│   ├── HomeView.vue          # Search results grid & Load More button
│   └── FavoritesView.vue     # Favorited tracks page
├── router/
│   └── index.js              # Vue Router configuration & route guard
├── App.vue                   # Layout root
├── main.js                   # Application bootstrap
└── style.css                 # Global Spotify dark styles & animations
```
