import { createRouter, createWebHistory } from 'vue-router';
import { AuthService } from '../services/auth';
import { getSidebarMenu } from '../services/api/sidebarMenu';
import { isMenuVisible, type NetLayoutType, type OperationMode, type UserRole } from '../types/menuVisibility';

interface SidebarAccessContext {
  operationMode: OperationMode;
  netLayoutType: NetLayoutType;
  features: { cellular?: boolean; matter?: boolean; thread?: boolean };
  userRole: UserRole;
}

let cachedSidebarAccess: { sessionId: string; context: SidebarAccessContext } | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('auth:session-cleared', () => {
    cachedSidebarAccess = null;
  });
}

const routeVisibilityRules: Array<{ pathPrefix: string; menuKey: string }> = [
  { pathPrefix: '/network/lan/ipv4', menuKey: 'basicSetup.lan.ipv4' },
  { pathPrefix: '/network/lan/devices', menuKey: 'basicSetup.lan.deviceConnected' },
  { pathPrefix: '/network/lan', menuKey: 'basicSetup.lan' },
  { pathPrefix: '/basic/lan', menuKey: 'basicSetup.lan' },
  { pathPrefix: '/basic/lan-cht', menuKey: 'basicSetup.lanCht' },

  { pathPrefix: '/network/wireless/basic', menuKey: 'basicSetup.wlan.basicConfig' },
  { pathPrefix: '/network/wireless/advanced', menuKey: 'basicSetup.wlan.advancedConfig' },
  { pathPrefix: '/network/wireless/wps', menuKey: 'basicSetup.wlan.wpsConfig' },
  { pathPrefix: '/network/wireless/mesh', menuKey: 'basicSetup.wlan.meshNetwork' },
  { pathPrefix: '/basic/wlan/zones', menuKey: 'basicSetup.wlan.wifiZones' },
  { pathPrefix: '/network/wireless/extender', menuKey: 'basicSetup.wlan.wirelessExtender' },
  { pathPrefix: '/network/wireless', menuKey: 'basicSetup.wlan' },
  { pathPrefix: '/basic/wlan', menuKey: 'basicSetup.wlan' },

  { pathPrefix: '/advanced/nat/dmz', menuKey: 'basicSetup.nat.dmzHost' },
  { pathPrefix: '/advanced/nat', menuKey: 'basicSetup.nat' },
  { pathPrefix: '/basic/nat', menuKey: 'basicSetup.nat' },
  { pathPrefix: '/advanced/security', menuKey: 'basicSetup.security' },
  { pathPrefix: '/basic/security', menuKey: 'basicSetup.security' },
  { pathPrefix: '/basic/routing', menuKey: 'basicSetup.routing' },
  { pathPrefix: '/advanced/ssh', menuKey: 'advanceSetup.sshService' },
  { pathPrefix: '/advanced/service-control', menuKey: 'advanceSetup.serviceControl' },
  { pathPrefix: '/advanced/mcl', menuKey: 'advanceSetup.mcl' },
  { pathPrefix: '/advanced/qos', menuKey: 'advanceSetup.qos' },
  { pathPrefix: '/advanced/lcm', menuKey: 'advanceSetup.lcm' },
  { pathPrefix: '/application/upnp', menuKey: 'application.upnp' },
  { pathPrefix: '/advanced/ddns', menuKey: 'application.ddns' },
  { pathPrefix: '/application/ddns', menuKey: 'application.ddns' },

  { pathPrefix: '/system/settings/reset', menuKey: 'management.settings.resetToDefault' },
  { pathPrefix: '/system/settings/backup', menuKey: 'management.settings.backupRestore' },
  { pathPrefix: '/system/settings/update', menuKey: 'management.settings.updateSoftware' },
  { pathPrefix: '/system/settings', menuKey: 'management.settings' },
  { pathPrefix: '/system/diagnostics/ping', menuKey: 'management.tools.pingDiagnosis' },
  { pathPrefix: '/system/diagnostics/traceroute', menuKey: 'management.tools.traceRoute' },
  { pathPrefix: '/system/diagnostics/dns', menuKey: 'management.tools.dnsDiagnosis' },
  { pathPrefix: '/system/diagnostics/tr471', menuKey: 'speedtest.tr471' },
  { pathPrefix: '/system/diagnostics', menuKey: 'management.tools' },

  { pathPrefix: '/system/account', menuKey: 'management.account' },
  { pathPrefix: '/system/device', menuKey: 'management.device' }
];

