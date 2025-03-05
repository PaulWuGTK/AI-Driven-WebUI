<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DashboardWiFi } from '../../types/dashboard';
import LineChart from '../LineChart.vue';

const { t } = useI18n();

const props = defineProps<{
  wifiInfo?: DashboardWiFi;
}>();

// Store previous values and timestamps
const previousValues = ref<{
  '2_4GHz': { bytesReceived: number; bytesSent: number; };
  '5GHz': { bytesReceived: number; bytesSent: number; };
  '6GHz': { bytesReceived: number; bytesSent: number; };
  timestamp: number;
  isFirstCall: boolean;
} | null>(null);

// Keep track of rates for the chart
const band24Rates = ref<number[]>([]);
const band5Rates = ref<number[]>([]);
const band6Rates = ref<number[]>([]);
const band24SentRates = ref<number[]>([]);
const band5SentRates = ref<number[]>([]);
const band6SentRates = ref<number[]>([]);
const timeLabels = ref<string[]>([]);
const maxDataPoints = 10;

// Watch for changes in wifiInfo and calculate rates
watch(() => props.wifiInfo, (newInfo) => {
  if (!newInfo) return;

  const currentTime = Date.now();

  if (!previousValues.value) {
    previousValues.value = {
      '2_4GHz': { bytesReceived: newInfo['2_4GHz'].BytesReceived, bytesSent: newInfo['2_4GHz'].BytesSent },
      '5GHz': { bytesReceived: newInfo['5GHz'].BytesReceived, bytesSent: newInfo['5GHz'].BytesSent },
      '6GHz': { bytesReceived: newInfo['6GHz'].BytesReceived, bytesSent: newInfo['6GHz'].BytesSent },
      timestamp: currentTime,
      isFirstCall: true
    };
    return;
  }

  const timeDiff = Math.max((currentTime - previousValues.value.timestamp) / 1000, 0.001);

  const diffs = {
    '2_4GHz': {
      received: newInfo['2_4GHz'].BytesReceived - previousValues.value['2_4GHz'].bytesReceived,
      sent: newInfo['2_4GHz'].BytesSent - previousValues.value['2_4GHz'].bytesSent
    },
    '5GHz': {
      received: newInfo['5GHz'].BytesReceived - previousValues.value['5GHz'].bytesReceived,
      sent: newInfo['5GHz'].BytesSent - previousValues.value['5GHz'].bytesSent
    },
    '6GHz': {
      received: newInfo['6GHz'].BytesReceived - previousValues.value['6GHz'].bytesReceived,
      sent: newInfo['6GHz'].BytesSent - previousValues.value['6GHz'].bytesSent
    }
  };

  // Update rates, only add new data when diff > 0
  const wifiBands = ['2_4GHz', '5GHz', '6GHz'] as const;

  wifiBands.forEach((band) => {
    let receivedRate = diffs[band].received / timeDiff;
    let sentRate = diffs[band].sent / timeDiff;

    if (band === '2_4GHz') {
      band24Rates.value.push(receivedRate);
      band24SentRates.value.push(sentRate);
    }
    if (band === '5GHz') {
      band5Rates.value.push(receivedRate);
      band5SentRates.value.push(sentRate);
    }
    if (band === '6GHz') {
      band6Rates.value.push(receivedRate);
      band6SentRates.value.push(sentRate);
    }
  });

  // Format time using 24-hour format
  const timeLabel = new Date().toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  timeLabels.value.push(timeLabel);

  if (band24Rates.value.length > maxDataPoints) {
    band24Rates.value.shift();
    band5Rates.value.shift();
    band6Rates.value.shift();
    timeLabels.value.shift();
  }

  // Only update previousValues when data actually changes
  if (Object.values(diffs).some(diff => diff.received > 0 || diff.sent > 0)) {
    previousValues.value = {
      '2_4GHz': { bytesReceived: newInfo['2_4GHz'].BytesReceived, bytesSent: newInfo['2_4GHz'].BytesSent },
      '5GHz': { bytesReceived: newInfo['5GHz'].BytesReceived, bytesSent: newInfo['5GHz'].BytesSent },
      '6GHz': { bytesReceived: newInfo['6GHz'].BytesReceived, bytesSent: newInfo['6GHz'].BytesSent },
      timestamp: currentTime,
      isFirstCall: false
    };
  }
}, { immediate: true });

