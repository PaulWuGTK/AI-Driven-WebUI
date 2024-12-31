import { createRouter, createWebHistory } from 'vue-router';
import WanStatus from '../views/status/WanStatus.vue';
import LanStatus from '../views/status/LanStatus.vue';
import WlanStatus from '../views/status/WlanStatus.vue';
import Statistics from '../views/status/Statistics.vue';
import WifiNeighbor from '../views/status/WifiNeighbor.vue';
import MeshInfo from '../views/status/MeshInfo.vue';
import LcmStatus from '../views/status/LcmStatus.vue';
import Dashboard from '../views/Dashboard.vue';
import Settings from '../views/Settings.vue';
import Management from '../views/Management.vue';
import DdnsSettings from '../views/advanced/DdnsSettings.vue';
import NtpSettings from '../views/management/NtpSettings.vue';
import SshManagement from '../views/management/ssh/SshManagement.vue';
import Login from '../views/Login.vue';

// Auth guard
const requireAuth = (to: any, from: any, next: any) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  if (!isAuthenticated && to.path !== '/login') {
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
      component: Login
    },
    {
      path: '/',
      redirect: '/status/wan',
      beforeEnter: requireAuth
    },
    {
      path: '/dashboard',
      component: Dashboard,
      beforeEnter: requireAuth
    },
    {
      path: '/status/wan',
      component: WanStatus,
      beforeEnter: requireAuth
    },
    {
      path: '/status/lan',
      component: LanStatus,
      beforeEnter: requireAuth
    },
    {
      path: '/status/wlan',
      component: WlanStatus,
      beforeEnter: requireAuth
    },
    {
      path: '/status/statistics',
      component: Statistics,
      beforeEnter: requireAuth
    },
    {
      path: '/status/wifi-neighbor',
      component: WifiNeighbor,
      beforeEnter: requireAuth
    },
    {
      path: '/status/mesh',
      component: MeshInfo,
      beforeEnter: requireAuth
    },
    {
      path: '/status/lcm',
      component: LcmStatus,
      beforeEnter: requireAuth
    },
    {
      path: '/settings',
      component: Settings,
      beforeEnter: requireAuth
    },
    {
      path: '/management',
      component: Management,
      beforeEnter: requireAuth
    },
    {
      path: '/advanced/ddns',
      component: DdnsSettings,
      beforeEnter: requireAuth
    },
    {
      path: '/management/ntp',
      component: NtpSettings,
      beforeEnter: requireAuth
    },
    {
      path: '/management/ssh',
      component: SshManagement,
      beforeEnter: requireAuth
    }
  ]
});

export default router;