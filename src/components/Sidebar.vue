<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t } = useI18n();
const activeMenu = ref('Status');
const activeSubItem = ref('WAN');
const expandedMenus = ref<string[]>(['Status']); // Track expanded state

const menuItems = [
  { name: 'Dashboard', icon: '⌂', path: '/dashboard', translationKey: 'menu.dashboard' },
  { 
    name: 'Status', 
    icon: '📊',
    translationKey: 'menu.status',
    subItems: [
      { name: 'WAN', path: '/status/wan', translationKey: 'menu.wan' },
      { name: 'LAN', path: '/status/lan', translationKey: 'menu.lan' },
      { name: 'WLAN', path: '/status/wlan', translationKey: 'menu.wlan' },
      { name: 'Statistics', path: '/status/statistics', translationKey: 'menu.statistics' },
      { name: 'WiFi Neighbor', path: '/status/wifi-neighbor', translationKey: 'menu.wifiNeighbor' },
      { name: 'Mesh Information', path: '/status/mesh', translationKey: 'menu.meshInfo' },
      { name: 'LCM', path: '/status/lcm', translationKey: 'menu.lcm' }
    ]
  },
  { 
    name: 'Basic Setting', 
    icon: '⚙', 
    translationKey: 'menu.basicSetting',
    subItems: [
      { name: 'Wireless', path: '/settings/wireless', translationKey: 'menu.wireless' }
    ]
  },
  { 
    name: 'Advanced', 
    icon: '⚡', 
    translationKey: 'menu.advanced',
    subItems: [
      { name: 'DDNS', path: '/advanced/ddns', translationKey: 'menu.ddns' },
    ]
  },
  { 
    name: 'Management', 
    icon: '🔧', 
    translationKey: 'menu.management',
    subItems: [
      { name: 'NTP', path: '/management/ntp', translationKey: 'menu.ntp' },
      { name: 'SSH', path: '/management/ssh', translationKey: 'menu.ssh' }
    ]
  }
];

const toggleMenu = (menuName: string) => {
  const index = expandedMenus.value.indexOf(menuName);
  if (index === -1) {
    expandedMenus.value.push(menuName);
  } else {
    expandedMenus.value.splice(index, 1);
  }
};

const handleMenuClick = (menuName: string, path?: string) => {
  activeMenu.value = menuName;
  if (path) {
    router.push(path);
  } else {
    toggleMenu(menuName);
  }
};

const handleSubItemClick = (subItem: { name: string; path: string }) => {
  activeSubItem.value = subItem.name;
  router.push(subItem.path);
};

const isMenuExpanded = (menuName: string): boolean => {
  return expandedMenus.value.includes(menuName);
};
</script>

<template>
  <aside class="sidebar">
    <div class="logo">
      <span class="logo-text">Gemtek</span>
    </div>
    <nav class="menu">
      <div 
        v-for="item in menuItems" 
        :key="item.name" 
        class="menu-item"
        :class="{ active: activeMenu === item.name }"
      >
        <div 
          class="menu-header"
          @click="handleMenuClick(item.name, item.path)"
        >
          <span class="icon">{{ item.icon }}</span>
          {{ t(item.translationKey) }}
          <span 
            v-if="item.subItems" 
            class="arrow"
            :class="{ expanded: isMenuExpanded(item.name) }"
          >▶</span>
        </div>
        <div 
          v-if="item.subItems" 
          class="submenu"
          :class="{ expanded: isMenuExpanded(item.name) }"
        >
          <div 
            v-for="subItem in item.subItems" 
            :key="subItem.name" 
            class="submenu-item"
            :class="{ active: activeSubItem === subItem.name }"
            @click="handleSubItemClick(subItem)"
          >
            {{ t(subItem.translationKey) }}
          </div>
        </div>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 230px;
  min-height: 100vh;
  background: linear-gradient(to bottom, #002060 0%, #3660AB 100%);
  color: white;
  padding: 0;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
}

.logo {
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  background-color: #002060;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-text {
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: bold;
}

.menu {
  margin-top: 0.5rem;
}

.menu-item {
  margin-bottom: 0.25rem;
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
  max-height: 500px; /* Adjust based on your needs */
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
  background-color: #1976d2; /* Highlight color for active submenu item */
  color: #ffffff;
  font-weight: 500;
}
</style>