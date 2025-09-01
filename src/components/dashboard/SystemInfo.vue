<script setup lang="ts">
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DashboardSystem } from '../../types/dashboard';
import { useQA } from '../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();

defineProps<{
  systemInfo?: DashboardSystem;
}>();
</script>

<template>
  <div class="system-info" v-if="systemInfo" :data-testid="qa('dashboard-system-info-content')">
    <h2 class="card-title" :data-testid="qa('dashboard-system-info-title')">{{ t('dashboard.system') }}</h2>
    <div class="info-grid" :data-testid="qa('dashboard-system-info-grid')">
      <div class="info-item" :data-testid="qa('dashboard-system-info-software-version')">
        <span class="label" :data-testid="qa('dashboard-system-info-software-version-label')">{{ t('dashboard.softwareVersion') }}</span>
        <span class="value" :data-testid="qa('dashboard-system-info-software-version-value')">{{ systemInfo.SoftwareVersion }}</span>
      </div>
      <div class="info-item" :data-testid="qa('dashboard-system-info-hardware-version')">
        <span class="label" :data-testid="qa('dashboard-system-info-hardware-version-label')">{{ t('dashboard.hardwareVersion') }}</span>
        <span class="value" :data-testid="qa('dashboard-system-info-hardware-version-value')">{{ systemInfo.HardwareVersion }}</span>
      </div>
      <div class="info-item" :data-testid="qa('dashboard-system-info-model')">
        <span class="label" :data-testid="qa('dashboard-system-info-model-label')">{{ t('dashboard.model') }}</span>
        <span class="value" :data-testid="qa('dashboard-system-info-model-value')">{{ systemInfo.ModelName }}</span>
      </div>
      <div class="info-item" :data-testid="qa('dashboard-system-info-serial-number')">
        <span class="label" :data-testid="qa('dashboard-system-info-serial-number-label')">{{ t('dashboard.serialNumber') }}</span>
        <span class="value" :data-testid="qa('dashboard-system-info-serial-number-value')">{{ systemInfo.SerialNumber }}</span>
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