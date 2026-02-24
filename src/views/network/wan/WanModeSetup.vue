<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WanModeSetupResponse } from '../../../types/wanSetup';
import { getWanModeSetup, updateWanModeSetup } from '../../../services/api/wanSetup';
import { ActionButtons, BaseToast } from '../../../components/common';
import { useAutoDismiss } from '../../../composables/useAutoDismiss';
import { extractNokMessage } from '../../../utils/apiUtils';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const setupData = ref<WanModeSetupResponse | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const successMessage = ref('');
const errorToastMessage = ref('');
const { visible: showSuccessToast, show: triggerSuccessToast } = useAutoDismiss();
const { visible: showErrorToast, show: triggerErrorToast } = useAutoDismiss();

const fetchSetupData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getWanModeSetup();
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      error.value = nokMessage;
      setupData.value = null;
      return;
    }
    setupData.value = response;
  } catch (err) {
    console.error('Error fetching WAN mode setup:', err);
    error.value = 'Failed to fetch WAN mode setup';
  } finally {
    loading.value = false;
  }
};

const showSuccessMessage = (message = `${t('common.apply')} successful`) => {
  successMessage.value = message;
  triggerSuccessToast();
};

const showErrorMessage = (message: string) => {
  errorToastMessage.value = message;
  triggerErrorToast();
};

const handleSubmit = async () => {
  if (!setupData.value) return;
  
  loading.value = true;
  try {
    const response = await updateWanModeSetup({
      WanModeSetup: {
        OperationMode: setupData.value.WanModeSetup.OperationMode,
        WANMode: setupData.value.WanModeSetup.WANMode
      }
    });
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      showErrorMessage(nokMessage);
      return;
    }
    showSuccessMessage();
    await fetchSetupData();
  } catch (err) {
    console.error('Error updating WAN mode setup:', err);
    showErrorMessage('Failed to update WAN mode setup');
  } finally {
    loading.value = false;
  }
};

onMounted(fetchSetupData);
</script>

<template>
  <div class="wan-mode-setup" :data-testid="qa('wan-mode-setup-content')">
    <div v-if="loading" class="loading-state" :data-testid="qa('wan-mode-setup-loading')">
      <div class="loading-spinner"></div>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="error" class="error-state" :data-testid="qa('wan-mode-setup-error')">
      {{ error }}
    </div>

    <form v-else-if="setupData" @submit.prevent="handleSubmit" :data-testid="qa('wan-mode-setup-form')">
      <div class="form-group">
        <label :data-testid="qa('wan-mode-setup-operation-mode-label')">{{ t('wanSetup.operationMode') }}</label>
        <select v-model="setupData.WanModeSetup.OperationMode" :data-testid="qa('wan-mode-setup-operation-mode-select')">
          <option value="Manual" :data-testid="qa('wan-mode-setup-operation-mode-manual')">{{ t('wanSetup.manual') }}</option>
          <option value="Automatic" :data-testid="qa('wan-mode-setup-operation-mode-auto')">{{ t('wanSetup.auto') }}</option>
        </select>
      </div>

      <div class="form-group">
        <label :data-testid="qa('wan-mode-setup-wan-mode-label')">{{ t('wanSetup.wanMode') }}</label>
        <select 
          v-model="setupData.WanModeSetup.WANMode"
          :data-testid="qa('wan-mode-setup-wan-mode-select')"
          :disabled="setupData.WanModeSetup.OperationMode === 'Automatic'"
        >
          <option 
            v-for="mode in setupData.WanModeSetup.WANModeList" 
            :key="mode" 
            :value="mode"
            :data-testid="qa(`wan-mode-setup-wan-mode-option-${slug(mode)}`)"
          >
            {{ mode }}
          </option>
        </select>
      </div>

      <div class="button-group">
        <ActionButtons
          :cancel-data-testid="qa('wan-mode-setup-cancel-button')"
          :apply-data-testid="qa('wan-mode-setup-apply-button')"
          :cancel-disabled="loading"
          :apply-disabled="loading"
          apply-type="submit"
          @cancel="fetchSetupData"
        />
      </div>
    </form>

    <BaseToast
      v-model="showSuccessToast"
      :message="successMessage"
      type="success"
      :data-testid="qa('wan-mode-setup-success-message')"
    />
    <BaseToast
      v-model="showErrorToast"
      :message="errorToastMessage"
      type="error"
      :data-testid="qa('wan-mode-setup-error-message')"
    />
  </div>
</template>

<style scoped>
.wan-mode-setup {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
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
  color: var(--text-secondary);
}

.error-state {
  padding: 2rem;
  text-align: center;
  color: #dc3545;
}

@media (max-width: 768px) {
  .wan-mode-setup {
    padding: 1rem;
  }

  .button-group {
    flex-direction: column;
  }

  .button-group :deep(.btn) {
    width: 100%;
  }
}
</style>
