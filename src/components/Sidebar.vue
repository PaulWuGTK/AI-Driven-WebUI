<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { getSidebarMenu, updateSidebarMenuLanguage } from '../services/api/sidebarMenu';
import { AuthService } from '../services/auth';
import { useQA } from '../utils/qa';
import { isMenuVisible, type NetLayoutType, type OperationMode, type UserRole } from '../types/menuVisibility';

const { qa, slug } = useQA();

const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();
const activeMenu = ref('Status');
const activeSubItem = ref('');
const expandedMenus = ref<string[]>([]);
const isMobileMenuOpen = ref(false);
const operationMode = ref<OperationMode>('Gateway');
const netLayoutType = ref<NetLayoutType>('prpl');
const userRole = ref<UserRole>('super');
const hasStreambow = ref(false);
const features = ref<Record<string, boolean>>({});

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

import homeIcon from '/src/assets/icons/icon-1/ico-home.svg';
import statusIcon from '/src/assets/icons/icon-1/menu-status.svg';
import basicIcon from '/src/assets/icons/icon-1/menu-basic.svg';
import advancedIcon from '/src/assets/icons/icon-1/menu-advanced.svg';
import managementIcon from '/src/assets/icons/icon-1/menu-utilities.svg';
import applicationIcon from '/src/assets/icons/icon-1/menu-application.svg';
import speedTestIcon from '/src/assets/icons/icon-1/menu-speedtest.svg';

interface SubMenuItem {
  name: string;
  path: string;
  translationKey: string;
  menuKey: string;
  children?: SubMenuItem[];
}

interface MenuItem {
  name: string;
  icon: string;
  translationKey: string;
  menuKey: string;
  path?: string;
  subItems?: SubMenuItem[];
}


