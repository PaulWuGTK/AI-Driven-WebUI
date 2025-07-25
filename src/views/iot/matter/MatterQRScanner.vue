<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';

const { t } = useI18n();

// Scanner state
const scannerMode = ref<'camera' | 'file'>('camera');
const isScanning = ref(false);
const scanResult = ref<string>('');
const error = ref<string>('');
const scanHistory = ref<{ result: string; timestamp: string; type: string }[]>([]);

// Camera scanner
let html5QrcodeScanner: Html5QrcodeScanner | null = null;
let html5Qrcode: Html5Qrcode | null = null;

// File upload
const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);

// Camera selection
const cameras = ref<{ id: string; label: string }[]>([]);
const selectedCamera = ref<string>('');

// Initialize camera list
const initializeCameras = async () => {
  try {
    const devices = await Html5Qrcode.getCameras();
    cameras.value = devices.map(device => ({
      id: device.id,
      label: device.label || `Camera ${device.id}`
    }));
    
    if (cameras.value.length > 0) {
      // Prefer back camera if available
      const backCamera = cameras.value.find(camera => 
        camera.label.toLowerCase().includes('back') || 
        camera.label.toLowerCase().includes('rear')
      );
      selectedCamera.value = backCamera ? backCamera.id : cameras.value[0].id;
    }
  } catch (err) {
    console.error('Error getting cameras:', err);
    error.value = t('matter.cameraError');
  }
};

// Start camera scanning
const startCameraScanning = async () => {
  if (isScanning.value) return;
  
  try {
    error.value = '';
    
    // Clean up any existing scanner
    await stopScanning();
    
    // Create new scanner instance
    html5Qrcode = new Html5Qrcode("qr-reader");
    
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0
    };
    
    await html5Qrcode.start(
      selectedCamera.value || { facingMode: "environment" },
      config,
      onScanSuccess,
      onScanFailure
    );
    
    isScanning.value = true;
  } catch (err) {
    console.error('Error starting camera:', err);
    error.value = t('matter.cameraError');
  }
};

// Stop scanning
const stopScanning = async () => {
  try {
    if (html5Qrcode && isScanning.value) {
      await html5Qrcode.stop();
      html5Qrcode.clear();
      html5Qrcode = null;
    }
    
    if (html5QrcodeScanner) {
      html5QrcodeScanner.clear();
      html5QrcodeScanner = null;
    }
    
    isScanning.value = false;
  } catch (err) {
    console.error('Error stopping scanner:', err);
  }
};

// Handle successful scan
const onScanSuccess = (decodedText: string, decodedResult: any) => {
  scanResult.value = decodedText;
  addToHistory(decodedText, 'camera');
  error.value = '';
};

// Handle scan failure (this is called frequently, so we don't show errors)
const onScanFailure = (error: string) => {
  // Don't show errors for scan failures as they happen frequently
};

// Handle file upload
const handleFileUpload = async (file: File) => {
  if (!file) return;
  
  try {
    error.value = '';
    
    // Create temporary Html5Qrcode instance for file scanning
    const tempScanner = new Html5Qrcode("temp-qr-reader");
    
    const result = await tempScanner.scanFile(file, true);
    scanResult.value = result;
    addToHistory(result, 'file');
    
    // Clean up
    tempScanner.clear();
  } catch (err) {
    console.error('Error scanning file:', err);
    error.value = t('matter.fileError');
    scanResult.value = '';
  }
};

// Handle file input change
const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    handleFileUpload(input.files[0]);
  }
};

// Handle drag and drop
const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = false;
  
  if (event.dataTransfer?.files.length) {
    handleFileUpload(event.dataTransfer.files[0]);
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

// Add scan result to history
const addToHistory = (result: string, type: string) => {
  const historyItem = {
    result,
    timestamp: new Date().toLocaleString(),
    type
  };
  
  scanHistory.value.unshift(historyItem);
  
  // Keep only last 20 results
  if (scanHistory.value.length > 20) {
    scanHistory.value = scanHistory.value.slice(0, 20);
  }
  
  // Save to localStorage
  localStorage.setItem('qr-scan-history', JSON.stringify(scanHistory.value));
};

// Load history from localStorage
const loadHistory = () => {
  try {
    const saved = localStorage.getItem('qr-scan-history');
    if (saved) {
      scanHistory.value = JSON.parse(saved);
    }
  } catch (err) {
    console.error('Error loading scan history:', err);
  }
};

// Clear scan history
const clearHistory = () => {
  scanHistory.value = [];
  localStorage.removeItem('qr-scan-history');
};

// Copy result to clipboard
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    // Show temporary success message
    const originalError = error.value;
    error.value = '';
    scanResult.value = t('matter.copied');
    setTimeout(() => {
      scanResult.value = text;
      error.value = originalError;
    }, 1000);
  } catch (err) {
    console.error('Error copying to clipboard:', err);
  }
};

