<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { sendQRScanResult } from '../../../services/api/matter';
import axios from 'axios';

const { t } = useI18n();

// Current step in the pairing process
const currentStep = ref<'scan' | 'configure' | 'pairing'>('scan');

// Scanner state
const scannerMode = ref<'camera' | 'file'>('camera');
const connectionType = ref<'wifi' | 'thread'>('wifi');
const isScanning = ref(false);
const scanResult = ref<string>('');
const error = ref<string>('');
const scanHistory = ref<{ result: string; timestamp: string; type: string }[]>([]);
const apiResult = ref<string>('');
const isProcessing = ref(false);

// Device configuration state
const deviceInfo = ref<{
  qrCode: string;
  deviceType: string;
}>({
  qrCode: '',
  deviceType: '',
});

// Pairing configuration
const pairingConfig = ref<{
  nodeAlias: string;
  connectionType: 'wifi' | 'thread';
  ssid: string;
  password: string;
  dataset: string;
}>({
  nodeAlias: '',
  connectionType: 'wifi',
  ssid: '',
  password: '',
  dataset: ''
});

// Device type options
const deviceTypes = [
  { value: 'light', labelKey: 'matter.smartLight', icon: 'lightbulb' },
  { value: 'switch', labelKey: 'matter.smartSwitch', icon: 'toggle_on' },
  { value: 'sensor', labelKey: 'matter.sensor', icon: 'sensors' },
  { value: 'outlet', labelKey: 'matter.smartOutlet', icon: 'power' },
  { value: 'thermostat', labelKey: 'matter.thermostat', icon: 'thermostat' },
  { value: 'lock', labelKey: 'matter.smartLock', icon: 'lock' },
  { value: 'camera', labelKey: 'matter.securityCamera', icon: 'videocam' },
  { value: 'speaker', labelKey: 'matter.smartSpeaker', icon: 'speaker' },
  { value: 'other', labelKey: 'matter.otherDevice', icon: 'device_hub' }
];

// Computed properties
const selectedDeviceType = computed(() => {
  return deviceTypes.find(type => type.value === deviceInfo.value.deviceType);
});

const canProceedToConfig = computed(() => {
  return scanResult.value && deviceInfo.value.deviceType;
});

const canStartPairing = computed(() => {
  return pairingConfig.value.nodeAlias && 
         ((pairingConfig.value.connectionType === 'wifi' && pairingConfig.value.ssid && pairingConfig.value.password) ||
          (pairingConfig.value.connectionType === 'thread' && pairingConfig.value.dataset));
});

// Validate Node Alias (only alphanumeric and underscore)
const isNodeAliasValid = computed(() => {
  const alias = pairingConfig.value.nodeAlias;
  return alias && /^[a-zA-Z0-9_]+$/.test(alias);
});

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
      // Prefer back/rear camera for QR scanning
      const backCamera = cameras.value.find(camera => {
        const label = camera.label.toLowerCase();
        return label.includes('back') || 
               label.includes('rear') || 
               label.includes('environment') ||
               label.includes('後') ||
               label.includes('背面');
      });
      
      // If no back camera found, use the first available camera
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
    
    // Clean up any existing scanner first
    await stopScanning();
    
    // Wait for DOM to be ready
    await nextTick();
    
    const qrReaderElement = document.getElementById("qr-reader");
    if (!qrReaderElement) {
      console.error('QR reader element not found');
      error.value = 'QR reader element not found';
      return;
    }
    
    // Create new scanner instance
    html5Qrcode = new Html5Qrcode("qr-reader");
    
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      disableFlip: false
    };
    
    // Determine camera configuration
    let cameraConfig;
    if (selectedCamera.value) {
      // Use specific camera ID
      cameraConfig = selectedCamera.value;
    } else {
      // Fallback to environment facing mode (back camera)
      cameraConfig = { facingMode: "environment" };
    }
        
    await html5Qrcode.start(
      cameraConfig,
      config,
      onScanSuccess,
      onScanFailure
    );
    
    isScanning.value = true;
    
  } catch (err) {
    console.error('Error starting camera:', err);
    // Try fallback to environment facing mode if specific camera fails
    if (selectedCamera.value) {
      selectedCamera.value = '';
      try {
        const fallbackConfig = { facingMode: "environment" };
        await html5Qrcode?.start(
          fallbackConfig,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            disableFlip: false
          },
          onScanSuccess,
          onScanFailure
        );
        isScanning.value = true;
        return;
      } catch (fallbackErr) {
        console.error('Fallback camera also failed:', fallbackErr);
      }
    }
    
    error.value = `${t('matter.cameraError')}: ${err}`;
    isScanning.value = false;
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
    isScanning.value = false;
  }
};

