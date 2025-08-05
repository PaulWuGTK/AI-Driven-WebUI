<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { parseAndAnalyzeMatterQR } from '../../../utils/matterQRParser';

const { t } = useI18n();

// Scanner state
const scanMode = ref<'camera' | 'file'>('camera');
const isScanning = ref(false);
const scanResult = ref<string>('');
const error = ref<string>('');
const fileInput = ref<HTMLInputElement | null>(null);
const scannerContainer = ref<HTMLDivElement | null>(null);

// Scanner instances
let qrScanner: Html5QrcodeScanner | null = null;
let fileScanner: Html5Qrcode | null = null;

// Scan history
const scanHistory = ref<Array<{ result: string; timestamp: string; analysis: any }>>([]);

// Step 2: Device Information
const deviceAlias = ref('');
const nodeId = ref('1');
const deviceTypeIcons: Record<string, string> = {
  light: 'lightbulb',
  switch: 'toggle_on',
  sensor: 'sensors',
  outlet: 'power',
  thermostat: 'thermostat',
  lock: 'lock',
  camera: 'videocam',
  speaker: 'speaker',
  other: 'device_hub'
};

// Step 3: Connection Settings
const connectionType = ref<'wifi' | 'thread'>('wifi');
const ssid = ref('');
const password = ref('');
const dataset = ref('');

// UI state
const currentStep = ref(1);
const loading = ref(false);
const analysisResult = ref<any>(null);

// Initialize camera scanner
const initCameraScanner = () => {
  if (!scannerContainer.value) return;

  qrScanner = new Html5QrcodeScanner(
    'qr-scanner-container',
    {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      showTorchButtonIfSupported: true,
      showZoomSliderIfSupported: true,
      defaultZoomValueIfSupported: 2
    },
    false
  );

  qrScanner.render(
    (decodedText) => {
      handleScanSuccess(decodedText);
    },
    (errorMessage) => {
      // Ignore frequent scanning errors
      if (!errorMessage.includes('No QR code found')) {
        console.warn('QR scan error:', errorMessage);
      }
    }
  );
};

// Handle successful scan
const handleScanSuccess = (result: string) => {
  console.log('QR Code scanned:', result);
  scanResult.value = result;
  error.value = '';
  
  // Parse and analyze the QR code
  const analysis = parseAndAnalyzeMatterQR(result);
  analysisResult.value = analysis;
  
  // Auto-generate device alias based on analysis or default
  const timestamp = Date.now().toString().slice(-4);
  if (analysis.isValid && analysis.deviceType) {
    deviceAlias.value = `Device_${analysis.deviceType}_${timestamp}`;
  } else {
    deviceAlias.value = `Device_other_${timestamp}`;
  }
  
  // Add to history
  scanHistory.value.unshift({
    result,
    timestamp: new Date().toLocaleTimeString(),
    analysis
  });
  
  // Keep only last 10 scans
  if (scanHistory.value.length > 10) {
    scanHistory.value = scanHistory.value.slice(0, 10);
  }
  
  // Move to step 2
  currentStep.value = 2;
};

// Start camera scanning
const startCamera = () => {
  scanMode.value = 'camera';
  isScanning.value = true;
  error.value = '';
  
  setTimeout(() => {
    initCameraScanner();
  }, 100);
};

// Stop camera scanning
const stopCamera = () => {
  if (qrScanner) {
    qrScanner.clear();
    qrScanner = null;
  }
  isScanning.value = false;
};

// Handle file upload
const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  
  if (!file) return;
  
  console.log('Scanning file:', file.name);
  error.value = '';
  loading.value = true;
  
  try {
    if (!fileScanner) {
      fileScanner = new Html5Qrcode('file-scanner');
    }
    
    const result = await fileScanner.scanFile(file, true);
    console.log('File scan successful:', result);
    handleScanSuccess(result);
  } catch (err) {
    console.error('File scan error:', err);
    error.value = t('matter.fileError');
  } finally {
    loading.value = false;
    // Reset file input
    if (input) input.value = '';
  }
};

