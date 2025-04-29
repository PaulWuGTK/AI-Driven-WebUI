<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import type { SystemStatsResponse, FormattedThroughputData, ThroughputType, WifiBand, ChartDataSeries } from '../../types/systemStats';
import { getSystemStats } from '../../services/api/systemStats';
import ThroughputChart from '../../components/ThroughputChart.vue';
import { calculateDataRate, prepareChartData, determineYAxisUnit, convertToUnit } from '../../utils/throughputUtils';

const { t } = useI18n();

// State variables
const activeTab = ref<ThroughputType>('WAN');
const selectedWanInterface = ref<string>('');
const selectedWifiBand = ref<WifiBand>('2.4G');
const loading = ref(true);
const error = ref<string | null>(null);

// Data storage
const wanInterfaces = ref<string[]>([]);
const wanData = ref<Map<string, FormattedThroughputData[]>>(new Map());
const lanData = ref<Map<string, FormattedThroughputData[]>>(new Map());
const wifiData = ref<Map<WifiBand, FormattedThroughputData[]>>(new Map());

// Polling interval
const pollingInterval = ref<number | null>(null);
const lastPollTime = ref<number>(Date.now());
const POLL_INTERVAL_MS = 2000; // 2 seconds
const MAX_DATA_POINTS = 30; // 1 minute of data at 2-second intervals

// Chart data
const wanChartData = ref<ChartDataSeries>({
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
});

const lanChartData = ref<ChartDataSeries>({
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
});

const wifiChartData = ref<ChartDataSeries>({
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
});

// Y-axis units
const wanUnit = ref('Mbps');
const lanUnit = ref('Mbps');
const wifiUnit = ref('Mbps');

// Fetch data and update charts
const fetchAndUpdateData = async () => {
  try {
    const now = Date.now();
    const intervalSeconds = (now - lastPollTime.value) / 1000;
    lastPollTime.value = now;
    
    const response = await getSystemStats();
    
    // Process WAN data
    response.StatusSystemStat.WAN.forEach(wan => {
      const interfaceName = wan.interface || 'unknown';
      
      // Initialize interface data if not exists
      if (!wanData.value.has(interfaceName)) {
        wanData.value.set(interfaceName, []);
        
        // Set first interface as selected if none selected
        if (!selectedWanInterface.value) {
          selectedWanInterface.value = interfaceName;
        }
      }
      
      const interfaceData = wanData.value.get(interfaceName) || [];
      const currentData = {
        rx: Number(wan.Receive),
        tx: Number(wan.Sent),
        timestamp: now,
        interface: interfaceName
      };
      
      const previousData = interfaceData.length > 0 ? interfaceData[interfaceData.length - 1] : null;
      const dataRate = calculateDataRate(
        { rx: currentData.rx, tx: currentData.tx },
        previousData ? { rx: previousData.rx, tx: previousData.tx } : null,
        intervalSeconds
      );
      
      interfaceData.push({
        ...currentData,
        rx: dataRate.rx,
        tx: dataRate.tx
      });
      
      // Limit data points
      if (interfaceData.length > MAX_DATA_POINTS) {
        interfaceData.shift();
      }
      
      wanData.value.set(interfaceName, interfaceData);
    });
    
    // Update WAN interfaces list
    wanInterfaces.value = Array.from(wanData.value.keys());
    
    // Process LAN data
    response.StatusSystemStat.LAN.forEach(lan => {
      const interfaceName = lan.interface || 'unknown';
      
      // Initialize interface data if not exists
      if (!lanData.value.has(interfaceName)) {
        lanData.value.set(interfaceName, []);
      }
      
      const interfaceData = lanData.value.get(interfaceName) || [];
      const currentData = {
        rx: Number(lan.Receive),
        tx: Number(lan.Sent),
        timestamp: now,
        interface: interfaceName
      };
      
      const previousData = interfaceData.length > 0 ? interfaceData[interfaceData.length - 1] : null;
      const dataRate = calculateDataRate(
        { rx: currentData.rx, tx: currentData.tx },
        previousData ? { rx: previousData.rx, tx: previousData.tx } : null,
        intervalSeconds
      );
      
      interfaceData.push({
        ...currentData,
        rx: dataRate.rx,
        tx: dataRate.tx
      });
      
      // Limit data points
      if (interfaceData.length > MAX_DATA_POINTS) {
        interfaceData.shift();
      }
      
      lanData.value.set(interfaceName, interfaceData);
    });
    
    // Process WiFi data
    const wifiBands: { key: WifiBand; data: { Receive: string; Sent: string } }[] = [
      { key: '2.4G', data: response.StatusSystemStat.WiFi.wifi2g },
      { key: '5G', data: response.StatusSystemStat.WiFi.wifi5g },
      { key: '6G', data: response.StatusSystemStat.WiFi.wifi6g }
    ];
    
    wifiBands.forEach(({ key, data }) => {
      // Initialize band data if not exists
      if (!wifiData.value.has(key)) {
        wifiData.value.set(key, []);
      }
      
      const bandData = wifiData.value.get(key) || [];
      const currentData = {
        rx: Number(data.Receive),
        tx: Number(data.Sent),
        timestamp: now,
        interface: key
      };
      
      const previousData = bandData.length > 0 ? bandData[bandData.length - 1] : null;
      const dataRate = calculateDataRate(
        { rx: currentData.rx, tx: currentData.tx },
        previousData ? { rx: previousData.rx, tx: previousData.tx } : null,
        intervalSeconds
      );
      
      bandData.push({
        ...currentData,
        rx: dataRate.rx,
        tx: dataRate.tx
      });
      
      // Limit data points
      if (bandData.length > MAX_DATA_POINTS) {
        bandData.shift();
      }
      
      wifiData.value.set(key, bandData);
    });
    
    // Update chart data
    updateChartData();
    
    loading.value = false;
    error.value = null;
  } catch (err) {
    console.error('Error fetching system stats:', err);
    error.value = 'Failed to fetch system statistics';
    loading.value = false;
  }
};