const baseMenuItems: MenuItem[] = [
  {
    name: 'Home',
    icon: homeIcon,
    path: '/dashboard',
    translationKey: 'menu.home',
    menuKey: 'home'
  },
  {
    name: 'Status',
    icon: statusIcon,
    translationKey: 'menu.status',
    menuKey: 'status',
    subItems: [
      { name: 'WAN', path: '/status/wan', translationKey: 'menu.wan', menuKey: 'status.wan' },
      { name: 'WAN Cht', path: '/status/wan-cht', translationKey: 'menu.wan', menuKey: 'status.wanCht' },
      { name: 'WAN Failover', path: '/status/wan-failover', translationKey: 'menu.wanFailover', menuKey: 'status.wanFailover' },
      { name: 'LAN', path: '/status/lan', translationKey: 'menu.lan', menuKey: 'status.lan' },
      { name: 'LAN Cht', path: '/status/lan-cht', translationKey: 'menu.lan', menuKey: 'status.lanCht' },
      { name: 'WLAN', path: '/status/wlan', translationKey: 'menu.wlan', menuKey: 'status.wlan' },
      { name: 'Statistics', path: '/status/statistics', translationKey: 'menu.statistics', menuKey: 'status.statistics' },
      { name: 'Throughput', path: '/status/system-stats', translationKey: 'menu.throughput', menuKey: 'status.throughput' },
      { name: 'WiFi Neighbor', path: '/status/wifi-neighbor', translationKey: 'menu.wifiNeighbor', menuKey: 'status.wifiNeighbor' },
      { name: 'Mesh Information', path: '/status/mesh', translationKey: 'menu.meshInfo', menuKey: 'status.meshInfo' },
      { name: 'LCM', path: '/status/lcm', translationKey: 'menu.lcm', menuKey: 'status.lcm' },
      { name: 'Dual Image', path: '/status/dual-image', translationKey: 'menu.dualImage', menuKey: 'status.dualImage' },
      { name: 'Cellular', path: '/status/cellular', translationKey: 'menu.cellular', menuKey: 'status.cellular' },
      { name: 'Log', path: '/status/log', translationKey: 'menu.logs', menuKey: 'status.log' }
    ]
  },
  {
    name: 'Basic Setup',
    icon: basicIcon,
    translationKey: 'menu.basicSetup',
    menuKey: 'basicSetup',
    subItems: [
      { name: 'WAN', path: '/basic/wan', translationKey: 'menu.wan', menuKey: 'basicSetup.wan' },
      { name: 'WAN Cht', path: '/basic/wan-cht', translationKey: 'menu.wan', menuKey: 'basicSetup.wanCht' },
      { name: 'Backup WAN', path: '/basic/backup-wan', translationKey: 'menu.backupWan', menuKey: 'basicSetup.backupWan' },
      {
        name: 'LAN',
        path: '/basic/lan',
        translationKey: 'menu.lan',
        menuKey: 'basicSetup.lan',
        children: [
          { name: 'IPv4 Configuration', path: '/basic/lan/ipv4', translationKey: 'menu.ipv4Config', menuKey: 'basicSetup.lan.ipv4' },
          { name: 'IPv6 Configuration', path: '/basic/lan/ipv6', translationKey: 'menu.ipv6Config', menuKey: 'basicSetup.lan.ipv6' },
          { name: 'Device Connected', path: '/basic/lan/devices', translationKey: 'menu.deviceConnected', menuKey: 'basicSetup.lan.deviceConnected' }
        ]
      },
      { name: 'LAN (CHT)', path: '/basic/lan-cht', translationKey: 'menu.lan', menuKey: 'basicSetup.lanCht' },
      {
        name: 'WLAN',
        path: '/basic/wlan',
        translationKey: 'menu.wlan',
        menuKey: 'basicSetup.wlan',
        children: [
          { name: 'Basic Config', path: '/basic/wlan/basic', translationKey: 'menu.basicConfig', menuKey: 'basicSetup.wlan.basicConfig' },
          { name: 'Advanced Config', path: '/basic/wlan/advanced', translationKey: 'menu.advancedConfig', menuKey: 'basicSetup.wlan.advancedConfig' },
          { name: 'WPS Configuration', path: '/basic/wlan/wps', translationKey: 'menu.wpsConfig', menuKey: 'basicSetup.wlan.wpsConfig' },
          { name: 'Mesh Network', path: '/basic/wlan/mesh', translationKey: 'menu.meshNetwork', menuKey: 'basicSetup.wlan.meshNetwork' },
          { name: 'WiFi Zones', path: '/basic/wlan/zones', translationKey: 'menu.wifiZones', menuKey: 'basicSetup.wlan.wifiZones' },
          { name: 'Wireless Extender', path: '/basic/wlan/extender', translationKey: 'menu.wirelessExtender', menuKey: 'basicSetup.wlan.wirelessExtender' }
        ]
      },
      { name: 'Cellular', path: '/basic/cellular', translationKey: 'menu.cellular', menuKey: 'basicSetup.cellular' },
      { name: 'Operation Mode', path: '/basic/operation-mode', translationKey: 'menu.operationMode' ,menuKey: 'basicSetup.operationMode'},
      {
        name: 'NAT',
        path: '/basic/nat',
        translationKey: 'menu.nat',
        menuKey: 'basicSetup.nat',
        children: [
          { name: 'Port Forwarding', path: '/basic/nat?tab=portforwarding', translationKey: 'menu.portForwarding', menuKey: 'basicSetup.nat.portForwarding' },
          { name: 'DMZ Host', path: '/basic/nat?tab=dmz', translationKey: 'menu.dmzHost', menuKey: 'basicSetup.nat.dmzHost' },
          { name: 'ALG', path: '/basic/nat?tab=alg', translationKey: 'menu.alg', menuKey: 'basicSetup.nat.alg' }
        ]
      },
      {
        name: 'Security',
        path: '/basic/security',
        translationKey: 'menu.security',
        menuKey: 'basicSetup.security',
        children: [
          { name: 'IP Filtering', path: '/basic/security?tab=ipfiltering', translationKey: 'menu.ipFiltering', menuKey: 'basicSetup.security.ipFiltering' },
          { name: 'MAC Filtering', path: '/basic/security?tab=macfiltering', translationKey: 'menu.macFiltering', menuKey: 'basicSetup.security.macFiltering' }
        ]
      },
      { name: 'Routing', path: '/basic/routing', translationKey: 'menu.routing', menuKey: 'basicSetup.routing' }
    ]
  },
  {
    name: 'Advance Setup',
    icon: advancedIcon,
    translationKey: 'menu.advanceSetup',
    menuKey: 'advanceSetup',
    subItems: [
      { name: 'SSH Service', path: '/advance/ssh', translationKey: 'menu.sshService', menuKey: 'advanceSetup.sshService' },
      { name: 'Service Control', path: '/advance/service-control', translationKey: 'menu.serviceControl', menuKey: 'advanceSetup.serviceControl' },
      { name: 'QoS', path: '/advance/qos', translationKey: 'menu.qos', menuKey: 'advanceSetup.qos' },
      { name: 'LCM', path: '/advance/lcm', translationKey: 'menu.lcm', menuKey: 'advanceSetup.lcm' }
    ]
  },
  {
    name: 'Application',
    icon: applicationIcon,
    translationKey: 'menu.application',
    menuKey: 'application',
    subItems: [
      { name: 'UPnP', path: '/application/upnp', translationKey: 'menu.upnp', menuKey: 'application.upnp' },
      { name: 'DDNS', path: '/application/ddns', translationKey: 'menu.ddns', menuKey: 'application.ddns' }
    ]
  },
  {
    name: 'Management',
    icon: managementIcon,
    translationKey: 'menu.management',
    menuKey: 'management',
    subItems: [
      { name: 'Reboot', path: '/management/reboot', translationKey: 'menu.reboot', menuKey: 'management.reboot' },
      { name: 'Account Management', path: '/management/account', translationKey: 'menu.account', menuKey: 'management.account' },
      { name: 'Account Management CHT', path: '/management/account', translationKey: 'menu.account', menuKey: 'management.accountCht' },
      { name: 'NTP', path: '/management/ntp', translationKey: 'menu.ntp', menuKey: 'management.ntp' },
      { name: 'Device Management', path: '/management/device', translationKey: 'menu.device', menuKey: 'management.device' },
      {
        name: 'Settings',
        path: '/management/settings',
        translationKey: 'menu.settings',
        menuKey: 'management.settings',
        children: [
          { name: 'Reset to Default', path: '/management/settings/reset', translationKey: 'menu.resetToDefault', menuKey: 'management.settings.resetToDefault' },
          { name: 'Backup/Restore', path: '/management/settings/backup', translationKey: 'menu.backupRestore', menuKey: 'management.settings.backupRestore' },
          { name: 'Update Software', path: '/management/settings/update', translationKey: 'menu.updateSoftware', menuKey: 'management.settings.updateSoftware' }
        ]
      },
      {
        name: 'Tools',
        path: '/management/tools',
        translationKey: 'menu.tools',
        menuKey: 'management.tools',
        children: [
          { name: 'Ping Diagnosis', path: '/management/tools/ping', translationKey: 'menu.pingDiagnosis', menuKey: 'management.tools.pingDiagnosis' },
          { name: 'Trace Route Diagnosis', path: '/management/tools/traceroute', translationKey: 'menu.traceRouteDiagnosis', menuKey: 'management.tools.traceRoute' },
          { name: 'DNS Diagnosis', path: '/management/tools/dns', translationKey: 'menu.dnsDiagnosis', menuKey: 'management.tools.dnsDiagnosis' }
        ]
      }
    ]
  },
  {
    name: 'Speed Test',
    icon: speedTestIcon,
    translationKey: 'menu.speedTest',
    menuKey: 'speedtest',
    subItems: [
      { name: 'XperienceControl', path: '/application/xperience-control', translationKey: 'menu.xperienceControl', menuKey: 'speedtest.xperienceControl' },
      { name: 'TR-471', path: '/system/diagnostics/tr471', translationKey: 'menu.tr471', menuKey: 'speedtest.tr471' }
    ]
  }
];

