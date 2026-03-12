<template>
  <div class="page-container" :data-testid="qa('backup-wan-container')">
    <h1 class="page-title" :data-testid="qa('backup-wan-title')">{{ $t('backupWan.title') }}</h1>

    <div class="page-content" :data-testid="qa('backup-wan-content')">
      <div v-if="showSuccess" class="success-message" :data-testid="qa('backup-wan-success')">
        {{ $t('common.saveSuccess') }}
      </div>
      <BaseToast
        v-model="showErrorToast"
        :message="errorToastMessage"
        type="error"
        :data-testid="qa('backup-wan-error-toast')"
      />
      <div v-if="loading" class="loading-container" :data-testid="qa('backup-wan-loading')">
        <BaseSpinner />
      </div>

      <form v-else @submit.prevent="handleSubmit" class="backup-wan-form" :data-testid="qa('backup-wan-form')">
        <div class="panel-section" :data-testid="qa('backup-wan-panel')">
          <div class="card-content">
            <div class="form-group" :data-testid="qa('backup-wan-enable-group')">
              <div class="switch-label">
                <span>{{ $t('backupWan.backupWan') }}</span>
                <BaseSwitch
                  v-model="formData.Enable"
                  :data-testid="qa('backup-wan-enable-toggle')"
                  :slider-data-testid="qa('backup-wan-enable-slider')"
                  @update:model-value="handleBackupWanToggle"
                />
              </div>
            </div>

            <div class="form-group" :data-testid="qa('backup-wan-physical-type-group')">
              <label>{{ $t('backupWan.physicalType') }}</label>
              <BaseSelect
                v-model="formData.PhysicalType"
                :options="physicalTypeOptions"
                :disabled="!formData.Enable"
                :data-testid="qa('backup-wan-physical-type-select')"
              />
            </div>

            <div class="form-group" :data-testid="qa('backup-wan-interface-group')">
              <label>{{ $t('backupWan.interface') }}</label>
              <BaseSelect
                v-model="formData.PhysicalInterface"
                :options="interfaceOptions"
                :disabled="!formData.Enable"
                :data-testid="qa('backup-wan-interface-select')"
              />
            </div>

            <div v-if="0" class="form-group">
              <div class="switch-label">
                <span>{{ $t('backupWan.wanHealthCheck') }}</span>
                <BaseSwitch
                  v-model="formData.WHCEnable"
                  :data-testid="qa('backup-wan-health-check-toggle')"
                  :slider-data-testid="qa('backup-wan-health-check-slider')"
                />
              </div>
            </div>

            <div v-if="formData.Enable" class="health-check-configs">
              <div
                v-for="(healthCheck, index) in formData.WANHealthCheck"
                :key="index"
                class="panel-section"
              >
                <div class="section-title">
                  {{ index === 0 ? $t('backupWan.primaryWan') : $t('backupWan.backupWanLabel') }}
                </div>
                <div class="card-content">
                  <div class="form-group">
                    <label>{{ $t('backupWan.checkCount') }}</label>
                    <BaseInput
                      v-model.number="healthCheck.CheckCount"
                      type="number"
                      :min="3"
                      :max="9999"
                      :data-testid="qa(`backup-wan-check-count-input-${index}`)"
                    />
                    <span class="help-text">
                      {{ $t('backupWan.checkCountHint') }}
                    </span>
                  </div>

                  <div class="form-group">
                    <label>{{ $t('backupWan.checkPeriod') }}</label>
                    <BaseInput
                      v-model.number="healthCheck.CheckPeriod"
                      type="number"
                      :min="3"
                      :max="9999999"
                      :data-testid="qa(`backup-wan-check-period-input-${index}`)"
                    />
                    <span class="help-text">
                      {{ $t('backupWan.checkPeriodHint') }}
                    </span>
                  </div>

                  <div class="form-group">
                    <div class="radio-group">
                      <label class="radio-label">
                        <input
                          type="radio"
                          :name="`checkMethod${index}`"
                          value="Ping"
                          v-model="healthCheck.CheckMethod"
                          :data-testid="qa(`backup-wan-check-method-ping-radio-${index}`)"
                        />
                        <span>{{ $t('backupWan.pingDetection') }}</span>
                      </label>
                      <div class="nested-field">
                        <label>{{ $t('backupWan.ipAddress') }}</label>
                        <BaseInput
                          v-model="healthCheck.PingAddress"
                          placeholder="8.8.8.8"
                          :data-testid="qa(`backup-wan-ping-address-input-${index}`)"
                        />
                      </div>
                    </div>

                    <div class="radio-group">
                      <label class="radio-label">
                        <input
                          type="radio"
                          :name="`checkMethod${index}`"
                          value="DNS"
                          v-model="healthCheck.CheckMethod"
                          :data-testid="qa(`backup-wan-check-method-dns-radio-${index}`)"
                        />
                        <span>{{ $t('backupWan.dnsDetection') }}</span>
                      </label>
                      <div class="nested-field">
                        <label>{{ $t('backupWan.dnsServer') }}</label>
                        <BaseInput
                          v-model="healthCheck.DNSAddress"
                          placeholder="www.google.com"
                          :data-testid="qa(`backup-wan-dns-address-input-${index}`)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="form-actions" :data-testid="qa('backup-wan-actions')">
              <BaseButton type="button" variant="secondary" @click="handleCancel" :data-testid="qa('backup-wan-cancel-button')">
                {{ $t('common.cancel') }}
              </BaseButton>
              <BaseButton type="submit" variant="primary" :disabled="loading" :data-testid="qa('backup-wan-apply-button')">
                {{ $t('common.apply') }}
              </BaseButton>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { backupWanApi } from '../../../services/api/backupWan';