const resolveMenuKeyFromRoute = (path: string): string | null => {
  let matchedRule: { pathPrefix: string; menuKey: string } | null = null;
  for (const rule of routeVisibilityRules) {
    const matched = path === rule.pathPrefix || path.startsWith(`${rule.pathPrefix}/`);
    if (!matched) continue;
    if (!matchedRule || rule.pathPrefix.length > matchedRule.pathPrefix.length) {
      matchedRule = rule;
    }
  }
  return matchedRule?.menuKey ?? null;
};

const fetchSidebarAccessContext = async (auth: AuthService): Promise<SidebarAccessContext | null> => {
  const sessionId = auth.getSessionId();
  if (!sessionId) return null;

  if (cachedSidebarAccess && cachedSidebarAccess.sessionId === sessionId) {
    return cachedSidebarAccess.context;
  }

  try {
    const response = await getSidebarMenu();
    const modeMapping: Record<string, OperationMode> = {
      Init: 'Init',
      Gateway: 'Gateway',
      Bridge: 'Bridge',
      Extender: 'Extender'
    };

    const context: SidebarAccessContext = {
      operationMode: modeMapping[response.SidebarMenu.mode] || 'Gateway',
      netLayoutType: response.SidebarMenu.NetLayoutType || 'prpl',
      features: response.SidebarMenu.features || {},
      userRole: response.SidebarMenu.user || 'super'
    };

    cachedSidebarAccess = { sessionId, context };
    return context;
  } catch (error) {
    console.warn('Failed to fetch sidebar access context for route guard:', error);
    return null;
  }
};

const canAccessRouteByVisibility = async (path: string, auth: AuthService): Promise<boolean> => {
  const menuKey = resolveMenuKeyFromRoute(path);
  if (!menuKey) return true;

  const context = await fetchSidebarAccessContext(auth);
  if (!context) return true;

  const resolvedMenuKey =
    menuKey === 'management.account' && context.netLayoutType === 'cht'
      ? 'management.accountCht'
      : menuKey;

  return isMenuVisible(
    resolvedMenuKey,
    context.netLayoutType,
    context.operationMode,
    context.features,
    context.userRole
  );
};

