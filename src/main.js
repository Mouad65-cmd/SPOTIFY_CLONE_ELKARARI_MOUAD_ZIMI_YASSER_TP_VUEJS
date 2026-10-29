import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index.js'
import App from './App.vue'
import './style.css'

const app = createApp(App)

// Register Pinia state management
app.use(createPinia())

// Register Vue Router
app.use(router)

// Mount the app
app.mount('#app')
