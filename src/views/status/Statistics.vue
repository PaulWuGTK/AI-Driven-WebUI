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
        
        <!-- PC版表格 -->
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

        <!-- 手機版卡片 -->
        <div class="mobile-cards">
          <div class="table-card" v-for="entry in statisticsData.Statistics.Ethernet" :key="entry.Port">
            <div class="card-row">
              <span class="card-label">{{ t('statistics.port') }}</span>
              <span class="card-value">{{ entry.Port }}</span>
            </div>
            <div class="card-section">
              <div class="section-title">Rx</div>
              <div class="card-row">
                <span class="card-label">{{ t('statistics.rxBytes') }}</span>
                <span class="card-value">{{ entry.RxBytes }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('statistics.rxPackets') }}</span>
                <span class="card-value">{{ entry.RxPackets }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('statistics.rxError') }}</span>
                <span class="card-value">{{ entry.RxError }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('statistics.rxDiscard') }}</span>
                <span class="card-value">{{ entry.RxDiscard }}</span>
              </div>
            </div>
            <div class="card-section">
              <div class="section-title">Tx</div>
              <div class="card-row">
                <span class="card-label">{{ t('statistics.txBytes') }}</span>
                <span class="card-value">{{ entry.TxBytes }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('statistics.txPackets') }}</span>
                <span class="card-value">{{ entry.TxPackets }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('statistics.txError') }}</span>
                <span class="card-value">{{ entry.TxError }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('statistics.txDiscard') }}</span>
                <span class="card-value">{{ entry.TxDiscard }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- WLAN Statistics -->
      <div class="statistics-section">
        <div class="section-header">{{ t('statistics.wlan') }}</div>
        
        <!-- PC版表格 -->
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

        <!-- 手機版卡片 -->
        <div class="mobile-cards">
          <div class="table-card" v-for="entry in statisticsData.Statistics.Wlan" :key="entry.Port">
            <div class="card-row">
              <span class="card-label">{{ t('statistics.port') }}</span>
              <span class="card-value">{{ entry.Port }}</span>
            </div>
            <div class="card-section">
              <div class="section-title">Rx</div>
              <div class="card-row">
                <span class="card-label">{{ t('statistics.rxBytes') }}</span>
                <span class="card-value">{{ entry.RxBytes }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('statistics.rxPackets') }}</span>
                <span class="card-value">{{ entry.RxPackets }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('statistics.rxError') }}</span>
                <span class="card-value">{{ entry.RxError }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('statistics.rxDiscard') }}</span>
                <span class="card-value">{{ entry.RxDiscard }}</span>
              </div>
            </div>
            <div class="card-section">
              <div class="section-title">Tx</div>
              <div class="card-row">
                <span class="card-label">{{ t('statistics.txBytes') }}</span>
                <span class="card-value">{{ entry.TxBytes }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('statistics.txPackets') }}</span>
                <span class="card-value">{{ entry.TxPackets }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('statistics.txError') }}</span>
                <span class="card-value">{{ entry.TxError }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('statistics.txDiscard') }}</span>
                <span class="card-value">{{ entry.TxDiscard }}</span>
              </div>
            </div>
          </div>
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

.table-wrapper {
  padding: 1.5rem;
  overflow-x: auto;
}

/* 手機版卡片樣式 */
.mobile-cards {
  display: none;
  padding: 1rem;
  gap: 1rem;
}

.table-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.card-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.card-section .section-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 0.5rem;
}

.card-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.card-row:last-child {
  border-bottom: none;
}

.card-label {
  color: #666;
  font-size: 0.9rem;
}

.card-value {
  color: #333;
  font-weight: 500;
  word-break: break-all;
}

/* 響應式設計 */
@media (min-width: 768px) {
  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
    white-space: nowrap;
  }

  th {
    background-color: #f8f8f8;
    font-weight: 500;
    color: #333;
  }

  td {
    color: #666;
  }

  .mobile-cards {
    display: none;
  }
}

@media (max-width: 767px) {
  .table-wrapper {
    display: none;
  }

  .mobile-cards {
    display: block;
  }
}
</style>