<script setup lang="ts">
import { ref, watchEffect, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type {
  SystemStatsResponse,
  ThroughputType,
  WifiBand,
  ChartDataSeries,
  FormattedThroughputData
} from '../../types/systemStats';
import { getSystemStats } from '../../services/api/systemStats';
import ThroughputChart from '../../components/ThroughputChart.vue';
import {
  prepareChartData,
  determineYAxisUnit,
  convertToUnit
} from '../../utils/throughputUtils';

const { t } = useI18n();

// Data structure to store throughput data points
interface CounterPoint {
  counterRx: number;
  counterTx: number;
  rateRx: number;
  rateTx: number;
  timestamp: number;
  interface: string;
}

// ------------------ reactive state ------------------
const activeTab = ref<ThroughputType>('WAN');
const selectedWanInterface = ref<string>('');
const selectedWifiBand = ref<WifiBand>('2.4G');
const loading = ref(true);
const error = ref<string | null>(null);

// Data storage for different interfaces
const wanData = ref<Map<string, CounterPoint[]>>(new Map());
const lanData = ref<Map<string, CounterPoint[]>>(new Map());
const wifiData = ref<Map<WifiBand, CounterPoint[]>>(new Map());
const wanInterfaces = ref<string[]>([]);

// Configuration constants
const POLL_INTERVAL_MS = 2000;
const MAX_POINTS = 30;
let timer: number | null = null;

// Create empty chart data structure
function createEmptyChartData(): ChartDataSeries {
  return {
    labels: [],
    datasets: [
      {
        label: 'Tx',
        data: [],
        borderColor: 'rgba(0, 112, 187, 1)',
        backgroundColor: 'rgba(0, 112, 187, 0.2)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Rx',
        data: [],
        borderColor: 'rgba(116, 119, 191, 1)',
        backgroundColor: 'rgba(116, 119, 191, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  };
}

// Chart data for different interfaces
const wanChartData = ref<ChartDataSeries>(createEmptyChartData());
const lanChartData = ref<ChartDataSeries>(createEmptyChartData());
const wifiChartData = ref<ChartDataSeries>(createEmptyChartData());

// Units for different interfaces
const wanUnit = ref('Mbps');
const lanUnit = ref('Mbps');
const wifiUnit = ref('Mbps');

// Fetch data and update charts
async function fetchAndUpdate() {
  try {
    const resp: SystemStatsResponse = await getSystemStats();
    const now = Date.now();

    // Process WAN data
    for (const w of resp.StatusSystemStat.WAN) {
      const iface = w.interface || 'unknown';
      if (!wanData.value.has(iface)) wanData.value.set(iface, []);
      const list = wanData.value.get(iface)!;
      const bytesRx = Number(w.Receive);
      const bytesTx = Number(w.Sent);
      const prev = list.at(-1);
      const dt = prev ? (now - prev.timestamp) / 1000 : POLL_INTERVAL_MS / 1000;
      const rateRx = prev ? Math.max(0, bytesRx - prev.counterRx) / dt : 0;
      const rateTx = prev ? Math.max(0, bytesTx - prev.counterTx) / dt : 0;
      list.push({ counterRx: bytesRx, counterTx: bytesTx, rateRx, rateTx, timestamp: now, interface: iface });
      if (list.length > MAX_POINTS) list.shift();
    }
    wanInterfaces.value = Array.from(wanData.value.keys());
    if (!selectedWanInterface.value && wanInterfaces.value.length) selectedWanInterface.value = wanInterfaces.value[0];

    // Process LAN data
    for (const l of resp.StatusSystemStat.LAN) {
      const iface = l.interface || 'unknown';
      if (!lanData.value.has(iface)) lanData.value.set(iface, []);
      const list = lanData.value.get(iface)!;
      const bytesRx = Number(l.Receive);
      const bytesTx = Number(l.Sent);
      const prev = list.at(-1);
      const dt = prev ? (now - prev.timestamp) / 1000 : POLL_INTERVAL_MS / 1000;
      const rateRx = prev ? Math.max(0, bytesRx - prev.counterRx) / dt : 0;
      const rateTx = prev ? Math.max(0, bytesTx - prev.counterTx) / dt : 0;
      list.push({ counterRx: bytesRx, counterTx: bytesTx, rateRx, rateTx, timestamp: now, interface: iface });
      if (list.length > MAX_POINTS) list.shift();
    }

    // Process WiFi data
    const wifiList: [WifiBand, { Receive: string; Sent: string }][] = [
      ['2.4G', resp.StatusSystemStat.WiFi.wifi2g],
      ['5G', resp.StatusSystemStat.WiFi.wifi5g],
      ['6G', resp.StatusSystemStat.WiFi.wifi6g]
    ];
    for (const [band, v] of wifiList) {
      if (!wifiData.value.has(band)) wifiData.value.set(band, []);
      const list = wifiData.value.get(band)!;
      const bytesRx = Number(v.Receive);
      const bytesTx = Number(v.Sent);
      const prev = list.at(-1);
      const dt = prev ? (now - prev.timestamp) / 1000 : POLL_INTERVAL_MS / 1000;
      const rateRx = prev ? Math.max(0, bytesRx - prev.counterRx) / dt : 0;
      const rateTx = prev ? Math.max(0, bytesTx - prev.counterTx) / dt : 0;
      list.push({ counterRx: bytesRx, counterTx: bytesTx, rateRx, rateTx, timestamp: now, interface: band });
      if (list.length > MAX_POINTS) list.shift();
    }

    updateCharts();
    loading.value = false;
    error.value = null;
  } catch (e) {
    console.error(e);
    error.value = 'Failed to fetch system statistics';
    loading.value = false;
  }
}

// Convert data points to formatted throughput data
function convertToFormattedData(list: CounterPoint[], unit: string): FormattedThroughputData[] {
  return list.map(p => ({
    timestamp: p.timestamp,
    rx: convertToUnit(p.rateRx, unit),
    tx: convertToUnit(p.rateTx, unit),
    interface: p.interface
  }));
}

// Update chart data
function updateCharts() {
  // Update WAN chart
  if (selectedWanInterface.value && wanData.value.has(selectedWanInterface.value)) {
    const list = wanData.value.get(selectedWanInterface.value)!;
    wanUnit.value = determineYAxisUnit(list.map(p => ({ rx: p.rateRx, tx: p.rateTx })));
    wanChartData.value = prepareChartData(convertToFormattedData(list, wanUnit.value));
  }
  
  // Update LAN chart (currently hidden in UI)
  if (lanData.value.size) {
    const first = Array.from(lanData.value.keys())[0];
    const list = lanData.value.get(first)!;
    lanUnit.value = determineYAxisUnit(list.map(p => ({ rx: p.rateRx, tx: p.rateTx })));
    lanChartData.value = prepareChartData(convertToFormattedData(list, lanUnit.value));
  }
  
  // Update WiFi chart
  if (wifiData.value.has(selectedWifiBand.value)) {
    const list = wifiData.value.get(selectedWifiBand.value)!;
    wifiUnit.value = determineYAxisUnit(list.map(p => ({ rx: p.rateRx, tx: p.rateTx })));
    wifiChartData.value = prepareChartData(convertToFormattedData(list, wifiUnit.value));
  }
}

// Watch for changes to update charts
watchEffect(updateCharts);

// Lifecycle hooks
onMounted(() => {
  fetchAndUpdate();
  timer = window.setInterval(fetchAndUpdate, POLL_INTERVAL_MS);
});

onUnmounted(() => {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
});
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">{{ t('systemStats.title') }}</h1>
    <div class="status-content">
      <div class="panel-section">
        <!-- Navigation Tabs -->
        <div class="tab-navigation">
          <button
            class="tab-button"
            :class="{ active: activeTab === 'WAN' }"
            @click="activeTab = 'WAN'"
          >
            {{ t('systemStats.wanThroughput') }}
          </button>

          <!-- LAN tab hidden for now -->
          <!-- <button class="tab-button" :class="{ active: activeTab === 'LAN' }" @click="activeTab = 'LAN'">
            {{ t('systemStats.lanThroughput') }}
          </button> -->

          <button
            class="tab-button"
            :class="{ active: activeTab === 'WiFi' }"
            @click="activeTab = 'WiFi'"
          >
            {{ t('systemStats.wifiThroughput') }}
          </button>
        </div>

        <div class="tab-content">
          <!-- Loading and Error States -->
          <div v-if="loading && !wanData.size && !wifiData.size" class="loading-state">
            <div class="loading-spinner"></div>
            <span>Loading...</span>
          </div>
          
          <div v-else-if="error" class="error-state">
            {{ error }}
          </div>

          <!-- WAN Throughput Tab -->
          <template v-else-if="activeTab === 'WAN'">
            <div class="chart-header">
              <h2>{{ t('systemStats.wanThroughput') }}</h2>
              <select v-model="selectedWanInterface" class="interface-select">
                <option v-for="iface in wanInterfaces" :key="iface" :value="iface">
                  {{ iface }}
                </option>
              </select>
            </div>
            <ThroughputChart
              :chart-data="wanChartData"
              :title="selectedWanInterface"
              :label-tx="t('systemStats.tx')"
              :label-rx="t('systemStats.rx')"
              :unit="wanUnit"
            />
          </template>

          <!-- WiFi Throughput Tab -->
          <template v-else-if="activeTab === 'WiFi'">
            <div class="chart-header">
              <h2>{{ t('systemStats.wifiThroughput') }}</h2>
              <select v-model="selectedWifiBand" class="interface-select">
                <option value="2.4G">2.4G</option>
                <option value="5G">5G</option>
                <option value="6G">6G</option>
              </select>
            </div>
            <ThroughputChart
              :chart-data="wifiChartData"
              :title="selectedWifiBand"
              :label-tx="t('systemStats.tx')"
              :label-rx="t('systemStats.rx')"
              :unit="wifiUnit"
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
}

.chart-header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--text-primary);
}

.interface-select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: white;
  min-width: 150px;
  font-size: 0.9rem;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-state {
  padding: 2rem;
  text-align: center;
  color: #dc3545;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
  }

  .interface-select {
    width: 100%;
  }
}
</style>