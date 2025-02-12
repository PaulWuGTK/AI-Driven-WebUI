```vue
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
    <div class="section-title">{{ t('wireless.vapInformation') }}</div>
    <div class="table-container">
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
  </div>
</template>

<style scoped>
.vap-info {
  margin-top: 1.5rem;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.2);
}

.section-title-sp {
  font-size: 1.25rem;
  color: var(--primary-color);
  font-weight: bold;
  padding: 0.75rem 1.5rem;
  background-color: white;
  border-bottom: 1px solid var(--border-color);
}

.table-container {
  padding: 1.5rem;
}

@media (max-width: 768px) {
  .section-title-sp {
    padding: 0.75rem 1rem;
  }

  .table-container {
    padding: 1rem;
  }
}
</style>
```