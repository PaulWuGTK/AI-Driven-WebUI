import { createRouter, createWebHistory } from 'vue-router';
import { AuthService } from '../services/auth';

// Auth guard
const requireAuth = (to: any, from: any, next: any) => {
  const auth = AuthService.getInstance();
  if (!auth.isAuthenticated() && to.path !== '/login') {
    next('/login');
  } else {
    next();
  }
};

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/',
      redirect: '/dashboard',
      beforeEnter: requireAuth
    },
    {
      path: '/dashboard',
      component: () => import('../views/Dashboard.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/status',
      redirect: '/status/wan',
      beforeEnter: requireAuth
    },
    {
      path: '/status/wan',
      component: () => import('../views/status/WanStatus.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/status/lan',
      component: () => import('../views/status/LanStatus.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/status/wlan',
      component: () => import('../views/status/WlanStatus.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/status/statistics',
      component: () => import('../views/status/Statistics.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/status/wifi-neighbor',
      component: () => import('../views/status/WifiNeighbor.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/status/mesh',
      component: () => import('../views/status/MeshInfo.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/status/lcm',
      component: () => import('../views/status/LcmStatus.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/settings/wireless',
      component: () => import('../views/settings/WirelessSettings.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/advanced/ddns',
      component: () => import('../views/advanced/DdnsSettings.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/management/ntp',
      component: () => import('../views/management/NtpSettings.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/management/ssh',
      component: () => import('../views/management/ssh/SshManagement.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/management/diagnostics',
      component: () => import('../views/management/diagnostics/DiagnosticsTools.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/management/device',
      component: () => import('../views/management/device/DeviceManagement.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/management/reset',
      component: () => import('../views/management/reset/DeviceReset.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/upgrade',
      component: () => import('../views/management/firmware/FirmwareUpgrade.vue'),
      beforeEnter: requireAuth
    }
  ]
});

export default router;