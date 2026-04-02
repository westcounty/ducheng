import { createRouter, createWebHashHistory } from 'vue-router'
import { useGameStore } from './stores/game.js'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('./pages/Home.vue')
  },
  {
    path: '/stage/:id',
    name: 'Stage',
    component: () => import('./pages/Stage.vue'),
    props: true
  },
  {
    path: '/transit/:from/:to',
    name: 'Transit',
    component: () => import('./pages/Transit.vue'),
    props: true
  },
  {
    path: '/finale',
    name: 'Finale',
    component: () => import('./pages/Finale.vue')
  },
  {
    path: '/archive',
    name: 'Archive',
    component: () => import('./pages/Archive.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to) => {
  const game = useGameStore()

  if (to.path === '/') return true

  if (to.name === 'Stage') {
    const stageId = parseInt(to.params.id)
    if (game.currentStage >= stageId) return true
    return '/'
  }

  if (to.name === 'Transit') {
    const from = parseInt(to.params.from)
    if (game.currentStage >= from) return true
    return '/'
  }

  if (to.name === 'Finale') {
    if (game.currentStage >= 8) return true
    return '/'
  }

  if (to.name === 'Archive') {
    if (game.currentStage >= 9) return true
    return '/'
  }

  return true
})

export default router
