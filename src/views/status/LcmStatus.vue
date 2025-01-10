<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { LcmApiResponse, SoftwareModuleParameters, DeploymentUnit } from '../../types/lcm';
import { getLcmStatus } from '../../services/api';

const { t } = useI18n();
const moduleParameters = ref<SoftwareModuleParameters | null>(null);
const deploymentUnits = ref<DeploymentUnit[]>([]);
const refreshInterval = ref<number | null>(null);

const fetchLcmStatus = async () => {
  try {
    const response = await getLcmStatus();
    
    // Find and set the main parameters
    const mainModule = response.find(item => item.path === "Device.SoftwareModules.");
    if (mainModule && 'parameters' in mainModule) {
      moduleParameters.value = mainModule.parameters as SoftwareModuleParameters;
    }

    // Find and set deployment units
    const units = response.filter(item => 
      item.path.startsWith("Device.SoftwareModules.DeploymentUnit.") &&
      'parameters' in item
    ).map(item => item.parameters as DeploymentUnit);
    
    deploymentUnits.value = units;
  } catch (error) {
    console.error('Error fetching LCM status:', error);
  }
};

onMounted(() => {
  fetchLcmStatus();
  // Set up auto-refresh every 10 seconds
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
      <!-- Summary Section -->
      <div class="status-section">
        <div class="section-title">{{ t('lcm.status') }}</div>
        
        <!-- PC版表格 -->
        <div class="table-wrapper" v-if="moduleParameters">
          <table>
            <tbody>
              <tr>
                <td>{{ t('lcm.execEnv') }}</td>
                <td>{{ moduleParameters.ExecEnvNumberOfEntries }}</td>
              </tr>
              <tr>
                <td>{{ t('lcm.execUnits') }}</td>
                <td>{{ moduleParameters.ExecutionUnitNumberOfEntries }}</td>
              </tr>
              <tr>
                <td>{{ t('lcm.deployUnits') }}</td>
                <td>{{ moduleParameters.DeploymentUnitNumberOfEntries }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 手機版卡片 -->
        <div class="mobile-cards" v-if="moduleParameters">
          <div class="card-row">
            <span class="card-label">{{ t('lcm.execEnv') }}</span>
            <span class="card-value">{{ moduleParameters.ExecEnvNumberOfEntries }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">{{ t('lcm.execUnits') }}</span>
            <span class="card-value">{{ moduleParameters.ExecutionUnitNumberOfEntries }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">{{ t('lcm.deployUnits') }}</span>
            <span class="card-value">{{ moduleParameters.DeploymentUnitNumberOfEntries }}</span>
          </div>
        </div>
      </div>

      <!-- Deployment Units Section -->
      <div class="status-section" v-if="deploymentUnits.length > 0">
        <div class="section-title">{{ t('lcm.deploymentUnits') }}</div>
        
        <!-- PC版表格 -->
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>{{ t('lcm.name') }}</th>
                <th>{{ t('lcm.status') }}</th>
                <th>{{ t('lcm.url') }}</th>
                <th>{{ t('lcm.uuid') }}</th>
                <th>{{ t('lcm.vendor') }}</th>
                <th>{{ t('lcm.version') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="unit in deploymentUnits" :key="unit.UUID">
                <td>{{ unit.Name }}</td>
                <td>{{ unit.Status }}</td>
                <td class="url-cell">{{ unit.URL }}</td>
                <td>{{ unit.UUID }}</td>
                <td>{{ unit.Vendor }}</td>
                <td>{{ unit.Version }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 手機版卡片 -->
        <div class="mobile-cards">
          <div class="table-card" v-for="unit in deploymentUnits" :key="unit.UUID">
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
</style>