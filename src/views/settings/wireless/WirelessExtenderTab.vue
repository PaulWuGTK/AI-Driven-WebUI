<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ExtenderResponse, ExtenderNeighbor, ExtenderConnectRequest } from '../../../types/extender';
import { getExtenderStatus, updateExtenderSettings, scanNeighborAPs, connectToAP, triggerWPS } from '../../../services/api/extender';
import { ActionButtons, BaseSwitch, BaseToast } from '../../../components/common';
import { useAutoDismiss } from '../../../composables/useAutoDismiss';
import { extractNokMessage } from '../../../utils/apiUtils';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const extenderData = ref<ExtenderResponse | null>(null);
const tempExtenderEnabled = ref<number>(0);
const tempExtenderRole = ref<"MeshAgent" | "Repeater">("MeshAgent");
const scanResults = ref<ExtenderNeighbor[]>([]);
const loading = ref(false);
const scanning = ref(false);
const error = ref<string | null>(null);
const showConnectModal = ref(false);
const selectedAP = ref<ExtenderNeighbor | null>(null);
const password = ref('');
const successMessage = ref('');
const errorToastMessage = ref('');
const { visible: showSuccessToast, show: triggerSuccessToast } = useAutoDismiss();
const { visible: showErrorToast, show: triggerErrorToast } = useAutoDismiss();
const redirectCountdown = ref<number | null>(null);
const redirectTimer = ref<number | null>(null);
const redirectUrl = ref<string | null>(null);

const showSuccessMessage = (message = t('common.saveSuccess')) => {
  successMessage.value = message;
  triggerSuccessToast();
};

const showErrorMessage = (message: string) => {
  errorToastMessage.value = message;
  triggerErrorToast();
};

// Computed properties
const isExtenderEnabled = computed(() =>
  extenderData.value?.Extender.ExtenderEnabled.Enabled === 1
);

const extenderRole = computed(() =>
  extenderData.value?.Extender.ExtenderRole.Role || 'MeshAgent'
);

const wpsPinCode = computed(() =>
  extenderData.value?.Extender.Wps.WpsPinCode || ''
);

const connectionStatus = computed(() => {
  const status = extenderData.value?.Extender.ConnectionStatus;
  if (!status) return null;
  // Return the first available band status
  return status['2.4GHz'] || status['5GHz'] || status['6GHz'] || null;
});

// Fetch extender status
const fetchExtenderStatus = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getExtenderStatus();
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      error.value = nokMessage;
      extenderData.value = null;
      return;
    }
    extenderData.value = response;
    tempExtenderEnabled.value = extenderData.value.Extender.ExtenderEnabled.Enabled;
    tempExtenderRole.value = extenderData.value.Extender.ExtenderRole.Role;
  } catch (err) {
    console.error('Error fetching extender status:', err);
    error.value = err instanceof Error ? err.message : 'Failed to fetch extender status';
  } finally {
    loading.value = false;
  }
};

// Update extender settings
const handleSaveSettings = async () => {
  loading.value = true;
  try {
    const response = await updateExtenderSettings({
      Extender: {
        Action: "ExtenderEnable",
        Enabled: tempExtenderEnabled.value,
        Role: tempExtenderRole.value
      }
    });
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      showErrorMessage(nokMessage);
      return;
    }
    await fetchExtenderStatus();
    showSuccessMessage();
  } catch (err) {
    console.error('Error updating extender settings:', err);
    showErrorMessage(err instanceof Error ? err.message : 'Failed to update settings');
  } finally {
    loading.value = false;
  }
};

// Scan for neighbor APs
const handleScan = async () => {
  scanning.value = true;
  try {
    const response = await scanNeighborAPs();
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      scanResults.value = [];
      showErrorMessage(nokMessage);
      return;
    }
    scanResults.value = response.ExtenderScan || [];
  } catch (err) {
    console.error('Error scanning APs:', err);
    scanResults.value = [];
    showErrorMessage(err instanceof Error ? err.message : 'Failed to scan APs');
  } finally {
    scanning.value = false;
  }
};

