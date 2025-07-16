import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      component: () => import('../views/Dashboard.vue'),
    },
    {
      path: '/thread',
      component: () => import('../views/iot/thread/ThreadLayout.vue'),
    },
    {
      path: '/matter',
      component: () => import('../views/iot/matter/MatterDashboard.vue'),
    },
    {
      path: '/management/firmware',
      component: () => import('../views/management/firmware/FirmwareUpgrade.vue'),
    }
  ]
});

export default router;