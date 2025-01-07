<script setup lang="ts">
import type { WlanInterface } from '../../types/wlan';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
defineProps<{
  interfaces: WlanInterface[];
}>();
</script>

<template>
  <div class="interface-section">
    <div class="section-title">{{ t('wlan.interface') }}</div>
    <div class="table-section">
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
        <tr v-for="iface in interfaces" :key="iface.Name">
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
  </div>
</template>

<style scoped>
.interface-section {
  margin-top: 1rem;
}

</style>