<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WlanStatusResponse } from '../../types/wlan';
import { getMockWlanStatus } from '../../services/mockApi';
import WlanBandInfo from '../../components/status/WlanBandInfo.vue';
import WlanInterfaceTable from '../../components/status/WlanInterfaceTable.vue';

const { t } = useI18n();
const wlanData = ref<WlanStatusResponse | null>(null);

const fetchWlanStatus = async () => {
  try {
    // In production, this would be a real API call
    // const response = await fetch('/API/info?list=StatusWlan');
    // wlanData.value = await response.json();
    
    // Using mock data for development
    wlanData.value = getMockWlanStatus();
  } catch (error) {
    console.error('Error fetching WLAN status:', error);
  }
};

onMounted(() => {
  fetchWlanStatus();
});
</script>

<template>
  <div class="wlan-status">
    <h1 class="page-title">{{ t('wlan.title') }}</h1>
    
    <div v-if="wlanData" class="wlan-bands">
      <div v-for="band in wlanData.StatusWlan" :key="band.Band" class="band-section">
        <h2 class="band-title">WiFi {{ band.Band }}</h2>
        <WlanBandInfo :band="band" />
        <WlanInterfaceTable :interfaces="band.Interface" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.wlan-status {
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

.wlan-bands {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.band-section {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.band-title {
  padding: 1rem 1.5rem;
  font-size: 1rem;
  color: #333;
  margin: 0;
  background-color: #f8f8f8;
  border-bottom: 1px solid #e0e0e0;
}
</style>