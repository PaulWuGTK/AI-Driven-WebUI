<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getWifiInfo } from '../../services/api/dashboard';

const { t } = useI18n();
const wifiData = ref({
  wlan0: {
    status: 'Down',
    clients: 0,
    rxBytes: '0',
    txBytes: '0'
  },
  wlan1: {
    status: 'Down',
    clients: 0,
    rxBytes: '0',
    txBytes: '0'
  }
});
const pollingInterval = ref<number | null>(null);

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const fetchWifiData = async () => {
  try {
    const response = await getWifiInfo();
    
    const wlan0 = response.find((item: any) => 
      item.path === 'WiFi.SSID.1.Stats.')?.parameters;
    const wlan1 = response.find((item: any) => 
      item.path === 'WiFi.SSID.2.Stats.')?.parameters;

    if (wlan0) {
      wifiData.value.wlan0 = {
        status: 'Up',
        clients: 2,
        rxBytes: formatBytes(wlan0.BytesReceived),
        txBytes: formatBytes(wlan0.BytesSent)
      };
    }

    if (wlan1) {
      wifiData.value.wlan1 = {
        status: 'Up',
        clients: 1,
        rxBytes: formatBytes(wlan1.BytesReceived),
        txBytes: formatBytes(wlan1.BytesSent)
      };
    }
  } catch (error) {
    console.error('Error fetching WiFi data:', error);
  }
};

onMounted(() => {
  fetchWifiData();
  pollingInterval.value = window.setInterval(fetchWifiData, 5000);
});

onUnmounted(() => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
  }
});
</script>

<template>
  <div class="wifi-status">
    <h2 class="card-title">{{ t('dashboard.wifi') }}</h2>
    <div class="wifi-container">
      <div class="wifi-band">
        <h3 class="band-title">2.4 GHz</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">{{ t('dashboard.status') }}</span>
            <span class="status-badge" :class="{ active: wifiData.wlan0.status === 'Up' }">
              {{ wifiData.wlan0.status }}
            </span>
          </div>
          <div class="info-item">
            <span class="label">{{ t('dashboard.clients') }}</span>
            <span class="value">{{ wifiData.wlan0.clients }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ t('dashboard.received') }}</span>
            <span class="value">{{ wifiData.wlan0.rxBytes }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ t('dashboard.sent') }}</span>
            <span class="value">{{ wifiData.wlan0.txBytes }}</span>
          </div>
        </div>
      </div>

      <div class="wifi-band">
        <h3 class="band-title">5 GHz</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">{{ t('dashboard.status') }}</span>
            <span class="status-badge" :class="{ active: wifiData.wlan1.status === 'Up' }">
              {{ wifiData.wlan1.status }}
            </span>
          </div>
          <div class="info-item">
            <span class="label">{{ t('dashboard.clients') }}</span>
            <span class="value">{{ wifiData.wlan1.clients }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ t('dashboard.received') }}</span>
            <span class="value">{{ wifiData.wlan1.rxBytes }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ t('dashboard.sent') }}</span>
            <span class="value">{{ wifiData.wlan1.txBytes }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wifi-container {
  display: grid;
  gap: 1.5rem;
}

.wifi-band {
  display: grid;
  gap: 0.5rem;
}

.band-title {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

.info-grid {
  display: grid;
  gap: 0.5rem;
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

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  background-color: #f44336;
  color: white;
}

.status-badge.active {
  background-color: #4caf50;
}

.card-title {
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 1rem 0;
}
</style>