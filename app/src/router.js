// app/src/router.js

import { createRouter, createWebHashHistory } from 'vue-router'
import { useGameStore } from './stores/game.js'
import { CITY_IDS } from './data/cities/index.js'

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
  if (to.path === '/') return true

  const cityId = to.params.cityId
  if (!cityId) return true

  if (!CITY_IDS.includes(cityId)) {
    return '/'
  }

  const game = useGameStore(cityId)

  if (to.name === 'CityHome') return true

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
