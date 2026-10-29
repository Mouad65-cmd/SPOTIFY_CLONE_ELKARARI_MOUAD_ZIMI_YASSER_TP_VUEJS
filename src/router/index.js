/**
 * Vue Router Configuration
 * Includes authentication route guard to protect private pages.
 */
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

import HomeView from '../views/HomeView.vue'
import FavoritesView from '../views/FavoritesView.vue'
import LoginView from '../views/LoginView.vue'
import CallbackView from '../views/CallbackView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: FavoritesView,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { guestOnly: true }
  },
  {
    path: '/callback',
    name: 'callback',
    component: CallbackView
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard: check authorization before each route transition
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 1. If route requires auth and user is NOT authenticated, redirect to /login
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ path: '/login' })
    return
  }

  // 2. If route is guest only (/login) and user IS authenticated, redirect to /
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    next({ path: '/' })
    return
  }

  next()
})

export default router
