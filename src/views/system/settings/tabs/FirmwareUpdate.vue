<script setup lang="ts">
import { computed, ref, onBeforeUnmount, onDeactivated, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import type { FirmwareBank } from '../../../../types/firmware';
import { getFirmwareStatus, uploadFirmware, upgradeFirmware, activateFirmware, FAILURE_STATUSES } from '../../../../services/api/firmware';
import BlockingOverlay from '../../../../components/BlockingOverlay.vue';
import { useQA } from '../../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const router = useRouter();
const selectedFile = ref<File | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const firmwareBanks = ref<FirmwareBank[]>([]);
const uploadedFileName = ref<string | null>(null);
const isUpgrading = ref(false);
const countdown = ref(60);
const countdownTimer = ref<number | null>(null);
const statusPollTimer = ref<number | null>(null);
const isActivating = ref(false);
const isRebootPhase = ref(false);
const upgradeError = ref<string | null>(null);
const showUpgradeError = ref(false);
const currentPhaseDuration = computed(() => (isRebootPhase.value ? 100 : 60));
const progressPercent = computed(() => {
  const total = currentPhaseDuration.value;
  return Math.min(100, Math.max(0, ((total - countdown.value) / total) * 100));
});

const fetchFirmwareStatus = async () => {
  try {
    const response = await getFirmwareStatus();
    firmwareBanks.value = Object.values(response.UpgradeFw.UpgradeFw);
  } catch (err) {
//    console.error('Error fetching firmware status:', err);
    error.value = 'Failed to fetch firmware status';
  }
};

// Check if activate button should be disabled
const isActivateDisabled = (bank: FirmwareBank): boolean => {
  return bank.Status === 'Active' || 
         bank.Status === 'NoImage' || 
         bank.Switch_Status !== 'Available';
};

// Get status display text
const getStatusDisplay = (bank: FirmwareBank): string => {
  if (bank.Switch_Status && bank.Switch_Status !== 'Available') {
    return bank.Switch_Status;
  }
  return bank.Status;
};

const stopUpgradeTimers = () => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
    countdownTimer.value = null;
  }
  if (statusPollTimer.value) {
    clearInterval(statusPollTimer.value);
    statusPollTimer.value = null;
  }
};

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    selectedFile.value = input.files[0];
    uploadedFileName.value = null;
  }
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = false;
  if (event.dataTransfer?.files.length) {
    selectedFile.value = event.dataTransfer.files[0];
    uploadedFileName.value = null;
  }
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = true;
};

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = false;
};

const hardNavigateToLogin = () => {
  const ui = Date.now().toString();
  window.location.replace(`/login?ui=${encodeURIComponent(ui)}&t=${Date.now()}`);
};

// Poll getFirmwareStatus() every 3s during the upgrade phase for early error
// detection only. Network errors are silently ignored — the device will go
// offline once it starts rebooting, and the fixed countdown handles that.
const startErrorPolling = () => {
  statusPollTimer.value = window.setInterval(async () => {
    try {
      const response = await getFirmwareStatus();
      const banks = Object.values(response?.UpgradeFw?.UpgradeFw ?? {});
      const bank = banks.find((b) => b.Alias === 'active');
      const status = bank?.Status?.trim();

      if (status && FAILURE_STATUSES.includes(status)) {
        upgradeError.value = bank?.BootFailureLog || `Firmware upgrade failed: ${status}`;
        showUpgradeError.value = true;
        clearUpgradeState();
      }
    } catch {
      // Network errors silently ignored — device may be writing firmware or rebooting
    }
  }, 3000);
};

const startRebootCountdown = () => {
  isUpgrading.value = true;
  isRebootPhase.value = true;
  countdown.value = 100;

  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
    countdownTimer.value = null;
  }

  countdownTimer.value = window.setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      stopUpgradeTimers();
      hardNavigateToLogin();
    }
  }, 1000);
};

