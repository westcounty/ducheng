import { createRouter, createWebHashHistory } from 'vue-router'

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

export default router
