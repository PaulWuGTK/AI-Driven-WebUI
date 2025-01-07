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
        <div class="summary-grid" v-if="moduleParameters">
          <div class="summary-item">
            <span class="label">{{ t('lcm.execEnv') }}</span>
            <span class="value">{{ moduleParameters.ExecEnvNumberOfEntries }}</span>
          </div>
          <div class="summary-item">
            <span class="label">{{ t('lcm.execUnits') }}</span>
            <span class="value">{{ moduleParameters.ExecutionUnitNumberOfEntries }}</span>
          </div>
          <div class="summary-item">
            <span class="label">{{ t('lcm.deployUnits') }}</span>
            <span class="value">{{ moduleParameters.DeploymentUnitNumberOfEntries }}</span>
          </div>
        </div>
      </div>

      <!-- Deployment Units Section -->
      <div class="status-section" v-if="deploymentUnits.length > 0">
        <div class="section-title">{{ t('lcm.deploymentUnits') }}</div>
        <div class="table-container">
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

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  color: #666;
  font-size: 0.9rem;
}

.value {
  color: #333;
  font-size: 1.1rem;
  font-weight: 500;
}

.table-container {
  padding: 1.5rem;
  overflow-x: auto;
}

.url-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

tr:hover td {
  background-color: #f5f5f5;
}
</style>