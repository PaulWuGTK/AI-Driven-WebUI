<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { OperationModeResponse, OperationModeUpdateRequest } from '../../../types/operationMode';
import { getOperationMode, updateOperationMode } from '../../../services/api/operationMode';
import { useQA } from '../../../utils/qa';
const { qa } = useQA();

const { t } = useI18n();
const operationModeData = ref<OperationModeResponse | null>(null);
const selectedMode = ref('');
const loading = ref(false);
const showSuccess = ref(false);
const error = ref<string | null>(null);

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

const showSuccessMessage = () => {
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
  }, 3000);
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
    showSuccessMessage();
    await fetchOperationMode();
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
              <button
                class="btn btn-secondary"
                :data-testid="qa('operation-mode-cancel-button')"
                @click="fetchOperationMode"
                :disabled="loading"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                class="btn btn-primary"
                :data-testid="qa('operation-mode-apply-button')"
                @click="handleSubmit"
                :disabled="loading"
              >
                {{ t('common.apply') }}
              </button>
            </div>
          </div>
        </div>
      </template>

      <div v-if="showSuccess" class="success-message" :data-testid="qa('operation-mode-success-message')">
        {{ t('common.apply') }} successful
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

.success-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #4caf50;
  color: white;
  padding: 1rem 2rem;
  border-radius: 4px;
  animation: fadeInOut 3s ease-in-out;
  z-index: 100;
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

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
}

@media (max-width: 768px) {
  .button-group {
    flex-direction: column;
  }

  .button-group .btn {
    width: 100%;
  }
}
</style>