const menuItems = ref<MenuItem[]>(baseMenuItems);

const filterSubItems = (subItems: SubMenuItem[]): SubMenuItem[] => {
  return subItems
    .filter(subItem => {
      const visible = isMenuVisible(
        subItem.menuKey,
        netLayoutType.value,
        operationMode.value,
        features.value,
        userRole.value
      );
      return visible;
    })
    .map(subItem => {
      if (subItem.children) {
        const filteredChildren = subItem.children.filter(child =>
          isMenuVisible(
            child.menuKey,
            netLayoutType.value,
            operationMode.value,
            features.value,
            userRole.value
          )
        );
        return {
          ...subItem,
          children: filteredChildren.length > 0 ? filteredChildren : undefined
        };
      }
      return subItem;
    });
};

const filterMenuItems = () => {
  menuItems.value = baseMenuItems
    .filter(item => {
      return isMenuVisible(
        item.menuKey,
        netLayoutType.value,
        operationMode.value,
        features.value,
        userRole.value
      );
    })
    .map(item => {
      if (item.subItems) {
        const filteredSubItems = filterSubItems(item.subItems);

        if (filteredSubItems.length === 0) return null;

        return {
          ...item,
          subItems: filteredSubItems
        };
      }

      return item;
    })
    .filter((item): item is MenuItem => item !== null);

  if (hasStreambow.value) {
    const xperienceControlVisible = isMenuVisible(
      'speedtest.xperienceControl',
      netLayoutType.value,
      operationMode.value,
      features.value,
      userRole.value
    );

    if (xperienceControlVisible) {
      const speedTestIndex = menuItems.value.findIndex(item => item.menuKey === 'speedtest');
      if (speedTestIndex >= 0) {
        const speedTestMenu = menuItems.value[speedTestIndex];
        if (speedTestMenu.subItems) {
          const xperienceControlExists = speedTestMenu.subItems.some(
            sub => sub.menuKey === 'speedtest.xperienceControl'
          );
          if (!xperienceControlExists) {
            speedTestMenu.subItems.unshift({
              name: 'XperienceControl',
              path: '/application/xperience-control',
              translationKey: 'menu.xperienceControl',
              menuKey: 'speedtest.xperienceControl'
            });
          }
        }
      }
    }
  }
};

