<script setup lang="ts">
import { defineProps, computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DashboardWAN } from '../../types/dashboard';
import LineChart from '../LineChart.vue';

const { t } = useI18n();

const props = defineProps<{
  wanInfo?: DashboardWAN;
}>();

// Store previous values and timestamps
const previousValues = ref<{
  bytesReceived: number;
  bytesSent: number;
  timestamp: number;
  isFirstCall: boolean;
} | null>(null);

// Keep track of rates for the chart
const receivedRates = ref<number[]>([]);
const sentRates = ref<number[]>([]);
const timeLabels = ref<string[]>([]);
const maxDataPoints = 10;

// Watch for changes in wanInfo and calculate rates
watch(() => props.wanInfo, (newInfo) => {
  if (!newInfo) return;

  const currentTime = Date.now();

  if (!previousValues.value) {
    previousValues.value = {
      bytesReceived: newInfo.BytesReceived,
      bytesSent: newInfo.BytesSent,
      timestamp: currentTime,
      isFirstCall: true
    };
    return;
  }

  const timeDiff = Math.max((currentTime - previousValues.value.timestamp) / 1000, 0.001);
  const receivedDiff = newInfo.BytesReceived - previousValues.value.bytesReceived;
  const sentDiff = newInfo.BytesSent - previousValues.value.bytesSent;


  if (receivedDiff > 0 || sentDiff > 0) {
    receivedRates.value.push(receivedDiff / timeDiff);
    sentRates.value.push(sentDiff / timeDiff);
    timeLabels.value.push(new Date().toLocaleTimeString());

    if (receivedRates.value.length > maxDataPoints) {
      receivedRates.value.shift();
      sentRates.value.shift();
      timeLabels.value.shift();
    }

    // **只在數據變動時更新 previousValues，減少不必要的變動**
    previousValues.value = {
      bytesReceived: newInfo.BytesReceived,
      bytesSent: newInfo.BytesSent,
      timestamp: currentTime,
      isFirstCall: false
    };
  }
}, { immediate: true });

const chartData = computed(() => ({
  labels: timeLabels.value,
  datasets: [
    {
      label: t('dashboard.received'),
      data: receivedRates.value.map(rate => Math.max(0, rate / (1024 * 1024))), // Convert to MB/s
      borderColor: '#42A5F5',
      backgroundColor: 'rgba(66, 165, 245, 0.2)',
      fill: true
    },
    {
      label: t('dashboard.sent'),
      data: sentRates.value.map(rate => Math.max(0, rate / (1024 * 1024))), // Convert to MB/s
      borderColor: '#FFA726',
      backgroundColor: 'rgba(255, 167, 38, 0.2)',
      fill: true
    }
  ]
}));

const formatRate = (bytesPerSecond: number): string => {
  if (!isFinite(bytesPerSecond) || bytesPerSecond < 0) return '0 B/s';
  if (bytesPerSecond < 1024) return `${bytesPerSecond.toFixed(1)} B/s`;
  if (bytesPerSecond < 1024 * 1024) return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
  return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
};

const currentRates = computed(() => {
  if (!previousValues.value || !props.wanInfo || previousValues.value.isFirstCall) {
    return { received: 0, sent: 0 };
  }


  const timeDiff = Math.max((Date.now() - previousValues.value.timestamp) / 1000, 0.001);

  const receivedDiff = props.wanInfo.BytesReceived - previousValues.value.bytesReceived;
  const sentDiff = props.wanInfo.BytesSent - previousValues.value.bytesSent;


  // **如果 diff = 0，則維持上一個速率，避免瞬間變 0**
  if (receivedDiff === 0 && receivedRates.value.length > 0) {
    return {
      received: receivedRates.value[receivedRates.value.length - 1], // 保留上一個數據
      sent: sentRates.value[sentRates.value.length - 1]
    };
  }

  return {
    received: Math.max(0, receivedDiff / timeDiff),
    sent: Math.max(0, sentDiff / timeDiff)
  };
});
</script>

<template>
  <div class="wan-status" v-if="wanInfo">
    <h2 class="card-title">{{ t('dashboard.wan') }} {{ t('dashboard.status') }}</h2>
    <div class="info-grid">
      <div class="info-item">
        <span class="label">{{ t('dashboard.received') }}</span>
        <span class="value">{{ formatRate(currentRates.received) }}</span>
      </div>
      <div class="info-item">
        <span class="label">{{ t('dashboard.sent') }}</span>
        <span class="value">{{ formatRate(currentRates.sent) }}</span>
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
  height: 200px;
}

.card-title {
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 1rem 0;
}
</style>