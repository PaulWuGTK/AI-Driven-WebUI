<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WlanStatusResponse } from '../../types/wlan';
import { getWlanStatus } from '../../services/api';
import WlanBandInfo from '../../components/status/WlanBandInfo.vue';

const { t } = useI18n();
const wlanData = ref<WlanStatusResponse | null>(null);
const bandOrder = ["2.4GHz", "5GHz", "6GHz"];

const fetchWlanStatus = async () => {
  try {
    const response = await getWlanStatus();

    response.StatusWlan.sort((a, b) => {
  const aIndex = bandOrder.indexOf(a.Band);
  const bIndex = bandOrder.indexOf(b.Band);
  return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
});

    wlanData.value = response;
  } catch (error) {
    console.error('Error fetching WLAN status:', error);
  }
};

onMounted(() => {
  fetchWlanStatus();
});
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">{{ t('wlan.title') }}</h1>
    
    <div v-if="wlanData" class="status-content">
      <div v-for="band in wlanData.StatusWlan" :key="band.Band" class="panel-section">
        <div class="section-title">WiFi {{ band.Band }}</div>
        
        <div class="card-content">
          <WlanBandInfo :band="band" />
          
          <div class="table-container">
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
                <span class="card-value">{{ iface.Enable ? t('wlan.enable') : t('wlan.disable') }}</span>
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
  </div>
</template>

<style scoped>

</style>