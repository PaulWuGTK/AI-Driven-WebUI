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
    <div >{{ t('wireless.vapInformation') }}</div>
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

</style>