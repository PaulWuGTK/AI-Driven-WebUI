<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { StatisticsResponse } from '../../types/statistics';
import { getStatistics } from '../../services/api';

const { t } = useI18n();
const statisticsData = ref<StatisticsResponse | null>(null);

const fetchStatistics = async () => {
  try {
    statisticsData.value = await getStatistics();
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
        <div class="section-header">{{ t('statistics.ethernet') }}</div>
        <div class="table-wrapper">
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
        <div class="section-header">{{ t('statistics.wlan') }}</div>
        <div class="table-wrapper">
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

.statistics-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.statistics-section {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-header {
  padding: 0.5rem 2rem;
  font-size: 1rem;
  color: #333;
  text-align: left;
  background-color: #F8F8FA;
  border-bottom: 1px solid #e0e0e0;
}

</style>