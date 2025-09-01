<script setup lang="ts">
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import type { StatusWan } from '../../../types/wan';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();

defineProps<{
  status: StatusWan;
}>();
</script>

<template>
  <div class="wan-status-summary" :data-testid="qa('wan-status-summary-container')">
    <div class="section-title" :data-testid="qa('wan-status-summary-title')">{{ t('wan.status') }}</div>
    
    <div class="card-content" :data-testid="qa('wan-status-summary-content')">
      <div class="info-grid" :data-testid="qa('wan-status-summary-grid')">
        <div class="info-row">
          <span class="info-label" :data-testid="qa('wan-status-summary-operation-mode-label')">{{ t('wan.operationMode') }}</span>
          <span class="info-value" :data-testid="qa('wan-status-summary-operation-mode-value')">{{ status.OperationMode }}</span>
        </div>
        <div class="info-row">
          <span class="info-label" :data-testid="qa('wan-status-summary-sensing-policy-label')">{{ t('wan.sensingPolicy') }}</span>
          <span class="info-value" :data-testid="qa('wan-status-summary-sensing-policy-value')">{{ status.SensingPolicy }}</span>
        </div>
        <div class="info-row">
          <span class="info-label" :data-testid="qa('wan-status-summary-sensing-timeout-label')">{{ t('wan.sensingTimeout') }}</span>
          <span class="info-value" :data-testid="qa('wan-status-summary-sensing-timeout-value')">{{ status.SensingTimeout }}</span>
        </div>
        <div class="info-row">
          <span class="info-label" :data-testid="qa('wan-status-summary-wan-mode-label')">{{ t('wan.wanMode') }}</span>
          <span class="info-value" :data-testid="qa('wan-status-summary-wan-mode-value')">{{ status.WANMode }}</span>
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