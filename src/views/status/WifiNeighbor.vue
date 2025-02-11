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
  <div class="page-container">
    <h1 class="page-title">{{ t('wifiNeighbor.title') }}</h1>

    <div class="status-content">
      <!-- 2.4G Section -->
      <div class="panel-section" v-if="wifiNeighborData?.WifiNeighbor.Enable2g">
        <div class="section-title">2.4G {{ t('wifiNeighbor.wifiNeighbor') }}</div>
        
        <div class="card-content">
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
              class="btn btn-primary" 
              @click="handleScan('2')"
              :disabled="loading['2']"
            >
              {{ loading['2'] ? t('wifiNeighbor.scanning') : t('wifiNeighbor.scan') }}
            </button>
          </div>
        </div>
      </div>

      <!-- 5G Section -->
      <div class="panel-section" v-if="wifiNeighborData?.WifiNeighbor.Enable5g">
        <div class="section-title">5G {{ t('wifiNeighbor.wifiNeighbor') }}</div>
        
        <div class="card-content">
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
              class="btn btn-primary" 
              @click="handleScan('5')"
              :disabled="loading['5']"
            >
              {{ loading['5'] ? t('wifiNeighbor.scanning') : t('wifiNeighbor.scan') }}
            </button>
          </div>
        </div>
      </div>

      <!-- 6G Section -->
      <div class="panel-section" v-if="wifiNeighborData?.WifiNeighbor.Enable6g">
        <div class="section-title">6G {{ t('wifiNeighbor.wifiNeighbor') }}</div>
        
        <div class="card-content">
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
              class="btn btn-primary" 
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

.scan-button-container {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

</style>