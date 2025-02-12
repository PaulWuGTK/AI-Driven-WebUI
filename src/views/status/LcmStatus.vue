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
  <div class="page-container">
    <h1 class="page-title">{{ t('lcm.title') }}</h1>

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
        <div class="panel-section">
          <div class="section-title">{{ t('lcm.status') }}</div>
          
          <div class="card-content">
            <div class="table-container">
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
        </div>

        <!-- Deployment Units Section -->
        <div class="panel-section" v-if="lcmData.StatusLcm.DeploymentUnits.length > 0">
          <div class="section-title">{{ t('lcm.deploymentUnits') }}</div>
          
          <div class="card-content">
            <div class="cards-grid">
              <div 
                class="deployment-card" 
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
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.deployment-card {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  overflow: hidden;
}

.card-header {
  padding: 1rem;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
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

.card-title {
  margin: 0;
  font-size: 1rem;
  color: var(--text-primary);
  font-weight: 500;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  background-color: white;
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
}

.error-state {
  padding: 2rem;
  text-align: center;
  color: #dc3545;
  background-color: white;
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
}

@media (max-width: 768px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }

  .table-container {
    display: none;
  }

  .mobile-cards {
    display: block;
  }
}
</style>