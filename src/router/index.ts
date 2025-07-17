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
      path: '/matter/home',
      component: () => import('../views/iot/matter/MatterDashboard.vue'),
    },
    {
      path: '/matter',
      redirect: '/matter/home',
    },
    {
      path: '/matter/pairing',
      component: () => import('../views/iot/matter/MatterPairing.vue'),
    },
    {
      path: '/matter/onoff',
      component: () => import('../views/iot/matter/MatterOnOff.vue'),
    },
    {
      path: '/matter/multiadmin',
      component: () => import('../views/iot/matter/MatterMultiAdmin.vue'),
    },
    {
      path: '/matter/subscribe',
      component: () => import('../views/iot/matter/MatterSubscribe.vue'),
    },
    {
      path: '/matter/getstatus',
      component: () => import('../views/iot/matter/MatterGetStatus.vue'),
    },
    {
      path: '/matter/binding',
      component: () => import('../views/iot/matter/MatterBinding.vue'),
    },
    {
      path: '/matter/mediacontrol',
      component: () => import('../views/iot/matter/MatterMediaControl.vue'),
    },
    {
      path: '/matter/eevsecontrol',
      component: () => import('../views/iot/matter/MatterEevseControl.vue'),
    },
    {
      path: '/management/firmware',
      component: () => import('../views/management/firmware/FirmwareUpgrade.vue'),
    }
  ]
});

export default router;