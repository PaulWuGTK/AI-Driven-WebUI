<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WlanStatusResponse } from '../../types/wlan';
import { getWlanStatus } from '../../services/api';
import WlanBandInfo from '../../components/status/WlanBandInfo.vue';

const { t } = useI18n();
const wlanData = ref<WlanStatusResponse | null>(null);

const fetchWlanStatus = async () => {
  try {
    wlanData.value = await getWlanStatus();
  } catch (error) {
    console.error('Error fetching WLAN status:', error);
  }
};

onMounted(() => {
  fetchWlanStatus();
});
</script>

<template>
  <div class="wlan-status">
    <h1 class="page-title">{{ t('wlan.title') }}</h1>
    
    <div v-if="wlanData" class="wlan-bands">
      <div v-for="band in wlanData.StatusWlan" :key="band.Band" class="band-section">
        <h2 class="band-title">WiFi {{ band.Band }}</h2>
        <WlanBandInfo :band="band" />
        
        <!-- PC版表格 -->
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>{{ t('wlan.name') }}</th>
                <th>{{ t('wlan.alias') }}</th>
                <th>{{ t('wlan.status') }}</th>
                <th>{{ t('wlan.ssid') }}</th>
                <th>{{ t('wlan.authentication') }}</th>
                <th>{{ t('wlan.encryption') }}</th>
                <th>{{ t('wlan.password') }}</th>
                <th>{{ t('wlan.bssid') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="iface in band.Interface" :key="iface.Name">
                <td>{{ iface.Name }}</td>
                <td>{{ iface.Alias }}</td>
                <td>{{ iface.Enable ? t('wlan.enable') : t('wlan.disable') }}</td>
                <td>{{ iface.SSID }}</td>
                <td>{{ iface.Authentication }}</td>
                <td>{{ iface.Encryption }}</td>
                <td>{{ iface.Password }}</td>
                <td>{{ iface.BSSID }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 手機版卡片 -->
        <div class="mobile-cards">
          <div class="table-card" v-for="iface in band.Interface" :key="iface.Name">
            <div class="card-row">
              <span class="card-label">{{ t('wlan.name') }}</span>
              <span class="card-value">{{ iface.Name }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('wlan.alias') }}</span>
              <span class="card-value">{{ iface.Alias }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('wlan.status') }}</span>
              <span class="card-value"> {{ iface.Enable ? t('wlan.enable') : t('wlan.disable') }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('wlan.ssid') }}</span>
              <span class="card-value">{{ iface.SSID }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('wlan.authentication') }}</span>
              <span class="card-value">{{ iface.Authentication }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('wlan.encryption') }}</span>
              <span class="card-value">{{ iface.Encryption }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('wlan.password') }}</span>
              <span class="card-value">{{ iface.Password }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('wlan.bssid') }}</span>
              <span class="card-value">{{ iface.BSSID }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wlan-status {
  flex: 1;
  background-color: #f5f5f5;
  min-height: 100%;
}

.wlan-bands {
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

.band-title {
  padding: 1rem 1.5rem;
  font-size: 1rem;
  color: #333;
  margin: 0;
  background-color: #f8f8f8;
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