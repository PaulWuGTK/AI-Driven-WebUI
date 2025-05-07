<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { GuestDeviceConnectedResponse } from '../../../types/guest';
import { getGuestDeviceConnected } from '../../../services/api/guestAccess';

const { t } = useI18n();
const deviceData = ref<GuestDeviceConnectedResponse | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const fetchDeviceConnected = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getGuestDeviceConnected();
    deviceData.value = response;
  } catch (err) {
    console.error('Error fetching guest connected devices:', err);
    error.value = 'Failed to fetch guest connected devices';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchDeviceConnected);
</script>

<template>
  <div class="device-connected">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>

    <template v-else-if="deviceData">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Host Name</th>
              <th>MAC Address</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="device in deviceData.GuestDeviceConnected" :key="device.MACAddress">
              <td>{{ device.Host }}</td>
              <td>{{ device.MACAddress }}</td>
              <td>{{ device.IPAddress }}</td>
            </tr>
            <tr v-if="deviceData.GuestDeviceConnected.length === 0">
              <td colspan="3" class="no-data">No devices connected</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mobile-cards">
        <div v-if="deviceData.GuestDeviceConnected.length === 0" class="no-data-mobile">
          No devices connected
        </div>
        <div 
          class="table-card" 
          v-else
          v-for="device in deviceData.GuestDeviceConnected" 
          :key="device.MACAddress"
        >
          <div class="card-row">
            <span class="card-label">Host Name</span>
            <span class="card-value">{{ device.Host }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">MAC Address</span>
            <span class="card-value">{{ device.MACAddress }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">IP Address</span>
            <span class="card-value">{{ device.IPAddress }}</span>
          </div>
        </div>
      </div>

      <div class="button-group">
        <button class="btn btn-primary" @click="fetchDeviceConnected">
          <span class="material-icons">refresh</span>
          {{ t('common.refresh') }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.device-connected {
  padding: 1.5rem;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.button-group {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.no-data {
  text-align: center;
  padding: 1rem;
  color: var(--text-secondary);
}

.no-data-mobile {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  background-color: var(--bg-secondary);
  border-radius: 4px;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .device-connected {
    padding: 1rem;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .table-container {
    display: none;
  }

  .mobile-cards {
    display: block;
  }
}
</style>