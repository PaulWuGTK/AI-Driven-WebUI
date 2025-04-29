<script setup lang="ts">
import { ref, onMounted, watch, defineProps, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';
import { Chart, registerables } from 'chart.js';
import type { ChartDataSeries } from '../types/systemStats';

Chart.register(...registerables);

const { t } = useI18n();

const props = defineProps<{
  chartData: ChartDataSeries;
  title: string;
  labelTx: string;
  labelRx: string;
  unit: string;
}>();

const chartRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

// Initialize chart
const renderChart = () => {
  if (chartRef.value && props.chartData) {
    if (chartInstance) {
      chartInstance.destroy();
    }
    
    const ctx = chartRef.value.getContext('2d');
    if (!ctx) return;
    
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: props.chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              display: true,
              color: '#f0f0f0'
            },
            ticks: {
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 6
            }
          },
          y: {
            grid: {
              display: true,
              color: '#f0f0f0'
            },
            ticks: {
              callback: function(value) {
                return value + ' ' + props.unit;
              }
            },
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + context.parsed.y.toFixed(2) + ' ' + props.unit;
              }
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        },
        elements: {
          point: {
            radius: 0,
            hoverRadius: 5
          },
          line: {
            tension: 0.4
          }
        }
      }
    });
  }
};

// Watch for changes in chartData and redraw
watch(
  () => props.chartData,
  () => {
    renderChart();
  },
  { deep: true }
);

onMounted(() => {
  renderChart();
});
</script>

<template>
  <div class="throughput-chart">
    <h3 class="chart-title">{{ title }}</h3>
    <div class="chart-container">
      <canvas ref="chartRef"></canvas>
    </div>
    <div class="chart-legend">
      <div class="legend-item">
        <span class="legend-color tx-color"></span>
        <span class="legend-label">{{ labelTx }}</span>
      </div>
      <div class="legend-item">
        <span class="legend-color rx-color"></span>
        <span class="legend-label">{{ labelRx }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.throughput-chart {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.chart-title {
  font-size: 1.1rem;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  text-align: center;
}

.chart-container {
  width: 100%;
  height: 300px;
  position: relative;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-color {
  width: 20px;
  height: 10px;
  border-radius: 2px;
}

.tx-color {
  background-color: rgba(0, 112, 187, 0.7);
}

.rx-color {
  background-color: rgba(116, 119, 191, 0.7);
}

.legend-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}
</style>