// Show connect modal
const showConnectDialog = (ap: ExtenderNeighbor) => {
  selectedAP.value = ap;
  password.value = '';
  showConnectModal.value = true;
};

// Connect to AP
const handleConnect = async () => {
  if (!selectedAP.value) return;

  loading.value = true;

  try {
    const connectRequest: ExtenderConnectRequest = {
      Extender: {
        Action: "connection_setting",
        Band: selectedAP.value.Band,
        SSID: selectedAP.value.SSID,
        Security: selectedAP.value.Security,
        Password: password.value
      }
    };

    const response = await connectToAP(connectRequest);
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      showErrorMessage(nokMessage);
      return;
    }

    if (response.Extender.ip_address) {
      redirectUrl.value = `http://${response.Extender.ip_address}`;
      redirectCountdown.value = 60;
      startRedirectCountdown();
    }

    showConnectModal.value = false;
    showSuccessMessage(t('wirelessExtender.connectSuccess'));
    await fetchExtenderStatus();
  } catch (err) {
    console.error('Error connecting to AP:', err);
    showErrorMessage(err instanceof Error ? err.message : 'Failed to connect to AP');
  } finally {
    loading.value = false;
  }
};

// WPS functionality
const handleWPS = async () => {
  loading.value = true;

  try {
    const response = await triggerWPS();
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      showErrorMessage(nokMessage);
      return;
    }

    if (response.Extender.ip_address) {
      redirectUrl.value = `http://${response.Extender.ip_address}`;
      redirectCountdown.value = 60;
      startRedirectCountdown();
    }

    showSuccessMessage(t('wirelessExtender.wpsTriggered'));
  } catch (err) {
    console.error('Error triggering WPS:', err);
    showErrorMessage(err instanceof Error ? err.message : 'Failed to trigger WPS');
  } finally {
    loading.value = false;
  }
};

// Start redirect countdown
const startRedirectCountdown = () => {
  if (redirectTimer.value) {
    clearInterval(redirectTimer.value);
  }

  redirectTimer.value = window.setInterval(() => {
    if (redirectCountdown.value && redirectCountdown.value > 0) {
      redirectCountdown.value--;
    } else {
      if (redirectTimer.value) {
        clearInterval(redirectTimer.value);
      }
      if (redirectUrl.value) {
        window.location.href = redirectUrl.value;
      }
    }
  }, 1000);
};

onMounted(() => {
  fetchExtenderStatus();
});
</script>

