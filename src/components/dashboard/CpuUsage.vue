<script setup lang="ts">
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DashboardCPU } from '../../types/dashboard';

const { t } = useI18n();

defineProps<{
  cpuInfo?: DashboardCPU;
}>();
</script>

<template>
  <div class="cpu-usage" v-if="cpuInfo">
    <h2 class="card-title">{{ t('dashboard.cpu') }}</h2>
    <div class="usage-container">
      <div class="usage-info">
        <div class="usage-value">{{ cpuInfo.CPUUsage }}%</div>
      </div>
      <div class="usage-graph">
        <div 
          class="graph-bar"
          :style="{ height: `${cpuInfo.CPUUsage}%` }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.usage-container {
  display: flex;
  gap: 1rem;
  height: 150px;
}

.usage-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
}

.usage-value {
  font-size: 2rem;
  font-weight: bold;
  color: #0070BB;
}

.usage-graph {
  flex: 1;
  display: flex;
  align-items: flex-end;
}

.graph-bar {
  flex: 1;
  background-color: #0070BB;
  opacity: 0.8;
  transition: height 0.3s ease;
  border-radius: 2px 2px 0 0;
}

.card-title {
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 1rem 0;
}
</style>