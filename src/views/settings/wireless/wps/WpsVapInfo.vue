<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { WlanWpsBand } from '../../../../types/wireless';

const { t } = useI18n();
defineProps<{
  bands: WlanWpsBand[];
}>();
</script>

<template>
  <div class="vap-info">
    <h3>{{ t('wireless.vapInformation') }}</h3>
    <table>
      <thead>
        <tr>
          <th>{{ t('wireless.band') }}</th>
          <th>{{ t('wireless.ssid') }}</th>
          <th>{{ t('wireless.authentication') }}</th>
          <th>{{ t('wireless.encryption') }}</th>
          <th>{{ t('wireless.wpsStatus') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="band in bands" :key="band.Band">
          <td>{{ band.Band }}</td>
          <td>{{ band.SSID }}</td>
          <td>{{ band.AuthType }}</td>
          <td>{{ band.EncryType }}</td>
          <td>{{ band.Configured }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.vap-info {
  margin-top: 2rem;
}

h3 {
  font-size: 1rem;
  color: #333;
  margin: 0 0 1rem 0;
}

table {
  width: 100%;
  border-collapse: collapse;
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
</style>