<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getWanInfo } from '../../services/api/dashboard';

const { t } = useI18n();
const wanData = ref({
  status: 'Down',
  speed: '0',
  bytesReceived: '0',
  bytesSent: '0'
});

const fetchWanData = async () => {
  try {
    const response = await getWanInfo();
    const wanPort = response.EthernetStatus.find((port: any) => port.Role === 'wan');
    
    if (wanPort) {
      wanData.value = {
        status: wanPort.Status,
        speed: wanPort.Speed,
        bytesReceived: '150.7 kB', // Mock data for traffic
        bytesSent: '180.7 kB'
      };
    }
  } catch (error) {
    console.error('Error fetching WAN data:', error);
  }
};

onMounted(() => {
  fetchWanData();
  setInterval(fetchWanData, 5000);
});
</script>

<template>
  <div class="wan-status">
    <h2 class="card-title">{{ t('dashboard.wan') }}</h2>
    <div class="status-container">
      <div class="status-indicator" :class="{ active: wanData.status === 'Up' }">
        {{ wanData.status }}
      </div>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">{{ t('dashboard.speed') }}</span>
          <span class="value">{{ wanData.speed }} Mbps</span>
        </div>
        <div class="info-item">
          <span class="label">{{ t('dashboard.received') }}</span>
          <span class="value">{{ wanData.bytesReceived }}</span>
        </div>
        <div class="info-item">
          <span class="label">{{ t('dashboard.sent') }}</span>
          <span class="value">{{ wanData.bytesSent }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.status-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-indicator {
  padding: 0.5rem 1rem;
  background-color: #f44336;
  color: white;
  border-radius: 4px;
  text-align: center;
  font-weight: 500;
}

.status-indicator.active {
  background-color: #4caf50;
}

.info-grid {
  display: grid;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  color: #666;
}

.value {
  color: #333;
  font-weight: 500;
}

.card-title {
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 1rem 0;
}
</style>