<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import SystemInfo from '../components/dashboard/SystemInfo.vue';
import CpuUsage from '../components/dashboard/CpuUsage.vue';
import MemoryStatus from '../components/dashboard/MemoryStatus.vue';
import WanStatus from '../components/dashboard/WanStatus.vue';
import WifiStatus from '../components/dashboard/WifiStatus.vue';
import EthernetStatus from '../components/dashboard/EthernetStatus.vue';

const { t } = useI18n();
const refreshInterval = ref<number | null>(null);

const fetchData = async () => {
  // Data fetching will be handled by individual components
};

onMounted(() => {
  fetchData();
  refreshInterval.value = window.setInterval(fetchData, 10000);
});

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
});
</script>

<template>
  <div class="dashboard">
    <h1 class="page-title">{{ t('menu.dashboard') }}</h1>
    
    <div class="dashboard-grid">
      <SystemInfo class="dashboard-item" />
      <CpuUsage class="dashboard-item" />
      <MemoryStatus class="dashboard-item" />
      <WanStatus class="dashboard-item" />
      <WifiStatus class="dashboard-item" />
      <EthernetStatus class="dashboard-item" />
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  flex: 1;
  background-color: #f5f5f5;
  min-height: 100%;
}

.page-title {
  color: #0070BB;
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0;
  padding: 1rem 2rem;
  text-align: left;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

.dashboard-item {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

@media (min-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>