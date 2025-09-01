<script setup lang="ts">
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WanModeConfig } from '../../../types/wan';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();

defineProps<{
  config: WanModeConfig;
}>();
</script>

<template>
  <div class="wan-mode-config" :data-testid="qa('wan-mode-config-container')">
    <div class="section-title" :data-testid="qa('wan-mode-config-title')">{{ t('wan.wanModeConfig') }}</div>
    
    <div class="card-content" :data-testid="qa('wan-mode-config-content')">
      <div class="info-grid" :data-testid="qa('wan-mode-config-grid')">
        <div class="info-row">
          <span class="info-label" :data-testid="qa('wan-mode-config-dns-mode-label')">{{ t('wan.dnsMode') }}</span>
          <span class="info-value" :data-testid="qa('wan-mode-config-dns-mode-value')">{{ config.DNSMode }}</span>
        </div>
        <div class="info-row">
          <span class="info-label" :data-testid="qa('wan-mode-config-physical-type-label')">{{ t('wan.physicalType') }}</span>
          <span class="info-value" :data-testid="qa('wan-mode-config-physical-type-value')">{{ config.PhysicalType }}</span>
        </div>
        <div class="info-row">
          <span class="info-label" :data-testid="qa('wan-mode-config-status-label')">{{ t('wan.status') }}</span>
          <span class="info-value" :data-testid="qa('wan-mode-config-status-value')">{{ config.Status }}</span>
        </div>
        <div class="info-row">
          <span class="info-label" :data-testid="qa('wan-mode-config-origin-label')">{{ t('wan.origin') }}</span>
          <span class="info-value" :data-testid="qa('wan-mode-config-origin-value')">{{ config.Origin }}</span>
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