// Switch scanner mode
const switchMode = async (mode: 'camera' | 'file') => {
  await stopScanning();
  scannerMode.value = mode;
  error.value = '';
};

// Component lifecycle
onMounted(async () => {
  await initializeCameras();
  loadHistory();
});

onUnmounted(async () => {
  await stopScanning();
});
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">{{ t('matter.qrScannerTitle') }}</h1>

    <div class="status-content">
      <!-- Scanner Mode Selection -->
      <div class="panel-section">
        <div class="card-content">
          <div class="mode-selector">
            <button 
              class="btn mode-btn"
              :class="{ active: scannerMode === 'camera' }"
              @click="switchMode('camera')"
            >
              <span class="material-icons">camera_alt</span>
              {{ t('matter.scanFromCamera') }}
            </button>
            <button 
              class="btn mode-btn"
              :class="{ active: scannerMode === 'file' }"
              @click="switchMode('file')"
            >
              <span class="material-icons">upload_file</span>
              {{ t('matter.scanFromFile') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Camera Scanner -->
      <div v-if="scannerMode === 'camera'" class="panel-section">
        <div class="section-title">{{ t('matter.scanFromCamera') }}</div>
        <div class="card-content">
          <!-- Camera Selection -->
          <div v-if="cameras.length > 1" class="form-group">
            <label>{{ t('matter.selectCamera') }}</label>
            <select v-model="selectedCamera" :disabled="isScanning">
              <option v-for="camera in cameras" :key="camera.id" :value="camera.id">
                {{ camera.label }}
              </option>
            </select>
          </div>

          <!-- Camera Controls -->
          <div class="camera-controls">
            <button 
              v-if="!isScanning"
              class="btn btn-primary"
              @click="startCameraScanning"
              :disabled="cameras.length === 0"
            >
              <span class="material-icons">camera_alt</span>
              {{ t('matter.startCamera') }}
            </button>
            <button 
              v-else
              class="btn btn-secondary"
              @click="stopScanning"
            >
              <span class="material-icons">stop</span>
              {{ t('matter.stopCamera') }}
            </button>
          </div>

          <!-- QR Reader Container -->
          <div class="qr-reader-container">
            <div id="qr-reader" class="qr-reader"></div>
          </div>
        </div>
      </div>

      <!-- File Scanner -->
      <div v-if="scannerMode === 'file'" class="panel-section">
        <div class="section-title">{{ t('matter.scanFromFile') }}</div>
        <div class="card-content">
          <div 
            class="file-drop-zone"
            :class="{ dragging: isDragging }"
            @drop="handleDrop"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
          >
            <div class="drop-zone-content">
              <span class="material-icons">qr_code_scanner</span>
              <p>{{ t('matter.dragDropFile') }}</p>
              <button 
                class="btn btn-primary"
                @click="() => fileInput?.click()"
              >
                {{ t('matter.chooseFile') }}
              </button>
            </div>
          </div>

          <input 
            type="file" 
            ref="fileInput"
            @change="handleFileSelect"
            accept="image/*"
            style="display: none"
          >

          <!-- Temporary container for file scanning -->
          <div id="temp-qr-reader" style="display: none;"></div>
        </div>
      </div>

      <!-- Scan Result -->
      <div v-if="scanResult || error" class="panel-section">
        <div class="section-title">{{ t('matter.scanResult') }}</div>
        <div class="card-content">
          <div v-if="error" class="error-message">
            <span class="material-icons">error</span>
            {{ error }}
          </div>
          
          <div v-if="scanResult" class="result-container">
            <div class="result-header">
              <span class="material-icons">qr_code</span>
              <button 
                class="btn-copy"
                @click="copyToClipboard(scanResult)"
                :title="t('matter.copyResult')"
              >
                <span class="material-icons">content_copy</span>
              </button>
            </div>
            <div class="result-content">
              {{ scanResult }}
            </div>
          </div>
        </div>
      </div>

      <!-- Scan History -->
      <div v-if="scanHistory.length > 0" class="panel-section">
        <div class="header-row">
          <div class="section-title-sp">{{ t('matter.scanHistory') }}</div>
          <button class="btn btn-secondary" @click="clearHistory">
            <span class="material-icons">clear_all</span>
            {{ t('matter.clearHistory') }}
          </button>
        </div>
        
        <div class="card-content">
          <div class="history-container">
            <div 
              v-for="(item, index) in scanHistory" 
              :key="index"
              class="history-item"
            >
              <div class="history-header">
                <div class="history-info">
                  <span class="material-icons">
                    {{ item.type === 'camera' ? 'camera_alt' : 'upload_file' }}
                  </span>
                  <span class="history-timestamp">{{ item.timestamp }}</span>
                </div>
                <button 
                  class="btn-copy"
                  @click="copyToClipboard(item.result)"
                  :title="t('matter.copyResult')"
                >
                  <span class="material-icons">content_copy</span>
                </button>
              </div>
              <div class="history-content">{{ item.result }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mode-selector {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 2px solid var(--border-color);
  background-color: white;
  color: var(--text-primary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mode-btn:hover {
  border-color: var(--primary-color);
  background-color: rgba(0, 112, 187, 0.05);
}

.mode-btn.active {
  border-color: var(--primary-color);
  background-color: var(--primary-color);
  color: white;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
}

select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
}

.camera-controls {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.qr-reader-container {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.qr-reader {
  max-width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.file-drop-zone {
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  padding: 3rem 2rem;
  text-align: center;
  transition: all 0.3s ease;
  background-color: var(--bg-secondary);
}

.file-drop-zone.dragging {
  border-color: var(--primary-color);
  background-color: rgba(0, 112, 187, 0.05);
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.drop-zone-content .material-icons {
  font-size: 4rem;
  color: var(--primary-color);
}

.drop-zone-content p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background-color: #ffebee;
  color: #f44336;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.result-container {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.result-header .material-icons {
  color: var(--primary-color);
}

.btn-copy {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-copy:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--text-primary);
}

.result-content {
  padding: 1rem;
  background-color: white;
  word-break: break-all;
  font-family: monospace;
  font-size: 0.9rem;
  line-height: 1.4;
  max-height: 200px;
  overflow-y: auto;
}

.section-title-sp {
  font-size: 1rem;
  color: var(--text-primary);
  padding: 0.5rem 0;
}

.history-container {
  max-height: 400px;
  overflow-y: auto;
}

.history-item {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.history-item:last-child {
  margin-bottom: 0;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.history-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.history-info .material-icons {
  font-size: 1.25rem;
  color: var(--primary-color);
}

.history-timestamp {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.history-content {
  padding: 1rem;
  background-color: white;
  word-break: break-all;
  font-family: monospace;
  font-size: 0.9rem;
  line-height: 1.4;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-secondary {
  background-color: var(--secondary-color);
  color: var(--text-primary);
}

.btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Global styles for html5-qrcode */
:deep(#qr-reader) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(#qr-reader__dashboard_section) {
  background-color: var(--bg-secondary) !important;
  border-radius: 0 0 8px 8px;
}

:deep(#qr-reader__dashboard_section_csr) {
  text-align: center;
  padding: 1rem;
}

:deep(#qr-reader__scan_region) {
  border-radius: 8px 8px 0 0;
}

@media (max-width: 768px) {
  .mode-selector {
    flex-direction: column;
  }

  .mode-btn {
    width: 100%;
    justify-content: center;
  }

  .camera-controls {
    margin-bottom: 1rem;
  }

  .camera-controls .btn {
    width: 100%;
  }

  .file-drop-zone {
    padding: 2rem 1rem;
  }

  .drop-zone-content .material-icons {
    font-size: 3rem;
  }

  .header-row {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .section-title-sp {
    padding: 0;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .history-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .history-info {
    width: 100%;
  }
}
</style>