<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { StatusLcmResponse } from '../../types/lcm';
import { getLcmStatus } from '../../services/api';
import { useQA } from '../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const lcmData = ref<StatusLcmResponse | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const refreshInterval = ref<number | null>(null);

const fetchLcmStatus = async () => {
  loading.value = true;
  error.value = null;
  const scrollY = window.scrollY;
  try {
    const newData = await getLcmStatus();
    // Only update if data has changed to prevent unnecessary re-renders
    if (JSON.stringify(newData) !== JSON.stringify(lcmData.value)) {
      lcmData.value = newData;
    }
  } catch (err) {
    console.error('Error fetching LCM status:', err);
    error.value = 'Failed to fetch LCM status';
  } finally {
    loading.value = false;
    requestAnimationFrame(() => window.scrollTo(0, scrollY));
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
    <h1 class="page-title" :data-testid="qa('lcm-title')">{{ t('lcm.title') }}</h1>

    <div class="status-content" :data-testid="qa('lcm-content')">
      <div v-if="loading && !lcmData" class="loading-state" :data-testid="qa('lcm-loading')">
        <div class="loading-spinner"></div>
        <span>{{ t('common.loading') }}</span>
      </div>

      <div v-else-if="error" class="error-state" :data-testid="qa('lcm-error')">
        {{ error }}
      </div>

      <template v-else-if="lcmData">
        <!-- Summary Section -->
        <div class="panel-section" :data-testid="qa('lcm-summary-section')">
          <div class="section-title" :data-testid="qa('lcm-summary-title')">{{ t('lcm.status') }}</div>
          
          <div class="card-content">
            <div class="table-container" :data-testid="qa('lcm-summary-table')">
              <table>
                <tbody>
                  <tr :data-testid="qa('lcm-exec-env-row')">
                    <td :data-testid="qa('lcm-exec-env-label')">{{ t('lcm.execEnv') }}</td>
                    <td :data-testid="qa('lcm-exec-env-value')">{{ lcmData.StatusLcm.ExecEnvNumberOfEntries }}</td>
                  </tr>
                  <tr :data-testid="qa('lcm-exec-units-row')">
                    <td :data-testid="qa('lcm-exec-units-label')">{{ t('lcm.execUnits') }}</td>
                    <td :data-testid="qa('lcm-exec-units-value')">{{ lcmData.StatusLcm.ExecutionUnitNumberOfEntries }}</td>
                  </tr>
                  <tr :data-testid="qa('lcm-deploy-units-row')">
                    <td :data-testid="qa('lcm-deploy-units-label')">{{ t('lcm.deployUnits') }}</td>
                    <td :data-testid="qa('lcm-deploy-units-value')">{{ lcmData.StatusLcm.DeploymentUnitNumberOfEntries }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="mobile-cards" :data-testid="qa('lcm-summary-mobile')">
              <div class="card-row">
                <span class="card-label" :data-testid="qa('lcm-exec-env-mobile-label')">{{ t('lcm.execEnv') }}</span>
                <span class="card-value" :data-testid="qa('lcm-exec-env-mobile-value')">{{ lcmData.StatusLcm.ExecEnvNumberOfEntries }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa('lcm-exec-units-mobile-label')">{{ t('lcm.execUnits') }}</span>
                <span class="card-value" :data-testid="qa('lcm-exec-units-mobile-value')">{{ lcmData.StatusLcm.ExecutionUnitNumberOfEntries }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa('lcm-deploy-units-mobile-label')">{{ t('lcm.deployUnits') }}</span>
                <span class="card-value" :data-testid="qa('lcm-deploy-units-mobile-value')">{{ lcmData.StatusLcm.DeploymentUnitNumberOfEntries }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Deployment Units Section -->
        <div class="panel-section" v-if="lcmData.StatusLcm.DeploymentUnits.length > 0" :data-testid="qa('lcm-deployment-section')">
          <div class="section-title" :data-testid="qa('lcm-deployment-title')">{{ t('lcm.deploymentUnits') }}</div>
          
          <div class="card-content">
            <div class="cards-grid" :data-testid="qa('lcm-deployment-grid')">
              <div 
                class="deployment-card" 
                v-for="(unit, unitIndex) in lcmData.StatusLcm.DeploymentUnits" 
                :key="unit.UUID"
                :data-testid="qa(`lcm-deployment-card-${unitIndex}`)"
              >
                <div class="card-header">
                  <div class="title-with-status">
                    <span 
                      class="status-dot"
                      :class="{ 'resolved': unit.Resolved === 1 }"
                      :data-testid="qa(`lcm-deployment-status-dot-${unitIndex}`)"
                    ></span>
                    <h3 class="card-title" :data-testid="qa(`lcm-deployment-alias-${unitIndex}`)">{{ unit.Alias }}</h3>
                  </div>
                </div>
                <div class="card-content">
                  <div class="card-row">
                    <span class="card-label" :data-testid="qa(`lcm-deployment-name-label-${unitIndex}`)">{{ t('lcm.name') }}</span>
                    <span class="card-value text-ellipsis" :title="unit.Name" :data-testid="qa(`lcm-deployment-name-value-${unitIndex}`)">{{ unit.Name }}</span>
                  </div>
                  <div class="card-row">
                    <span class="card-label" :data-testid="qa(`lcm-deployment-status-label-${unitIndex}`)">{{ t('lcm.status') }}</span>
                    <span class="card-value" :data-testid="qa(`lcm-deployment-status-value-${unitIndex}`)">{{ unit.Status }}</span>
                  </div>
                  <div class="card-row">
                    <span class="card-label" :data-testid="qa(`lcm-deployment-url-label-${unitIndex}`)">{{ t('lcm.url') }}</span>
                    <span class="card-value text-ellipsis" :title="unit.URL" :data-testid="qa(`lcm-deployment-url-value-${unitIndex}`)">{{ unit.URL }}</span>
                  </div>
                  <div class="card-row">
                    <span class="card-label" :data-testid="qa(`lcm-deployment-uuid-label-${unitIndex}`)">{{ t('lcm.uuid') }}</span>
                    <span class="card-value text-ellipsis" :title="unit.UUID" :data-testid="qa(`lcm-deployment-uuid-value-${unitIndex}`)">{{ unit.UUID }}</span>
                  </div>
                  <div class="card-row">
                    <span class="card-label" :data-testid="qa(`lcm-deployment-vendor-label-${unitIndex}`)">{{ t('lcm.vendor') }}</span>
                    <span class="card-value" :data-testid="qa(`lcm-deployment-vendor-value-${unitIndex}`)">{{ unit.Vendor }}</span>
                  </div>
                  <div class="card-row">
                    <span class="card-label" :data-testid="qa(`lcm-deployment-version-label-${unitIndex}`)">{{ t('lcm.version') }}</span>
                    <span class="card-value" :data-testid="qa(`lcm-deployment-version-value-${unitIndex}`)">{{ unit.Version }}</span>
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
  flex-shrink: 0;
}

.status-dot.resolved {
  background-color: #4caf50;
}

.card-title {
  margin: 0;
  font-size: 1rem;
  color: var(--text-primary);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-color);
  align-items: center;
  gap: 1rem;
}

.card-row:last-child {
  border-bottom: none;
}

.card-label {
  color: var(--text-secondary);
  flex-shrink: 0;
  min-width: 80px;
}

.card-value {
  color: var(--text-primary);
  text-align: right;
  word-break: break-word;
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

  .card-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .card-value {
    text-align: left;
    width: 100%;
  }
}
</style>