// Handle successful scan
const onScanSuccess = (decodedText: string, decodedResult: any) => {
  scanResult.value = decodedText;
  addToHistory(decodedText, 'camera');
  error.value = '';
  
  // Parse QR code and extract device information
  parseQRCode(decodedText);
  
  // Optionally stop scanning after successful scan
  stopScanning();
  
  // Move to configuration step
  currentStep.value = 'configure';
};

// Handle scan failure (this is called frequently, so we don't show errors)
const onScanFailure = (error: string) => {
  // Don't show errors for scan failures as they happen frequently
  // console.log('Scan failure:', error);
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
    
    // Parse QR code and extract device information
    parseQRCode(result);
    
    stopScanning();
    
    // Move to configuration step
    currentStep.value = 'configure';
    
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

// Parse QR code to extract device information
const parseQRCode = (qrCode: string) => {
  deviceInfo.value.qrCode = qrCode;
  // Set default device type and alias
  deviceInfo.value.deviceType = 'other';
  pairingConfig.value.nodeAlias = `Device_other_${Date.now().toString().slice(-4)}`;
};

// Handle device type selection and update alias
const handleDeviceTypeChange = (deviceType: string) => {
  deviceInfo.value.deviceType = deviceType;
  // Update alias with new device type
  const timestamp = Date.now().toString().slice(-4);
  pairingConfig.value.nodeAlias = `Device_${deviceType}_${timestamp}`;
};

// Handle node alias input with validation
const handleNodeAliasInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const value = input.value;
  
  // Only allow alphanumeric characters and underscore
  const sanitized = value.replace(/[^a-zA-Z0-9_]/g, '');
  
  if (sanitized !== value) {
    input.value = sanitized;
  }
  
  pairingConfig.value.nodeAlias = sanitized;
};

// Go back to scanning
const goBackToScan = () => {
  currentStep.value = 'scan';
  scanResult.value = '';
  error.value = '';
  deviceInfo.value = {
    qrCode: '',
    deviceType: '',
  };
};

// Proceed to pairing configuration
const proceedToConfig = () => {
  if (!canProceedToConfig.value) return;
  currentStep.value = 'pairing';
};

// Start device pairing
const startPairing = async () => {
  if (!canStartPairing.value) return;
  
  isProcessing.value = true;
  error.value = '';
  
  try {
    // Prepare API data based on connection type
    const apiData: any = {
      ScanResult: deviceInfo.value.qrCode,
      ConnectionType: pairingConfig.value.connectionType,
      nodeAlias: pairingConfig.value.nodeAlias
    };

    // Add connection-specific parameters
    if (pairingConfig.value.connectionType === 'wifi') {
      apiData.ssId = pairingConfig.value.ssid;
      apiData.password = pairingConfig.value.password;
    } else if (pairingConfig.value.connectionType === 'thread') {
      apiData.dataset = pairingConfig.value.dataset;
    }

    // Send API request
    const response = await sendQRScanResult(
      deviceInfo.value.qrCode, 
      pairingConfig.value.connectionType,
      apiData
    );
    
    if (response.MatterProxy.result === 'successful') {
      // Show success and reset to scan step
      alert(`Device "${pairingConfig.value.nodeAlias}" paired successfully!`);
      resetToScan();
    } else {
      error.value = response.MatterProxy.message || 'Pairing failed';
    }
  } catch (err) {
    console.error('Error during pairing:', err);
    error.value = 'An error occurred during pairing';
  } finally {
    isProcessing.value = false;
  }
};

