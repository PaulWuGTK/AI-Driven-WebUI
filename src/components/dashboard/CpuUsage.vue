<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const cpuData = ref({
  usage: 0,
  processes: 0
});

const usageHistory = ref<number[]>([]);
const maxHistoryPoints = 10;

const fetchCpuData = async () => {
  try {
    const response = await fetch('/serviceElements/Device.DeviceInfo.');
    const data = await response.json();
    const processStatus = data.find((item: any) => 
      item.path === 'DeviceInfo.ProcessStatus.')?.parameters;
    
    if (processStatus) {
      cpuData.value = {
        usage: processStatus.CPUUsage,
        processes: processStatus.ProcessNumberOfEntries
      };
      
      usageHistory.value.push(processStatus.CPUUsage);
      if (usageHistory.value.length > maxHistoryPoints) {
        usageHistory.value.shift();
      }
    }
  } catch (error) {
    console.error('Error fetching CPU data:', error);
  }
};

onMounted(() => {
  fetchCpuData();
  setInterval(fetchCpuData, 10000);
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
.cpu-usage {
  height: 100%;
}

.card-title {
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 1rem 0;
}

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
</style>