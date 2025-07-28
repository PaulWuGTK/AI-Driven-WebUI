<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();
const activeMenu = ref('Dashboard');
const activeSubItem = ref('');
const expandedMenus = ref<string[]>([]);
const isMobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

import homeIcon from '/src/assets/icons/icon-1/ico-home.svg';
import basicIcon from '/src/assets/icons/icon-1/menu-basic.svg';
import wifiIcon from '/src/assets/icons/icon-1/menu-wifi.svg';
import threadIcon from '/src/assets/icons/icon-1/menu-iot.svg';
import matterIcon from '/src/assets/icons/icon-1/menu-iot.svg';
import managementIcon from '/src/assets/icons/icon-1/menu-utilities.svg';

// Define types for menu items
interface SubMenuItem {
  name: string;
  path: string;
  translationKey: string;
}

interface MenuItem {
  name: string;
  icon: string;
  translationKey: string;
  path?: string;
  subItems?: SubMenuItem[];
}

// Base menu structure
const baseMenuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    icon: homeIcon,
    path: '/dashboard',
    translationKey: 'menu.dashboard'
  },
  {
    name: 'Basic Setting',
    icon: basicIcon,
    translationKey: 'menu.basicSetting',
    subItems: [
      { name: 'WAN', path: '/settings/wan', translationKey: 'menu.wanSetting' },
      { name: 'LAN', path: '/settings/lan', translationKey: 'menu.lanSetting' },
      { name: 'Wireless', path: '/settings/wireless', translationKey: 'menu.wireless' }
    ]
  },
  {
    name: 'Wi-Fi',
    icon: wifiIcon,
    translationKey: 'menu.wifi',
    subItems: [
      { name: 'Guest Access', path: '/wifi/guest-access', translationKey: 'menu.guestAccess' },
      { name: 'MAC Filter', path: '/wifi/mac-filter', translationKey: 'menu.macFilter' },
      { name: 'Wireless Extender', path: '/wifi/wireless-extender', translationKey: 'menu.wirelessExtender' }
    ]
  },
  {
    name: 'Thread',
    icon: threadIcon,
    path: '/thread',
    translationKey: 'menu.thread'
  },
  {
    name: 'Matter',
    icon: matterIcon,
    translationKey: 'menu.matter',
    subItems: [
      { name: 'Home', path: '/matter/home', translationKey: 'menu.matterHome' },
      { name: 'Pairing', path: '/matter/pairing', translationKey: 'menu.matterPairing' },
      { name: 'OnOff', path: '/matter/onoff', translationKey: 'menu.matterOnoff' },
      { name: 'MultiAdmin', path: '/matter/multiadmin', translationKey: 'menu.matterMultiadmin' },
      { name: 'Subscribe', path: '/matter/subscribe', translationKey: 'menu.matterSubscribe' },
      { name: 'GetStatus', path: '/matter/getstatus', translationKey: 'menu.matterGetstatus' },
      { name: 'Binding', path: '/matter/binding', translationKey: 'menu.matterBinding' },
      { name: 'MediaControl', path: '/matter/mediacontrol', translationKey: 'menu.matterMediacontrol' },
      { name: 'EevseControl', path: '/matter/eevsecontrol', translationKey: 'menu.matterEevsecontrol' },
      { name: 'QRScanner', path: '/matter/qrscanner', translationKey: 'menu.matterQrscanner' }
    ]
  },
  { 
    name: 'Management',
    icon: managementIcon,
    translationKey: 'menu.management',
    subItems: [
      { name: 'Firmware Upgrade', path: '/management/firmware', translationKey: 'menu.firmware' }
    ]
  }
];

// Filter menu items based on device mode and app availability
const menuItems = ref<MenuItem[]>(baseMenuItems);

const toggleMenu = (menuName: string) => {
  // Clear all expanded menus and only expand the clicked one
  expandedMenus.value = expandedMenus.value.includes(menuName) ? [] : [menuName];
};

const handleMenuClick = (menuName: string, path?: string) => {
  activeMenu.value = menuName;
  if (path) {
    activeSubItem.value = ''; // Reset submenu selection when clicking main menu item
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

// Watch for route changes to update active states
watch(() => route.path, (newPath) => {
  let found = false;
  for (const item of menuItems.value) {
    if (item.path === newPath) {
      activeMenu.value = item.name;
      activeSubItem.value = '';
      found = true;
      break;
    }
    if (item.subItems) {
      const subItem = item.subItems.find(sub => sub.path === newPath);
      if (subItem) {
        activeMenu.value = item.name;
        activeSubItem.value = subItem.name;
        // Expand only the active menu
        expandedMenus.value = [item.name];
        found = true;
        break;
      }
    }
  }
  
  if (!found) {
    activeSubItem.value = '';
    expandedMenus.value = []; // Close all submenus if no match found
  }
}, { immediate: true });

onMounted(() => {
  // Initialize with base menu items
  menuItems.value = baseMenuItems;
});
</script>

<template>
  <div class="mobile-top-header">
    <button class="mobile-menu-toggle" @click="toggleMobileMenu">
      <span class="material-icons">{{ isMobileMenuOpen ? 'close' : 'menu' }}</span>
    </button>
    <span class="mobile-logo">Gemtek</span>
  </div>
  
  <aside class="sidebar" :class="{ 'mobile-open': isMobileMenuOpen }">
    <div class="logo desktop-only">
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
          <span class="icon">
            <img :src="item.icon" alt="icon" />
          </span>
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
  max-height: 900px;
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
    height: calc(100vh - var(--header-height) - var(--mobile-safe-area-bottom));
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 5rem;
  }

  .menu-header {
    padding: 1rem 1.5rem;
  }

  .submenu-item {
    padding: 1rem 2.5rem;
  }

  /* Ensure submenu items are accessible */
  .submenu.expanded {
    max-height: none;
  }
  
  .menu-item:last-child .submenu {
    margin-bottom: 5rem;
  }
}
</style>