const toggleMenu = (menuName: string) => {
  if (expandedMenus.value.includes(menuName)) {
    expandedMenus.value = expandedMenus.value.filter(name => name !== menuName);
  } else {
    expandedMenus.value = [menuName];
  }
};

const handleMenuClick = (menuName: string, path?: string) => {
  activeMenu.value = menuName;
  activeSubItem.value = '';
  if (path) {
    router.push(path);
  } else {
    toggleMenu(menuName);
  }
};

const handleSubItemClick = (subItem: { name: string; path: string }, event?: Event) => {
  if (event) {
    event.stopPropagation();
  }
  activeSubItem.value = subItem.name;
  router.push(subItem.path);
};

const isMenuExpanded = (menuName: string): boolean => {
  return expandedMenus.value.includes(menuName);
};

const STREAMBOW_KEYWORDS = ['streambow'];

const fetchSidebarMenu = async () => {
  const auth = AuthService.getInstance();
  if (!auth.isAuthenticated()) {
    return;
  }

  try {
    const response = await getSidebarMenu();

    const modeMapping: Record<string, OperationMode> = {
      'Init': 'Init',
      'Gateway': 'Gateway',
      'Bridge': 'Bridge',
      'Extender': 'Extender'
    };

    operationMode.value = modeMapping[response.SidebarMenu.mode] || 'Gateway';
    netLayoutType.value = response.SidebarMenu.NetLayoutType || 'prpl';
    userRole.value = response.SidebarMenu.user || 'super';
    features.value = response.SidebarMenu.features || {};

    hasStreambow.value = response.SidebarMenu.Apps.some(app => {
      if (app.state !== 'active') return false;

      const name = app.name?.toLowerCase() || '';
      const alias = app.alias?.toLowerCase() || '';
      return STREAMBOW_KEYWORDS.some(keyword =>
        name.includes(keyword) || alias.includes(keyword)
      );
    });

    if (response.SidebarMenu.language.current !== locale.value) {
      locale.value = response.SidebarMenu.language.current;
    }

    filterMenuItems();
  } catch (err) {
    console.error('Error fetching sidebar menu:', err);

    if (err instanceof Error &&
        (err.message.includes('403') ||
         err.message.includes('401') ||
         err.message.includes('Failed to fetch sidebar menu'))) {
      auth.clearSession();
      router.push(`/login?t=${Date.now()}`);
    }
  }
};

watch(() => locale.value, async (newLocale) => {
  try {
    await updateSidebarMenuLanguage(newLocale);
  } catch (error) {
    console.error('Error updating language:', error);

    if (error instanceof Error &&
        (error.message.includes('403') ||
         error.message.includes('401'))) {
      const auth = AuthService.getInstance();
      auth.clearSession();
      router.push(`/login?t=${Date.now()}`);
    }
  }
});

