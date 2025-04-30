<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { LanBasicResponse } from '../../../types/lanBasic';
import { getLanBasic } from '../../../services/api/lanBasic';

const { t } = useI18n();
const lanData = ref<LanBasicResponse | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const fetchLanBasic = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getLanBasic();
    lanData.value = response;
  } catch (err) {
    console.error('Error fetching LAN basic:', err);
    error.value = 'Failed to fetch connected devices';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchLanBasic);
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

    <template v-else-if="lanData">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>{{ t('lanBasic.hostName') }}</th>
              <th>{{ t('lanBasic.macAddress') }}</th>
              <th>{{ t('lanBasic.ipAddress') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="device in lanData.LanBasic.DeviceConnected" :key="device.MACAddress">
              <td>{{ device.Host }}</td>
              <td>{{ device.MACAddress }}</td>
              <td>{{ device.IPAddress }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mobile-cards">
        <div 
          class="table-card" 
          v-for="device in lanData.LanBasic.DeviceConnected" 
          :key="device.MACAddress"
        >
          <div class="card-row">
            <span class="card-label">{{ t('lanBasic.hostName') }}</span>
            <span class="card-value">{{ device.Host }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">{{ t('lanBasic.macAddress') }}</span>
            <span class="card-value">{{ device.MACAddress }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">{{ t('lanBasic.ipAddress') }}</span>
            <span class="card-value">{{ device.IPAddress }}</span>
          </div>
        </div>
      </div>

      <div class="button-group">
        <button class="btn btn-primary" @click="fetchLanBasic">
          <span class="material-icons">refresh</span>
          {{ t('lanBasic.refresh') }}
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