<script setup lang="ts">
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DashboardSystem } from '../../types/dashboard';

const { t } = useI18n();

defineProps<{
  systemInfo?: DashboardSystem;
}>();
</script>

<template>
  <div class="system-info" v-if="systemInfo">
    <h2 class="card-title">{{ t('dashboard.system') }}</h2>
    <div class="info-grid">
      <div class="info-item">
        <span class="label">{{ t('dashboard.model') }}</span>
        <span class="value">{{ systemInfo.ModelName }}</span>
      </div>
      <div class="info-item">
        <span class="label">{{ t('dashboard.serialNumber') }}</span>
        <span class="value">{{ systemInfo.SerialNumber }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.info-grid {
  display: grid;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  color: #666;
}

.value {
  color: #333;
  font-weight: 500;
}

.card-title {
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 1rem 0;
}
</style>