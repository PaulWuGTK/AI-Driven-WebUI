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
    <h1 class="page-title">{{ t('wifiNeighbor.title') }}</h1>

    <div class="status-content">
      <!-- 2.4G Section -->
      <div class="panel-section">
        <div class="section-title">2.4G {{ t('wifiNeighbor.wifiNeighbor') }}</div>
        
        <div class="card-content">
          <div v-if="errors['2']" class="error-message">
            {{ errors['2'] }}
          </div>

          <div class="table-container" v-if="neighborResults['2'].length > 0">
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

          <div class="mobile-cards" v-if="neighborResults['2'].length > 0">
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
              :disabled="loading['2'] || !wifiNeighborData?.WifiNeighbor.Enable2g"
            >
              {{ loading['2'] ? t('wifiNeighbor.scanning') : t('wifiNeighbor.scan') }}
            </button>
          </div>
        </div>
      </div>

      <!-- 5G Section -->
      <div class="panel-section">
        <div class="section-title">5G {{ t('wifiNeighbor.wifiNeighbor') }}</div>
        
        <div class="card-content">
          <div v-if="errors['5']" class="error-message">
            {{ errors['5'] }}
          </div>

          <div class="table-container" v-if="neighborResults['5'].length > 0">
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

          <div class="mobile-cards" v-if="neighborResults['5'].length > 0">
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
              :disabled="loading['5'] || !wifiNeighborData?.WifiNeighbor.Enable5g"
            >
              {{ loading['5'] ? t('wifiNeighbor.scanning') : t('wifiNeighbor.scan') }}
            </button>
          </div>
        </div>
      </div>

      <!-- 6G Section -->
      <div class="panel-section">
        <div class="section-title">6G {{ t('wifiNeighbor.wifiNeighbor') }}</div>
        
        <div class="card-content">
          <div v-if="errors['6']" class="error-message">
            {{ errors['6'] }}
          </div>

          <div class="table-container" v-if="neighborResults['6'].length > 0">
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

          <div class="mobile-cards" v-if="neighborResults['6'].length > 0">
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