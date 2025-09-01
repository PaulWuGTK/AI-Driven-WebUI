<script setup lang="ts">
import type { WlanInterface } from '../../types/wlan';
import { useI18n } from 'vue-i18n';
import { useQA } from '../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
defineProps<{
  interfaces: WlanInterface[];
}>();
</script>

<template>
  <div class="interface-section" :data-testid="qa('wlan-interface-section')">
    <div class="section-title" :data-testid="qa('wlan-interface-title')">{{ t('wlan.interface') }}</div>
    <div class="table-section" :data-testid="qa('wlan-interface-table-section')">
    <table :data-testid="qa('wlan-interface-table')">
      <thead>
        <tr>
          <th :data-testid="qa('wlan-interface-header-name')">{{ t('wlan.name') }}</th>
          <th :data-testid="qa('wlan-interface-header-alias')">{{ t('wlan.alias') }}</th>
          <th :data-testid="qa('wlan-interface-header-status')">{{ t('wlan.status') }}</th>
          <th :data-testid="qa('wlan-interface-header-ssid')">{{ t('wlan.ssid') }}</th>
          <th :data-testid="qa('wlan-interface-header-authentication')">{{ t('wlan.authentication') }}</th>
          <th :data-testid="qa('wlan-interface-header-encryption')">{{ t('wlan.encryption') }}</th>
          <th :data-testid="qa('wlan-interface-header-password')">{{ t('wlan.password') }}</th>
          <th :data-testid="qa('wlan-interface-header-bssid')">{{ t('wlan.bssid') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(iface, index) in interfaces" :key="iface.Name" :data-testid="qa(`wlan-interface-row-${index}`)">
          <td :data-testid="qa(`wlan-interface-name-${index}`)">{{ iface.Name }}</td>
          <td :data-testid="qa(`wlan-interface-alias-${index}`)">{{ iface.Alias }}</td>
          <td :data-testid="qa(`wlan-interface-status-${index}`)">{{ iface.Enable ? t('wlan.enable') : t('wlan.disable') }}</td>
          <td :data-testid="qa(`wlan-interface-ssid-${index}`)">{{ iface.SSID }}</td>
          <td :data-testid="qa(`wlan-interface-authentication-${index}`)">{{ iface.Authentication }}</td>
          <td :data-testid="qa(`wlan-interface-encryption-${index}`)">{{ iface.Encryption }}</td>
          <td :data-testid="qa(`wlan-interface-password-${index}`)">{{ iface.Password }}</td>
          <td :data-testid="qa(`wlan-interface-bssid-${index}`)">{{ iface.BSSID }}</td>
        </tr>
      </tbody>
    </table>
    </div>
  </div>
</template>

<style scoped>
.interface-section {
  margin-top: 1rem;
}

</style>