// Two-phase countdown: 60s upgrade (with error polling) → 100s reboot
const startUpgradeCountdown = () => {
  isUpgrading.value = true;
  isRebootPhase.value = false;
  countdown.value = 60;

  startErrorPolling();

  countdownTimer.value = window.setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      // Upgrade phase done — stop error polling, start reboot phase
      if (statusPollTimer.value) {
        clearInterval(statusPollTimer.value);
        statusPollTimer.value = null;
      }
      startRebootCountdown();
    }
  }, 1000);
};

const clearUpgradeState = () => {
  isUpgrading.value = false;
  isActivating.value = false;
  isRebootPhase.value = false;
  upgradeError.value = null;
  showUpgradeError.value = false;
  stopUpgradeTimers();
};

const handleActivate = async (bank: FirmwareBank) => {
  if (isActivateDisabled(bank)) return;

  loading.value = true;
  error.value = null;
  isActivating.value = true;
  
  try {
    const bankNumber = Object.entries(firmwareBanks.value).find(
      ([_, b]) => b === bank
    )?.[0];

    if (!bankNumber) {
      throw new Error('Invalid firmware bank');
    }

    await activateFirmware(parseInt(bankNumber)+1);

    startRebootCountdown();
    await fetchFirmwareStatus();
  } catch (err) {
//    console.error('Error activating firmware:', err);
    error.value = err instanceof Error ? err.message : 'Failed to activate firmware';
    clearUpgradeState();
  } finally {
    loading.value = false;
  }
};

const handleUpgrade = async () => {
  if (!selectedFile.value) return;

  loading.value = true;
  error.value = null;
  upgradeError.value = null;
  showUpgradeError.value = false;
  isActivating.value = false;

  try {
    // First upload the firmware file
    if (!uploadedFileName.value) {
      uploadedFileName.value = await uploadFirmware(selectedFile.value);
    }

    // Send upgrade command — returns once HTTP 201 is confirmed
    await upgradeFirmware(uploadedFileName.value, true);

    // Command accepted — start two-phase countdown (60s upgrade + 100s reboot)
    selectedFile.value = null;
    uploadedFileName.value = null;
    loading.value = false;
    startUpgradeCountdown();

  } catch (err) {
    upgradeError.value = err instanceof Error ? err.message : 'Failed to process firmware';
    showUpgradeError.value = true;
    clearUpgradeState();
    loading.value = false;
  }
};

onMounted(fetchFirmwareStatus);
onBeforeUnmount(stopUpgradeTimers);
onDeactivated(stopUpgradeTimers);
</script>

