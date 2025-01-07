<script setup lang="ts">
import { ref, onMounted, onUnmounted, toRaw } from 'vue';
import { getWanInfo } from '../../services/api/dashboard';
import LineChart from '../LineChart.vue';

const wanData = ref({
  bytesReceived: '0',
  bytesSent: '0',
  packetsReceived: '0',
  packetsSent: '0'
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
      label: 'Bytes Received',
      data: [],
      borderColor: '#42A5F5',
      fill: true,
      backgroundColor: 'rgba(66, 165, 245, 0.2)'
    },
    {
      label: 'Bytes Sent',
      data: [],
      borderColor: '#FFA726',
      fill: true,
      backgroundColor: 'rgba(255, 167, 38, 0.2)'
    }
  ]
});

// 獲取 WAN 數據
const fetchWanData = async () => {
  try {
    const response = await getWanInfo();
    wanData.value = {
      bytesReceived: `${(response.BytesReceived / 1024).toFixed(2)} kB`,
      bytesSent: `${(response.BytesSent / 1024).toFixed(2)} kB`,
      packetsReceived: `${(response.PacketsReceived / 1024).toFixed(2)} kB`,
      packetsSent: `${(response.PacketsSent / 1024).toFixed(2)} kB`,
    };

    updateChartData(response.BytesReceived/1024, response.BytesSent/1024);
  } catch (error) {
    console.error('Error fetching WAN data:', error);
  }
};

// 更新圖表數據
const updateChartData = (received: number, sent: number) => {
  const currentTime = new Date().toLocaleTimeString();

  // 創建新數組，避免直接對 ref 內部數據進行操作
  chartData.value = {
    labels: [...chartData.value.labels, currentTime].slice(-10),
    datasets: [
      {
        ...chartData.value.datasets[0],
        data: [...chartData.value.datasets[0].data, received].slice(-10)
      },
      {
        ...chartData.value.datasets[1],
        data: [...chartData.value.datasets[1].data, sent].slice(-10)
      }
    ]
  };
};

// 組件掛載時啟動輪詢
onMounted(() => {
  if (!pollingInterval.value) {
    fetchWanData();
    pollingInterval.value = window.setInterval(fetchWanData, 5000);
  }
});

// 組件卸載時清除輪詢
onUnmounted(() => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
    pollingInterval.value = null;
  }
});
</script>

<template>
  <div class="wan-status">
    <h2 class="card-title">WAN Traffic</h2>
    <div class="info-grid">
      <div class="info-item">
        <span class="label">Bytes Received</span>
        <span class="value">{{ wanData.bytesReceived }}</span>
      </div>
      <div class="info-item">
        <span class="label">Bytes Sent</span>
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
