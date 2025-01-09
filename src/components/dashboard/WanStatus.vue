<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import LineChart from '../LineChart.vue';
import { getWanInfo } from '../../services/api/dashboard';

const { t } = useI18n();
const wanData = ref({
  bytesReceived: '0 B/s',
  bytesSent: '0 B/s',
  packetsReceived: '0',
  packetsSent: '0'
});

// Add state for rate calculation
const previousData = ref({
  bytesReceived: 0,
  bytesSent: 0,
  timestamp: 0,
  isFirstCall: true
});

const pollingInterval = ref<number | null>(null);
  type CustomChartData = {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
  }[];
};

const chartData = ref<CustomChartData>({
  labels: [],
  datasets: [
    {
      label: t('dashboard.received'),
      data: [],
      borderColor: '#42A5F5',
      fill: true,
      backgroundColor: 'rgba(66, 165, 245, 0.2)'
    },
    {
      label: t('dashboard.sent'),
      data: [],
      borderColor: '#FFA726',
      fill: true,
      backgroundColor: 'rgba(255, 167, 38, 0.2)'
    }
  ]
});

// Function to format bytes/s to appropriate unit
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

const fetchWanData = async () => {
  try {
    const response = await getWanInfo();
    const currentTime = Date.now();

    // Skip rate calculation on first call
    if (previousData.value.isFirstCall) {
      previousData.value = {
        bytesReceived: response.BytesReceived,
        bytesSent: response.BytesSent,
        timestamp: currentTime,
        isFirstCall: false
      };
      return;
    }

    const timeDiff = (currentTime - previousData.value.timestamp) / 1000; // Convert to seconds

    // Calculate rates
    const rxRate = (response.BytesReceived - previousData.value.bytesReceived) / timeDiff;
    const txRate = (response.BytesSent - previousData.value.bytesSent) / timeDiff;

    // Update display data with rates
    wanData.value = {
      bytesReceived: formatSpeed(rxRate),
      bytesSent: formatSpeed(txRate),
      packetsReceived: `${(response.PacketsReceived / 1024).toFixed(2)} kP`,
      packetsSent: `${(response.PacketsSent / 1024).toFixed(2)} kP`,
    };

    // Update chart with rates in KB/s
    updateChartData(rxRate / 1024, txRate / 1024);

    // Store current values for next calculation
    previousData.value = {
      bytesReceived: response.BytesReceived,
      bytesSent: response.BytesSent,
      timestamp: currentTime,
      isFirstCall: false
    };
  } catch (error) {
    console.error('Error fetching WAN data:', error);
  }
};

const updateChartData = (received: number, sent: number) => {
  const currentTime = new Date().toLocaleTimeString();

  chartData.value = {
    labels: [...chartData.value.labels, currentTime].slice(-10),
    datasets: [
      {
        ...chartData.value.datasets[0],
        label: t('dashboard.received'),
        data: [...chartData.value.datasets[0].data, received].slice(-10)
      },
      {
        ...chartData.value.datasets[1],
        label: t('dashboard.sent'),
        data: [...chartData.value.datasets[1].data, sent].slice(-10)
      }
    ]
  };
};

onMounted(() => {
  if (!pollingInterval.value) {
    fetchWanData();
    pollingInterval.value = window.setInterval(fetchWanData, 5000);
  }
});

onUnmounted(() => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
    pollingInterval.value = null;
  }
});
</script>

<template>
  <div class="wan-status">
    <h2 class="card-title">{{ t('dashboard.wan') }} {{ t('dashboard.status') }}</h2>
    <div class="info-grid">
      <div class="info-item">
        <span class="label">{{ t('dashboard.received') }}</span>
        <span class="value">{{ wanData.bytesReceived }}</span>
      </div>
      <div class="info-item">
        <span class="label">{{ t('dashboard.sent') }}</span>
        <span class="value">{{ wanData.bytesSent }}</span>
      </div>
    </div>
    <div class="chart-container">
      <LineChart :chart-data="chartData" />
    </div>
  </div>
</template>

<style scoped>
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

.chart-container {
  margin-top: 2rem;
}

.card-title {
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 1rem 0;
}
</style>