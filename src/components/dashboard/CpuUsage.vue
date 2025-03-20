<script setup lang="ts">
import { defineProps, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DashboardCPU } from '../../types/dashboard';

const { t } = useI18n();

const props = defineProps<{
  cpuInfo?: DashboardCPU;
}>();

const usageHistory = ref<number[]>([]);
const maxHistoryPoints = 10;

watch(() => props.cpuInfo?.CPUUsage, (newUsage) => {
  if (newUsage !== undefined) {
    usageHistory.value.push(Math.min(newUsage, 100));
    if (usageHistory.value.length > maxHistoryPoints) {
      usageHistory.value.shift();
    }
  }
});
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
          v-for="(value, index) in usageHistory" 
          :key="index"
          class="graph-bar"
          :style="{ height: `${value}%` }"
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
  gap: 2px;
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