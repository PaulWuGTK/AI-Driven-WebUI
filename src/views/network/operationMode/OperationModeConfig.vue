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

const redirectToLogin = () => {
  const timestamp = new Date().getTime();
  let targetUrl = '';

  if (selectedMode.value === 'Gateway') {
    targetUrl = `http://192.168.1.1/login?t=${timestamp}`;
  } else if (selectedMode.value === 'Bridge' || selectedMode.value === 'Extender') {
    targetUrl = `http://192.168.1.100/login?t=${timestamp}`;
  }

  if (targetUrl) {
    window.location.href = targetUrl;
  }
};

const handleCountdownComplete = () => {
  redirectToLogin();
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

@media (max-width: 768px) {
  .button-group {
    flex-direction: column;
  }

  .button-group :deep(.btn) {
    width: 100%;
  }
}
</style>
