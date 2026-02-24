<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getWlanWps, updateWlanWps } from '../../../services/api/wireless';
import type { WlanWpsResponse } from '../../../types/wireless';
import WpsVapInfo from './wps/WpsVapInfo.vue';
import WpsActions from './wps/WpsActions.vue';
import ConfirmationDialog from '../../../components/ConfirmationDialog.vue';
import { ActionButtons, BaseSwitch, BaseToast } from '../../../components/common';
import { useAutoDismiss } from '../../../composables/useAutoDismiss';
import { extractNokMessage } from '../../../utils/apiUtils';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const wpsData = ref<WlanWpsResponse | null>(null);
const tempWpsEnabled = ref<number>(0);
const loading = ref(false);
const pairingInProgress = ref(false);
const pairingResult = ref<"Success" | "NotSuccess" | null>(null);
const pollingInterval = ref<number | null>(null);
const showConfirmDialog = ref(false);
const successMessage = ref('');
const errorToastMessage = ref('');
const { visible: showSuccessToast, show: triggerSuccessToast } = useAutoDismiss();
const { visible: showErrorToast, show: triggerErrorToast } = useAutoDismiss();

const showSuccessMessage = (message = `${t('common.apply')} successful`) => {
  successMessage.value = message;
  triggerSuccessToast();
};

const showErrorMessage = (message: string) => {
  errorToastMessage.value = message;
  triggerErrorToast();
};

const fetchWpsConfig = async () => {
  loading.value = true;
  try {
    const data = await getWlanWps();
    const nokMessage = extractNokMessage(data);
    if (nokMessage) {
      showErrorMessage(nokMessage);
      wpsData.value = null;
      return;
    }
    wpsData.value = data;
    tempWpsEnabled.value = data.WlanWps.Enable;
    
    // Check pairing result status
    if (data.WlanWps.PairingResult === "PairingInprogress") {
      pairingInProgress.value = true;
      startPolling();
    } else if (data.WlanWps.PairingResult === "Success" || data.WlanWps.PairingResult === "NotSuccess") {
      pairingInProgress.value = false;
      pairingResult.value = data.WlanWps.PairingResult;
    } else {
      pairingInProgress.value = false;
      pairingResult.value = null;
    }
  } catch (error) {
    console.error('Error fetching WPS config:', error);
    showErrorMessage('Failed to fetch WPS configuration');
  } finally {
    loading.value = false;
  }
};

const startPolling = () => {
  // Clear any existing interval
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
  }
  
  // Start polling every 3 seconds
  pollingInterval.value = window.setInterval(async () => {
    try {
      const data = await getWlanWps();
      const nokMessage = extractNokMessage(data);
      if (nokMessage) {
        showErrorMessage(nokMessage);
        throw new Error(nokMessage);
      }
      wpsData.value = data;
      
      if (data.WlanWps.PairingResult !== "PairingInprogress") {
        // Stop polling when pairing is no longer in progress
        pairingInProgress.value = false;
        
        if (data.WlanWps.PairingResult === "Success" || data.WlanWps.PairingResult === "NotSuccess") {
        pairingResult.value = data.WlanWps.PairingResult;
        } else {
          pairingResult.value = null;
        }
        
        if (pollingInterval.value) {
          clearInterval(pollingInterval.value);
          pollingInterval.value = null;
        }
      }
    } catch (error) {
      console.error('Error polling WPS status:', error);
      // Stop polling on error
      if (pollingInterval.value) {
        clearInterval(pollingInterval.value);
        pollingInterval.value = null;
      }
      pairingInProgress.value = false;
    }
  }, 3000);
};

const handleEnableToggle = (value: string | number | boolean) => {
  tempWpsEnabled.value = value === true || value === 1 || value === '1' ? 1 : 0;
};

const handleApply = () => {
  // If enabling WPS, show confirmation dialog
  if (tempWpsEnabled.value === 1 && wpsData.value?.WlanWps.Enable === 0) {
    showConfirmDialog.value = true;
  } else {
    applyWpsConfig();
  }
};

const applyWpsConfig = async () => {
  loading.value = true;
  try {
    const response = await updateWlanWps({
      WlanWps: {
        Enable: tempWpsEnabled.value
      }
    });
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      showErrorMessage(nokMessage);
      return;
    }
    await fetchWpsConfig();
    showSuccessMessage();
  } catch (error) {
    console.error('Error updating WPS enable state:', error);
    showErrorMessage('Failed to update WPS enable state');
  } finally {
    loading.value = false;
    showConfirmDialog.value = false;
  }
};

const handleCancel = () => {
  if (wpsData.value) {
    tempWpsEnabled.value = wpsData.value.WlanWps.Enable;
  }
};

const handlePairingComplete = () => {
  pairingResult.value = null;
};

// Clean up interval when component is unmounted
onUnmounted(() => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
    pollingInterval.value = null;
  }
});