<template>
  <div class="status-content" :data-testid="qa('wireless-extender-tab-content')">
    <div v-if="loading && !extenderData" class="loading-state" :data-testid="qa('wireless-extender-loading')">
      <div class="loading-spinner"></div>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="error" class="error-state" :data-testid="qa('wireless-extender-error')">
      <p>{{ error }}</p>
      <button @click="fetchExtenderStatus" class="btn btn-primary" :data-testid="qa('wireless-extender-retry-button')">
        {{ t('common.retry') }}
      </button>
    </div>

    <div v-else-if="extenderData">
      <!-- Extender Settings -->
      <div class="panel-section" :data-testid="qa('wireless-extender-settings-section')">

        <div class="card-content">
          <div class="form-group">
            <div class="switch-label">
              <span :data-testid="qa('wireless-extender-enable-label')">{{ t('wirelessExtender.enabled') }}</span>
              <BaseSwitch
                v-model="tempExtenderEnabled"
                :true-value="1"
                :false-value="0"
                :data-testid="qa('wireless-extender-enable-toggle')"
                :slider-data-testid="qa('wireless-extender-enable-toggle-slider')"
              />
            </div>
          </div>

          <div v-if="tempExtenderEnabled === 1" class="form-group">
            <label :data-testid="qa('wireless-extender-role-label')">
              {{ t('wirelessExtender.role') }}
            </label>
            <select
              v-model="tempExtenderRole"
              :data-testid="qa('wireless-extender-role-select')"
            >
              <option value="MeshAgent">{{ t('wirelessExtender.meshAgent') }}</option>
              <option value="Repeater">{{ t('wirelessExtender.repeater') }}</option>
            </select>
          </div>

          <div class="button-group">
            <ActionButtons
              :cancel-data-testid="qa('wireless-extender-cancel-button')"
              :apply-data-testid="qa('wireless-extender-apply-button')"
              :cancel-disabled="loading"
              :apply-disabled="loading"
              @cancel="fetchExtenderStatus"
              @apply="handleSaveSettings"
            />
          </div>
        </div>
      </div>

      <!-- Connection Status (only show if extender is enabled) -->
      <div v-if="isExtenderEnabled && connectionStatus" class="panel-section" :data-testid="qa('wireless-extender-connection-section')">
        <div class="section-title" :data-testid="qa('wireless-extender-connection-title')">
          {{ t('wirelessExtender.connectionStatus') }}
        </div>

        <div class="card-content">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label" :data-testid="qa('wireless-extender-connection-status-label')">{{ t('wirelessExtender.status') }}</span>
              <span class="info-value" :data-testid="qa('wireless-extender-connection-status-value')">
                {{ connectionStatus.Status }}
              </span>
            </div>
            <div class="info-item" v-if="connectionStatus.SSID">
              <span class="info-label" :data-testid="qa('wireless-extender-connection-ssid-label')">{{ t('wirelessExtender.connectedSSID') }}</span>
              <span class="info-value" :data-testid="qa('wireless-extender-connection-ssid-value')">
                {{ connectionStatus.SSID }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Scan and Connect (only show if extender is enabled) -->
      <div v-if="isExtenderEnabled" class="panel-section" :data-testid="qa('wireless-extender-scan-section')">
        <div class="section-title" :data-testid="qa('wireless-extender-scan-title')">
          {{ t('wirelessExtender.availableNetworks') }}
        </div>

        <div class="card-content">
          <div class="action-buttons" style="margin-bottom: 1rem;">
            <button
              @click="handleScan"
              class="btn btn-secondary"
              :disabled="scanning"
              :data-testid="qa('wireless-extender-scan-button')"
            >
              <span class="material-icons" v-if="scanning">sync</span>
              {{ scanning ? t('wirelessExtender.scanning') : t('wirelessExtender.scan') }}
            </button>
          </div>

          <div v-if="scanResults.length > 0" class="table-container" :data-testid="qa('wireless-extender-scan-results')">
            <table>
              <thead>
                <tr>
                  <th :data-testid="qa('wireless-extender-scan-header-ssid')">{{ t('wirelessExtender.ssid') }}</th>
                  <th :data-testid="qa('wireless-extender-scan-header-bssid')">{{ t('wirelessExtender.bssid') }}</th>
                  <th :data-testid="qa('wireless-extender-scan-header-security')">{{ t('wirelessExtender.security') }}</th>
                  <th :data-testid="qa('wireless-extender-scan-header-signal')">{{ t('wirelessExtender.signal') }}</th>
                  <th :data-testid="qa('wireless-extender-scan-header-action')">{{ t('common.action') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(ap, index) in scanResults" :key="index" :data-testid="qa(`wireless-extender-scan-row-${index}`)">
                  <td :data-testid="qa(`wireless-extender-scan-ssid-${index}`)">{{ ap.SSID }}</td>
                  <td :data-testid="qa(`wireless-extender-scan-bssid-${index}`)">{{ ap.Band }}</td>
                  <td :data-testid="qa(`wireless-extender-scan-security-${index}`)">{{ ap.Security }}</td>
                  <td :data-testid="qa(`wireless-extender-scan-signal-${index}`)">{{ ap.Signal }}</td>
                  <td>
                    <button
                      @click="showConnectDialog(ap)"
                      class="btn btn-sm btn-primary"
                      :data-testid="qa(`wireless-extender-scan-connect-${index}`)"
                    >
                      {{ t('wirelessExtender.connect') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else-if="!scanning" class="empty-state" :data-testid="qa('wireless-extender-scan-empty')">
            <p>{{ t('wirelessExtender.noNetworksFound') }}</p>
          </div>
        </div>
      </div>

      <!-- WPS Section (only show if extender is enabled) -->
      <div v-if="isExtenderEnabled" class="panel-section" :data-testid="qa('wireless-extender-wps-section')">
        <div class="section-title" :data-testid="qa('wireless-extender-wps-title')">
          {{ t('wirelessExtender.wps') }}
        </div>

        <div class="card-content">
          <div class="info-item" style="margin-bottom: 1rem;">
            <span class="info-label" :data-testid="qa('wireless-extender-wps-pin-label')">{{ t('wirelessExtender.wpsPinCode') }}</span>
            <span class="info-value" :data-testid="qa('wireless-extender-wps-pin-value')">{{ wpsPinCode }}</span>
          </div>

          <div class="action-buttons">
            <button
              @click="handleWPS"
              class="btn btn-secondary"
              :disabled="loading"
              :data-testid="qa('wireless-extender-wps-button')"
            >
              {{ t('wirelessExtender.triggerWPS') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Connect Modal -->
    <div v-if="showConnectModal" class="modal-overlay" @click="showConnectModal = false" :data-testid="qa('wireless-extender-connect-modal')">
      <div class="modal-content" @click.stop :data-testid="qa('wireless-extender-connect-modal-content')">
        <h2 :data-testid="qa('wireless-extender-connect-modal-title')">{{ t('wirelessExtender.connectTo') }} {{ selectedAP?.SSID }}</h2>

        <div class="form-group">
          <label class="form-label" :data-testid="qa('wireless-extender-connect-password-label')">
            {{ t('wirelessExtender.password') }}
          </label>
          <input
            type="password"
            v-model="password"
            class="form-input"
            :data-testid="qa('wireless-extender-connect-password-input')"
          />
        </div>

        <div class="modal-actions">
          <ActionButtons
            :cancel-data-testid="qa('wireless-extender-connect-cancel-button')"
            :apply-data-testid="qa('wireless-extender-connect-confirm-button')"
            :apply-text="t('wirelessExtender.connect')"
            :apply-disabled="loading"
            :apply-loading="loading"
            @cancel="showConnectModal = false"
            @apply="handleConnect"
          />
        </div>
      </div>
    </div>

    <!-- Redirect Countdown -->
    <div v-if="redirectCountdown !== null" class="modal-overlay" :data-testid="qa('wireless-extender-redirect-modal')">
      <div class="modal-content" :data-testid="qa('wireless-extender-redirect-modal-content')">
        <h2 :data-testid="qa('wireless-extender-redirect-title')">{{ t('wirelessExtender.redirecting') }}</h2>
        <p :data-testid="qa('wireless-extender-redirect-message')">
          {{ t('wirelessExtender.redirectMessage', { seconds: redirectCountdown }) }}
        </p>
        <div class="loading-spinner"></div>
      </div>
    </div>

    <BaseToast
      v-model="showSuccessToast"
      :message="successMessage"
      type="success"
      :data-testid="qa('wireless-extender-success-message')"
    />
    <BaseToast
      v-model="showErrorToast"
      :message="errorToastMessage"
      type="error"
      :data-testid="qa('wireless-extender-error-message')"
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
}

select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}

/* Custom switch size (60px × 34px) for larger prominence */
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

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
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

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  padding: 2rem;
  text-align: center;
  color: #dc3545;
  background-color: white;
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  min-width: 400px;
  max-width: 90vw;
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--primary-color);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .modal-content {
    min-width: auto;
    width: 90vw;
  }

  .button-group {
    flex-direction: column;
  }

  .button-group :deep(.btn) {
    width: 100%;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-actions :deep(.btn) {
    width: 100%;
  }
}
</style>