// Switch to file mode
const switchToFileMode = () => {
  stopCamera();
  scanMode.value = 'file';
};

// Generate device alias based on device type
const generateDeviceAlias = (deviceType: string) => {
  const timestamp = Date.now().toString().slice(-4);
  return `Device_${deviceType}_${timestamp}`;
};

// Handle device type icon click
const handleDeviceTypeClick = (deviceType: string) => {
  deviceAlias.value = generateDeviceAlias(deviceType);
};

// Validate device alias
const validateDeviceAlias = (alias: string): boolean => {
  // Check if empty
  if (!alias.trim()) return false;
  
  // Check for special characters (only allow letters, numbers, underscore)
  const validPattern = /^[a-zA-Z0-9_]+$/;
  return validPattern.test(alias);
};

// Handle device alias input
const handleDeviceAliasInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const value = input.value;
  
  // Remove invalid characters as user types
  const cleanValue = value.replace(/[^a-zA-Z0-9_]/g, '');
  if (cleanValue !== value) {
    input.value = cleanValue;
    deviceAlias.value = cleanValue;
  }
};

// Copy result to clipboard
const copyResult = async (result: string) => {
  try {
    await navigator.clipboard.writeText(result);
    // Show temporary feedback
    const originalText = result;
    setTimeout(() => {
      // Could show a toast notification here
    }, 1000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

// Clear scan history
const clearHistory = () => {
  scanHistory.value = [];
};

// Go to next step
const goToNextStep = () => {
  if (currentStep.value === 2) {
    // Validate device alias
    if (!validateDeviceAlias(deviceAlias.value)) {
      error.value = 'Device alias cannot be empty and can only contain letters, numbers, and underscores';
      return;
    }
    error.value = '';
    currentStep.value = 3;
  }
};

// Go to previous step
const goToPreviousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
    error.value = '';
  }
};

// Reset to step 1
const resetToStep1 = () => {
  currentStep.value = 1;
  scanResult.value = '';
  analysisResult.value = null;
  deviceAlias.value = '';
  nodeId.value = '1';
  ssid.value = '';
  password.value = '';
  dataset.value = '';
  error.value = '';
};

// Get Thread dataset
const getDataset = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const response = await fetch('/API/info?list=matterProxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        MatterProxy: {
          method: "GET",
          action: "get_dataset",
          data: {}
        }
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to get dataset');
    }
    
    const data = await response.json();
    
    if (data.MatterProxy?.result === 'successful') {
      dataset.value = data.MatterProxy.dataset || '';
    } else {
      error.value = data.MatterProxy?.message || 'Failed to get dataset';
    }
  } catch (err) {
    console.error('Error getting dataset:', err);
    error.value = 'Failed to get dataset';
  } finally {
    loading.value = false;
  }
};

// Submit pairing request
const submitPairing = async () => {
  if (!scanResult.value || !deviceAlias.value) return;
  
  // Validate device alias one more time
  if (!validateDeviceAlias(deviceAlias.value)) {
    error.value = 'Invalid device alias format';
    return;
  }
  
  // Validate connection settings
  if (connectionType.value === 'wifi') {
    if (!ssid.value || !password.value) {
      error.value = 'SSID and password are required for WiFi connection';
      return;
    }
  } else if (connectionType.value === 'thread') {
    if (!dataset.value) {
      error.value = 'Dataset is required for Thread connection';
      return;
    }
  }
  
  loading.value = true;
  error.value = '';
  
  try {
    const response = await fetch('/API/info?list=matterProxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        MatterProxy: {
          method: "POST",
          action: "qrcode_pairing",
          data: {
            ScanResult: scanResult.value,
            ConnectionType: connectionType.value,
            nodeId: nodeId.value,
            nodeAlias: deviceAlias.value,
            ...(connectionType.value === 'wifi' ? {
              ssId: ssid.value,
              password: password.value
            } : {
              dataset: dataset.value
            })
          }
        }
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to send pairing request');
    }
    
    const data = await response.json();
    
    if (data.MatterProxy.result === 'successful') {
      // Show success and reset
      alert('Pairing request sent successfully!');
      resetToStep1();
    } else {
      error.value = data.MatterProxy.message || 'Failed to send pairing request';
    }
  } catch (err) {
    console.error('Error submitting pairing request:', err);
    error.value = 'Failed to submit pairing request';
  } finally {
    loading.value = false;
  }
};