onMounted(fetchWpsConfig);
</script>

<template>
  <div class="wireless-wps-config" :data-testid="qa('wireless-wps-config-content')">
    <div class="wps-enable" :data-testid="qa('wireless-wps-config-enable-section')">
      <div class="switch-label">
        <span :data-testid="qa('wireless-wps-config-enable-label')">{{ t('wireless.wpsConfiguration') }}</span>
        <BaseSwitch
          :model-value="tempWpsEnabled"
          :true-value="1"
          :false-value="0"
          :data-testid="qa('wireless-wps-config-enable-toggle')"
          :slider-data-testid="qa('wireless-wps-config-enable-toggle-slider')"
          @update:model-value="handleEnableToggle"
        />
      </div>
    </div>

    <div class="button-group" :data-testid="qa('wireless-wps-config-button-group')">
      <ActionButtons
        :cancel-data-testid="qa('wireless-wps-config-cancel-button')"
        :apply-data-testid="qa('wireless-wps-config-apply-button')"
        :apply-disabled="loading"
        @cancel="handleCancel"
        @apply="handleApply"
      />
    </div>

    <template v-if="wpsData?.WlanWps.Enable === 1">
      <WpsActions 
        :data-testid="qa('wireless-wps-config-actions')"
        :pin-code="wpsData.WlanWps.PINCode"
        @refresh="fetchWpsConfig"
      />
      <WpsVapInfo 
        :data-testid="qa('wireless-wps-config-vap-info')"
        :bands="wpsData.WlanWps.Band"
      />
    </template>

    <!-- Pairing In Progress Overlay -->
    <div v-if="pairingInProgress" class="pairing-overlay" :data-testid="qa('wireless-wps-config-pairing-overlay')">
      <div class="pairing-content" :data-testid="qa('wireless-wps-config-pairing-content')">
        <div class="spinner"></div>
        <h3 :data-testid="qa('wireless-wps-config-pairing-title')">{{ t('wireless.wpsStatus') }}</h3>
        <p :data-testid="qa('wireless-wps-config-pairing-text')">{{ t('diagnostics.processing') }}</p>
      </div>
    </div>

    <!-- Pairing Result Modal -->
    <div v-if="pairingResult" class="pairing-overlay" :data-testid="qa('wireless-wps-config-result-overlay')">
      <div class="pairing-content result" :data-testid="qa('wireless-wps-config-result-content')">
        <div v-if="pairingResult === 'Success'" class="success-icon" :data-testid="qa('wireless-wps-config-result-success-icon')">
          <span class="material-icons">check_circle</span>
        </div>
        <div v-else class="error-icon" :data-testid="qa('wireless-wps-config-result-error-icon')">
          <span class="material-icons">error</span>
        </div>
        
        <h3 :data-testid="qa('wireless-wps-config-result-title')">{{ t('wireless.wpsStatus') }}</h3>
        <p :data-testid="qa('wireless-wps-config-result-text')">{{ pairingResult === 'Success' ? 'Connection successful' : 'Connection failed' }}</p>
        
        <button class="btn btn-primary" :data-testid="qa('wireless-wps-config-result-close-button')" @click="handlePairingComplete">
          {{ t('common.close') }}
        </button>
      </div>
    </div>

    <BaseToast
      v-model="showSuccessToast"
      :message="successMessage"
      type="success"
      :data-testid="qa('wireless-wps-config-success-message')"
    />
    <BaseToast
      v-model="showErrorToast"
      :message="errorToastMessage"
      type="error"
      :data-testid="qa('wireless-wps-config-error-message')"
    />

    <!-- Confirmation Dialog -->
    <ConfirmationDialog
      :data-testid="qa('wireless-wps-config-confirmation-dialog')"
      :is-open="showConfirmDialog"
      :title="t('wireless.enableWpsConfirm')"
      :message="t('wireless.enableWpsMessage')"
      @confirm="applyWpsConfig"
      @cancel="showConfirmDialog = false"
    />
  </div>
</template>

<style scoped>
.wireless-wps-config {
  padding: 1.5rem;
  position: relative;
}

.wps-enable {
  margin-bottom: 1.5rem;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

/* Custom switch size (60px × 34px) for larger prominence in WPS configuration */
:deep(.switch) {
  width: 60px;
  height: 34px;
  flex-shrink: 0;
}

:deep(.slider:before) {
  height: 26px;
  width: 26px;
}

:deep(input:checked + .slider:before) {
  transform: translateX(26px);
}

.pairing-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.pairing-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  max-width: 400px;
  width: 90%;
}

.pairing-content.result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

.success-icon, .error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.success-icon {
  color: #4caf50;
}

.error-icon {
  color: #dc3545;
}

.success-icon .material-icons, .error-icon .material-icons {
  font-size: 3rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .wireless-wps-config {
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
