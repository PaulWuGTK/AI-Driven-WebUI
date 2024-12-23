<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { StatisticsResponse } from '../../types/statistics';
import { getMockStatistics } from '../../services/mockApi';

const { t } = useI18n();
const statisticsData = ref<StatisticsResponse | null>(null);

const fetchStatistics = async () => {
  try {
    // In production, this would be a real API call
    // const response = await fetch('/API/info?list=Statistics');
    // statisticsData.value = await response.json();
    
    // Using mock data for development
    statisticsData.value = getMockStatistics();
  } catch (error) {
    console.error('Error fetching statistics:', error);
  }
};

onMounted(() => {
  fetchStatistics();
});
</script>

<template>
  <div class="statistics">
    <h1 class="page-title">{{ t('statistics.title') }}</h1>

    <div v-if="statisticsData" class="statistics-content">
      <!-- Ethernet Statistics -->
      <div class="statistics-section">
        <h2 class="section-title">{{ t('statistics.ethernet') }}</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>{{ t('statistics.port') }}</th>
                <th>{{ t('statistics.rxBytes') }}</th>
                <th>{{ t('statistics.rxPackets') }}</th>
                <th>{{ t('statistics.rxError') }}</th>
                <th>{{ t('statistics.rxDiscard') }}</th>
                <th>{{ t('statistics.txBytes') }}</th>
                <th>{{ t('statistics.txPackets') }}</th>
                <th>{{ t('statistics.txError') }}</th>
                <th>{{ t('statistics.txDiscard') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entry in statisticsData.Statistics.Ethernet" :key="entry.Port">
                <td>{{ entry.Port }}</td>
                <td>{{ entry.RxBytes }}</td>
                <td>{{ entry.RxPackets }}</td>
                <td>{{ entry.RxError }}</td>
                <td>{{ entry.RxDiscard }}</td>
                <td>{{ entry.TxBytes }}</td>
                <td>{{ entry.TxPackets }}</td>
                <td>{{ entry.TxError }}</td>
                <td>{{ entry.TxDiscard }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- WLAN Statistics -->
      <div class="statistics-section">
        <h2 class="section-title">{{ t('statistics.wlan') }}</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>{{ t('statistics.port') }}</th>
                <th>{{ t('statistics.rxBytes') }}</th>
                <th>{{ t('statistics.rxPackets') }}</th>
                <th>{{ t('statistics.rxError') }}</th>
                <th>{{ t('statistics.rxDiscard') }}</th>
                <th>{{ t('statistics.txBytes') }}</th>
                <th>{{ t('statistics.txPackets') }}</th>
                <th>{{ t('statistics.txError') }}</th>
                <th>{{ t('statistics.txDiscard') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entry in statisticsData.Statistics.Wlan" :key="entry.Port">
                <td>{{ entry.Port }}</td>
                <td>{{ entry.RxBytes }}</td>
                <td>{{ entry.RxPackets }}</td>
                <td>{{ entry.RxError }}</td>
                <td>{{ entry.RxDiscard }}</td>
                <td>{{ entry.TxBytes }}</td>
                <td>{{ entry.TxPackets }}</td>
                <td>{{ entry.TxError }}</td>
                <td>{{ entry.TxDiscard }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.statistics {
  flex: 1;
  background-color: #f5f5f5;
  min-height: 100%;
}

.page-title {
  color: #0070BB;
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0;
  padding: 1rem 2rem;
  text-align: left;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.statistics-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.statistics-section {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.section-title {
  padding: 1rem 1.5rem;
  font-size: 1rem;
  color: #333;
  margin: 0;
  background-color: #f8f8f8;
  border-bottom: 1px solid #e0e0e0;
}

.table-container {
  padding: 1.5rem;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border: 1px solid #e0e0e0;
}

th {
  background-color: #f8f8f8;
  font-weight: normal;
  color: #666;
}

td {
  color: #333;
}

tr:hover td {
  background-color: #f5f5f5;
}
</style>