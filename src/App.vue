<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { WanStatusResponse } from './types/wan';
import { getMockWanStatus } from './services/mockApi';
import { AuthService } from './services/auth';
import { AutoLogoutService } from './services/autoLogout';
import Sidebar from './components/Sidebar.vue';
import Header from './components/Header.vue';

const route = useRoute();
const router = useRouter();
const wanData = ref<WanStatusResponse | null>(null);
const autoLogout = AutoLogoutService.getInstance();

const fetchWanStatus = async () => {
  try {
    wanData.value = getMockWanStatus();
  } catch (error) {
    console.error('Error fetching WAN status:', error);
  }
};

onMounted(() => {
  fetchWanStatus();

  // Initialize auto logout service with router
  autoLogout.init(router);

  // Start auto logout if user is authenticated
  const auth = AuthService.getInstance();
  if (auth.isAuthenticated() && route.path !== '/login' && route.path !== '/wizard') {
    autoLogout.start();
  }
});

onUnmounted(() => {
  autoLogout.stop();
});

const isLoginPage = computed(() => route.path === '/login');
const isWizardPage = computed(() => route.path === '/wizard');

// Watch route changes to manage auto logout
watch(() => route.path, (newPath) => {
  const auth = AuthService.getInstance();

  if (newPath === '/login' || newPath === '/wizard') {
    // Stop auto logout on login and wizard pages
    autoLogout.stop();
  } else if (auth.isAuthenticated()) {
    // Start auto logout on other pages if authenticated
    autoLogout.start();
  }
});
</script>

<template>
  <div class="app-container">
    <template v-if="!isLoginPage && !isWizardPage">
      <Sidebar />
      <div class="main-content">
        <Header />
        <router-view />
      </div>
    </template>
    <template v-else>
      <router-view />
    </template>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  overflow: auto;
}

@media (max-width: 768px) {
  .main-content {
    margin-top: 50px; /* Height of mobile header */
  }
}

.page-enter-active, .page-leave-active {
  transition: opacity 0.5s;
}

.page-enter, .page-leave-to {
  opacity: 0;
}
</style>