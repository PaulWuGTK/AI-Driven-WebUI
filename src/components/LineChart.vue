<script setup lang="ts">
import { Chart, registerables } from 'chart.js';
import { ref, onMounted, watch, defineProps } from 'vue';
import { useQA } from '../utils/qa';
const { isQAMode, qa, slug } = useQA();

Chart.register(...registerables);

const props = defineProps<{
  chartData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      fill: boolean;
    }[];
  };
}>();

const chartRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

// 初始化圖表
const renderChart = () => {
  if (chartRef.value && props.chartData) {
    if (chartInstance) {
      chartInstance.destroy();
    }
    chartInstance = new Chart(chartRef.value, {
      type: 'line',
      data: props.chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
};

// 監聽 chartData 變化並重新繪製
watch(
  () => props.chartData,
  (newData) => {
//    console.log('Chart data updated:', newData);
    renderChart();
  },
  { deep: true }
);

onMounted(() => {
  renderChart();
});
</script>

<template>
  <div class="chart-container" :data-testid="qa('line-chart-container')">
    <canvas ref="chartRef" :data-testid="qa('line-chart-canvas')"></canvas>
  </div>
</template>

<style scoped>
.chart-container {
  width: 100%;
  height: 300px;
}
</style>