<template>
  <div class="status-content" :data-testid="qa('firmware-content')">
      <div class="panel-section" :data-testid="qa('firmware-panel')">
        <!-- Firmware Banks Section -->
        <div class="section-title" :data-testid="qa('firmware-bank-title')">{{ t('firmware.firmwareBank') }}</div>
        
        <div class="card-content">
          <!-- PC Version -->
          <div class="table-container" :data-testid="qa('firmware-bank-table')">
            <table>
              <thead>
                <tr>
                  <th :data-testid="qa('firmware-bank-header-bank')">{{ t('firmware.firmwareBank') }}</th>
                  <th :data-testid="qa('firmware-bank-header-status')">{{ t('firmware.status') }}</th>
                  <th :data-testid="qa('firmware-bank-header-version')">{{ t('firmware.firmwareVersion') }}</th>
                  <th :data-testid="qa('firmware-bank-header-action')">{{ t('firmware.action') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(bank, bankIndex) in firmwareBanks" :key="bank.Alias" :data-testid="qa(`firmware-bank-row-${bankIndex}`)">
                  <td :data-testid="qa(`firmware-bank-alias-${bankIndex}`)">{{ bank.Alias }}</td>
                  <td>
                    <div class="status-wrapper" :data-testid="qa(`firmware-bank-status-wrapper-${bankIndex}`)">
                      <span 
                        class="status-indicator"
                        :class="{ active: bank.Status === 'Active' }"
                        :data-testid="qa(`firmware-bank-status-indicator-${bankIndex}`)"
                      ></span>
                      <span :data-testid="qa(`firmware-bank-status-text-${bankIndex}`)">{{ getStatusDisplay(bank) }}</span>
                    </div>
                  </td>
                  <td :data-testid="qa(`firmware-bank-version-${bankIndex}`)">{{ bank.Version || 'N/A' }}</td>
                  <td>
                    <button 
                      v-if="!isActivateDisabled(bank)"
                      class="btn btn-primary btn-activate"
                      :data-testid="qa(`firmware-bank-activate-button-${bankIndex}`)"
                      @click="handleActivate(bank)"
                      :disabled="isActivateDisabled(bank)"
                    >
                      {{ t('firmware.activate') }}
                    </button>
                    <span v-else :data-testid="qa(`firmware-bank-no-action-${bankIndex}`)">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Version -->
          <div class="mobile-cards" :data-testid="qa('firmware-bank-mobile')">
            <div class="table-card" v-for="(bank, bankIndex) in firmwareBanks" :key="bank.Alias" :data-testid="qa(`firmware-bank-card-${bankIndex}`)">
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`firmware-bank-card-bank-label-${bankIndex}`)">{{ t('firmware.firmwareBank') }}</span>
                <span class="card-value" :data-testid="qa(`firmware-bank-card-bank-value-${bankIndex}`)">{{ bank.Alias }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`firmware-bank-card-status-label-${bankIndex}`)">{{ t('firmware.status') }}</span>
                <span class="card-value">
                  <div class="status-wrapper">
                    <span 
                      class="status-indicator"
                      :class="{ active: bank.Status === 'Active' }"
                      :data-testid="qa(`firmware-bank-card-status-indicator-${bankIndex}`)"
                    ></span>
                    <span :data-testid="qa(`firmware-bank-card-status-text-${bankIndex}`)">{{ bank.Status }}</span>
                  </div>
                </span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`firmware-bank-card-version-label-${bankIndex}`)">{{ t('firmware.firmwareVersion') }}</span>
                <span class="card-value" :data-testid="qa(`firmware-bank-card-version-value-${bankIndex}`)">{{ bank.Version || 'N/A' }}</span>
              </div>
              <div class="card-actions" v-if="!isActivateDisabled(bank)">
                <button 
                  class="btn btn-primary btn-activate"
                  :data-testid="qa(`firmware-bank-card-activate-button-${bankIndex}`)"
                  @click="handleActivate(bank)"
                >
                  {{ t('firmware.activate') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Upload Section -->
        <div class="upload-section" :data-testid="qa('firmware-upload-section')">
          <div class="section-title" :data-testid="qa('firmware-upload-title')">{{ t('firmware.uploadFirmware') }}</div>
          
          <div class="card-content">
            <div 
              class="drop-zone"
              :class="{ dragging: isDragging }"
              :data-testid="qa('firmware-upload-drop-zone')"
              @drop="handleDrop"
              @dragover="handleDragOver"
              @dragleave="handleDragLeave"
            >
              <div class="drop-zone-content">
                <span class="material-icons">cloud_upload</span>
                <p class="drop-text" :data-testid="qa('firmware-upload-drop-text')">{{ t('firmware.dragAndDrop') }}</p>
                <p class="separator" :data-testid="qa('firmware-upload-separator-text')">{{ t('firmware.selectFromComputer') }}</p>
                <button 
                  class="btn btn-secondary"
                  :data-testid="qa('firmware-upload-choose-file-button')"
                  @click="() => fileInput?.click()"
                >
                  {{ t('firmware.chooseFile') }}
                </button>
              </div>
            </div>

            <div v-if="selectedFile" class="selected-file" :data-testid="qa('firmware-upload-selected-file')">
              <span class="material-icons">description</span>
              <span class="file-name" :data-testid="qa('firmware-upload-selected-file-name')">{{ selectedFile.name }}</span>
              <button 
                class="btn-clear"
                :data-testid="qa('firmware-upload-clear-file-button')"
                @click="selectedFile = null"
              >
                <span class="material-icons">close</span>
              </button>
            </div>

            <input 
              type="file" 
              ref="fileInput"
              :data-testid="qa('firmware-upload-file-input')"
              @change="handleFileSelect"
              style="display: none"
              accept=".bin,.img,.swu"
            >

            <div v-if="error" class="error-message" :data-testid="qa('firmware-upload-error-message')">
              {{ error }}
            </div>

            <div class="button-group">
              <button 
                class="btn btn-primary"
                :data-testid="qa('firmware-upload-button')"
                @click="handleUpgrade"
                :disabled="!selectedFile || loading"
              >
                <span class="material-icons" v-if="loading">sync</span>
                <span>{{ loading ? t('firmware.processing') : t('firmware.updateFirmware') }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <BlockingOverlay
      :is-visible="isUpgrading"
      :message="isRebootPhase ? t('firmware.rebooting') : (isActivating ? t('firmware.activating') : t('firmware.upgrading'))"
      :description1="t('firmware.powerOffWarning')"
      :description2="isRebootPhase ? t('firmware.rebootWarning') : ''"
      :auto-complete="false"
      :show-countdown="false"
      :show-progress="true"
      :progress-value="progressPercent"
      :data-testid="qa('firmware-upgrade-overlay')"
    />

    <!-- Upgrade Error Overlay -->
    <div v-if="showUpgradeError" class="error-overlay" :data-testid="qa('firmware-upgrade-error-overlay')">
      <div class="error-content" :data-testid="qa('firmware-upgrade-error-content')">
        <div class="error-icon" :data-testid="qa('firmware-upgrade-error-icon')">
          <span class="material-icons">error</span>
        </div>
        <h2 :data-testid="qa('firmware-upgrade-error-title')">{{ t('firmware.upgradeFail') }}</h2>
        <p :data-testid="qa('firmware-upgrade-error-message')">{{ upgradeError }}</p>
        <button 
          class="btn btn-primary" 
          :data-testid="qa('firmware-upgrade-error-close-button')"
          @click="showUpgradeError = false; upgradeError = null"
        >
          {{ t('common.close') }}
        </button>
      </div>
    </div>
</template>

<style scoped>
.status-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ccc;
}

.status-indicator.active {
  background-color: #4caf50;
}

.upload-section {
  margin-top: 2rem;
}

.drop-zone {
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  padding: 2rem;
  transition: all 0.3s ease;
  background-color: var(--bg-secondary);
}

.drop-zone.dragging {
  border-color: var(--primary-color);
  background-color: rgba(0, 112, 187, 0.05);
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.drop-zone .material-icons {
  font-size: 3rem;
  color: var(--primary-color);
}

.drop-text {
  font-size: 1.1rem;
  color: var(--text-primary);
  margin: 0;
}

.separator {
  color: var(--text-secondary);
  margin: 0;
  position: relative;
  width: 100%;
  text-align: center;
}

.selected-file {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--bg-secondary);
  border-radius: 4px;
  margin-top: 1rem;
}

.selected-file .material-icons {
  color: var(--primary-color);
}

.file-name {
  flex: 1;
  color: var(--text-primary);
}

.btn-clear {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.btn-clear:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--text-primary);
}

.button-group {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.button-group .btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-message {
  color: #dc3545;
  margin: 1rem 0;
  padding: 0.75rem;
  background-color: rgba(220, 53, 69, 0.1);
  border-radius: 4px;
  text-align: center;
}

.btn-activate {
  opacity: 1;
}

.btn-activate:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #ccc;
}

/* Error Overlay Styles */
.error-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.error-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  max-width: 500px;
  width: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.error-icon {
  color: #dc3545;
  font-size: 3rem;
}

.error-icon .material-icons {
  font-size: 3rem;
}

.error-content h2 {
  color: #dc3545;
  margin: 0;
}

.error-content p {
  color: var(--text-secondary);
  margin: 0;
  word-break: break-word;
}

@media (max-width: 768px) {
  .drop-zone {
    padding: 1.5rem 1rem;
  }

  .drop-zone .material-icons {
    font-size: 2.5rem;
  }

  .drop-text {
    font-size: 1rem;
  }

  .button-group .btn {
    width: 100%;
    justify-content: center;
  }

  .selected-file {
    flex-wrap: wrap;
  }

  .file-name {
    width: 100%;
    order: 3;
  }
}
</style>
