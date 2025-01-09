<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getWifiInfo } from '../../services/api/dashboard';
import LineChart from '../LineChart.vue';

const { t } = useI18n();

interface BandData {
  bytesReceived: number;
  bytesSent: number;
  rxRate: number;
  txRate: number;
  lastTimestamp: number;
}

interface ChartDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  fill: boolean;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

const wifiData = ref<{ [key: string]: BandData }>({
  '2.4GHz': { bytesReceived: 0, bytesSent: 0, rxRate: 0, txRate: 0, lastTimestamp: Date.now() / 1000 },
  '5GHz': { bytesReceived: 0, bytesSent: 0, rxRate: 0, txRate: 0, lastTimestamp: Date.now() / 1000 },
  '6GHz': { bytesReceived: 0, bytesSent: 0, rxRate: 0, txRate: 0, lastTimestamp: Date.now() / 1000 }
});

const pollingInterval = ref<number | null>(null);

const chartData = ref<ChartData>({
  labels: [],
  datasets: [
    {
      label: t('dashboard.received'),
      data: [],
      borderColor: '#42A5F5',
      backgroundColor: 'rgba(66, 165, 245, 0.2)',
      fill: true
    },
    {
      label: t('dashboard.sent'),
      data: [],
      borderColor: '#FFA726',
      backgroundColor: 'rgba(255, 167, 38, 0.2)',
      fill: true
    }
  ]
});

const formatSpeed = (bytesPerSecond: number): string => {
  if (bytesPerSecond < 0) return '0 B/s';
  if (bytesPerSecond < 1024) {
    return `${bytesPerSecond.toFixed(1)} B/s`;
  } else if (bytesPerSecond < 1024 * 1024) {
    return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
  } else {
    return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
  }
};

const calculateRate = (currentBytes: number, lastBytes: number, timeDiff: number): number => {
  return timeDiff > 0 ? (currentBytes - lastBytes) / timeDiff : 0;
};

const updateChartData = (totalRx: number, totalTx: number) => {
  const currentTime = new Date().toLocaleTimeString();
  
  chartData.value = {
    labels: [...chartData.value.labels, currentTime].slice(-10),
    datasets: [
      {
        ...chartData.value.datasets[0],
        data: [...chartData.value.datasets[0].data, totalRx / 1024].slice(-10)
      },
      {
        ...chartData.value.datasets[1],
        data: [...chartData.value.datasets[1].data, totalTx / 1024].slice(-10)
      }
    ]
  };
};

interface WifiResponse {
  parameters: {
    OperatingFrequencyBand?: string;
    BytesReceived?: number;
    BytesSent?: number;
  };
  path: string;
}

const fetchWifiData = async () => {
  try {
    const response = await getWifiInfo() as WifiResponse[];
    
    const currentTime = Date.now() / 1000;

    let totalRxRate = 0;
    let totalTxRate = 0;

    response.forEach((item: WifiResponse) => {
      if (item.parameters?.OperatingFrequencyBand) {
        const band = item.parameters.OperatingFrequencyBand;
        const statsPath = item.path.replace(/(^Device\.WiFi\.Radio\.\d+)/, '$1.Stats');
        const stats = response.find(s => s.path === statsPath);
        if (stats?.parameters) {
          const currentRx = stats.parameters.BytesReceived || 0;
          const currentTx = stats.parameters.BytesSent || 0;
          const lastData = wifiData.value[band];
          
          if (lastData) {
            const timeDiff = currentTime - lastData.lastTimestamp;
            const rxRate = calculateRate(currentRx, lastData.bytesReceived, timeDiff);
            const txRate = calculateRate(currentTx, lastData.bytesSent, timeDiff);

            wifiData.value[band] = {
              bytesReceived: currentRx,
              bytesSent: currentTx,
              rxRate,
              txRate,
              lastTimestamp: currentTime
            };

            totalRxRate += rxRate;
            totalTxRate += txRate;
          }
        }
      }
    });

    updateChartData(totalRxRate, totalTxRate);
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
      <div class="wifi-info">
        <div v-for="(data, band) in wifiData" :key="band" class="band-info">
          <div class="band-title">{{ band }}</div>
          <div class="traffic-info">
            <div class="traffic-item">
              <span class="label">{{ t('dashboard.received') }}</span>
              <span class="value">{{ formatSpeed(data.rxRate) }}</span>
            </div>
            <div class="traffic-item">
              <span class="label">{{ t('dashboard.sent') }}</span>
              <span class="value">{{ formatSpeed(data.txRate) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="chart-container">
        <LineChart :chart-data="chartData" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.wifi-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.wifi-info {
  display: grid;
  gap: 1rem;
}

.band-info {
  padding: 1rem;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.band-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 0.5rem;
}

.traffic-info {
  display: grid;
  gap: 0.5rem;
}

.traffic-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  color: #666;
  font-size: 0.9rem;
}

.value {
  color: #333;
  font-weight: 500;
}

.chart-container {
  margin-top: 1rem;
  height: 200px;
}

.card-title {
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 1rem 0;
}
</style>