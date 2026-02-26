<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DeviceConnectedResponse } from '../../../types/lanBasic';
import { getDeviceConnected } from '../../../services/api/lanBasic';
import { BaseTable } from '../../../components/common';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const deviceData = ref<DeviceConnectedResponse | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const deviceColumns = computed(() => [
  { key: 'Host', label: t('lanBasic.hostName'), headerDataTestid: qa('device-connected-header-hostname') },
  { key: 'MACAddress', label: t('lanBasic.macAddress'), headerDataTestid: qa('device-connected-header-mac') },
  { key: 'IPAddress', label: t('lanBasic.ipAddress'), headerDataTestid: qa('device-connected-header-ip') },
]);

const connectedDevices = computed(() => deviceData.value?.LanDeviceConnected ?? []);

const fetchDeviceConnected = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getDeviceConnected();
    deviceData.value = response;
  } catch (err) {
    console.error('Error fetching connected devices:', err);
    error.value = 'Failed to fetch connected devices';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchDeviceConnected);
</script>

<template>
  <div class="device-connected" :data-testid="qa('device-connected-content')">
    <div v-if="loading" class="loading-state" :data-testid="qa('device-connected-loading')">
      <div class="loading-spinner"></div>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="error" class="error-state" :data-testid="qa('device-connected-error')">
      {{ error }}
    </div>

    <template v-else-if="deviceData">
      <BaseTable
        :columns="deviceColumns"
        :data="connectedDevices"
        row-key="MACAddress"
        :table-data-testid="qa('device-connected-table-container')"
        :mobile-data-testid="qa('device-connected-mobile')"
      >
        <template #cell-Host="{ row, index, mobile }">
          <span :data-testid="qa(mobile ? `device-connected-card-hostname-value-${index}` : `device-connected-hostname-${index}`)">
            {{ row.Host }}
          </span>
        </template>
        <template #cell-MACAddress="{ row, index, mobile }">
          <span :data-testid="qa(mobile ? `device-connected-card-mac-value-${index}` : `device-connected-mac-${index}`)">
            {{ row.MACAddress }}
          </span>
        </template>
        <template #cell-IPAddress="{ row, index, mobile }">
          <span :data-testid="qa(mobile ? `device-connected-card-ip-value-${index}` : `device-connected-ip-${index}`)">
            {{ row.IPAddress }}
          </span>
        </template>
      </BaseTable>

      <div class="button-group">
        <button class="btn btn-primary" :data-testid="qa('device-connected-refresh-button')" @click="fetchDeviceConnected">
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
}
</style>
