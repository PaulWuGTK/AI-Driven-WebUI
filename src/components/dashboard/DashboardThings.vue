<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import type { DashboardThingsResponse, DashboardDevice } from '../../types/dashboardThings';
import { getDashboardThings, updateDashboardThing } from '../../services/api/dashboardThings';
import DeviceControlModal from './DeviceControlModal.vue';

const { t } = useI18n();
const router = useRouter();
const devicesData = ref<DashboardThingsResponse | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const selectedDevice = ref<DashboardDevice | null>(null);
const showModal = ref(false);
const refreshInterval = ref<number | null>(null);

// Get device icon based on type
const getDeviceIcon = (type: string): string => {
  if (type.toLowerCase().includes('switch')) return 'toggle_on';
  if (type.toLowerCase().includes('light')) return 'lightbulb';
  if (type.toLowerCase().includes('outlet')) return 'power';
  if (type.toLowerCase().includes('sensor')) return 'sensors';
  if (type.toLowerCase().includes('thermostat')) return 'thermostat';
  if (type.toLowerCase().includes('lock')) return 'lock';
  if (type.toLowerCase().includes('camera')) return 'videocam';
  if (type.toLowerCase().includes('speaker')) return 'speaker';
  return 'device_hub';
};

// Get device status color
const getStatusColor = (onoff: number): string => {
  return onoff === 1 ? '#4caf50' : '#9e9e9e';
};

// Get device status text
const getStatusText = (onoff: number): string => {
  return onoff === 1 ? 'ON' : 'OFF';
};

// Fetch dashboard things
const fetchDashboardThings = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getDashboardThings();
    devicesData.value = response;
  } catch (err) {
    console.error('Error fetching dashboard things:', err);
    error.value = 'Failed to fetch device status';
  } finally {
    loading.value = false;
  }
};

// Handle device click
const handleDeviceClick = (device: DashboardDevice) => {
  selectedDevice.value = device;
  showModal.value = true;
};

// Handle device toggle
const handleDeviceToggle = async (updatedDevice: DashboardDevice) => {
  try {
    await updateDashboardThing({
      DashboardThings: {
        Name: updatedDevice.Name,
        NodeId: updatedDevice.NodeId,
        Type: updatedDevice.Type,
        Onoff: updatedDevice.Onoff
      }
    });
    
    // Update local data
    if (devicesData.value) {
      const deviceIndex = devicesData.value.DashboardThings.Devices.findIndex(
        d => d.NodeId === updatedDevice.NodeId
      );
      if (deviceIndex !== -1) {
        devicesData.value.DashboardThings.Devices[deviceIndex] = updatedDevice;
      }
    }
    
    // Update selected device
    selectedDevice.value = updatedDevice;
    
  } catch (err) {
    console.error('Error updating device:', err);
    error.value = 'Failed to update device';
  }
};

// Close modal
const closeModal = () => {
  showModal.value = false;
  selectedDevice.value = null;
};

// Navigate to Matter QR Scanner
const navigateToQRScanner = () => {
  router.push('/matter/qrscanner');
};

onMounted(() => {
  fetchDashboardThings();
  // Refresh every 10 seconds
  refreshInterval.value = window.setInterval(fetchDashboardThings, 10000);
});

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
});
</script>

<template>
  <div class="dashboard-things">
    <div v-if="loading && !devicesData" class="loading-state">
      <div class="loading-spinner"></div>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>

    <template v-else-if="devicesData">
      <!--div v-if="devicesData.DashboardThings.Devices.length === 0" class="no-devices">
        <span class="material-icons">device_hub</span>
        <p>{{ t('dashboard.noConnectedDevices') }}</p>
      </div-->

      <div class="devices-grid">
        <div 
          v-for="device in devicesData.DashboardThings.Devices" 
          :key="device.NodeId"
          class="device-card"
          @click="handleDeviceClick(device)"
        >
          <div class="device-header">
            <div class="device-icon" :style="{ color: getStatusColor(device.Onoff) }">
              <span class="material-icons">{{ getDeviceIcon(device.Type) }}</span>
            </div>
            <div class="device-status" :style="{ color: getStatusColor(device.Onoff) }">
              {{ getStatusText(device.Onoff) }}
            </div>
          </div>
          
          <div class="device-info">
            <div class="device-name">{{ device.Name }}</div>
            <div class="device-type">{{ device.Type }}</div>
            <div class="device-node-id">Node ID: {{ device.NodeId }}</div>
          </div>
        </div>

        <!-- Add Device Panel -->
        <div class="device-card add-device-card" @click="navigateToQRScanner">
          <div class="add-device-content">
            <div class="add-device-icon">
              <span class="material-icons">add</span>
            </div>
            <div class="add-device-text">
              <div class="add-device-title">{{ t('dashboard.addDevice') }}</div>
              <div class="add-device-subtitle">{{ t('dashboard.quickSetup') }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="refresh-button">
        <button class="btn btn-primary" @click="fetchDashboardThings" :disabled="loading">
          <span class="material-icons">refresh</span>
          {{ t('common.refresh') }}
        </button>
      </div>
    </template>

    <!-- Device Control Modal -->
    <DeviceControlModal
      v-if="selectedDevice"
      :device="selectedDevice"
      :is-open="showModal"
      @close="closeModal"
      @toggle="handleDeviceToggle"
    />
  </div>
</template>

<style scoped>
.dashboard-things {
  padding: 1.5rem;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-state {
  padding: 2rem;
  text-align: center;
  color: #dc3545;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.no-devices {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  color: var(--text-secondary);
}

.no-devices .material-icons {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--text-secondary);
}

.no-devices p {
  margin: 0;
  font-size: 1.1rem;
}

.devices-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.device-card {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.device-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  border-color: var(--primary-color);
}

.add-device-card {
  border: 2px dashed var(--border-color);
  background-color: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 140px;
}

.add-device-card:hover {
  border-color: var(--primary-color);
  background-color: rgba(0, 112, 187, 0.05);
  transform: translateY(-2px);
}

.add-device-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

.add-device-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.add-device-card:hover .add-device-icon {
  transform: scale(1.1);
}

.add-device-icon .material-icons {
  font-size: 1.5rem;
}

.add-device-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.add-device-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.add-device-subtitle {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.device-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.device-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: rgba(0, 112, 187, 0.1);
}

.device-icon .material-icons {
  font-size: 1.5rem;
}

.device-status {
  font-weight: bold;
  font-size: 0.9rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  background-color: rgba(0, 0, 0, 0.05);
}

.device-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.device-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  word-break: break-word;
}

.device-type {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.device-node-id {
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-family: monospace;
}

.refresh-button {
  display: flex;
  justify-content: center;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn:hover:not(:disabled) {
  opacity: 0.9;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .devices-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .dashboard-things {
    padding: 1rem;
  }
  
  .devices-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .device-card {
    padding: 1rem;
  }
  
  .refresh-button .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .devices-grid {
    grid-template-columns: 1fr;
  }
}
</style>