// Cleanup on unmount
onUnmounted(() => {
  stopCamera();
  if (fileScanner) {
    fileScanner.clear();
  }
});

onMounted(() => {
  // Auto-start camera on mount
  startCamera();
});
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">{{ t('matter.qrScannerTitle') }}</h1>

    <!-- Progress Steps -->
    <div class="progress-steps">
      <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
        <div class="step-number">1</div>
        <div class="step-label">Scan QR Code</div>
      </div>
      <div class="step-line" :class="{ completed: currentStep > 1 }"></div>
      <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
        <div class="step-number">2</div>
        <div class="step-label">Configure Device</div>
      </div>
      <div class="step-line" :class="{ completed: currentStep > 2 }"></div>
      <div class="step" :class="{ active: currentStep >= 3 }">
        <div class="step-number">3</div>
        <div class="step-label">Start Pairing</div>
      </div>
    </div>

    <div class="status-content">
      <!-- Step 1: QR Code Scanning -->
      <div v-if="currentStep === 1" class="panel-section">
        <div class="section-title">Step 1: Scan QR Code</div>
        
        <div class="card-content">
          <!-- Mode Selection -->
          <div class="mode-selection">
            <button 
              class="mode-button"
              :class="{ active: scanMode === 'camera' }"
              @click="startCamera"
            >
              <span class="material-icons">camera_alt</span>
              {{ t('matter.scanFromCamera') }}
            </button>
            <button 
              class="mode-button"
              :class="{ active: scanMode === 'file' }"
              @click="switchToFileMode"
            >
              <span class="material-icons">upload_file</span>
              {{ t('matter.scanFromFile') }}
            </button>
          </div>

          <!-- Camera Scanner -->
          <div v-if="scanMode === 'camera'" class="scanner-section">
            <div v-if="isScanning" class="camera-container">
              <div id="qr-scanner-container" ref="scannerContainer"></div>
            </div>
          </div>

          <!-- File Scanner -->
          <div v-if="scanMode === 'file'" class="file-scanner-section">
            <div class="file-upload-area">
              <div class="upload-content">
                <span class="material-icons">qr_code_scanner</span>
                <p>{{ t('matter.dragDropFile') }}</p>
                <button class="btn btn-secondary" @click="() => fileInput?.click()">
                  {{ t('matter.chooseFile') }}
                </button>
              </div>
            </div>
            <input 
              type="file" 
              ref="fileInput"
              @change="handleFileUpload"
              accept="image/*"
              style="display: none"
            />
            <div id="file-scanner" style="display: none;"></div>
          </div>

          <!-- Error Display -->
          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <!-- Scan History -->
          <div v-if="scanHistory.length > 0" class="scan-history">
            <div class="history-header">
              <h3>{{ t('matter.scanHistory') }}</h3>
              <button class="btn btn-secondary" @click="clearHistory">
                {{ t('matter.clearHistory') }}
              </button>
            </div>
            <div class="history-list">
              <div 
                v-for="(item, index) in scanHistory" 
                :key="index"
                class="history-item"
                @click="handleScanSuccess(item.result)"
              >
                <div class="history-time">{{ item.timestamp }}</div>
                <div class="history-result">{{ item.result }}</div>
                <button 
                  class="btn-copy"
                  @click.stop="copyResult(item.result)"
                  :title="t('matter.copyResult')"
                >
                  <span class="material-icons">content_copy</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Device Information -->
      <div v-if="currentStep === 2" class="panel-section">
        <div class="section-title">Step 2: Configure Device</div>
        
        <div class="card-content">
          <!-- QR Code Result Display -->
          <div class="qr-result-display">
            <div class="result-header">
              <span class="material-icons">qr_code</span>
              <span>{{ scanResult }}</span>
            </div>
          </div>

          <!-- Device Information Display -->
          <div v-if="analysisResult && analysisResult.isValid" class="device-info-display">
            <div class="device-card">
              <div class="device-icon">
                <span class="material-icons">{{ deviceTypeIcons[analysisResult.deviceType as keyof typeof deviceTypeIcons] || 'device_hub' }}</span>
              </div>
              <div class="device-details">
                <div class="device-name">{{ analysisResult.deviceAlias }}</div>
                <div class="device-type">{{ analysisResult.deviceInfo?.label || 'Other Device' }}</div>
                <div class="device-vendor">{{ analysisResult.vendorName }}</div>
                <div class="device-id">Node ID: {{ nodeId }}</div>
              </div>
            </div>
          </div>

          <!-- Device Type Selection Icons -->
          <div class="device-type-section">
            <div class="section-subtitle">Quick Device Type Selection</div>
            <div class="device-type-icons">
              <button 
                v-for="(icon, type) in deviceTypeIcons" 
                :key="type"
                class="device-type-icon"
                @click="handleDeviceTypeClick(type)"
                :title="type"
              >
                <span class="material-icons">{{ icon }}</span>
              </button>
            </div>
          </div>

          <!-- Device Configuration -->
          <div class="device-config">
            <div class="form-group">
              <label>Device Alias</label>
              <input 
                type="text" 
                v-model="deviceAlias"
                @input="handleDeviceAliasInput"
                placeholder="Device_light_1234"
                required
                pattern="[a-zA-Z0-9_]+"
                title="Only letters, numbers, and underscores are allowed"
              />
              <small class="form-hint">Only letters, numbers, and underscores are allowed</small>
            </div>

            <div class="form-group">
              <label>Node ID</label>
              <input 
                type="text" 
                v-model="nodeId"
                required
              />
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="step-navigation">
            <button class="btn btn-secondary" @click="goToPreviousStep">
              <span class="material-icons">arrow_back</span>
              Back
            </button>
            <button 
              class="btn btn-primary" 
              @click="goToNextStep"
              :disabled="!deviceAlias || !validateDeviceAlias(deviceAlias)"
            >
              Next
              <span class="material-icons">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Step 3: Connection Settings -->
      <div v-if="currentStep === 3" class="panel-section">
        <div class="section-title">Step 3: Start Pairing</div>
        
        <div class="card-content">
          <!-- Device Summary -->
          <div class="device-summary">
            <div class="summary-card">
              <div class="summary-icon">
                <span class="material-icons">{{ deviceTypeIcons[analysisResult?.deviceType as keyof typeof deviceTypeIcons] || 'device_hub' }}</span>
              </div>
              <div class="summary-details">
                <div class="summary-name">{{ deviceAlias }}</div>
                <div class="summary-type">{{ analysisResult?.deviceInfo?.label || 'Other Device' }}</div>
                <div class="summary-id">Node ID: {{ nodeId }}</div>
              </div>
            </div>
          </div>

          <!-- Connection Configuration -->
          <div class="connection-config">
            <div class="section-subtitle">Connection Configuration</div>
            
            <!-- Connection Type Selection -->
            <div class="form-group">
              <label>Connection Type</label>
              <div class="connection-type-selection">
                <label class="connection-option">
                  <input type="radio" v-model="connectionType" value="wifi" />
                  <div class="option-content">
                    <span class="material-icons">wifi</span>
                    <span>WiFi Connection</span>
                  </div>
                </label>
                <label class="connection-option">
                  <input type="radio" v-model="connectionType" value="thread" />
                  <div class="option-content">
                    <span class="material-icons">hub</span>
                    <span>Thread Network</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- WiFi Settings -->
            <template v-if="connectionType === 'wifi'">
              <div class="form-group">
                <label>WiFi Network (SSID)</label>
                <input 
                  type="text" 
                  v-model="ssid"
                  placeholder="Matter_Test"
                  required
                />
              </div>

              <div class="form-group">
                <label>WiFi Password</label>
                <input 
                  type="password" 
                  v-model="password"
                  placeholder="12345678"
                  required
                />
              </div>
            </template>

            <!-- Thread Settings -->
            <template v-if="connectionType === 'thread'">
              <div class="form-group">
                <label>Dataset</label>
                <div class="dataset-input-group">
                  <textarea 
                    v-model="dataset"
                    placeholder="Enter Thread dataset..."
                    rows="3"
                    required
                  ></textarea>
                  <button 
                    type="button"
                    class="btn btn-secondary get-dataset-btn"
                    @click="getDataset"
                    :disabled="loading"
                  >
                    <span class="material-icons" v-if="loading">sync</span>
                    GET DATASET
                  </button>
                </div>
              </div>
            </template>
          </div>

          <!-- Navigation Buttons -->
          <div class="step-navigation">
            <button class="btn btn-secondary" @click="goToPreviousStep">
              <span class="material-icons">arrow_back</span>
              Back
            </button>
            <button 
              class="btn btn-primary" 
              @click="submitPairing"
              :disabled="loading || (connectionType === 'wifi' && (!ssid || !password)) || (connectionType === 'thread' && !dataset)"
            >
              <span class="material-icons" v-if="loading">sync</span>
              Submit Pairing
            </button>
          </div>
        </div>
      </div>

      <!-- Error Display -->
      <div v-if="error && currentStep > 1" class="error-message">
        {{ error }}
      </div>

      <!-- Reset Button (always visible) -->
      <div class="reset-container">
        <button class="btn btn-secondary" @click="resetToStep1">
          <span class="material-icons">refresh</span>
          Reset
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Progress Steps */
.progress-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  background-color: white;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e0e0e0;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transition: all 0.3s;
}

