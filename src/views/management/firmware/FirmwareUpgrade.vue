<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { FirmwareBank } from '../../../types/firmware';
import { getFirmwareStatus, uploadFirmware, upgradeFirmware } from '../../../services/api/firmware';

const { t } = useI18n();
const selectedFile = ref<File | null>(null);
const autoActivate = ref(true);
const loading = ref(false);
const error = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const firmwareBanks = ref<FirmwareBank[]>([]);
const uploadedFileName = ref<string | null>(null);

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
    uploadedFileName.value = null; // Reset uploaded file name when new file is selected
  }
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = false;
  if (event.dataTransfer?.files.length) {
    selectedFile.value = event.dataTransfer.files[0];
    uploadedFileName.value = null; // Reset uploaded file name when new file is selected
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

const handleUpgrade = async () => {
  if (!selectedFile.value) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    // First upload the firmware file
    if (!uploadedFileName.value) {
      uploadedFileName.value = await uploadFirmware(selectedFile.value);
    }

    // Then perform the upgrade
    await upgradeFirmware(uploadedFileName.value, autoActivate.value);
    
    // Clear file selection after successful upgrade
    selectedFile.value = null;
    uploadedFileName.value = null;
    
    // Refresh firmware status
    await fetchFirmwareStatus();
  } catch (err) {
    console.error('Error processing firmware:', err);
    error.value = err instanceof Error ? err.message : 'Failed to process firmware';
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
              accept=".bin,.img,.fw"
            >

            <div class="auto-activate">
              <label class="switch-label">
                <span>{{ t('firmware.autoActivate') }}</span>
                <label class="switch">
                  <input
                    type="checkbox"
                    v-model="autoActivate"
                  >
                  <span class="slider"></span>
                </label>
              </label>
            </div>

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
                <span>{{ loading ? 'Processing...' : t('firmware.updateFirmware') }}</span>
              </button>
            </div>
          </div>
        </div>
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

.auto-activate {
  margin: 1.5rem 0;
}

.switch-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-primary);
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  flex-shrink: 0;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary-color);
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.button-group {
  display: flex;
  justify-content: center;
}

.button-group .btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.button-group .material-icons {
  animation: spin 1s linear infinite;
}

.error-message {
  color: #dc3545;
  margin: 1rem 0;
  padding: 0.75rem;
  background-color: rgba(220, 53, 69, 0.1);
  border-radius: 4px;
  text-align: center;
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