watch(() => route.path, (newPath) => {
  let found = false;

  // Path mapping for redirects: maps menu paths to their actual routes
  const pathRedirects: Record<string, string[]> = {
    '/basic/wan': ['/network/wan'],
    '/basic/lan': ['/network/lan'],
    '/basic/lan/ipv4': ['/network/lan/ipv4'],
    '/basic/lan/devices': ['/network/lan/devices'],
    '/basic/wlan': ['/network/wireless'],
    '/basic/wlan/basic': ['/network/wireless/basic'],
    '/basic/wlan/advanced': ['/network/wireless/advanced'],
    '/basic/wlan/wps': ['/network/wireless/wps'],
    '/basic/wlan/mesh': ['/network/wireless/mesh'],
    '/basic/wlan/extender': ['/network/wireless/extender'],
    '/basic/nat': ['/advanced/nat'],
    '/basic/nat/dmz': ['/advanced/nat/dmz'],
    '/basic/security': ['/advanced/security'],
    '/advance/ssh': ['/advanced/ssh'],
    '/advance/service-control': ['/advanced/service-control'],
    '/advance/qos': ['/advanced/qos'],
    '/advance/lcm': ['/advanced/lcm'],
    '/application/ddns': ['/advanced/ddns'],
    '/management/tools': ['/system/diagnostics'],
    '/management/tools/ping': ['/system/diagnostics/ping'],
    '/management/tools/traceroute': ['/system/diagnostics/traceroute'],
    '/management/tools/dns': ['/system/diagnostics/dns'],
    '/management/reboot': ['/system/reboot'],
    '/management/ntp': ['/system/ntp'],
    '/management/settings': ['/system/settings'],
    '/management/settings/reset': ['/system/settings/reset'],
    '/management/settings/backup': ['/system/settings/backup'],
    '/management/settings/update': ['/system/settings/update'],
    '/management/device': ['/system/device'],
    '/management/account': ['/system/account']
  };

  const pathMatches = (menuPath: string, currentPath: string): boolean => {
    // Exact match
    if (menuPath === currentPath) return true;

    // Check if menuPath has a known redirect to currentPath
    if (pathRedirects[menuPath]) {
      if (pathRedirects[menuPath].includes(currentPath)) {
        return true;
      }
    }

    return false;
  };

  for (const item of menuItems.value) {
    if (item.path && pathMatches(item.path, newPath)) {
      activeMenu.value = item.name;
      activeSubItem.value = '';
      found = true;
      break;
    }
    if (item.subItems) {
      const subItem = item.subItems.find(sub => pathMatches(sub.path, newPath));
      if (subItem) {
        activeMenu.value = item.name;
        activeSubItem.value = subItem.name;
        if (!expandedMenus.value.includes(item.name)) {
          expandedMenus.value = [item.name];
        }
        found = true;
        break;
      }

      for (const subItem of item.subItems) {
        if (subItem.children) {
          const childItem = subItem.children.find(child => pathMatches(child.path, newPath));
          if (childItem) {
            activeMenu.value = item.name;
            activeSubItem.value = subItem.name;
            if (!expandedMenus.value.includes(item.name)) {
              expandedMenus.value = [item.name];
            }
            found = true;
            break;
          }
        }
      }
      if (found) break;
    }
  }

  if (!found) {
    activeSubItem.value = '';
    expandedMenus.value = [];
  }
}, { immediate: true });

onMounted(() => {
  fetchSidebarMenu();
});
</script>

