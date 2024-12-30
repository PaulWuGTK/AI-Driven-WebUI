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
  <div class="config-section">
    <h3 class="section-title">{{ t('wan.wanModeConfig') }}</h3>
    <div class="config-grid">
      <div class="config-row">
        <div class="label">{{ t('wan.dnsMode') }}</div>
        <div class="value">{{ config.DNSMode }}</div>
      </div>
      <div class="config-row">
        <div class="label">{{ t('wan.physicalType') }}</div>
        <div class="value">{{ config.PhysicalType }}</div>
      </div>
      <div class="config-row">
        <div class="label">{{ t('wan.status') }}</div>
        <div class="value">{{ config.Status }}</div>
      </div>
      <div class="config-row">
        <div class="label">{{ t('wan.origin') }}</div>
        <div class="value">{{ config.Origin }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.config-section {
  background-color: white;
  border-radius: 4px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1rem;
  color: #333;
  margin: 0 0 1rem 0;
}

.config-grid {
  display: grid;
  gap: 1rem;
}

.config-row {
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