import type { BackupWANConfig, BackupWANRequest } from '../../../types/backupWan';
import { BaseButton, BaseInput, BaseSelect, BaseSpinner, BaseSwitch, BaseToast } from '../../../components/common';
import { useQA } from '../../../utils/qa';
import { extractNokMessage } from '../../../utils/apiUtils';
import { useAutoDismiss } from '../../../composables/useAutoDismiss';

const router = useRouter();
const { qa } = useQA();
const loading = ref(false);
const originalData = ref<BackupWANConfig | null>(null);
const showSuccess = ref(false);
const errorToastMessage = ref('');
const { visible: showErrorToast, show: triggerErrorToast } = useAutoDismiss();

const showErrorMessage = (message: string) => {
  errorToastMessage.value = message;
  triggerErrorToast();
};

const showSuccessMessage = () => {
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
  }, 3000);
};

const formData = ref<BackupWANConfig>({
  PhysicalInterface: 'lan1',
  SupportedEthernetInterface: ['lan1','eth0'],
  SupportedCellularInterface: ['eth1'],
  Enable: false,
  WHCEnable: false,
  PhysicalType: 'Ethernet',
  WANHealthCheck: [
    {
      Alias: 'primary_wan',
      CheckMethod: 'Ping',
      CheckPeriod: 3,
      Name: 'eth0',
      DNSAddress: 'www.google.com',
      PingAddress: '8.8.8.8',
      CheckCount: 3
    },
    {
      Alias: 'backup_wan',
      CheckMethod: 'Ping',
      CheckPeriod: 3,
      Name: 'lan1',
      DNSAddress: 'www.google.com',
      PingAddress: '8.8.8.8',
      CheckCount: 3
    }
  ]
});

const isCellularSupported = computed(() => {
  const cellularInterfaces = formData.value.SupportedCellularInterface;
  return cellularInterfaces.length > 0 && cellularInterfaces[0] !== '';
});

const physicalTypeOptions = computed(() => {
  const options = [{ label: 'Ethernet', value: 'Ethernet' }];
  if (isCellularSupported.value) {
    options.push({ label: 'Cellular', value: 'Cellular' });
  }
  return options;
});

