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
  },
  wlan2: {
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

    // 獲取 2.4GHz 和 5GHz 的流量數據
    const wlan0 = response.find((item: any) => 
      item.path === 'Device.WiFi.SSID.1.Stats.')?.parameters;  // 修正 path
    const wlan1 = response.find((item: any) => 
      item.path === 'Device.WiFi.SSID.4.Stats.')?.parameters;
    const wlan2 = response.find((item: any) => 
      item.path === 'Device.WiFi.SSID.7.Stats.')?.parameters;

    // 獲取 clients 數量 (通過 AccessPoint 提取)
    const ap0 = response.find((item: any) =>
      item.path === 'Device.WiFi.AccessPoint.1.')?.parameters;
    const ap1 = response.find((item: any) =>
      item.path === 'Device.WiFi.AccessPoint.3.')?.parameters;
    const ap2 = response.find((item: any) =>
      item.path === 'Device.WiFi.AccessPoint.5.')?.parameters;
    // 更新 2.4GHz WiFi 狀態
    if (wlan0) {
      wifiData.value.wlan0 = {
        status: ap0?.Enable ? 'Up' : 'Down',
        clients: ap0?.ActiveAssociatedDeviceNumberOfEntries || 0,
        rxBytes: formatBytes(wlan0.BytesReceived || 0),
        txBytes: formatBytes(wlan0.BytesSent || 0)
      };
    }

    // 更新 5GHz WiFi 狀態
    if (wlan1) {
      wifiData.value.wlan1 = {
        status: ap1?.Enable ? 'Up' : 'Down',
        clients: ap1?.ActiveAssociatedDeviceNumberOfEntries || 0,
        rxBytes: formatBytes(wlan1.BytesReceived || 0),
        txBytes: formatBytes(wlan1.BytesSent || 0)
      };
    }

    // 更新 6GHz WiFi 狀態
    if (wlan2) {
      wifiData.value.wlan2 = {
        status: ap2?.Enable ? 'Up' : 'Down',
        clients: ap2?.ActiveAssociatedDeviceNumberOfEntries || 0,
        rxBytes: formatBytes(wlan2.BytesReceived || 0),
        txBytes: formatBytes(wlan2.BytesSent || 0)
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
      <!-- 2.4GHz WiFi 狀態 -->
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

      <!-- 5GHz WiFi 狀態 -->
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

      
      <!-- 6Hz WiFi 狀態 -->
      <div class="wifi-band">
        <h3 class="band-title">5 GHz</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">{{ t('dashboard.status') }}</span>
            <span class="status-badge" :class="{ active: wifiData.wlan2.status === 'Up' }">
              {{ wifiData.wlan2.status }}
            </span>
          </div>
          <div class="info-item">
            <span class="label">{{ t('dashboard.clients') }}</span>
            <span class="value">{{ wifiData.wlan2.clients }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ t('dashboard.received') }}</span>
            <span class="value">{{ wifiData.wlan2.rxBytes }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ t('dashboard.sent') }}</span>
            <span class="value">{{ wifiData.wlan2.txBytes }}</span>
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