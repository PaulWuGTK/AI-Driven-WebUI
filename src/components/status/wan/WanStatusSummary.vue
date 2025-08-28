<script setup lang="ts">
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import type { StatusWan } from '../../../types/wan';

const { t } = useI18n();

defineProps<{
  status: StatusWan;
}>();
</script>

<template>
  <div class="wan-status-summary">
    <div class="section-title">{{ t('wan.status') }}</div>
    
    <div class="card-content">
      <div class="info-grid">
        <div class="info-row">
          <span class="info-label">{{ t('wan.operationMode') }}</span>
          <span class="info-value" :id="`wan-opMode-value`">{{ status.OperationMode }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">{{ t('wan.sensingPolicy') }}</span>
          <span class="info-value" :id="`wan-sensingPolicy-value`">{{ status.SensingPolicy }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">{{ t('wan.sensingTimeout') }}</span>
          <span class="info-value" :id="`wan-sensingTimeout-value`">{{ status.SensingTimeout }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">{{ t('wan.wanMode') }}</span>
          <span class="info-value" :id="`wan-mode-value`">{{ status.WANMode }}</span>
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