<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WifiNeighborStatusResponse, WifiNeighborInfo } from '../../types/wifiNeighbor';
import { getWifiNeighbors, scanWifiNeighbors } from '../../services/api';
import { useQA } from '../../utils/qa';
const { isQAMode, qa, slug } = useQA();

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
const errors = ref<{ [key: string]: string | null }>({
  '2': null,
  '5': null,
  '6': null
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
  errors.value[band] = null;
  try {
    const response = await scanWifiNeighbors(band);
    if ('NOK' in response.WifiNeighbor) {
      errors.value[band] = String(response.WifiNeighbor.NOK);
      neighborResults.value[band] = [];
    } else {
      errors.value[band] = null;
      neighborResults.value[band] = response.WifiNeighbor;
    }
  } catch (error) {
    console.error(`Error scanning ${band}G band:`, error);
    errors.value[band] = error instanceof Error ? error.message : 'Unknown error occurred';
    neighborResults.value[band] = [];
  } finally {
    loading.value[band] = false;
  }
};

onMounted(fetchWifiNeighbors);
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('wifi-neighbor-title')">{{ t('wifiNeighbor.title') }}</h1>

    <div class="status-content" :data-testid="qa('wifi-neighbor-content')">
      <!-- 2.4G Section -->
      <div class="panel-section" :data-testid="qa('wifi-neighbor-2g-section')">
        <div class="section-title" :data-testid="qa('wifi-neighbor-2g-title')">2.4G {{ t('wifiNeighbor.wifiNeighbor') }}</div>
        
        <div class="card-content">
          <div v-if="errors['2']" class="error-message" :data-testid="qa('wifi-neighbor-2g-error')">
            {{ errors['2'] }}
          </div>

          <div class="table-container" v-if="neighborResults['2'].length > 0" :data-testid="qa('wifi-neighbor-2g-table')">
            <table>
              <thead>
                <tr>
                  <th :data-testid="qa('wifi-neighbor-header-ssid')">{{ t('wifiNeighbor.ssid') }}</th>
                  <th :data-testid="qa('wifi-neighbor-header-bssid')">{{ t('wifiNeighbor.bssid') }}</th>
                  <th :data-testid="qa('wifi-neighbor-header-channel')">{{ t('wifiNeighbor.channel') }}</th>
                  <th :data-testid="qa('wifi-neighbor-header-signal')">{{ t('wifiNeighbor.signal') }}</th>
                  <th :data-testid="qa('wifi-neighbor-header-security')">{{ t('wifiNeighbor.security') }}</th>
                  <th :data-testid="qa('wifi-neighbor-header-wireless-mode')">{{ t('wifiNeighbor.wirelessMode') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(neighbor, neighborIndex) in neighborResults['2']" :key="neighbor.BSSID" :data-testid="qa(`wifi-neighbor-2g-row-${neighborIndex}`)">
                  <td :data-testid="qa(`wifi-neighbor-2g-ssid-${neighborIndex}`)">{{ neighbor.SSID }}</td>
                  <td :data-testid="qa(`wifi-neighbor-2g-bssid-${neighborIndex}`)">{{ neighbor.BSSID }}</td>
                  <td :data-testid="qa(`wifi-neighbor-2g-channel-${neighborIndex}`)">{{ neighbor.Channel }}</td>
                  <td :data-testid="qa(`wifi-neighbor-2g-signal-${neighborIndex}`)">{{ neighbor.Signal }}</td>
                  <td :data-testid="qa(`wifi-neighbor-2g-security-${neighborIndex}`)">{{ neighbor.Security }}</td>
                  <td :data-testid="qa(`wifi-neighbor-2g-wireless-mode-${neighborIndex}`)">{{ neighbor.WirelessMode }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mobile-cards" v-if="neighborResults['2'].length > 0" :data-testid="qa('wifi-neighbor-2g-mobile')">
            <div class="table-card" v-for="(neighbor, neighborIndex) in neighborResults['2']" :key="neighbor.BSSID" :data-testid="qa(`wifi-neighbor-2g-card-${neighborIndex}`)">
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wifi-neighbor-2g-card-ssid-label-${neighborIndex}`)">{{ t('wifiNeighbor.ssid') }}</span>
                <span class="card-value" :data-testid="qa(`wifi-neighbor-2g-card-ssid-value-${neighborIndex}`)">{{ neighbor.SSID }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wifi-neighbor-2g-card-bssid-label-${neighborIndex}`)">{{ t('wifiNeighbor.bssid') }}</span>
                <span class="card-value" :data-testid="qa(`wifi-neighbor-2g-card-bssid-value-${neighborIndex}`)">{{ neighbor.BSSID }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wifi-neighbor-2g-card-channel-label-${neighborIndex}`)">{{ t('wifiNeighbor.channel') }}</span>
                <span class="card-value" :data-testid="qa(`wifi-neighbor-2g-card-channel-value-${neighborIndex}`)">{{ neighbor.Channel }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wifi-neighbor-2g-card-signal-label-${neighborIndex}`)">{{ t('wifiNeighbor.signal') }}</span>
                <span class="card-value" :data-testid="qa(`wifi-neighbor-2g-card-signal-value-${neighborIndex}`)">{{ neighbor.Signal }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wifi-neighbor-2g-card-security-label-${neighborIndex}`)">{{ t('wifiNeighbor.security') }}</span>
                <span class="card-value" :data-testid="qa(`wifi-neighbor-2g-card-security-value-${neighborIndex}`)">{{ neighbor.Security }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wifi-neighbor-2g-card-wireless-mode-label-${neighborIndex}`)">{{ t('wifiNeighbor.wirelessMode') }}</span>
                <span class="card-value" :data-testid="qa(`wifi-neighbor-2g-card-wireless-mode-value-${neighborIndex}`)">{{ neighbor.WirelessMode }}</span>
              </div>
            </div>
          </div>

          <div class="scan-button-container">
            <button 
              class="btn btn-primary"
              :data-testid="qa('wifi-neighbor-2g-scan-button')"
              @click="handleScan('2')"
              :disabled="loading['2'] || !wifiNeighborData?.WifiNeighbor.Enable2g"
            >
              {{ loading['2'] ? t('wifiNeighbor.scanning') : t('wifiNeighbor.scan') }}
            </button>
          </div>
        </div>
      </div>

      <!-- 5G Section -->
      <div class="panel-section" :data-testid="qa('wifi-neighbor-5g-section')">
        <div class="section-title" :data-testid="qa('wifi-neighbor-5g-title')">5G {{ t('wifiNeighbor.wifiNeighbor') }}</div>
        
        <div class="card-content">
          <div v-if="errors['5']" class="error-message" :data-testid="qa('wifi-neighbor-5g-error')">
            {{ errors['5'] }}
          </div>

          <div class="table-container" v-if="neighborResults['5'].length > 0" :data-testid="qa('wifi-neighbor-5g-table')">
            <table>
              <thead>
                <tr>
                  <th :data-testid="qa('wifi-neighbor-header-ssid')">{{ t('wifiNeighbor.ssid') }}</th>
                  <th :data-testid="qa('wifi-neighbor-header-bssid')">{{ t('wifiNeighbor.bssid') }}</th>
                  <th :data-testid="qa('wifi-neighbor-header-channel')">{{ t('wifiNeighbor.channel') }}</th>
                  <th :data-testid="qa('wifi-neighbor-header-signal')">{{ t('wifiNeighbor.signal') }}</th>
                  <th :data-testid="qa('wifi-neighbor-header-security')">{{ t('wifiNeighbor.security') }}</th>
                  <th :data-testid="qa('wifi-neighbor-header-wireless-mode')">{{ t('wifiNeighbor.wirelessMode') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(neighbor, neighborIndex) in neighborResults['5']" :key="neighbor.BSSID" :data-testid="qa(`wifi-neighbor-5g-row-${neighborIndex}`)">
                  <td :data-testid="qa(`wifi-neighbor-5g-ssid-${neighborIndex}`)">{{ neighbor.SSID }}</td>
                  <td :data-testid="qa(`wifi-neighbor-5g-bssid-${neighborIndex}`)">{{ neighbor.BSSID }}</td>
                  <td :data-testid="qa(`wifi-neighbor-5g-channel-${neighborIndex}`)">{{ neighbor.Channel }}</td>
                  <td :data-testid="qa(`wifi-neighbor-5g-signal-${neighborIndex}`)">{{ neighbor.Signal }}</td>
                  <td :data-testid="qa(`wifi-neighbor-5g-security-${neighborIndex}`)">{{ neighbor.Security }}</td>
                  <td :data-testid="qa(`wifi-neighbor-5g-wireless-mode-${neighborIndex}`)">{{ neighbor.WirelessMode }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mobile-cards" v-if="neighborResults['5'].length > 0" :data-testid="qa('wifi-neighbor-5g-mobile')">
            <div class="table-card" v-for="(neighbor, neighborIndex) in neighborResults['5']" :key="neighbor.BSSID" :data-testid="qa(`wifi-neighbor-5g-card-${neighborIndex}`)">
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wifi-neighbor-5g-card-ssid-label-${neighborIndex}`)">{{ t('wifiNeighbor.ssid') }}</span>
                <span class="card-value" :data-testid="qa(`wifi-neighbor-5g-card-ssid-value-${neighborIndex}`)">{{ neighbor.SSID }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wifi-neighbor-5g-card-bssid-label-${neighborIndex}`)">{{ t('wifiNeighbor.bssid') }}</span>
                <span class="card-value" :data-testid="qa(`wifi-neighbor-5g-card-bssid-value-${neighborIndex}`)">{{ neighbor.BSSID }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wifi-neighbor-5g-card-channel-label-${neighborIndex}`)">{{ t('wifiNeighbor.channel') }}</span>
                <span class="card-value" :data-testid="qa(`wifi-neighbor-5g-card-channel-value-${neighborIndex}`)">{{ neighbor.Channel }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wifi-neighbor-5g-card-signal-label-${neighborIndex}`)">{{ t('wifiNeighbor.signal') }}</span>
                <span class="card-value" :data-testid="qa(`wifi-neighbor-5g-card-signal-value-${neighborIndex}`)">{{ neighbor.Signal }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wifi-neighbor-5g-card-security-label-${neighborIndex}`)">{{ t('wifiNeighbor.security') }}</span>
                <span class="card-value" :data-testid="qa(`wifi-neighbor-5g-card-security-value-${neighborIndex}`)">{{ neighbor.Security }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wifi-neighbor-5g-card-wireless-mode-label-${neighborIndex}`)">{{ t('wifiNeighbor.wirelessMode') }}</span>
                <span class="card-value" :data-testid="qa(`wifi-neighbor-5g-card-wireless-mode-value-${neighborIndex}`)">{{ neighbor.WirelessMode }}</span>
              </div>
            </div>
          </div>

          <div class="scan-button-container">
            <button 
              class="btn btn-primary"
              :data-testid="qa('wifi-neighbor-5g-scan-button')"
              @click="handleScan('5')"
              :disabled="loading['5'] || !wifiNeighborData?.WifiNeighbor.Enable5g"
            >
              {{ loading['5'] ? t('wifiNeighbor.scanning') : t('wifiNeighbor.scan') }}
            </button>
          </div>
        </div>
      </div>

      <!-- 6G Section -->
      <div class="panel-section" :data-testid="qa('wifi-neighbor-6g-section')">
        <div class="section-title" :data-testid="qa('wifi-neighbor-6g-title')">6G {{ t('wifiNeighbor.wifiNeighbor') }}</div>
        
        <div class="card-content">
          <div v-if="errors['6']" class="error-message" :data-testid="qa('wifi-neighbor-6g-error')">
            {{ errors['6'] }}
          </div>

          <div class="table-container" v-if="neighborResults['6'].length > 0" :data-testid="qa('wifi-neighbor-6g-table')">
            <table>
              <thead>
                <tr>
                  <th :data-testid="qa('wifi-neighbor-header-ssid')">{{ t('wifiNeighbor.ssid') }}</th>
                  <th :data-testid="qa('wifi-neighbor-header-bssid')">{{ t('wifiNeighbor.bssid') }}</th>
                  <th :data-testid="qa('wifi-neighbor-header-channel')">{{ t('wifiNeighbor.channel') }}</th>
                  <th :data-testid="qa('wifi-neighbor-header-signal')">{{ t('wifiNeighbor.signal') }}</th>
                  <th :data-testid="qa('wifi-neighbor-header-security')">{{ t('wifiNeighbor.security') }}</th>
                  <th :data-testid="qa('wifi-neighbor-header-wireless-mode')">{{ t('wifiNeighbor.wirelessMode') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(neighbor, neighborIndex) in neighborResults['6']" :key="neighbor.BSSID" :data-testid="qa(`wifi-neighbor-6g-row-${neighborIndex}`)">
                  <td :data-testid="qa(`wifi-neighbor-6g-ssid-${neighborIndex}`)">{{ neighbor.SSID }}</td>
                  <td :data-testid="qa(`wifi-neighbor-6g-bssid-${neighborIndex}`)">{{ neighbor.BSSID }}</td>
                  <td :data-testid="qa(`wifi-neighbor-6g-channel-${neighborIndex}`)">{{ neighbor.Channel }}</td>
                  <td :data-testid="qa(`wifi-neighbor-6g-signal-${neighborIndex}`)">{{ neighbor.Signal }}</td>
                  <td :data-testid="qa(`wifi-neighbor-6g-security-${neighborIndex}`)">{{ neighbor.Security }}</td>
                  <td :data-testid="qa(`wifi-neighbor-6g-wireless-mode-${neighborIndex}`)">{{ neighbor.WirelessMode }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mobile-cards" v-if="neighborResults['6'].length > 0" :data-testid="qa('wifi-neighbor-6g-mobile')">
            <div class="table-card" v-for="(neighbor, neighborIndex) in neighborResults['6']" :key="neighbor.BSSID" :data-testid="qa(`wifi-neighbor-6g-card-${neighborIndex}`)">
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wifi-neighbor-6g-card-ssid-label-${neighborIndex}`)">{{ t('wifiNeighbor.ssid') }}</span>
                <span class="card-value" :data-testid="qa(`wifi-neighbor-6g-card-ssid-value-${neighborIndex}`)">{{ neighbor.SSID }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wifi-neighbor-6g-card-bssid-label-${neighborIndex}`)">{{ t('wifiNeighbor.bssid') }}</span>
                <span class="card-value" :data-testid="qa(`wifi-neighbor-6g-card-bssid-value-${neighborIndex}`)">{{ neighbor.BSSID }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wifi-neighbor-6g-card-channel-label-${neighborIndex}`)">{{ t('wifiNeighbor.channel') }}</span>
                <span class="card-value" :data-testid="qa(`wifi-neighbor-6g-card-channel-value-${neighborIndex}`)">{{ neighbor.Channel }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wifi-neighbor-6g-card-signal-label-${neighborIndex}`)">{{ t('wifiNeighbor.signal') }}</span>
                <span class="card-value" :data-testid="qa(`wifi-neighbor-6g-card-signal-value-${neighborIndex}`)">{{ neighbor.Signal }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wifi-neighbor-6g-card-security-label-${neighborIndex}`)">{{ t('wifiNeighbor.security') }}</span>
                <span class="card-value" :data-testid="qa(`wifi-neighbor-6g-card-security-value-${neighborIndex}`)">{{ neighbor.Security }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wifi-neighbor-6g-card-wireless-mode-label-${neighborIndex}`)">{{ t('wifiNeighbor.wirelessMode') }}</span>
                <span class="card-value" :data-testid="qa(`wifi-neighbor-6g-card-wireless-mode-value-${neighborIndex}`)">{{ neighbor.WirelessMode }}</span>
              </div>
            </div>
          </div>

          <div class="scan-button-container">
            <button 
              class="btn btn-primary"
              :data-testid="qa('wifi-neighbor-6g-scan-button')"
              @click="handleScan('6')"
              :disabled="loading['6'] || !wifiNeighborData?.WifiNeighbor.Enable6g"
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

.error-message {
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: #fee;
  color: #dc3545;
  border-radius: 4px;
  text-align: center;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .scan-button-container {
    margin-top: 1rem;
  }

  .btn {
    width: 100%;
  }
}
</style>