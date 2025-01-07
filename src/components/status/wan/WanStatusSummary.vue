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
  <div class="panel-section">
    <div class="section-title">{{ t('wan.status') }}</div>
    <div class="status-section">
      <div class="status-grid">
        <div class="status-row">
          <div class="label">{{ t('wan.operationMode') }}</div>
          <div class="value">{{ status.OperationMode }}</div>
        </div>
        <div class="status-row">
          <div class="label">{{ t('wan.sensingPolicy') }}</div>
          <div class="value">{{ status.SensingPolicy }}</div>
        </div>
        <div class="status-row">
          <div class="label">{{ t('wan.sensingTimeout') }}</div>
          <div class="value">{{ status.SensingTimeout }}</div>
        </div>
        <div class="status-row">
          <div class="label">{{ t('wan.wanMode') }}</div>
          <div class="value">{{ status.WANMode }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.status-section {
  background-color: white;
  border-radius: 4px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.status-grid {
  display: grid;
  gap: 1rem;
}

.status-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.label {
  color: #333;
  font-weight: normal;
}

.value {
  color: #000;
}
</style>