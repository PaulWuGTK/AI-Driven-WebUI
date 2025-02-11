<script setup lang="ts">
import type { WlanBand } from '../../types/wlan';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
defineProps<{
  band: WlanBand;
}>();
</script>

<template>
  <div class="band-info">
    <div class="info-grid">
      <div class="info-row">
        <span class="info-label">{{ t('wlan.channel') }}</span>
        <span class="info-value">{{ band.Channel }}{{ band.AutoChannel ? t('wlan.auto') : '' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">{{ t('wlan.bandwidth') }}</span>
        <span class="info-value">{{ band.Bandwidth }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">{{ t('wlan.macAddress') }}</span>
        <span class="info-value">{{ band.MACAddress }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.band-info {
  margin-bottom: 2rem;
}

.info-grid {
  display: grid;
  gap: 1rem;
}

.info-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  align-items: center;
}

.info-label {
  color: var(--text-secondary);
}

.info-value {
  color: var(--text-primary);
  font-weight: 500;
}

@media (max-width: 768px) {
  .info-row {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }

  .info-label {
    font-size: 0.9rem;
  }
}
</style>