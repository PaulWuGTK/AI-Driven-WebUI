<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t } = useI18n();
const activeMenu = ref('Status');
const activeSubItem = ref('WAN');

const menuItems = [
  { name: 'Dashboard', icon: '📊', path: '/dashboard', translationKey: 'menu.dashboard' },
  { 
    name: 'Status', 
    icon: '📈',
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
  { name: 'Basic Setting', icon: '⚙️', path: '/settings', translationKey: 'menu.basicSetting' },
  { name: 'Management', icon: '🔧', path: '/management', translationKey: 'menu.management' }
];

const handleMenuClick = (menuName: string, path?: string) => {
  activeMenu.value = menuName;
  if (path) {
    router.push(path);
  }
  if (menuName !== 'Status') {
    activeSubItem.value = '';
  }
};

const handleSubItemClick = (subItem: { name: string; path: string }) => {
  activeSubItem.value = subItem.name;
  router.push(subItem.path);
};
</script>

<template>
  <aside class="sidebar">
    <div class="logo">Gemtek</div>
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
          <span v-if="item.subItems" class="arrow">▼</span>
        </div>
        <div 
          v-if="item.subItems && activeMenu === item.name" 
          class="submenu"
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
  background: linear-gradient(to bottom, #0c78be 0%, #60ccf6 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.logo {
  padding: 1.5rem 2rem;
  font-size: 1.75rem;
  font-weight: bold;
  color: #ffffff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1rem;
  text-align: left;
}

.menu {
  margin-top: 1rem;
}

.menu-item {
  margin-bottom: 0.25rem;
}

.menu-header {
  padding: 0.875rem 2rem;
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
}

.submenu {
  padding: 0.5rem 0;
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
  background-color: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-weight: 500;
}
</style>