// Reset to scan step
const resetToScan = () => {
  currentStep.value = 'scan';
  scanResult.value = '';
  error.value = '';
  deviceInfo.value = {
    qrCode: '',
    deviceType: '',
  };
  pairingConfig.value = {
    nodeAlias: '',
    connectionType: 'wifi',
    ssid: '',
    password: '',
    dataset: ''
  };
};

// Get Thread dataset from Thread API
const getDataset = async () => {
  try {
    isProcessing.value = true;
    error.value = '';
    
    // Use the same API endpoint as Matter Pairing
    const response = await axios.post('/API/info?list=matterProxy', {
      MatterProxy: {
        method: "GET",
        action: "get_dataset",
        data: {}
      }
    });
    
    if (response.data.MatterProxy?.result === 'successful') {
      pairingConfig.value.dataset = response.data.MatterProxy.dataset || '';
    } else if (response.data.MatterProxy?.result === 'failed') {
      error.value = response.data.MatterProxy.message || 'Failed to get Thread dataset';
    } else {
      error.value = 'Unexpected response format when getting Thread dataset';
    }
  } catch (err) {
    console.error('Error getting Thread dataset:', err);
    error.value = 'Failed to get Thread dataset';
  } finally {
    isProcessing.value = false;
  }
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
    const originalResult = scanResult.value;
    scanResult.value = t('matter.copied');
    setTimeout(() => {
      scanResult.value = originalResult;
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
      <!-- Step Indicator -->
      <div class="step-indicator">
        <div class="step" :class="{ active: currentStep === 'scan', completed: currentStep !== 'scan' }">
          <div class="step-number">1</div>
          <div class="step-label">{{ t('matter.stepScanQR') }}</div>
        </div>
        <div class="step-line" :class="{ active: currentStep !== 'scan' }"></div>
        <div class="step" :class="{ active: currentStep === 'configure', completed: currentStep === 'pairing' }">
          <div class="step-number">2</div>
          <div class="step-label">{{ t('matter.stepConfigureDevice') }}</div>
        </div>
        <div class="step-line" :class="{ active: currentStep === 'pairing' }"></div>
        <div class="step" :class="{ active: currentStep === 'pairing' }">
          <div class="step-number">3</div>
          <div class="step-label">{{ t('matter.stepStartPairing') }}</div>
        </div>
      </div>

      <!-- Step 1: QR Code Scanning -->
      <div v-if="currentStep === 'scan'" class="panel-section">
        <div class="section-title">{{ t('matter.stepScanTitle') }}</div>
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

      <!-- Camera Scanner (only show in scan step) -->
      <div v-if="currentStep === 'scan' && scannerMode === 'camera'" class="panel-section">
        <div class="section-title">{{ t('matter.scanFromCamera') }}</div>
        <div class="card-content">
          <!-- Camera Selection -->
          <div v-if="cameras.length > 0" class="form-group">
            <label>{{ t('matter.selectCamera') }}</label>
            <select v-model="selectedCamera" :disabled="isScanning">
              <option value="">{{ t('matter.selectCamera') }} (Auto)</option>
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
            <div 
              id="qr-reader" 
              class="qr-reader"
            ></div>
            <div v-if="!isScanning" class="qr-reader-placeholder">
              <span class="material-icons">qr_code_scanner</span>
              <p>{{ t('matter.startCamera') }}</p>
            </div>
          </div>

          <!-- Debug Information -->
          <div v-if="error || cameras.length > 0" class="debug-info">
            <p v-if="error"><strong>Error:</strong> {{ error }}</p>
            <p><strong>Cameras found:</strong> {{ cameras.length }}</p>
            <p><strong>Selected camera:</strong> {{ selectedCamera }}</p>
            <p><strong>Is scanning:</strong> {{ isScanning }}</p>
            <div v-if="cameras.length > 0">
              <p><strong>Available cameras:</strong></p>
              <ul>
                <li v-for="camera in cameras" :key="camera.id">
                  {{ camera.label }} (ID: {{ camera.id }})
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- File Scanner (only show in scan step) -->
      <div v-if="currentStep === 'scan' && scannerMode === 'file'" class="panel-section">
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

      <!-- Step 2: Device Configuration -->
      <div v-if="currentStep === 'configure'" class="panel-section">
        <div class="section-title">{{ t('matter.stepConfigureTitle') }}</div>
        <div class="card-content">
          <!-- QR Code Result Display -->
          <div class="qr-result-display">
            <div class="result-header">
              <span class="material-icons">qr_code</span>
              <span>{{ t('matter.scannedQRCode') }}</span>
            </div>
            <div class="result-content">{{ scanResult }}</div>
          </div>
          
          <!-- Device Type Selection -->
          <div class="device-type-section">
            <h3>{{ t('matter.selectDeviceType') }}</h3>
            <div class="device-type-grid">
              <div 
                v-for="type in deviceTypes" 
                :key="type.value"
                class="device-type-card"
                :class="{ selected: deviceInfo.deviceType === type.value }"
                @click="handleDeviceTypeChange(type.value)"
              >
                <div class="device-icon">
                  <span class="material-icons">{{ type.icon }}</span>
                </div>
                <div class="device-label">{{ t(type.labelKey) }}</div>
              </div>
            </div>
          </div>
          
          <!-- Device Information -->
          <div class="device-info-section">
            <h3>{{ t('matter.deviceInformation') }}</h3>
            <div class="form-group">
              <label>{{ t('matter.deviceAlias') }}</label>
              <input 
                type="text" 
                v-model="pairingConfig.nodeAlias"
                @input="handleNodeAliasInput"
                :placeholder="t('matter.deviceAliasPlaceholder')"
                :class="{ 'invalid': pairingConfig.nodeAlias && !isNodeAliasValid }"
              />
              <div v-if="pairingConfig.nodeAlias && !isNodeAliasValid" class="validation-error">
                {{ t('matter.deviceAliasValidation') }}
              </div>
              <div class="alias-hint">
                <span>{{ t('matter.deviceAliasHint') }}</span>
              </div>
            </div>
          </div>
          
          <!-- Navigation Buttons -->
          <div class="step-navigation">
            <button class="btn btn-secondary" @click="goBackToScan">
              <span class="material-icons">arrow_back</span>
              {{ t('matter.backToScan') }}
            </button>
            <button 
              class="btn btn-primary" 
              @click="proceedToConfig"
              :disabled="!canProceedToConfig"
            >
              {{ t('matter.nextConfigureConnection') }}
              <span class="material-icons">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Step 3: Pairing Configuration -->
      <div v-if="currentStep === 'pairing'" class="panel-section">
        <div class="section-title">{{ t('matter.stepPairingTitle') }}</div>
        <div class="card-content">
          <!-- Device Summary -->
          <div class="device-summary">
            <div class="summary-header">
              <div class="device-icon-large">
                <span class="material-icons">{{ selectedDeviceType?.icon || 'device_hub' }}</span>
              </div>
              <div class="device-details">
                <h3>{{ pairingConfig.nodeAlias }}</h3>
                <p>{{ selectedDeviceType ? t(selectedDeviceType.labelKey) : t('matter.otherDevice') }}</p>
              </div>
            </div>
          </div>
          
          <!-- Connection Type Selection -->
          <div class="connection-config">
            <h3>{{ t('matter.connectionConfiguration') }}</h3>
            <div class="connection-type-selector">
              <label class="radio-option">
                <input 
                  type="radio" 
                  value="wifi" 
                  v-model="pairingConfig.connectionType"
                  name="connectionType"
                />
                <span class="radio-label">
                  <span class="material-icons">wifi</span>
                  {{ t('matter.wifiConnection') }}
                </span>
              </label>
              <label class="radio-option">
                <input 
                  type="radio" 
                  value="thread" 
                  v-model="pairingConfig.connectionType"
                  name="connectionType"
                />
                <span class="radio-label">
                  <span class="material-icons">hub</span>
                  {{ t('matter.threadNetwork') }}
                </span>
              </label>
            </div>
          </div>
          
          <!-- WiFi Configuration -->
          <div v-if="pairingConfig.connectionType === 'wifi'" class="wifi-config">
            <div class="form-group">
              <label>{{ t('matter.wifiNetworkSSID') }}</label>
              <input 
                type="text" 
                v-model="pairingConfig.ssid"
                :placeholder="t('matter.wifiNetworkPlaceholder')"
                required
              />
            </div>
            <div class="form-group">
              <label>{{ t('matter.password') }}</label>
              <input 
                type="password" 
                v-model="pairingConfig.password"
                :placeholder="t('matter.wifiPasswordPlaceholder')"
                required
              />
            </div>
          </div>
          
          <!-- Thread Configuration -->
          <div v-if="pairingConfig.connectionType === 'thread'" class="thread-config">
            <div class="form-group">
              <label>{{ t('matter.threadDataset') }}</label>
              <input 
                type="text" 
                v-model="pairingConfig.dataset"
                :placeholder="t('matter.threadDatasetPlaceholder')"
                required
              />
              <button 
                type="button" 
                class="btn btn-secondary get-dataset-btn"
                @click="getDataset"
                :disabled="isProcessing"
              >
                <span class="material-icons" v-if="isProcessing">sync</span>
                {{ isProcessing ? t('matter.gettingDataset') : t('matter.getDataset') }}
              </button>
            </div>
          </div>
          
          <!-- Error Display -->
          <div v-if="error" class="error-message">
            <span class="material-icons">error</span>
            {{ error }}
          </div>
          
          <!-- Navigation Buttons -->
          <div class="step-navigation">
            <button class="btn btn-secondary" @click="currentStep = 'configure'">
              <span class="material-icons">arrow_back</span>
              {{ t('matter.back') }}
            </button>
            <button 
              class="btn btn-primary pairing-btn" 
              @click="startPairing"
              :disabled="!canStartPairing || !isNodeAliasValid || isProcessing"
            >
              <span class="material-icons" v-if="isProcessing">sync</span>
              <span class="material-icons" v-else>link</span>
              {{ isProcessing ? t('matter.pairing') : t('matter.startPairing') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Scan Result (only show in scan step when there's a result) -->
      <div v-if="currentStep === 'scan' && (scanResult || error)" class="panel-section">
        <div class="section-title">{{ t('matter.scanResult') }}</div>
        <div class="card-content">
          <div v-if="error && !scanResult" class="error-message">
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
            <div class="result-content">{{ scanResult }}</div>
            
            <!-- Quick action to proceed -->
            <div class="quick-action">
              <button class="btn btn-primary" @click="parseQRCode(scanResult); currentStep = 'configure'">
                <span class="material-icons">settings</span>
                {{ t('matter.configureThisDevice') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Scan History (only show in scan step) -->
      <div v-if="currentStep === 'scan' && scanHistory.length > 0" class="panel-section">
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
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: white;
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
  transition: all 0.3s ease;
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

.step-line {
  flex: 1;
  height: 2px;
  background-color: #e0e0e0;
  margin: 0 1rem;
  transition: background-color 0.3s ease;
}

.step-line.active {
  background-color: var(--primary-color);
}

.qr-result-display {
  margin-bottom: 2rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.qr-result-display .result-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.qr-result-display .result-content {
  padding: 1rem;
  background-color: white;
  word-break: break-all;
  font-family: monospace;
  font-size: 0.9rem;
  line-height: 1.4;
}

.device-type-section {
  margin-bottom: 2rem;
}

.device-type-section h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.device-type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.device-type-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: white;
}

.device-type-card:hover {
  border-color: var(--primary-color);
  background-color: rgba(0, 112, 187, 0.05);
}

.device-type-card.selected {
  border-color: var(--primary-color);
  background-color: rgba(0, 112, 187, 0.1);
}

.device-icon {
  color: var(--primary-color);
}

.device-icon .material-icons {
  font-size: 2rem;
}

.device-label {
  font-size: 0.9rem;
  color: var(--text-primary);
  text-align: center;
}

.device-info-section {
  margin-bottom: 2rem;
}

.device-info-section h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.device-type-hint {
  margin: 0 0 1rem 0;
  padding: 0.75rem;
  background-color: #e3f2fd;
  border-radius: 4px;
  color: #0070BB;
  font-size: 0.9rem;
}

.readonly-input {
  background-color: var(--bg-secondary) !important;
  cursor: not-allowed !important;
  color: var(--text-secondary) !important;
}

.validation-error {
  color: #f44336;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.node-id-hint {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.alias-hint {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.form-group input.invalid {
  border-color: #f44336;
  background-color: #ffebee;
}

.device-summary {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: var(--bg-secondary);
  border-radius: 8px;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.device-icon-large {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.device-icon-large .material-icons {
  font-size: 2rem;
}

.device-details h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.device-details p {
  margin: 0;
  color: var(--text-secondary);
}

.node-id {
  font-family: monospace;
  font-size: 0.9rem;
}

.connection-config {
  margin-bottom: 2rem;
}

.connection-config h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.connection-type-selector {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.radio-option:hover {
  border-color: var(--primary-color);
  background-color: rgba(0, 112, 187, 0.05);
}

.radio-option input[type="radio"]:checked + .radio-label {
  color: var(--primary-color);
  font-weight: 500;
}

.radio-option input[type="radio"] {
  width: auto;
  margin: 0;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  color: var(--text-primary);
}

.wifi-config, .thread-config {
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: var(--bg-secondary);
  border-radius: 8px;
}

.get-dataset-btn {
  margin-top: 0.5rem;
  width: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.step-navigation {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.pairing-btn {
  background-color: #4caf50;
}

.pairing-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.quick-action {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  text-align: center;
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

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
}

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
  position: relative;
  width: 100%;
  min-height: 400px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  background-color: #000;
}

.qr-reader {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.qr-reader-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  z-index: 1;
}

.qr-reader-placeholder .material-icons {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
}

.qr-reader-placeholder p {
  margin: 0;
  font-size: 1.1rem;
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

.debug-info {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9rem;
  display: none;
}

.debug-info p {
  margin: 0.25rem 0;
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

/* Override html5-qrcode styles */
:deep(#qr-reader) {
  width: 100% !important;
  height: 100% !important;
  min-height: 400px !important;
  border: none !important;
}

:deep(#qr-reader > div) {
  width: 100% !important;
  height: 100% !important;
}

:deep(#qr-reader__scan_region) {
  width: 100% !important;
  height: 100% !important;
  border: none !important;
}

:deep(#qr-reader__scan_region > img, #qr-reader__scan_region > video) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
}

:deep(#qr-reader__dashboard_section) {
  background-color: rgba(0, 0, 0, 0.8) !important;
  color: white !important;
  padding: 1rem !important;
  margin: 0 !important;
  width: 100% !important;
}

:deep(#qr-reader__dashboard_section_csr) {
  text-align: center !important;
  padding: 0.5rem !important;
}

:deep(#qr-reader__dashboard_section_csr > div) {
  color: white !important;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .step-indicator {
    flex-direction: column;
    gap: 1rem;
  }
  
  .step-line {
    width: 2px;
    height: 20px;
    margin: 0;
  }
  
  .device-type-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .summary-header {
    flex-direction: column;
    text-align: center;
  }
  
  .step-navigation {
    flex-direction: column;
  }
  
  .step-navigation .btn {
    width: 100%;
    justify-content: center;
  }

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

  .qr-reader-container {
    min-height: 300px;
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