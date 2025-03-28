<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { DashboardCPU } from '../../types/dashboard'

ChartJS.register(ArcElement, Tooltip, Legend)

const { t } = useI18n()

const props = defineProps<{
  cpuInfo?: DashboardCPU;
}>()

const usage = computed(() => props.cpuInfo?.CPUUsage ?? 0)

const colorByUsage = (value: number) => {
  if (value < 40) return '#0070BB'   // 藍色（低）
  if (value < 80) return '#FFA500'   // 橙色（中）
  return '#D32F2F'                   // 紅色（高）
}

const chartData = computed(() => ({
  labels: ['Used', 'Free'],
  datasets: [
    {
      data: [usage.value, 100 - usage.value],
      backgroundColor: [colorByUsage(usage.value), '#e0e0e0'],
      borderWidth: 0
    }
  ]
}))

const chartOptions = {
  cutout: '70%',
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false }
  }
}
</script>

<template>
  <div class="memory-status" v-if="cpuInfo">
    <h2 class="card-title">{{ t('dashboard.cpu') }}</h2>
    <div class="cpu-chart-container">
      
      <div class="chart-wrapper">
        <Doughnut :data="chartData" :options="chartOptions" />
        <div class="center-label">{{ usage }}%</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cpu-chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.chart-wrapper {
  position: relative;
  width: 150px;
  height: 150px;
}

.center-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
}

.card-title {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 1rem;
}
</style>