<template>
  <div class="mobile-top-header" :data-testid="qa('mobile-header')">
    <button class="mobile-menu-toggle" :data-testid="qa('mobile-menu-toggle')" @click="toggleMobileMenu">
      <span class="material-icons" :data-testid="qa('mobile-menu-icon')">{{ isMobileMenuOpen ? 'close' : 'menu' }}</span>
    </button>
    <span class="mobile-logo" :data-testid="qa('mobile-logo')">Gemtek</span>
  </div>

  <aside class="sidebar" :data-testid="qa('sidebar')" :class="{ 'mobile-open': isMobileMenuOpen }">
    <div class="logo desktop-only" :data-testid="qa('sidebar-logo')">
      <span class="logo-text" :data-testid="qa('sidebar-logo-text')">Gemtek</span>
    </div>
    <nav class="menu" :data-testid="qa('sidebar-menu')">
      <div
        v-for="item in menuItems"
        :key="item.name"
        class="menu-item"
        :data-testid="qa(`sidebar-menu-item-${slug(item.name)}`)"
        :class="{ active: activeMenu === item.name }"
      >
        <div
          class="menu-header"
          :data-testid="qa(`sidebar-menu-header-${slug(item.name)}`)"
          @click="handleMenuClick(item.name, item.path)"
        >
          <span class="icon" :data-testid="qa(`sidebar-menu-icon-${slug(item.name)}`)">
            <img :src="item.icon" alt="icon" />
          </span>
          {{ t(item.translationKey) }}
          <span
            v-if="item.subItems"
            class="arrow"
            :data-testid="qa(`sidebar-menu-arrow-${slug(item.name)}`)"
            :class="{ expanded: isMenuExpanded(item.name) }"
          >▶</span>
        </div>
        <div
          v-if="item.subItems"
          class="submenu"
          :data-testid="qa(`sidebar-submenu-${slug(item.name)}`)"
          :class="{ expanded: isMenuExpanded(item.name) }"
        >
          <div
            v-for="subItem in item.subItems"
            :key="subItem.name"
            class="submenu-item"
            :data-testid="qa(`sidebar-submenu-item-${slug(item.name)}-${slug(subItem.name)}`)"
            :class="{ active: activeSubItem === subItem.name }"
            @click="handleSubItemClick(subItem, $event)"
          >
            {{ t(subItem.translationKey) }}
          </div>
        </div>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
.mobile-top-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  background-color: #006BC4;
  display: none;
  align-items: center;
  padding: 0 1rem;
  z-index: 1002;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.mobile-menu-toggle {
  background: none;
  border: none;
  color: white;
  padding: 0.5rem;
  margin: -0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.mobile-menu-toggle .material-icons {
  font-size: 24px;
}

.mobile-logo {
  font-size: 1.25rem;
  font-weight: bold;
  margin-left: 1rem;
  color: white;
}

.sidebar {
  width: var(--sidebar-width);
  min-height: 100vh;
  background: linear-gradient(to bottom, #006BC4 8%, #45B1E4 100%);
  color: white;
  padding: 0;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
  position: relative;
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}

.logo {
  height: var(--header-height);
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  background-color: #006BC4;
  flex-shrink: 0;
}

.logo-text {
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: bold;
}

.menu {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.menu::-webkit-scrollbar {
  width: 6px;
}

.menu::-webkit-scrollbar-track {
  background: transparent;
}

.menu::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.menu-header {
  padding: 0.875rem 1.5rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 1rem;
  position: relative;
  text-align: left;
}

.menu-header:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.menu-item.active .menu-header {
  background-color: rgba(255, 255, 255, 0.15);
}

.icon {
  margin-right: 0.75rem;
  font-size: 1.1rem;
  width: 24px;
  text-align: center;
}

.arrow {
  position: absolute;
  right: 1.5rem;
  font-size: 0.75rem;
  opacity: 0.8;
  transition: transform 0.3s ease;
}

.arrow.expanded {
  transform: rotate(90deg);
}

.submenu {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}

.submenu.expanded {
  max-height: 800px;
}

.submenu-item {
  padding: 0.75rem 3.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
  text-align: left;
}

.submenu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.submenu-item.active {
  background-color: #409FD5;
  color: #ffffff;
  font-weight: 500;
}

@media (max-width: 768px) {
  .mobile-top-header {
    display: flex;
  }

  .desktop-only {
    display: none;
  }

  .sidebar {
    position: fixed;
    top: var(--header-height);
    left: 0;
    bottom: 0;
    z-index: 1001;
    transform: translateX(-100%);
    width: 100%;
    max-width: 320px;
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .menu {
    height: calc(100vh - var(--header-height));
    padding-top: 0;
    overflow-y: auto;
  }

  .menu-header {
    padding: 1rem 1.5rem;
  }

  .submenu-item {
    padding: 1rem 2.5rem;
  }
}
</style>
