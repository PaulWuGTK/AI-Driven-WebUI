<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import type { WanStatusResponse } from './types/wan';
import { getMockWanStatus } from './services/mockApi';
import Sidebar from './components/Sidebar.vue';
import Header from './components/Header.vue';

const route = useRoute();
const wanData = ref<WanStatusResponse | null>(null);

const fetchWanStatus = async () => {
  try {
    wanData.value = getMockWanStatus();
  } catch (error) {
    console.error('Error fetching WAN status:', error);
  }
};

onMounted(() => {
  fetchWanStatus();
});

const isLoginPage = computed(() => route.path === '/login');
</script>

<template>
  <div class="app-container">
    <template v-if="!isLoginPage">
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

.page-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.page-enter-active, .page-leave-active {
  transition: opacity 0.5s;
}

.page-enter, .page-leave-to {
  opacity: 0;
}
</style>