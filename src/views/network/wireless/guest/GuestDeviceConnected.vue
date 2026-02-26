<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { GuestDeviceConnectedResponse } from '../../../../types/guest';
import { getGuestDeviceConnected } from '../../../../services/api/guestAccess';
import { BaseTable } from '../../../../components/common';
import { useQA } from '../../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const deviceData = ref<GuestDeviceConnectedResponse | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const deviceColumns = computed(() => [
  { key: 'Host', label: t('guest.hostName'), headerDataTestid: qa('guest-device-connected-header-hostname') },
  { key: 'MACAddress', label: t('guest.macAddress'), headerDataTestid: qa('guest-device-connected-header-mac') },
  { key: 'IPAddress', label: t('guest.ipAddress'), headerDataTestid: qa('guest-device-connected-header-ip') },
]);

const getRowTestId = (_row: unknown, index: number, mobile: boolean) =>
  qa(mobile ? `guest-device-connected-card-${index}` : `guest-device-connected-row-${index}`) ?? '';

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
      <BaseTable
        :columns="deviceColumns"
        :data="deviceData.GuestDeviceConnected"
        row-key="MACAddress"
        :empty-text="t('guest.deviceConnected')"
        :table-data-testid="qa('guest-device-connected-table')"
        :mobile-data-testid="qa('guest-device-connected-mobile')"
        :row-data-testid="getRowTestId"
      >
        <template #cell-Host="{ row, index, mobile }">
          <span :data-testid="qa(mobile ? `guest-device-connected-card-hostname-value-${index}` : `guest-device-connected-hostname-${index}`)">
            {{ row.Host }}
          </span>
        </template>
        <template #cell-MACAddress="{ row, index, mobile }">
          <span :data-testid="qa(mobile ? `guest-device-connected-card-mac-value-${index}` : `guest-device-connected-mac-${index}`)">
            {{ row.MACAddress }}
          </span>
        </template>
        <template #cell-IPAddress="{ row, index, mobile }">
          <span :data-testid="qa(mobile ? `guest-device-connected-card-ip-value-${index}` : `guest-device-connected-ip-${index}`)">
            {{ row.IPAddress }}
          </span>
        </template>

        <template #label-Host="{ index, mobile }">
          <span :data-testid="mobile ? qa(`guest-device-connected-card-hostname-label-${index}`) : undefined">
            {{ t('guest.hostName') }}
          </span>
        </template>
        <template #label-MACAddress="{ index, mobile }">
          <span :data-testid="mobile ? qa(`guest-device-connected-card-mac-label-${index}`) : undefined">
            {{ t('guest.macAddress') }}
          </span>
        </template>
        <template #label-IPAddress="{ index, mobile }">
          <span :data-testid="mobile ? qa(`guest-device-connected-card-ip-label-${index}`) : undefined">
            {{ t('guest.ipAddress') }}
          </span>
        </template>

        <template #empty="{ mobile }">
          <div
            :class="mobile ? 'no-data-mobile' : 'no-data'"
            :data-testid="mobile ? qa('guest-device-connected-no-data-mobile') : qa('guest-device-connected-no-data-row')"
          >
            <span :data-testid="!mobile ? qa('guest-device-connected-no-data') : undefined">
              {{ t('guest.deviceConnected') }}
            </span>
          </div>
        </template>
      </BaseTable>

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
