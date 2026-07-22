<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { OperationModeResponse, OperationModeUpdateRequest } from '../../../types/operationMode';
import { getOperationMode, updateOperationMode } from '../../../services/api/operationMode';
import { ActionButtons } from '../../../components/common';
import { useQA } from '../../../utils/qa';
import BlockingOverlay from '../../../components/BlockingOverlay.vue';
const { qa } = useQA();

const { t } = useI18n();
const operationModeData = ref<OperationModeResponse | null>(null);
const selectedMode = ref('');
const loading = ref(false);
const error = ref<string | null>(null);
const showCountdown = ref(false);
const countdownMessage = ref('');
const overlayDurationSeconds = 30;
const overlayDescription1 = computed(() => t('operationMode.applyingDescription'));
const overlayDescription2 = computed(() =>
  t('operationMode.applyingDurationHint', { seconds: overlayDurationSeconds })
);
const showModeSwitchNotice = ref(false);
const switchedMode = ref('');

const fetchOperationMode = async () => {
  loading.value = true;
  error.value = null;
  try {
    operationModeData.value = await getOperationMode();
    if (operationModeData.value) {
      selectedMode.value = operationModeData.value.OperationMode.Mode;
    }
  } catch (err) {
    console.error('Error fetching operation mode:', err);
    error.value = 'Failed to fetch operation mode';
  } finally {
    loading.value = false;
  }
};

const getAccessIp = (mode: string): string => {
  if (mode === 'Gateway') return '192.168.1.1';
  return '172.16.123.100';
};

const handleCountdownComplete = () => {
  showCountdown.value = false;
  showModeSwitchNotice.value = true;
};

const dismissModeSwitchNotice = () => {
  showModeSwitchNotice.value = false;
};

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;
  try {
    const updateData: OperationModeUpdateRequest = {
      OperationMode: {
        Mode: selectedMode.value
      }
    };
    await updateOperationMode(updateData);

    switchedMode.value = selectedMode.value;
    countdownMessage.value = t('operationMode.applyingModeConfig', { mode: selectedMode.value });
    showCountdown.value = true;
  } catch (err) {
    console.error('Error updating operation mode:', err);
    error.value = 'Failed to update operation mode';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchOperationMode);
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('operation-mode-title')">{{ t('operationMode.title') }}</h1>

    <div class="status-content" :data-testid="qa('operation-mode-content')">
      <div v-if="loading" class="loading-state" :data-testid="qa('operation-mode-loading')">
        <div class="loading-spinner"></div>
        <span>{{ t('common.loading') }}</span>
      </div>

      <div v-else-if="error" class="error-state" :data-testid="qa('operation-mode-error')">
        {{ error }}
      </div>

      <template v-else>
        <div class="panel-section" :data-testid="qa('operation-mode-panel')">
          <div class="card-content">
            <div class="form-group">
              <label :data-testid="qa('operation-mode-label')">{{ t('operationMode.mode') }}</label>
              <select
                v-model="selectedMode"
                :data-testid="qa('operation-mode-select')"
                :disabled="loading"
              >
                <option
                  v-for="mode in operationModeData?.OperationMode.ListModes"
                  :key="mode"
                  :value="mode"
                  :data-testid="qa(`operation-mode-option-${mode.toLowerCase()}`)"
                >
                  {{ mode }}
                </option>
              </select>
            </div>

            <div class="button-group">
              <ActionButtons
                :cancel-disabled="loading"
                :apply-disabled="loading"
                :cancel-data-testid="qa('operation-mode-cancel-button')"
                :apply-data-testid="qa('operation-mode-apply-button')"
                @cancel="fetchOperationMode"
                @apply="handleSubmit"
              />
            </div>
          </div>
        </div>
      </template>
    </div>

    <BlockingOverlay
      :is-visible="showCountdown"
      :message="countdownMessage"
      :description1="overlayDescription1"
      :description2="overlayDescription2"
      :duration="overlayDurationSeconds"
      @complete="handleCountdownComplete"
    />

    <!-- Mode Switch Notice -->
    <div v-if="showModeSwitchNotice" class="mode-switch-overlay">
      <div class="mode-switch-card">
        <div class="mode-switch-icon">
          <span class="material-icons">info</span>
        </div>
        <h3 class="mode-switch-title">
          {{ t('operationMode.modeSwitchTitle', { mode: switchedMode }) }}
        </h3>
        <p class="mode-switch-message">
          {{ switchedMode === 'Gateway'
            ? t('operationMode.gatewayAccessInfo', { ip: getAccessIp('Gateway') })
            : t('operationMode.nonGatewayAccessInfo', { ip: getAccessIp(switchedMode) })
          }}
        </p>
        <button class="btn btn-primary mode-switch-dismiss" @click="dismissModeSwitchNotice">
          {{ t('common.confirm') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: white;
}

select:disabled {
  background-color: var(--bg-secondary);
  cursor: not-allowed;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
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

.mode-switch-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.mode-switch-card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.mode-switch-icon {
  margin-bottom: 1rem;
}

.mode-switch-icon .material-icons {
  font-size: 48px;
  color: #0078d4;
}

.mode-switch-title {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  color: #333;
}

.mode-switch-message {
  color: #555;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
}

.mode-switch-dismiss {
  padding: 0.5rem 2rem;
}

@media (max-width: 768px) {
  .button-group {
    flex-direction: column;
  }

  .button-group :deep(.btn) {
    width: 100%;
  }
}
</style>
