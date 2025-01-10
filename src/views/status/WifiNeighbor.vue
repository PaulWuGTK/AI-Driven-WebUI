<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WifiNeighborStatusResponse, WifiNeighborInfo } from '../../types/wifiNeighbor';
import { getWifiNeighbors, scanWifiNeighbors } from '../../services/api';

const { t } = useI18n();
const wifiNeighborData = ref<WifiNeighborStatusResponse | null>(null);
const neighborResults = ref<{ [key: string]: WifiNeighborInfo[] }>({
  '2': [],
  '5': [],
  '6': []
});
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
      neighborResults.value[band] = response.WifiNeighbor;
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
      <div class="band-section" v-if="wifiNeighborData?.WifiNeighbor.Enable2g">
        <div class="section-title">2.4G {{ t('wifiNeighbor.wifiNeighbor') }}</div>
        
        <!-- PC版表格 -->
        <div class="table-wrapper">
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
              <tr v-for="neighbor in neighborResults['2']" :key="neighbor.BSSID">
                <td>{{ neighbor.SSID }}</td>
                <td>{{ neighbor.BSSID }}</td>
                <td>{{ neighbor.Channel }}</td>
                <td>{{ neighbor.Signal }}</td>
                <td>{{ neighbor.Security }}</td>
                <td>{{ neighbor.WirelessMode }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 手機版卡片 -->
        <div class="mobile-cards">
          <div class="table-card" v-for="neighbor in neighborResults['2']" :key="neighbor.BSSID">
            <div class="card-row">
              <span class="card-label">{{ t('wifiNeighbor.ssid') }}</span>
              <span class="card-value">{{ neighbor.SSID }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('wifiNeighbor.bssid') }}</span>
              <span class="card-value">{{ neighbor.BSSID }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('wifiNeighbor.channel') }}</span>
              <span class="card-value">{{ neighbor.Channel }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('wifiNeighbor.signal') }}</span>
              <span class="card-value">{{ neighbor.Signal }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('wifiNeighbor.security') }}</span>
              <span class="card-value">{{ neighbor.Security }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('wifiNeighbor.wirelessMode') }}</span>
              <span class="card-value">{{ neighbor.WirelessMode }}</span>
            </div>
          </div>
        </div>

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

      <!-- 5G Section -->
      <div class="band-section" v-if="wifiNeighborData?.WifiNeighbor.Enable5g">
        <div class="section-title">5G {{ t('wifiNeighbor.wifiNeighbor') }}</div>
        
        <!-- PC版表格 -->
        <div class="table-wrapper">
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
              <tr v-for="neighbor in neighborResults['5']" :key="neighbor.BSSID">
                <td>{{ neighbor.SSID }}</td>
                <td>{{ neighbor.BSSID }}</td>
                <td>{{ neighbor.Channel }}</td>
                <td>{{ neighbor.Signal }}</td>
                <td>{{ neighbor.Security }}</td>
                <td>{{ neighbor.WirelessMode }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 手機版卡片 -->
        <div class="mobile-cards">
          <div class="table-card" v-for="neighbor in neighborResults['5']" :key="neighbor.BSSID">
            <div class="card-row">
              <span class="card-label">{{ t('wifiNeighbor.ssid') }}</span>
              <span class="card-value">{{ neighbor.SSID }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('wifiNeighbor.bssid') }}</span>
              <span class="card-value">{{ neighbor.BSSID }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('wifiNeighbor.channel') }}</span>
              <span class="card-value">{{ neighbor.Channel }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('wifiNeighbor.signal') }}</span>
              <span class="card-value">{{ neighbor.Signal }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('wifiNeighbor.security') }}</span>
              <span class="card-value">{{ neighbor.Security }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('wifiNeighbor.wirelessMode') }}</span>
              <span class="card-value">{{ neighbor.WirelessMode }}</span>
            </div>
          </div>
        </div>

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

      <!-- 6G Section -->
      <div class="band-section" v-if="wifiNeighborData?.WifiNeighbor.Enable6g">
        <div class="section-title">6G {{ t('wifiNeighbor.wifiNeighbor') }}</div>
        
        <!-- PC版表格 -->
        <div class="table-wrapper">
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
              <tr v-for="neighbor in neighborResults['6']" :key="neighbor.BSSID">
                <td>{{ neighbor.SSID }}</td>
                <td>{{ neighbor.BSSID }}</td>
                <td>{{ neighbor.Channel }}</td>
                <td>{{ neighbor.Signal }}</td>
                <td>{{ neighbor.Security }}</td>
                <td>{{ neighbor.WirelessMode }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 手機版卡片 -->
        <div class="mobile-cards">
          <div class="table-card" v-for="neighbor in neighborResults['6']" :key="neighbor.BSSID">
            <div class="card-row">
              <span class="card-label">{{ t('wifiNeighbor.ssid') }}</span>
              <span class="card-value">{{ neighbor.SSID }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('wifiNeighbor.bssid') }}</span>
              <span class="card-value">{{ neighbor.BSSID }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('wifiNeighbor.channel') }}</span>
              <span class="card-value">{{ neighbor.Channel }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('wifiNeighbor.signal') }}</span>
              <span class="card-value">{{ neighbor.Signal }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('wifiNeighbor.security') }}</span>
              <span class="card-value">{{ neighbor.Security }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('wifiNeighbor.wirelessMode') }}</span>
              <span class="card-value">{{ neighbor.WirelessMode }}</span>
            </div>
          </div>
        </div>

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
</template>

<style scoped>
.wifi-neighbor {
  flex: 1;
  background-color: #f5f5f5;
  min-height: 100%;
}

.neighbor-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.band-section {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-title {
  padding: 0.5rem 2rem;
  font-size: 1rem;
  color: #333;
  text-align: left;
  background-color: #F8F8FA;
  border-bottom: 1px solid #e0e0e0;
}

.table-wrapper {
  padding: 1.5rem;
  overflow-x: auto;
}

/* 手機版卡片樣式 */
.mobile-cards {
  display: none;
  padding: 1rem;
  gap: 1rem;
}

.table-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.card-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.card-row:last-child {
  border-bottom: none;
}

.card-label {
  color: #666;
  font-size: 0.9rem;
}

.card-value {
  color: #333;
  font-weight: 500;
  word-break: break-all;
}

.scan-button-container {
  display: flex;
  justify-content: center;
  margin: 1rem;
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

/* 響應式設計 */
@media (min-width: 768px) {
  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
    white-space: nowrap;
  }

  th {
    background-color: #f8f8f8;
    font-weight: 500;
    color: #333;
  }

  td {
    color: #666;
  }

  .mobile-cards {
    display: none;
  }
}

@media (max-width: 767px) {
  .table-wrapper {
    display: none;
  }

  .mobile-cards {
    display: block;
  }
}
</style>