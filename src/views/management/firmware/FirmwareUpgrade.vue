<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import type { FirmwareBank } from '../../../types/firmware';
import { getFirmwareStatus, uploadFirmware, upgradeFirmware, activateFirmware } from '../../../services/api/firmware';

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
const isActivating = ref(false);
const isRebootPhase = ref(false);

const fetchFirmwareStatus = async () => {
  try {
    const response = await getFirmwareStatus();
    firmwareBanks.value = Object.values(response.UpgradeFw.UpgradeFw);
  } catch (err) {
    console.error('Error fetching firmware status:', err);
    error.value = 'Failed to fetch firmware status';
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

const startUpgradeCountdown = () => {
  isUpgrading.value = true;

  // 如果是「啟用分割槽」流程，直接進入重開機階段；否則先跑升級階段
  isRebootPhase.value = isActivating.value;

  // 先清掉舊的計時器（避免多重計時）
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
    countdownTimer.value = null;
  }

  // 第一階段 60s（升級）→ 第二階段 100s（重開機）
  countdown.value = isRebootPhase.value ? 100 : 60;

  const tick = () => {
    countdown.value--;
    if (countdown.value <= 0) {
      if (countdownTimer.value) {
        clearInterval(countdownTimer.value);
        countdownTimer.value = null;
      }

      if (!isRebootPhase.value) {
        // 第一段結束 → 進入「重開機」第二段 100 秒
        isRebootPhase.value = true;
        countdown.value = 100;
        countdownTimer.value = window.setInterval(tick, 1000);
      } else {
        // 第二段結束 → 導回登入（或你要的頁面）
        router.push('/login');
      }
    }
  };

  countdownTimer.value = window.setInterval(tick, 1000);
};

const clearUpgradeState = () => {
  isUpgrading.value = false;
  isActivating.value = false;
  isRebootPhase.value = false;
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
    countdownTimer.value = null;
  }
};

const handleActivate = async (bank: FirmwareBank) => {
  if (bank.Status === 'Active') return;

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
    
    startUpgradeCountdown();
    await fetchFirmwareStatus();
  } catch (err) {
    console.error('Error activating firmware:', err);
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
  isActivating.value = false;
  
  try {
    // First upload the firmware file
    if (!uploadedFileName.value) {
      uploadedFileName.value = await uploadFirmware(selectedFile.value);
    }

    // Then perform the upgrade with autoActivate always true
    await upgradeFirmware(uploadedFileName.value, true);
    
    // Clear file selection after successful upgrade
    selectedFile.value = null;
    uploadedFileName.value = null;
    
    // Start countdown and show upgrade overlay
    startUpgradeCountdown();
    
    // Refresh firmware status
    await fetchFirmwareStatus();
  } catch (err) {
    console.error('Error processing firmware:', err);
    error.value = err instanceof Error ? err.message : 'Failed to process firmware';
    clearUpgradeState();
  } finally {
    loading.value = false;
  }
};

onMounted(fetchFirmwareStatus);
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">{{ t('firmware.title') }}</h1>

    <div class="status-content">
      <div class="panel-section">
        <!-- Firmware Banks Section -->
        <div class="section-title">{{ t('firmware.firmwareBank') }}</div>
        
        <div class="card-content">
          <!-- PC Version -->
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>{{ t('firmware.firmwareBank') }}</th>
                  <th>{{ t('firmware.status') }}</th>
                  <th>{{ t('firmware.firmwareVersion') }}</th>
                  <th>{{ t('firmware.action') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="bank in firmwareBanks" :key="bank.Alias">
                  <td>{{ bank.Alias }}</td>
                  <td>
                    <div class="status-wrapper">
                      <span 
                        class="status-indicator"
                        :class="{ active: bank.Status === 'Active' }"
                      ></span>
                      {{ bank.Status }}
                    </div>
                  </td>
                  <td>{{ bank.Version || 'N/A' }}</td>
                  <td>
                    <button 
                      v-if="bank.Status !== 'Active' && bank.Status !== 'NoImage'"
                      class="btn btn-primary btn-activate"
                      @click="handleActivate(bank)"
                    >
                      {{ t('firmware.activate') }}
                    </button>
                    <span v-else>-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Version -->
          <div class="mobile-cards">
            <div class="table-card" v-for="bank in firmwareBanks" :key="bank.Alias">
              <div class="card-row">
                <span class="card-label">{{ t('firmware.firmwareBank') }}</span>
                <span class="card-value">{{ bank.Alias }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('firmware.status') }}</span>
                <span class="card-value">
                  <div class="status-wrapper">
                    <span 
                      class="status-indicator"
                      :class="{ active: bank.Status === 'Active' }"
                    ></span>
                    {{ bank.Status }}
                  </div>
                </span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('firmware.firmwareVersion') }}</span>
                <span class="card-value">{{ bank.Version || 'N/A' }}</span>
              </div>
              <div class="card-actions" v-if="bank.Status !== 'Active' && bank.Status !== 'NoImage'">
                <button 
                  class="btn btn-primary btn-activate"
                  @click="handleActivate(bank)"
                >
                  {{ t('firmware.activate') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Upload Section -->
        <div class="upload-section">
          <div class="section-title">{{ t('firmware.uploadFirmware') }}</div>
          
          <div class="card-content">
            <div 
              class="drop-zone"
              :class="{ dragging: isDragging }"
              @drop="handleDrop"
              @dragover="handleDragOver"
              @dragleave="handleDragLeave"
            >
              <div class="drop-zone-content">
                <span class="material-icons">cloud_upload</span>
                <p class="drop-text">{{ t('firmware.dragAndDrop') }}</p>
                <p class="separator">{{ t('firmware.selectFromComputer') }}</p>
                <button 
                  class="btn btn-secondary"
                  @click="() => fileInput?.click()"
                >
                  {{ t('firmware.chooseFile') }}
                </button>
              </div>
            </div>

            <div v-if="selectedFile" class="selected-file">
              <span class="material-icons">description</span>
              <span class="file-name">{{ selectedFile.name }}</span>
              <button 
                class="btn-clear"
                @click="selectedFile = null"
              >
                <span class="material-icons">close</span>
              </button>
            </div>

            <input 
              type="file" 
              ref="fileInput"
              @change="handleFileSelect"
              style="display: none"
              accept=".bin,.img,.swu"
            >

            <div v-if="error" class="error-message">
              {{ error }}
            </div>

            <div class="button-group">
              <button 
                class="btn btn-primary"
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

    <!-- Upgrade/Activation Overlay -->
    <div v-if="isUpgrading" class="upgrade-overlay">
      <div class="upgrade-content">
        <div class="spinner"></div>
        <h2>{{ isRebootPhase ? t('firmware.rebooting') : (isActivating ? t('firmware.activating') : t('firmware.upgrading')) }}</h2>
        <p>{{ t('firmware.powerOffWarning') }}</p>
        <p v-if="isRebootPhase">{{ t('firmware.rebootWarning') }}</p>
        <div class="countdown">{{ countdown }}s</div>
      </div>
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

/* Upgrade Overlay Styles */
.upgrade-overlay {
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

.upgrade-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  max-width: 400px;
  width: 90%;
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

.countdown {
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-color);
  margin-top: 1rem;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
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