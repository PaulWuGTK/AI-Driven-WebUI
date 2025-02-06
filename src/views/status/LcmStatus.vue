<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { StatusLcmResponse } from '../../types/lcm';
import { getLcmStatus } from '../../services/api';

const { t } = useI18n();
const lcmData = ref<StatusLcmResponse | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const refreshInterval = ref<number | null>(null);

const fetchLcmStatus = async () => {
  loading.value = true;
  error.value = null;
  try {
    lcmData.value = await getLcmStatus();
  } catch (err) {
    console.error('Error fetching LCM status:', err);
    error.value = 'Failed to fetch LCM status';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchLcmStatus();
  // Refresh every 10 seconds
  refreshInterval.value = window.setInterval(fetchLcmStatus, 10000);
});

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
});
</script>

<template>
  <div class="lcm-status">
    <div class="page-title">{{ t('lcm.title') }}</div>

    <div class="status-content">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>Loading...</span>
      </div>

      <div v-else-if="error" class="error-state">
        {{ error }}
      </div>

      <template v-else-if="lcmData">
      <!-- Summary Section -->
      <div class="status-section">
        <div class="section-title">{{ t('lcm.status') }}</div>
        
        <!-- PC版表格 -->
        <div class="table-wrapper">
          <table>
            <tbody>
              <tr>
                <td>{{ t('lcm.execEnv') }}</td>
                  <td>{{ lcmData.StatusLcm.ExecEnvNumberOfEntries }}</td>
              </tr>
              <tr>
                <td>{{ t('lcm.execUnits') }}</td>
                  <td>{{ lcmData.StatusLcm.ExecutionUnitNumberOfEntries }}</td>
              </tr>
              <tr>
                <td>{{ t('lcm.deployUnits') }}</td>
                  <td>{{ lcmData.StatusLcm.DeploymentUnitNumberOfEntries }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 手機版卡片 -->
          <div class="mobile-cards">
          <div class="card-row">
            <span class="card-label">{{ t('lcm.execEnv') }}</span>
              <span class="card-value">{{ lcmData.StatusLcm.ExecEnvNumberOfEntries }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">{{ t('lcm.execUnits') }}</span>
              <span class="card-value">{{ lcmData.StatusLcm.ExecutionUnitNumberOfEntries }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">{{ t('lcm.deployUnits') }}</span>
              <span class="card-value">{{ lcmData.StatusLcm.DeploymentUnitNumberOfEntries }}</span>
          </div>
        </div>
      </div>

      <!-- Deployment Units Section -->
<div class="status-section" v-if="lcmData.StatusLcm.DeploymentUnits.length > 0">
        <div class="section-title">{{ t('lcm.deploymentUnits') }}</div>
        
  <div class="cards-grid">
    <div 
      class="card" 
      v-for="unit in lcmData.StatusLcm.DeploymentUnits" 
      :key="unit.UUID"
    >
      <div class="card-header">
        <div class="title-with-status">
          <span 
            class="status-dot"
            :class="{ 'resolved': unit.Resolved === 1 }"
          ></span>
          <h3 class="card-title">{{ unit.Alias }}</h3>
        </div>
        </div>
      <div class="card-content">
            <div class="card-row">
              <span class="card-label">{{ t('lcm.name') }}</span>
              <span class="card-value">{{ unit.Name }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('lcm.status') }}</span>
              <span class="card-value">{{ unit.Status }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('lcm.url') }}</span>
              <span class="card-value">{{ unit.URL }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('lcm.uuid') }}</span>
              <span class="card-value">{{ unit.UUID }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('lcm.vendor') }}</span>
              <span class="card-value">{{ unit.Vendor }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('lcm.version') }}</span>
              <span class="card-value">{{ unit.Version }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

      </template>
    </div>
  </div>
</template>

<style scoped>
.lcm-status {
  flex: 1;
  background-color: #f5f5f5;
  min-height: 100%;
}

.status-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.status-section {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.section-title {
  padding: 1rem 2rem;
  font-size: 1rem;
  color: #333;
  margin: 0;
  background-color: #f8f8f8;
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
  }

  th {
    background-color: #f8f8f8;
    font-weight: 500;
    color: #333;
  }

  td {
    color: #666;
  }

  /* 特殊欄位樣式 */
  .url-cell {
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mobile-cards {
    display: none;
  }
}

@media (max-width: 767px) {
  .status-content {
    padding: 1rem;
  }

  .table-wrapper {
    display: none;
  }

  .mobile-cards {
    display: block;
  }
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.error-state {
  padding: 2rem;
  text-align: center;
  color: #dc3545;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #0070BB;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
}

.card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.card-header {
  padding: 1rem;
  background-color: #f8f8f8;
  border-bottom: 1px solid #e0e0e0;
}

.title-with-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #dc3545;
}

.status-dot.resolved {
  background-color: #4caf50;
}

.card-content {
  padding: 1rem;
}
.card-title {
  margin: 0;
  font-size: 1rem;
  color: #333;
  font-weight: 500;
}

.status-indicator {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-indicator.resolved {
  background-color: #4caf50;
  color: white;
}

.status-indicator.unresolved {
  background-color: #dc3545;
  color: white;
}

</style>