```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { WlanWpsBand } from '../../../../types/wireless';
import { useQA } from '../../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
defineProps<{
  bands: WlanWpsBand[];
}>();
</script>

<template>
  <div class="vap-info" :data-testid="qa('wps-vap-info-content')">
    <div class="section-title" :data-testid="qa('wps-vap-info-title')">{{ t('wireless.vapInformation') }}</div>
    <div class="table-container" :data-testid="qa('wps-vap-info-table-container')">
      <table class="wps-vap-table" :data-testid="qa('wps-vap-info-table')">
        <colgroup>
          <col class="wps-vap-col-band">
          <col class="wps-vap-col-ssid">
          <col class="wps-vap-col-authentication">
          <col class="wps-vap-col-encryption">
          <col class="wps-vap-col-status">
        </colgroup>
        <thead>
          <tr>
            <th :data-testid="qa('wps-vap-info-header-band')">{{ t('wireless.band') }}</th>
            <th :data-testid="qa('wps-vap-info-header-ssid')">{{ t('wireless.ssid') }}</th>
            <th :data-testid="qa('wps-vap-info-header-authentication')">{{ t('wireless.authentication') }}</th>
            <th :data-testid="qa('wps-vap-info-header-encryption')">{{ t('wireless.encryption') }}</th>
            <th :data-testid="qa('wps-vap-info-header-wps-status')">{{ t('wireless.wpsStatus') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(band, bandIndex) in bands" :key="band.Band" :data-testid="qa(`wps-vap-info-row-${bandIndex}`)">
            <td :data-testid="qa(`wps-vap-info-band-${bandIndex}`)">{{ band.Band }}</td>
            <td :data-testid="qa(`wps-vap-info-ssid-${bandIndex}`)">{{ band.SSID }}</td>
            <td :data-testid="qa(`wps-vap-info-authentication-${bandIndex}`)">{{ band.AuthType }}</td>
            <td :data-testid="qa(`wps-vap-info-encryption-${bandIndex}`)">{{ band.EncryType }}</td>
            <td :data-testid="qa(`wps-vap-info-wps-status-${bandIndex}`)">{{ band.Configured }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mobile-cards" :data-testid="qa('wps-vap-info-mobile')">
      <div class="table-card" v-for="(band, bandIndex) in bands" :key="band.Band" :data-testid="qa(`wps-vap-info-card-${bandIndex}`)">
        <div class="card-row">
          <span class="card-label" :data-testid="qa(`wps-vap-info-card-band-label-${bandIndex}`)">{{ t('wireless.band') }}</span>
          <span class="card-value" :data-testid="qa(`wps-vap-info-card-band-value-${bandIndex}`)">{{ band.Band }}</span>
        </div>
        <div class="card-row">
          <span class="card-label" :data-testid="qa(`wps-vap-info-card-ssid-label-${bandIndex}`)">{{ t('wireless.ssid') }}</span>
          <span class="card-value" :data-testid="qa(`wps-vap-info-card-ssid-value-${bandIndex}`)">{{ band.SSID }}</span>
        </div>
        <div class="card-row">
          <span class="card-label" :data-testid="qa(`wps-vap-info-card-authentication-label-${bandIndex}`)">{{ t('wireless.authentication') }}</span>
          <span class="card-value" :data-testid="qa(`wps-vap-info-card-authentication-value-${bandIndex}`)">{{ band.AuthType }}</span>
        </div>
        <div class="card-row">
          <span class="card-label" :data-testid="qa(`wps-vap-info-card-encryption-label-${bandIndex}`)">{{ t('wireless.encryption') }}</span>
          <span class="card-value" :data-testid="qa(`wps-vap-info-card-encryption-value-${bandIndex}`)">{{ band.EncryType }}</span>
        </div>
        <div class="card-row">
          <span class="card-label" :data-testid="qa(`wps-vap-info-card-wps-status-label-${bandIndex}`)">{{ t('wireless.wpsStatus') }}</span>
          <span class="card-value" :data-testid="qa(`wps-vap-info-card-wps-status-value-${bandIndex}`)">{{ band.Configured }}</span>
        </div>
      </div>
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

.table-container {
  padding: 1.5rem;
}

.wps-vap-table {
  table-layout: fixed;
}

.table-container .wps-vap-col-band {
  width: 12%;
}

.table-container .wps-vap-col-ssid {
  width: 28%;
}

.table-container .wps-vap-col-authentication {
  width: 24%;
}

.table-container .wps-vap-col-encryption {
  width: 14%;
}

.table-container .wps-vap-col-status {
  width: 22%;
}

.table-container th:last-child,
.table-container td:last-child {
  text-align: center;
}

@media (max-width: 768px) {
  .table-container {
    padding: 1rem;
  }

  .mobile-cards {
    display: none;
  }

  @media (max-width: 768px) {
    .table-container {
      display: none;
    }

    .mobile-cards {
      display: block;
    }
  }
}
</style>
```
