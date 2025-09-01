<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { GuestDeviceConnectedResponse } from '../../../types/guest';
import { getGuestDeviceConnected } from '../../../services/api/guestAccess';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

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
  <div class="device-connected" :data-testid="qa('guest-device-connected-content')">
    <div v-if="loading" class="loading-state" :data-testid="qa('guest-device-connected-loading')">
      <div class="loading-spinner"></div>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="error" class="error-state" :data-testid="qa('guest-device-connected-error')">
      {{ error }}
    </div>

    <template v-else-if="deviceData">
      <div class="table-container" :data-testid="qa('guest-device-connected-table')">
        <table>
          <thead>
            <tr>
              <th :data-testid="qa('guest-device-connected-header-hostname')">{{ t('guest.hostName') }}</th>
              <th :data-testid="qa('guest-device-connected-header-mac')">{{ t('guest.macAddress') }}</th>
              <th :data-testid="qa('guest-device-connected-header-ip')">{{ t('guest.ipAddress') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(device, index) in deviceData.GuestDeviceConnected" :key="device.MACAddress" :data-testid="qa(`guest-device-connected-row-${index}`)">
              <td :data-testid="qa(`guest-device-connected-hostname-${index}`)">{{ device.Host }}</td>
              <td :data-testid="qa(`guest-device-connected-mac-${index}`)">{{ device.MACAddress }}</td>
              <td :data-testid="qa(`guest-device-connected-ip-${index}`)">{{ device.IPAddress }}</td>
            </tr>
            <tr v-if="deviceData.GuestDeviceConnected.length === 0" :data-testid="qa('guest-device-connected-no-data-row')">
              <td colspan="3" class="no-data" :data-testid="qa('guest-device-connected-no-data')">{{ t('guest.deviceConnected') }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mobile-cards" :data-testid="qa('guest-device-connected-mobile')">
        <div v-if="deviceData.GuestDeviceConnected.length === 0" class="no-data-mobile" :data-testid="qa('guest-device-connected-no-data-mobile')">
          {{ t('guest.deviceConnected') }}
        </div>
        <div 
          class="table-card" 
          v-else
          v-for="(device, index) in deviceData.GuestDeviceConnected" 
          :key="device.MACAddress"
          :data-testid="qa(`guest-device-connected-card-${index}`)"
        >
          <div class="card-row">
            <span class="card-label" :data-testid="qa(`guest-device-connected-card-hostname-label-${index}`)">{{ t('guest.hostName') }}</span>
            <span class="card-value" :data-testid="qa(`guest-device-connected-card-hostname-value-${index}`)">{{ device.Host }}</span>
          </div>
          <div class="card-row">
            <span class="card-label" :data-testid="qa(`guest-device-connected-card-mac-label-${index}`)">{{ t('guest.macAddress') }}</span>
            <span class="card-value" :data-testid="qa(`guest-device-connected-card-mac-value-${index}`)">{{ device.MACAddress }}</span>
          </div>
          <div class="card-row">
            <span class="card-label" :data-testid="qa(`guest-device-connected-card-ip-label-${index}`)">{{ t('guest.ipAddress') }}</span>
            <span class="card-value" :data-testid="qa(`guest-device-connected-card-ip-value-${index}`)">{{ device.IPAddress }}</span>
          </div>
        </div>
      </div>

      <div class="button-group">
        <button class="btn btn-primary" :data-testid="qa('guest-device-connected-refresh-button')" @click="fetchDeviceConnected">
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