// Update chart data based on selected interfaces/bands
const updateChartData = () => {
  // Update WAN chart
  if (selectedWanInterface.value && wanData.value.has(selectedWanInterface.value)) {
    const interfaceData = wanData.value.get(selectedWanInterface.value) || [];
    
    // Determine appropriate unit based on data
    const dataRates = interfaceData.map(point => ({ rx: point.rx, tx: point.tx }));
    wanUnit.value = determineYAxisUnit(dataRates);
    
    // Convert data to the determined unit
    const convertedData = interfaceData.map(point => ({
      ...point,
      rx: convertToUnit(point.rx, wanUnit.value),
      tx: convertToUnit(point.tx, wanUnit.value)
    }));
    
    wanChartData.value = prepareChartData(convertedData);
  }
  
  // Update LAN chart (if enabled)
  if (lanData.value.size > 0) {
    const firstInterface = Array.from(lanData.value.keys())[0];
    const interfaceData = lanData.value.get(firstInterface) || [];
    
    // Determine appropriate unit based on data
    const dataRates = interfaceData.map(point => ({ rx: point.rx, tx: point.tx }));
    lanUnit.value = determineYAxisUnit(dataRates);
    
    // Convert data to the determined unit
    const convertedData = interfaceData.map(point => ({
      ...point,
      rx: convertToUnit(point.rx, lanUnit.value),
      tx: convertToUnit(point.tx, lanUnit.value)
    }));
    
    lanChartData.value = prepareChartData(convertedData);
  }
  
  // Update WiFi chart
  if (wifiData.value.has(selectedWifiBand.value)) {
    const bandData = wifiData.value.get(selectedWifiBand.value) || [];
    
    // Determine appropriate unit based on data
    const dataRates = bandData.map(point => ({ rx: point.rx, tx: point.tx }));
    wifiUnit.value = determineYAxisUnit(dataRates);
    
    // Convert data to the determined unit
    const convertedData = bandData.map(point => ({
      ...point,
      rx: convertToUnit(point.rx, wifiUnit.value),
      tx: convertToUnit(point.tx, wifiUnit.value)
    }));
    
    wifiChartData.value = prepareChartData(convertedData);
  }
};

// Watch for changes in selected interface/band
watchEffect(() => {
  updateChartData();
});

// Start polling on mount
onMounted(() => {
  fetchAndUpdateData();
  pollingInterval.value = window.setInterval(fetchAndUpdateData, POLL_INTERVAL_MS);
});

// Clean up on unmount
onUnmounted(() => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
  }
});
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">{{ t('systemStats.title') }}</h1>

    <div class="status-content">
      <div class="panel-section">
        <div class="tab-navigation">
          <button
            class="tab-button"
            :class="{ active: activeTab === 'WAN' }"
            @click="activeTab = 'WAN'"
          >
            {{ t('systemStats.wanThroughput') }}
          </button>
          <button
            class="tab-button"
            :class="{ active: activeTab === 'LAN', disabled: true }"
            v-if="false"
          >
            {{ t('systemStats.lanThroughput') }}
          </button>
          <button
            class="tab-button"
            :class="{ active: activeTab === 'WiFi' }"
            @click="activeTab = 'WiFi'"
          >
            {{ t('systemStats.wifiThroughput') }}
          </button>
        </div>

        <div class="tab-content">
          <div v-if="loading && !wanData.size && !wifiData.size" class="loading-state">
            <div class="loading-spinner"></div>
            <span>Loading...</span>
          </div>

          <div v-else-if="error" class="error-state">
            {{ error }}
          </div>

          <template v-else>
            <!-- WAN Throughput Tab -->
            <div v-if="activeTab === 'WAN'" class="throughput-content">
              <div class="header-row">
                <h2 class="section-title">{{ t('systemStats.wanThroughput') }}</h2>
                <div class="interface-selector">
                  <select v-model="selectedWanInterface">
                    <option v-for="iface in wanInterfaces" :key="iface" :value="iface">
                      {{ iface }}
                    </option>
                  </select>
                </div>
              </div>

              <ThroughputChart
                :chart-data="wanChartData"
                :title="selectedWanInterface"
                :label-tx="t('systemStats.tx')"
                :label-rx="t('systemStats.rx')"
                :unit="wanUnit"
              />
            </div>

            <!-- WiFi Throughput Tab -->
            <div v-if="activeTab === 'WiFi'" class="throughput-content">
              <div class="header-row">
                <h2 class="section-title">{{ t('systemStats.wifiThroughput') }}</h2>
                <div class="interface-selector">
                  <select v-model="selectedWifiBand">
                    <option value="2.4G">2.4G</option>
                    <option value="5G">5G</option>
                    <option value="6G">6G</option>
                  </select>
                </div>
              </div>

              <ThroughputChart
                :chart-data="wifiChartData"
                :title="selectedWifiBand"
                :label-tx="t('systemStats.tx')"
                :label-rx="t('systemStats.rx')"
                :unit="wifiUnit"
              />
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.throughput-content {
  padding: 1.5rem;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.2rem;
  color: var(--text-primary);
  margin: 0;
}

.interface-selector select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: white;
  min-width: 150px;
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

.tab-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .throughput-content {
    padding: 1rem;
  }

  .header-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .interface-selector select {
    width: 100%;
  }
}
</style>