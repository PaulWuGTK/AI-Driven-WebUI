<script setup lang="ts">
import { defineProps, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DashboardWiFi } from '../../types/dashboard';

const { t } = useI18n();

const props = defineProps<{
  wifiInfo?: DashboardWiFi;
}>();

// Map band keys to display names
const bandNames = {
  'wifi2g': '2.4GHz',
  'wifi5g': '5GHz',
  'wifi6g': '6GHz'
};

// Get enabled WiFi bands
const enabledBands = computed(() => {
  if (!props.wifiInfo) return [];
  
  return Object.entries(props.wifiInfo)
    .filter(([_, band]) => band && band.Enable === 1)
    .map(([key, band]) => ({
      key,
      displayName: bandNames[key as keyof typeof bandNames],
      ...band
    }));
});

// Check if any WiFi is enabled
const hasEnabledWifi = computed(() => enabledBands.value.length > 0);

// Check if a security mode requires a password (is not "None")
const requiresPassword = (securityMode: string): boolean => {
  return securityMode !== "None";
}
</script>

<template>
  <div class="wifi-status" v-if="wifiInfo">
    <h2 class="card-title">{{ t('dashboard.wifi') }}</h2>
    
    <div v-if="hasEnabledWifi" class="wifi-networks">
      <div v-for="band in enabledBands" :key="band.key" class="wifi-network">
        <div class="network-row">
          <div class="row-label">SSID</div>
          <div class="row-value">
            <span class="text-truncate" :title="band.SSID">{{ band.SSID }}</span>
            <span v-if="requiresPassword(band.SecurityMode)" class="security-icon material-icons">lock</span>
          </div>
        </div>
        <div class="network-row">
          <div class="row-label">{{ t('wireless.band') }}</div>
          <div class="row-value">{{ band.displayName }}</div>
        </div>
        <div class="network-row" v-if="requiresPassword(band.SecurityMode)">
          <div class="row-label">{{ t('dashboard.password') }}</div>
          <div class="row-value password text-truncate" :title="band.Password">{{ band.Password }}</div>
        </div>
      </div>
    </div>
    
    <div v-else class="no-wifi-enabled">
      <span class="material-icons">wifi_off</span>
      <p>{{ t('dashboard.wifiIsDisabled') }}</p>
    </div>
  </div>
</template>

<style scoped>
.wifi-networks {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.wifi-network {
  background-color: #f8f8f8;
  border-radius: 4px;
  padding: 0.75rem 1rem;
}

.network-row {
  display: flex;
  margin-bottom: 0.5rem;
  align-items: center;
}

.network-row:last-child {
  margin-bottom: 0;
}

.row-label {
  width: 80px;
  color: #666;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.row-value {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end; /* 新增這行，使文字靠右 */
  gap: 0.5rem;
  font-weight: 500;
  color: #333;
  min-width: 0;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  max-width: 100%;
}

.row-value.password {
  font-family: monospace;
  font-weight: normal;
}

.security-icon {
  color: #0070BB;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.no-wifi-enabled {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  color: #666;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.no-wifi-enabled .material-icons {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #999;
}

.no-wifi-enabled p {
  margin: 0;
}

.card-title {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 1rem;
}
</style>