const interfaceOptions = computed(() => {
  const interfaces = formData.value.PhysicalType === 'Ethernet'
    ? formData.value.SupportedEthernetInterface
    : formData.value.SupportedCellularInterface;

  return interfaces
    .filter(iface => iface !== '')
    .map(iface => ({
      label: iface,
      value: iface
    }));
});

const handleBackupWanToggle = (value: string | number | boolean) => {
  const enabled = value === true || value === 1 || value === '1';
  if (!enabled) {
    formData.value.WHCEnable = false;
  }
};

watch(() => formData.value.PhysicalType, (newType) => {
  const interfaces = newType === 'Ethernet'
    ? formData.value.SupportedEthernetInterface
    : formData.value.SupportedCellularInterface;

  const availableInterfaces = interfaces.filter(iface => iface !== '');
  if (availableInterfaces.length > 0) {
    formData.value.PhysicalInterface = availableInterfaces[0];
  }
});

const loadConfig = async () => {
  loading.value = true;
  try {
    const response = await backupWanApi.getConfig();
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      console.warn('Failed to load Backup WAN config:', nokMessage);
      return;
    }

    if (response?.BackupWAN) {
      const config = response.BackupWAN;
      formData.value = {
        ...config,
        Enable: Boolean(config.Enable),
        WHCEnable: Boolean(config.WHCEnable)
      };
      originalData.value = JSON.parse(JSON.stringify(formData.value));
    }
  } catch (error) {
    console.error('Failed to load Backup WAN config:', error);
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  loading.value = true;
  try {
    const requestData: BackupWANRequest = {
      BackupWAN: {
        Enable: Boolean(formData.value.Enable),
        PhysicalType: formData.value.PhysicalType,
        PhysicalInterface: formData.value.PhysicalInterface,
        WHCEnable: Boolean(formData.value.Enable),
        WANHealthCheck: formData.value.WANHealthCheck.map(hc => ({
          Alias: hc.Alias,
          CheckMethod: hc.CheckMethod,
          CheckCount: hc.CheckCount,
          CheckPeriod: hc.CheckPeriod,
          PingAddress: hc.PingAddress,
          DNSAddress: hc.DNSAddress
        }))
      }
    };

    const res = await backupWanApi.updateConfig(requestData);

    const nokMessage = extractNokMessage(res);
    if (nokMessage) {
      console.warn('Failed to update Backup WAN config:', nokMessage);
      showErrorMessage(nokMessage);
    } else {
      showSuccessMessage();
      await loadConfig();
    }
  } catch (error) {
    console.error('Failed to update Backup WAN config:', error);
    showErrorMessage('Failed to update Backup WAN configuration');
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  if (originalData.value) {
    formData.value = JSON.parse(JSON.stringify(originalData.value));
  }
  router.back();
};

onMounted(() => {
  loadConfig();
});
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.backup-wan-form {
  display: flex;
  flex-direction: column;
}

.panel-section {
  background-color: white;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.2);
}

.section-title {
  padding: 1rem 1.5rem;
  font-size: 1rem;
  color: var(--text-primary);
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.card-content {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

/* Custom switch size (60px × 34px) for larger prominence */

.help-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

.help-text.warning {
  color: #ff6b00;
}

.health-check-configs {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.radio-group:last-child {
  margin-bottom: 0;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  color: var(--text-primary);
}

.radio-label input[type="radio"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  margin-right: 0.75rem;
}

.nested-field {
  margin-left: 1.75rem;
  margin-top: 0.5rem;
}

.nested-field label {
  margin-bottom: 0.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.success-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #4caf50;
  color: white;
  padding: 1rem 2rem;
  border-radius: 4px;
  animation: fadeInOut 3s ease-in-out;
  z-index: 1100;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
}

@media (max-width: 768px) {
  .page-content {
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions button {
    width: 100%;
  }

  .nested-field {
    margin-left: 1rem;
  }
}
</style>
