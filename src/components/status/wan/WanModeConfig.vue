<script setup lang="ts">
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WanModeConfig } from '../../../types/wan';

const { t } = useI18n();

defineProps<{
  config: WanModeConfig;
}>();
</script>

<template>
  <div class="wan-mode-config">
    <div class="section-title">{{ t('wan.wanModeConfig') }}</div>
    
    <div class="card-content">
      <div class="info-grid">
        <div class="info-row">
          <span class="info-label">{{ t('wan.dnsMode') }}</span>
          <span class="info-value">{{ config.DNSMode }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">{{ t('wan.physicalType') }}</span>
          <span class="info-value">{{ config.PhysicalType }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">{{ t('wan.status') }}</span>
          <span class="info-value">{{ config.Status }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">{{ t('wan.origin') }}</span>
          <span class="info-value">{{ config.Origin }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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