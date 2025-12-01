// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// top-level views (lazy-loaded)
const ContactsView = () => import('@/views/ContactsView.vue')
const ContactAddView = () => import('@/views/Contacts/ContactAdd.vue')
const LoginView = () => import('@/views/LoginView.vue')
const RegisterView = () => import('@/views/RegisterView.vue')
const NotFound = () => import('@/views/NotFound.vue')
const TrashView = () => import('@/views/Contacts/TrashView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { requiresGuest: true }
    },
    {
      path: '/',
      name: 'contacts',
      component: ContactsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/add',
      name: 'contact-add',
      component: ContactAddView,
      meta: { requiresAuth: true }
    },
    {
      path: '/trash',
      name: 'trash',
      component: TrashView,
      meta: { requiresAuth: true }
    },
    
    // fallback / 404
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound,
    },
  ],
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = !!authStore.token

  // Redirect to login if route requires auth and user is not authenticated
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  }
  // Redirect to home if route is for guests only and user is authenticated
  else if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'contacts' })
  }
  // Otherwise, proceed
  else {
    next()
  }
})

export default router