.step.active .step-number {
  background-color: var(--primary-color);
  color: white;
}

.step.completed .step-number {
  background-color: #4caf50;
  color: white;
}

.step-label {
  font-size: 0.9rem;
  color: #666;
  text-align: center;
}

.step.active .step-label {
  color: var(--primary-color);
  font-weight: 500;
}

.step.completed .step-label {
  color: #4caf50;
}

.step-line {
  flex: 1;
  height: 2px;
  background-color: #e0e0e0;
  margin: 0 1rem;
  transition: background-color 0.3s;
}

.step-line.completed {
  background-color: #4caf50;
}

/* Mode Selection */
.mode-selection {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.mode-button {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-button:hover {
  border-color: var(--primary-color);
}

.mode-button.active {
  border-color: var(--primary-color);
  background-color: rgba(0, 112, 187, 0.1);
}

.mode-button .material-icons {
  font-size: 2rem;
  color: var(--primary-color);
}

/* Scanner sections */
.scanner-section {
  margin-bottom: 2rem;
}

.camera-container {
  display: flex;
  justify-content: center;
  margin: 2rem 0;
}

.file-scanner-section {
  margin-bottom: 2rem;
}

.file-upload-area {
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  background-color: var(--bg-secondary);
  transition: border-color 0.3s;
}

.file-upload-area:hover {
  border-color: var(--primary-color);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-content .material-icons {
  font-size: 3rem;
  color: var(--primary-color);
}

/* QR Result Display */
.qr-result-display {
  margin-bottom: 2rem;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-family: monospace;
  font-size: 0.9rem;
  color: var(--text-primary);
  padding: 1rem;
  background-color: var(--bg-secondary);
  border-radius: 8px;
}

/* Device Information Display */
.device-info-display {
  margin-bottom: 2rem;
}

.device-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background-color: white;
  border: 2px solid var(--primary-color);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 112, 187, 0.1);
}

.device-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: rgba(0, 112, 187, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.device-icon .material-icons {
  font-size: 2rem;
  color: var(--primary-color);
}

.device-details {
  flex: 1;
}

.device-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.device-type {
  font-size: 1rem;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
}

.device-vendor {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.device-id {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* Device Type Selection */
.device-type-section {
  margin-bottom: 2rem;
}

.section-subtitle {
  font-size: 1rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-weight: 500;
}

.device-type-icons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin: 1.5rem 0;
}

.device-type-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.device-type-icon:hover {
  border-color: var(--primary-color);
  background-color: rgba(0, 112, 187, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 112, 187, 0.2);
}

.device-type-icon .material-icons {
  font-size: 2.5rem;
  color: var(--primary-color);
}

/* Device Configuration */
.device-config {
  margin-top: 2rem;
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

.form-hint {
  color: var(--text-secondary);
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

input, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
}

input:invalid {
  border-color: #dc3545;
}

/* Device Summary */
.device-summary {
  margin-bottom: 2rem;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background-color: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.summary-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.summary-icon .material-icons {
  font-size: 1.5rem;
  color: white;
}

.summary-details {
  flex: 1;
}

.summary-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.summary-type {
  font-size: 0.9rem;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
}

.summary-id {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* Connection Configuration */
.connection-config {
  margin-bottom: 2rem;
}

.connection-type-selection {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.connection-option {
  flex: 1;
  cursor: pointer;
}

.connection-option input[type="radio"] {
  display: none;
}

.option-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: white;
  transition: all 0.2s;
}

.connection-option input[type="radio"]:checked + .option-content {
  border-color: var(--primary-color);
  background-color: rgba(0, 112, 187, 0.1);
}

.option-content .material-icons {
  font-size: 1.5rem;
  color: var(--primary-color);
}

.dataset-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.get-dataset-btn {
  align-self: flex-end;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

/* Navigation */
.step-navigation {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  gap: 1rem;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-secondary {
  background-color: var(--secondary-color);
  color: var(--text-primary);
}

/* Scan History */
.scan-history {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.history-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background-color: white;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.history-item:hover {
  background-color: var(--bg-secondary);
}

.history-time {
  color: var(--text-secondary);
  font-size: 0.9rem;
  min-width: 80px;
}

.history-result {
  flex: 1;
  font-family: monospace;
  font-size: 0.9rem;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-copy {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 4px;
}

.btn-copy:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.error-message {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #ffebee;
  color: #f44336;
  border-radius: 4px;
  text-align: center;
}

.reset-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

/* QR Scanner specific styles */
:deep(#qr-scanner-container) {
  max-width: 500px;
  margin: 0 auto;
}

:deep(#qr-scanner-container video) {
  border-radius: 8px;
}

:deep(#qr-scanner-container button) {
  margin: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .progress-steps {
    padding: 1rem;
  }

  .step {
    min-width: 80px;
  }

  .step-number {
    width: 32px;
    height: 32px;
    font-size: 0.9rem;
  }

  .step-label {
    font-size: 0.8rem;
  }

  .step-line {
    margin: 0 0.5rem;
  }

  .mode-selection {
    flex-direction: column;
  }

  .connection-type-selection {
    flex-direction: column;
  }

  .device-type-icons {
    gap: 0.75rem;
    margin: 1rem 0;
  }

  .device-type-icon {
    width: 70px;
    height: 70px;
  }

  .device-type-icon .material-icons {
    font-size: 2rem;
  }

  .step-navigation {
    flex-direction: column;
  }

  .step-navigation .btn {
    width: 100%;
    justify-content: center;
  }

  .history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .history-time {
    min-width: auto;
  }

  .btn-copy {
    align-self: flex-end;
  }

  .device-card {
    flex-direction: column;
    text-align: center;
  }

  .summary-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>