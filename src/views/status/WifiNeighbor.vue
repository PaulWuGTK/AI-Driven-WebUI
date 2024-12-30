<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WifiNeighborResponse, WifiNeighborInfo } from '../../types/wifiNeighbor';
import { getWifiNeighbors, scanWifiNeighbors } from '../../services/api';

const { t } = useI18n();
const wifiNeighborData = ref<WifiNeighborResponse | null>(null);
const neighborResults = ref<WifiNeighborInfo[]>([]);
const loading = ref<{ [key: string]: boolean }>({
  '2': false,
  '5': false,
  '6': false
});

const fetchWifiNeighbors = async () => {
  try {
    wifiNeighborData.value = await getWifiNeighbors();
  } catch (error) {
    console.error('Error fetching WiFi neighbors:', error);
  }
};

const handleScan = async (band: string) => {
  if (loading.value[band]) return;
  
  loading.value[band] = true;
  try {
    const response = await scanWifiNeighbors(band);
    if (response.WifiNeighbor) {
      neighborResults.value = response.WifiNeighbor;
    }
  } catch (error) {
    console.error(`Error scanning ${band}G band:`, error);
  } finally {
    loading.value[band] = false;
  }
};

onMounted(fetchWifiNeighbors);
</script>

<template>
  <div class="wifi-neighbor">
    <h1 class="page-title">{{ t('wifiNeighbor.title') }}</h1>

    <div class="neighbor-content">
      <!-- 2.4G Section -->
      <div class="band-section" v-if="wifiNeighborData?.Enable2g">
        <h2 class="section-title">2.4G {{ t('wifiNeighbor.wifiNeighbor') }}</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>{{ t('wifiNeighbor.ssid') }}</th>
                <th>{{ t('wifiNeighbor.bssid') }}</th>
                <th>{{ t('wifiNeighbor.channel') }}</th>
                <th>{{ t('wifiNeighbor.signal') }}</th>
                <th>{{ t('wifiNeighbor.security') }}</th>
                <th>{{ t('wifiNeighbor.wirelessMode') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="neighbor in neighborResults" :key="neighbor.BSSID">
                <td>{{ neighbor.SSID }}</td>
                <td>{{ neighbor.BSSID }}</td>
                <td>{{ neighbor.Channel }}</td>
                <td>{{ neighbor.Signal }}</td>
                <td>{{ neighbor.Security }}</td>
                <td>{{ neighbor.WirelessMode }}</td>
              </tr>
            </tbody>
          </table>
          <div class="scan-button-container">
            <button 
              class="scan-button" 
              @click="handleScan('2')"
              :disabled="loading['2']"
            >
              {{ loading['2'] ? t('wifiNeighbor.scanning') : t('wifiNeighbor.scan') }}
            </button>
          </div>
        </div>
      </div>

      <!-- 5G Section -->
      <div class="band-section" v-if="wifiNeighborData?.Enable5g">
        <h2 class="section-title">5G {{ t('wifiNeighbor.wifiNeighbor') }}</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>{{ t('wifiNeighbor.ssid') }}</th>
                <th>{{ t('wifiNeighbor.bssid') }}</th>
                <th>{{ t('wifiNeighbor.channel') }}</th>
                <th>{{ t('wifiNeighbor.signal') }}</th>
                <th>{{ t('wifiNeighbor.security') }}</th>
                <th>{{ t('wifiNeighbor.wirelessMode') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="neighbor in neighborResults" :key="neighbor.BSSID">
                <td>{{ neighbor.SSID }}</td>
                <td>{{ neighbor.BSSID }}</td>
                <td>{{ neighbor.Channel }}</td>
                <td>{{ neighbor.Signal }}</td>
                <td>{{ neighbor.Security }}</td>
                <td>{{ neighbor.WirelessMode }}</td>
              </tr>
            </tbody>
          </table>
          <div class="scan-button-container">
            <button 
              class="scan-button" 
              @click="handleScan('5')"
              :disabled="loading['5']"
            >
              {{ loading['5'] ? t('wifiNeighbor.scanning') : t('wifiNeighbor.scan') }}
            </button>
          </div>
        </div>
      </div>

      <!-- 6G Section -->
      <div class="band-section" v-if="wifiNeighborData?.Enable6g">
        <h2 class="section-title">6G {{ t('wifiNeighbor.wifiNeighbor') }}</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>{{ t('wifiNeighbor.ssid') }}</th>
                <th>{{ t('wifiNeighbor.bssid') }}</th>
                <th>{{ t('wifiNeighbor.channel') }}</th>
                <th>{{ t('wifiNeighbor.signal') }}</th>
                <th>{{ t('wifiNeighbor.security') }}</th>
                <th>{{ t('wifiNeighbor.wirelessMode') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="neighbor in neighborResults" :key="neighbor.BSSID">
                <td>{{ neighbor.SSID }}</td>
                <td>{{ neighbor.BSSID }}</td>
                <td>{{ neighbor.Channel }}</td>
                <td>{{ neighbor.Signal }}</td>
                <td>{{ neighbor.Security }}</td>
                <td>{{ neighbor.WirelessMode }}</td>
              </tr>
            </tbody>
          </table>
          <div class="scan-button-container">
            <button 
              class="scan-button" 
              @click="handleScan('6')"
              :disabled="loading['6']"
            >
              {{ loading['6'] ? t('wifiNeighbor.scanning') : t('wifiNeighbor.scan') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wifi-neighbor {
  flex: 1;
  background-color: #f5f5f5;
  min-height: 100%;
}

.page-title {
  color: #0070BB;
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0;
  padding: 1rem 2rem;
  text-align: left;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.neighbor-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.band-section {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.section-title {
  padding: 1rem 1.5rem;
  font-size: 1rem;
  color: #333;
  margin: 0;
  background-color: #f8f8f8;
  border-bottom: 1px solid #e0e0e0;
}

.table-container {
  padding: 1.5rem;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border: 1px solid #e0e0e0;
}

th {
  background-color: #f8f8f8;
  font-weight: normal;
  color: #666;
}

td {
  color: #333;
}

tr:hover td {
  background-color: #f5f5f5;
}

.scan-button-container {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.scan-button {
  background-color: #0070BB;
  color: white;
  padding: 0.5rem 2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.scan-button:hover:not(:disabled) {
  background-color: #005a96;
}

.scan-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>