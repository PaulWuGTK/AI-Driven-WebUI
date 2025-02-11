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
  <div class="page-container">
    <h1 class="page-title">{{ t('statistics.title') }}</h1>

    <div v-if="statisticsData" class="status-content">
      <!-- Ethernet Statistics -->
      <div class="panel-section">
        <div class="section-title">{{ t('statistics.ethernet') }}</div>
        
        <div class="card-content">
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

          <div class="mobile-cards">
            <div class="table-card" v-for="entry in statisticsData.Statistics.Ethernet" :key="entry.Port">
              <div class="card-row">
                <span class="card-label">{{ t('statistics.port') }}</span>
                <span class="card-value">{{ entry.Port }}</span>
              </div>
              <div class="card-section">
                <div class="section-subtitle">Rx</div>
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
                <div class="section-subtitle">Tx</div>
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

      <!-- WLAN Statistics -->
      <div class="panel-section">
        <div class="section-title">{{ t('statistics.wlan') }}</div>
        
        <div class="card-content">
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

          <div class="mobile-cards">
            <div class="table-card" v-for="entry in statisticsData.Statistics.Wlan" :key="entry.Port">
              <div class="card-row">
                <span class="card-label">{{ t('statistics.port') }}</span>
                <span class="card-value">{{ entry.Port }}</span>
              </div>
              <div class="card-section">
                <div class="section-subtitle">Rx</div>
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
                <div class="section-subtitle">Tx</div>
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
  </div>
</template>

<style scoped>

.card-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.section-subtitle {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

</style>