const requireAuth = async (to: any, from: any, next: any) => {
  const auth = AuthService.getInstance();
  if (!auth.isAuthenticated() && to.path !== '/login') {
    cachedSidebarAccess = null;
    next('/login');
  } else if (auth.needsWizard() && to.path !== '/wizard') {
    next('/wizard');
  } else {
    const canAccess = await canAccessRouteByVisibility(to.path, auth);
    if (!canAccess) {
      next('/dashboard');
      return;
    }

    next();
  }
};

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/wizard',
      component: () => import('../views/wizard/SetupWizard.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/',
      redirect: '/dashboard',
      beforeEnter: requireAuth
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../views/Dashboard.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/status',
      redirect: '/dashboard',
      beforeEnter: requireAuth
    },
    {
      path: '/status/wan',
      component: () => import('../views/status/WanStatus.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/status/wan-cht',
      component: () => import('../views/status/WanStatusCht.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/status/lan',
      component: () => import('../views/status/LanStatus.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/status/lan-cht',
      component: () => import('../views/status/LanStatusCht.vue'),
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
      path: '/status/system-stats',
      component: () => import('../views/status/SystemStats.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/status/log',
      component: () => import('../views/status/LogStatus.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/status/dual-image',
      component: () => import('../views/status/DualImage.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/status/wan-failover',
      component: () => import('../views/InProgress.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/status/cellular',
      component: () => import('../views/status/CellularStatus.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/network/wan',
      name: 'NetworkWan',
      component: () => import('../views/network/wan/WanConfig.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/basic/wan',
      redirect: '/network/wan'
    },
    {
      path: '/basic/wan-cht',
      name: 'BasicWanCht',
      component: () => import('../views/network/wan/BasicWanCht.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/basic/backup-wan',
      name: 'BackupWan',
      component: () => import('../views/network/wan/BackupWanConfig.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/network/backup-wan',
      redirect: '/basic/backup-wan'
    },
    {
      path: '/network/lan',
      name: 'NetworkLan',
      component: () => import('../views/network/lan/LanConfig.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/basic/lan',
      redirect: '/network/lan'
    },
    {
      path: '/basic/lan-cht',
      name: 'BasicBridgeLan',
      component: () => import('../views/network/lan/LanConfigCht.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/network/lan/ipv4',
      name: 'NetworkLanIPv4',
      component: () => import('../views/network/lan/IPv4Config.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/basic/lan/ipv4',
      redirect: '/network/lan/ipv4'
    },
    {
      path: '/basic/lan/ipv6',
      component: () => import('../views/InProgress.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/network/lan/devices',
      name: 'NetworkLanDevices',
      component: () => import('../views/network/lan/DeviceList.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/basic/lan/devices',
      redirect: '/network/lan/devices'
    },
    {
      path: '/network/wireless',
      name: 'NetworkWireless',
      component: () => import('../views/network/wireless/WirelessConfig.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/basic/wlan',
      redirect: '/network/wireless'
    },
    {
      path: '/network/wireless/basic',
      name: 'NetworkWirelessBasic',
      component: () => import('../views/network/wireless/BasicConfig.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/basic/wlan/basic',
      redirect: '/network/wireless/basic'
    },
    {
      path: '/network/wireless/advanced',
      name: 'NetworkWirelessAdvanced',
      component: () => import('../views/network/wireless/AdvancedConfig.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/basic/wlan/advanced',
      redirect: '/network/wireless/advanced'
    },
    {
      path: '/network/wireless/wps',
      name: 'NetworkWirelessWps',
      component: () => import('../views/network/wireless/WpsConfig.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/basic/wlan/wps',
      redirect: '/network/wireless/wps'
    },
    {
      path: '/network/wireless/mesh',
      name: 'NetworkWirelessMesh',
      component: () => import('../views/network/wireless/MeshConfig.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/basic/wlan/mesh',
      redirect: '/network/wireless/mesh'
    },
    {
      path: '/basic/wlan/zones',
      component: () => import('../views/InProgress.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/network/wireless/extender',
      name: 'NetworkWirelessExtender',
      component: () => import('../views/network/wireless/ExtenderConfig.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/basic/wlan/extender',
      redirect: '/network/wireless/extender'
    },
    {
      path: '/basic/cellular',
      name: 'BasicCellular',
      component: () => import('../views/network/cellular/CellularConfig.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/basic/operation-mode',
      name: 'BasicOperationMode',
      component: () => import('../views/network/operationMode/OperationModeConfig.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/basic/nat/port-forwarding',
      component: () => import('../views/InProgress.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/advanced/nat',
      name: 'AdvancedNat',
      component: () => import('../views/advanced/nat/NatConfig.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/basic/nat',
      redirect: '/advanced/nat'
    },
    {
      path: '/advanced/nat/dmz',
      name: 'AdvancedNatDmz',
      component: () => import('../views/advanced/nat/DmzConfig.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/basic/nat/dmz',
      redirect: '/advanced/nat/dmz'
    },
    {
      path: '/basic/nat/alg',
      component: () => import('../views/InProgress.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/advanced/security',
      name: 'AdvancedSecurity',
      component: () => import('../views/advanced/SecurityConfig.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/basic/security',
      redirect: '/advanced/security'
    },
    {
      path: '/basic/routing',
      name: 'BasicRouting',
      component: () => import('../views/network/routing/RoutingConfig.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/advanced/ssh',
      name: 'AdvancedSsh',
      component: () => import('../views/advanced/SshConfig.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/advance/ssh',
      redirect: '/advanced/ssh'
    },
    {
      path: '/advanced/service-control',
      name: 'AdvancedServiceControl',
      component: () => import('../views/advanced/ServiceControl.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/advance/service-control',
      redirect: '/advanced/service-control'
    },
    {
      path: '/advanced/mcl',
      name: 'AdvancedMcl',
      component: () => import('../views/advanced/MclConfig.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/advance/mcl',
      redirect: '/advanced/mcl'
    },
    {
      path: '/advanced/qos',
      name: 'AdvancedQos',
      component: () => import('../views/network/qos/QosConfig.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/advance/qos',
      redirect: '/advanced/qos'
    },
    {
      path: '/advanced/ddns',
      name: 'AdvancedDdns',
      component: () => import('../views/advanced/DdnsConfig.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/application/ddns',
      redirect: '/advanced/ddns'
    },
    {
      path: '/advanced/lcm',
      name: 'AdvancedLcm',
      component: () => import('../views/advanced/LcmConfig.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/advance/lcm',
      redirect: '/advanced/lcm'
    },
    {
      path: '/system/ntp',
      name: 'SystemNtp',
      component: () => import('../views/system/ntp/NtpConfig.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/management/ntp',
      redirect: '/system/ntp'
    },
    {
      path: '/system/reboot',
      name: 'SystemReboot',
      component: () => import('../views/system/reboot/DeviceReboot.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/management/reboot',
      redirect: '/system/reboot'
    },
    {
      path: '/management/language',
      component: () => import('../views/InProgress.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/system/settings',
      name: 'SystemSettings',
      component: () => import('../views/system/settings/SettingsManagement.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/management/settings',
      redirect: '/system/settings'
    },
    {
      path: '/system/settings/reset',
      name: 'SystemSettingsReset',
      component: () => import('../views/system/reset/DeviceReset.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/management/settings/reset',
      redirect: '/system/settings/reset'
    },
    {
      path: '/system/settings/backup',
      name: 'SystemSettingsBackup',
      component: () => import('../views/system/backup/BackupManagement.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/management/settings/backup',
      redirect: '/system/settings/backup'
    },
    {
      path: '/system/settings/update',
      name: 'SystemSettingsUpdate',
      component: () => import('../views/system/firmware/FirmwareUpgrade.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/management/settings/update',
      redirect: '/system/settings/update'
    },
    {
      path: '/system/diagnostics',
      name: 'SystemDiagnostics',
      component: () => import('../views/system/diagnostics/DiagnosticsTools.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/management/tools',
      redirect: '/system/diagnostics'
    },
    {
      path: '/system/diagnostics/ping',
      name: 'SystemDiagnosticsPing',
      component: () => import('../views/system/diagnostics/PingTool.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/management/tools/ping',
      redirect: '/system/diagnostics/ping'
    },
    {
      path: '/system/diagnostics/traceroute',
      name: 'SystemDiagnosticsTraceroute',
      component: () => import('../views/system/diagnostics/TraceRouteTool.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/management/tools/traceroute',
      redirect: '/system/diagnostics/traceroute'
    },
    {
      path: '/system/diagnostics/dns',
      name: 'SystemDiagnosticsDns',
      component: () => import('../views/system/diagnostics/DNSLookupTool.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/management/tools/dns',
      redirect: '/system/diagnostics/dns'
    },
    {
      path: '/system/diagnostics/tr471',
      name: 'SystemDiagnosticsTR471',
      component: () => import('../views/system/diagnostics/TR471Test.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/system/device',
      name: 'SystemDevice',
      component: () => import('../views/system/device/DeviceManagement.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/management/device',
      redirect: '/system/device'
    },
    {
      path: '/system/account',
      name: 'SystemAccount',
      component: () => import('../views/system/account/AccountManagementEntry.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/management/account',
      redirect: '/system/account'
    },
    {
      path: '/application/xperience-control',
      component: () => import('../views/application/XperienceControl.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/application/upnp',
      name: 'ApplicationUpnp',
      component: () => import('../views/application/UpnpConfig.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/iot/thread',
      name: 'IotThread',
      component: () => import('../views/iot/thread/ThreadLayout.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/iot/matter',
      name: 'IotMatter',
      component: () => import('../views/iot/matter/MatterDashboard.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: (to) => {
        const auth = AuthService.getInstance();

        if (!auth.isAuthenticated()) {
          return { path: '/login', query: { next: to.fullPath } };
        }

        if (auth.needsWizard()) {
          return { path: '/wizard' };
        }

        return { path: '/' };
      }
    }
  ]
});

export default router;
