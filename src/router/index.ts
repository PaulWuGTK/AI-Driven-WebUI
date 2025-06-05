import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/dashboard',
      component: () => import('../views/Dashboard.vue')
    },
    {
      path: '/status/mesh',
      component: () => import('../views/status/MeshInfo.vue')
    }
  ]
});

export default router;