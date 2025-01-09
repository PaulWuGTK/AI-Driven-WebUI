<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getCpuInfo } from '../../services/api/dashboard';

const { t } = useI18n();
const cpuData = ref({
  usage: 0,
  processes: 0
});

const usageHistory = ref<number[]>([]);
const maxHistoryPoints = 10;
const pollingInterval = ref<number | null>(null);

const fetchCpuData = async () => {
  try {
    const response = await getCpuInfo();

    if (Array.isArray(response)) {
      const cpuInfo = response.find(item => 
        item.parameters?.CPUUsage !== undefined
      );

      if (cpuInfo && cpuInfo.parameters) {
        const cpuUsage = Math.min(cpuInfo.parameters.CPUUsage, 100);
        cpuData.value = {
          usage: cpuUsage,
          processes: cpuInfo.parameters.ProcessNumberOfEntries || 0
        };
        
        usageHistory.value.push(cpuUsage);
        if (usageHistory.value.length > maxHistoryPoints) {
          usageHistory.value.shift();
        }
      } else {
        console.warn("No CPUUsage data found in response.");
      }
    } else {
      console.error("Unexpected response format:", response);
    }
  } catch (error) {
    console.error('Error fetching CPU data:', error);
  }
};

onMounted(() => {
  fetchCpuData();
  pollingInterval.value = window.setInterval(fetchCpuData, 5000);
});

onUnmounted(() => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
  }
});
</script>

<template>
  <div class="cpu-usage">
    <h2 class="card-title">{{ t('dashboard.cpu') }}</h2>
    <div class="usage-container">
      <div class="usage-info">
        <div class="usage-value">{{ cpuData.usage }}%</div>
        <div class="processes">{{ t('dashboard.processes') }}: {{ cpuData.processes }}</div>
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

.processes {
  color: #666;
  font-size: 0.9rem;
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