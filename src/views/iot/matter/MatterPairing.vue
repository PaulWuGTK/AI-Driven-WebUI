<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';

const { t } = useI18n();

// Form data
const nodeId = ref('1');
const nodeAlias = ref('Light1');
const pinCode = ref('20202021');
const discriminator = ref('3840');
const ssId = ref('');
const password = ref('');
const dataset = ref('');

// UI state
const loading = ref(false);
const result = ref<string | null>(null);
const error = ref<string | null>(null);
const pairingType = ref('onnetwork');

// Pairing types
const pairingTypes = [
  { value: 'onnetwork', label: 'ONNETWORK' },
  { value: 'ble-wifi', label: 'BLE-WIFI' },
  { value: 'ble-thread', label: 'BLE-THREAD' }
];

// API endpoint for Matter proxy
const API_ENDPOINT = '/API/info?list=matterProxy';

// Handle pairing
const handlePairing = async () => {
  loading.value = true;
  error.value = null;
  result.value = null;

  try {
    let requestData: Record<string, any> = {
      nodeId: nodeId.value,
      nodeAlias: nodeAlias.value,
      pinCode: pinCode.value,
      type: pairingType.value
    };

    // Add additional fields based on pairing type
    if (pairingType.value === 'ble-wifi') {
      requestData.ssId = ssId.value;
      requestData.password = password.value;
      requestData.discriminator = discriminator.value;
    } else if (pairingType.value === 'ble-thread') {
      requestData.dataset = dataset.value;
      requestData.discriminator = discriminator.value;
    }

    const response = await axios.post(API_ENDPOINT, {MatterProxy:{
      method: "POST",
      action: "pairing",
      data: requestData
    }});
    
    result.value = JSON.stringify(response.data, null, 2);
  } catch (err) {
    console.error('Error during pairing:', err);
    error.value = err instanceof Error ? err.message : 'An error occurred during pairing';
  } finally {
    loading.value = false;
  }
};

// Get Thread dataset
const getDataset = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await axios.post(API_ENDPOINT, {MatterProxy:{
      method: "GET",
      action: "get_dataset",
      data: {}
    }});
    
    if (response.data.result === 'failed') {
      error.value = response.data.message || 'Failed to get dataset';
    } else {
      dataset.value = response.data.dataset || '';
    }
  } catch (err) {
    console.error('Error getting dataset:', err);
    error.value = err instanceof Error ? err.message : 'An error occurred while getting dataset';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">{{ t('matter.title') }} {{ t('matter.pairingTitle') }}</h1>
    
    <div class="status-content">
      <div class="panel-section">
        <div class="card-content">
          <div class="form-container">
            <!-- Pairing Type Selection -->
            <div class="form-group">
              <label>Please choose the pairing type:</label>
              <select v-model="pairingType" class="form-control">
                <option v-for="type in pairingTypes" :key="type.value" :value="type.value">
                  {{ type.label }}
                </option>
              </select>
            </div>

            <h3 class="section-title">{{ pairingTypes.find(t => t.value === pairingType)?.label }}</h3>

            <!-- Common Fields -->
            <div class="form-row">
              <div class="form-group half-width">
                <label for="nodeId">Node ID</label>
                <input 
                  type="text" 
                  id="nodeId" 
                  v-model="nodeId" 
                  class="form-control"
                  required
                />
              </div>

              <div class="form-group half-width">
                <label for="nodeAlias">Node Alias</label>
                <input 
                  type="text" 
                  id="nodeAlias" 
                  v-model="nodeAlias" 
                  class="form-control"
                  required
                />
              </div>
            </div>

            <!-- BLE-WIFI Fields -->
            <div v-if="pairingType === 'ble-wifi'" class="form-row">
              <div class="form-group half-width">
                <label for="ssId">SSID</label>
                <input 
                  type="text" 
                  id="ssId" 
                  v-model="ssId" 
                  class="form-control"
                  required
                />
              </div>

              <div class="form-group half-width">
                <label for="password">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  v-model="password" 
                  class="form-control"
                  required
                />
              </div>
            </div>

            <!-- Pin Code Field -->
            <div class="form-row">
              <div class="form-group" :class="pairingType === 'ble-wifi' || pairingType === 'ble-thread' ? 'half-width' : 'full-width'">
                <label for="pinCode">Pin Code</label>
                <input 
                  type="text" 
                  id="pinCode" 
                  v-model="pinCode" 
                  class="form-control"
                  required
                />
              </div>

              <!-- Discriminator Field for BLE-WIFI and BLE-THREAD -->
              <div v-if="pairingType === 'ble-wifi' || pairingType === 'ble-thread'" class="form-group half-width">
                <label for="discriminator">Discriminator</label>
                <input 
                  type="text" 
                  id="discriminator" 
                  v-model="discriminator" 
                  class="form-control"
                  required
                />
              </div>
            </div>

            <!-- Dataset Field for BLE-THREAD -->
            <div v-if="pairingType === 'ble-thread'" class="form-group">
              <label for="dataset">Dataset</label>
              <input 
                type="text" 
                id="dataset" 
                v-model="dataset" 
                class="form-control"
                required
              />
            </div>

            <!-- Action Buttons -->
            <div class="button-group">
              <button 
                v-if="pairingType === 'ble-thread'"
                class="btn btn-secondary" 
                @click="getDataset"
                :disabled="loading"
              >
                GET-DATASET
              </button>
              <button 
                class="btn btn-primary" 
                @click="handlePairing"
                :disabled="loading"
              >
                {{ pairingTypes.find(t => t.value === pairingType)?.label }}
              </button>
            </div>

            <!-- Loading Indicator -->
            <div v-if="loading" class="loading-indicator">
              <div class="spinner"></div>
              <span>Processing...</span>
            </div>

            <!-- Error Message -->
            <div v-if="error" class="error-message">
              {{ error }}
            </div>

            <!-- Result Display -->
            <div v-if="result" class="result-container">
              <h4>Result:</h4>
              <pre>{{ result }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-container {
  max-width: 800px;
  margin: 0 auto;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
  width: 100%;
}

.half-width {
  width: 50%;
}

.full-width {
  width: 100%;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
}

select.form-control {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
  padding-right: 2.5rem;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
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
  background-color: #f0f0f0;
  color: var(--text-primary);
}

.section-title {
  margin: 1.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--primary-color);
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #ffebee;
  color: #d32f2f;
  border-radius: 4px;
}

.result-container {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 4px;
}

pre {
  white-space: pre-wrap;
  word-break: break-word;
  background-color: #f8f8f8;
  padding: 1rem;
  border-radius: 4px;
  overflow: auto;
  max-height: 300px;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .half-width {
    width: 100%;
  }

  .button-group {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>