const chartData = computed(() => ({
  labels: timeLabels.value,
  datasets: [
    {
      label: '2.4GHz',
      data: band24Rates.value.map(rate => Math.max(0, rate / (1024 * 1024))),
      borderColor: '#42A5F5',
      backgroundColor: 'rgba(66, 165, 245, 0.2)',
      fill: true
    },
    {
      label: '5GHz',
      data: band5Rates.value.map(rate => Math.max(0, rate / (1024 * 1024))),
      borderColor: '#FFA726',
      backgroundColor: 'rgba(255, 167, 38, 0.2)',
      fill: true
    },
    {
      label: '6GHz',
      data: band6Rates.value.map(rate => Math.max(0, rate / (1024 * 1024))),
      borderColor: '#66BB6A',
      backgroundColor: 'rgba(102, 187, 106, 0.2)',
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

const getCurrentRates = (band: keyof DashboardWiFi) => {
  if (!previousValues.value || !props.wifiInfo || previousValues.value.isFirstCall) {
    return { received: 0, sent: 0 };
  }

  const timeDiff = Math.max((Date.now() - previousValues.value.timestamp) / 1000, 0.001);
  const receivedDiff = props.wifiInfo[band].BytesReceived - previousValues.value[band].bytesReceived;
  const sentDiff = props.wifiInfo[band].BytesSent - previousValues.value[band].bytesSent;

  let receivedRate = receivedDiff / timeDiff;
  let sentRate = sentDiff / timeDiff;

  // Use stored rates for each band when there's no new data
  if (band === '2_4GHz' && band24Rates.value.length > 0) receivedRate = band24Rates.value[band24Rates.value.length - 1];
  if (band === '2_4GHz' && band24SentRates.value.length > 0) sentRate = band24SentRates.value[band24SentRates.value.length - 1];

  if (band === '5GHz' && band5Rates.value.length > 0) receivedRate = band5Rates.value[band5Rates.value.length - 1];
  if (band === '5GHz' && band5SentRates.value.length > 0) sentRate = band5SentRates.value[band5SentRates.value.length - 1];

  if (band === '6GHz' && band6Rates.value.length > 0) receivedRate = band6Rates.value[band6Rates.value.length - 1];
  if (band === '6GHz' && band6SentRates.value.length > 0) sentRate = band6SentRates.value[band6SentRates.value.length - 1];

  return {
    received: Math.max(0, receivedRate),
    sent: Math.max(0, sentRate)
  };
};
</script>

<template>
  <div class="wifi-status" v-if="wifiInfo">
    <h2 class="card-title">{{ t('dashboard.wifi') }}</h2>
    <div class="info-grid">
      <div class="band-info">
        <div class="band-title">2.4GHz</div>
        <div class="traffic-info">
          <div class="traffic-item">
            <span class="label">{{ t('dashboard.received') }}</span>
            <span class="value">{{ formatRate(getCurrentRates('2_4GHz').received) }}</span>
          </div>
          <div class="traffic-item">
            <span class="label">{{ t('dashboard.sent') }}</span>
            <span class="value">{{ formatRate(getCurrentRates('2_4GHz').sent) }}</span>
          </div>
        </div>
      </div>
      <div class="band-info">
        <div class="band-title">5GHz</div>
        <div class="traffic-info">
          <div class="traffic-item">
            <span class="label">{{ t('dashboard.received') }}</span>
            <span class="value">{{ formatRate(getCurrentRates('5GHz').received) }}</span>
          </div>
          <div class="traffic-item">
            <span class="label">{{ t('dashboard.sent') }}</span>
            <span class="value">{{ formatRate(getCurrentRates('5GHz').sent) }}</span>
          </div>
        </div>
      </div>
      <div class="band-info">
        <div class="band-title">6GHz</div>
        <div class="traffic-info">
          <div class="traffic-item">
            <span class="label">{{ t('dashboard.received') }}</span>
            <span class="value">{{ formatRate(getCurrentRates('6GHz').received) }}</span>
          </div>
          <div class="traffic-item">
            <span class="label">{{ t('dashboard.sent') }}</span>
            <span class="value">{{ formatRate(getCurrentRates('6GHz').sent) }}</span>
          </div>
        </div>
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