// app/src/router.js

import { createRouter, createWebHashHistory } from 'vue-router'
import { useGameStore } from './stores/game.js'
import { usePlatformStore } from './stores/platform.js'
import { CITY_IDS } from './data/cities/index.js'
import { useAuthStore } from './stores/auth.js'

const routes = [
  {
    path: '/',
    name: 'PlatformHome',
    component: () => import('./pages/PlatformHome.vue')
  },
  {
    path: '/city/:cityId',
    name: 'CityHome',
    component: () => import('./pages/Home.vue'),
    props: true
  },
  {
    path: '/city/:cityId/prologue',
    name: 'Prologue',
    component: () => import('./pages/Prologue.vue'),
    props: true
  },
  {
    path: '/city/:cityId/stage/:id',
    name: 'Stage',
    component: () => import('./pages/Stage.vue'),
    props: true
  },
  {
    path: '/city/:cityId/transit/:from/:to',
    name: 'Transit',
    component: () => import('./pages/Transit.vue'),
    props: true
  },
  {
    path: '/city/:cityId/finale',
    name: 'Finale',
    component: () => import('./pages/Finale.vue'),
    props: true
  },
  {
    path: '/city/:cityId/archive',
    name: 'Archive',
    component: () => import('./pages/Archive.vue'),
    props: true
  },
  {
    path: '/cross-city-reveal',
    name: 'CrossCityReveal',
    component: () => import('./pages/CrossCityReveal.vue')
  },

  // ─── Explore module routes ──────────────────────────
  {
    path: '/login',
    name: 'Login',
    component: () => import('./pages/Login.vue'),
  },
  {
    path: '/explore',
    name: 'TaskList',
    component: () => import('./pages/TaskList.vue'),
  },
  {
    path: '/explore/:slug',
    name: 'TaskDetail',
    component: () => import('./pages/TaskDetail.vue'),
    props: true,
  },
  {
    path: '/explore/:slug/play',
    name: 'TaskPlay',
    component: () => import('./pages/TaskPlay.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/explore/:slug/poster',
    name: 'PosterView',
    component: () => import('./pages/PosterView.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/badges',
    name: 'BadgeCollection',
    component: () => import('./pages/BadgeCollection.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/create',
    name: 'TaskCreate',
    component: () => import('./pages/TaskCreate.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/my-tasks',
    name: 'CreatorDashboard',
    component: () => import('./pages/CreatorDashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/leaderboard',
    name: 'Leaderboard',
    component: () => import('./pages/Leaderboard.vue'),
  },

  // Backward compatibility redirects (old Shanghai URLs)
  {
    path: '/stage/:id',
    redirect: (to) => `/city/shanghai/stage/${to.params.id}`
  },
  {
    path: '/transit/:from/:to',
    redirect: (to) => `/city/shanghai/transit/${to.params.from}/${to.params.to}`
  },
  {
    path: '/finale',
    redirect: '/city/shanghai/finale'
  },
  {
    path: '/archive',
    redirect: '/city/shanghai/archive'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to) => {
  // Auth guard for explore module
  if (to.meta.requiresAuth) {
    const auth = useAuthStore()
    if (!auth.isAuthenticated) {
      return { path: '/login', query: { redirect: to.fullPath } }
    }
  }

  if (to.path === '/' || to.path === '/login') return true

  if (to.name === 'CrossCityReveal') {
    const platform = usePlatformStore()
    if (!platform.allCitiesCompleted) return '/'
    return true
  }

  // Explore routes don't need city validation
  if (to.path.startsWith('/explore') || to.path === '/badges' ||
      to.path === '/create' || to.path === '/my-tasks' || to.path === '/leaderboard') return true

  const cityId = to.params.cityId
  if (!cityId) return true

  if (!CITY_IDS.includes(cityId)) {
    return '/'
  }

  const game = useGameStore(cityId)

  if (to.name === 'CityHome') return true

  if (to.name === 'Prologue') {
    if (game.currentStage === 0) return true
    return `/city/${cityId}`
  }

  if (to.name === 'Stage') {
    const stageId = parseInt(to.params.id)
    if (game.currentStage >= stageId) return true
    return `/city/${cityId}`
  }

  if (to.name === 'Transit') {
    const from = parseInt(to.params.from)
    if (game.currentStage >= from) return true
    return `/city/${cityId}`
  }

  if (to.name === 'Finale') {
    if (game.currentStage >= 8) return true
    return `/city/${cityId}`
  }

  if (to.name === 'Archive') {
    if (game.currentStage >= 9) return true
    return `/city/${cityId}`
  }

  return true
})

export default router
