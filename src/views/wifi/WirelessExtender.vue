<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ExtenderResponse, ExtenderNeighbor, ExtenderConnectRequest } from '../../types/extender';
import { getExtenderStatus, updateExtenderSettings, scanNeighborAPs, connectToAP, triggerWPS } from '../../services/api/extender';

const { t } = useI18n();
const extenderData = ref<ExtenderResponse | null>(null);
const scanResults = ref<ExtenderNeighbor[]>([]);
const loading = ref(false);
const scanning = ref(false);
const error = ref<string | null>(null);
const showConnectModal = ref(false);
const selectedAP = ref<ExtenderNeighbor | null>(null);
const password = ref('');
const showSuccess = ref(false);
const successMessage = ref('');

// Computed properties
const isExtenderEnabled = computed(() => 
  extenderData.value?.Extender.ExtenderEnabled.Enabled === 1
);

const extenderRole = computed(() => 
  extenderData.value?.Extender.ExtenderRole.Role || 'Repeater'
);

const wpsPinCode = computed(() => 
  extenderData.value?.Extender.Wps.WpsPinCode || ''
);

const connectionStatus = computed(() => 
  extenderData.value?.Extender.ConnectionStatus || null
);

// Fetch extender status
const fetchExtenderStatus = async () => {
  loading.value = true;
  error.value = null;
  try {
    extenderData.value = await getExtenderStatus();
  } catch (err) {
    console.error('Error fetching extender status:', err);
    error.value = 'Failed to fetch extender status';
  } finally {
    loading.value = false;
  }
};

// Toggle extender enabled state
const toggleExtenderEnabled = async () => {
  if (!extenderData.value) return;
  
  loading.value = true;
  try {
    const newState = extenderData.value.Extender.ExtenderEnabled.Enabled === 1 ? 0 : 1;
    await updateExtenderSettings({
      Extender: {
        Action: 'ExtenderEnable',
        Enabled: newState,
        Role: extenderRole.value
      }
    });
    await fetchExtenderStatus();
    showSuccessNotification(newState === 1 ? 'Extender enabled successfully' : 'Extender disabled successfully');
  } catch (err) {
    console.error('Error toggling extender state:', err);
    error.value = 'Failed to update extender state';
  } finally {
    loading.value = false;
  }
};

// Update extender role
const updateRole = async (event: Event) => {
  const role = (event.target as HTMLSelectElement).value as "MeshAgent" | "Repeater";
  
  loading.value = true;
  try {
    await updateExtenderSettings({
      Extender: {
        Action: 'ExtenderEnable',
        Enabled: isExtenderEnabled.value ? 1 : 0,
        Role: role
      }
    });
    await fetchExtenderStatus();
    showSuccessNotification('Extender role updated successfully');
  } catch (err) {
    console.error('Error updating extender role:', err);
    error.value = 'Failed to update extender role';
  } finally {
    loading.value = false;
  }
};

// Scan for neighbor APs
const handleScan = async () => {
  scanning.value = true;
  error.value = null;
  try {
    const response = await scanNeighborAPs();
    scanResults.value = response.Extender;
  } catch (err) {
    console.error('Error scanning for neighbor APs:', err);
    error.value = 'Failed to scan for neighbor APs';
  } finally {
    scanning.value = false;
  }
};

// Trigger WPS pairing
const handleWPSPairing = async () => {
  loading.value = true;
  error.value = null;
  try {
    await triggerWPS();
    showSuccessNotification('WPS pairing initiated');
  } catch (err) {
    console.error('Error triggering WPS pairing:', err);
    error.value = 'Failed to trigger WPS pairing';
  } finally {
    loading.value = false;
  }
};

// Open connect modal for a specific AP
const openConnectModal = (ap: ExtenderNeighbor) => {
  selectedAP.value = ap;
  password.value = '';
  showConnectModal.value = true;
};

// Close connect modal
const closeConnectModal = () => {
  showConnectModal.value = false;
  selectedAP.value = null;
  password.value = '';
};

// Connect to selected AP
const handleConnect = async () => {
  if (!selectedAP.value) return;
  
  loading.value = true;
  error.value = null;
  try {
    const connectRequest: ExtenderConnectRequest = {
      Extender: {
        Action: 'connect',
        Band: selectedAP.value.Band,
        SSID: selectedAP.value.SSID,
        Security: selectedAP.value.Security,
        Password: password.value
      }
    };
    
    await connectToAP(connectRequest);
    closeConnectModal();
    await fetchExtenderStatus();
    showSuccessNotification(`Connected to ${selectedAP.value.SSID} successfully`);
  } catch (err) {
    console.error('Error connecting to AP:', err);
    error.value = 'Failed to connect to AP';
  } finally {
    loading.value = false;
  }
};

// Show success notification
const showSuccessNotification = (message: string) => {
  successMessage.value = message;
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
  }, 3000);
};

// Get status class based on connection status
const getStatusClass = (status: string) => {
  return status === 'connected' ? 'status-connected' : 'status-disconnected';
};

onMounted(() => {
  fetchExtenderStatus();
});
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">{{ t('wirelessExtender.title') }}</h1>

    <div class="status-content">
      <div v-if="loading && !extenderData" class="loading-state">
        <div class="loading-spinner"></div>
        <span>{{ t('common.loading') }}</span>
      </div>

      <div v-else-if="error" class="error-state">
        {{ error }}
      </div>

      <template v-else-if="extenderData">
        <!-- Extender Configuration Section -->
        <div class="panel-section">
          <div class="section-title">{{ t('wirelessExtender.configuration') }}</div>
          
          <div class="card-content">
            <div class="form-group">
              <div class="switch-label">
                <span>{{ t('wirelessExtender.enabled') }}</span>
                <label class="switch">
                  <input
                    type="checkbox"
                    :checked="isExtenderEnabled"
                    @change="toggleExtenderEnabled"
                  >
                  <span class="slider"></span>
                </label>
              </div>
            </div>

            <div v-if="isExtenderEnabled" class="form-group">
              <label>{{ t('wirelessExtender.role') }}</label>
              <select 
                :value="extenderRole"
                @change="updateRole"
                class="role-select"
              >
                <option value="Repeater">{{ t('wirelessExtender.repeater') }}</option>
                <option value="MeshAgent">{{ t('wirelessExtender.meshAgent') }}</option>
              </select>
            </div>
          </div>
        </div>

        <template v-if="isExtenderEnabled">
          <!-- Connection Status Section -->
          <div class="panel-section">
            <div class="section-title">{{ t('wirelessExtender.connectionStatus') }}</div>
            
            <div class="card-content">
              <div class="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>{{ t('wirelessExtender.band') }}</th>
                      <th>{{ t('wirelessExtender.status') }}</th>
                      <th>{{ t('wirelessExtender.ssid') }}</th>
                      <th>{{ t('wirelessExtender.security') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="connectionStatus">
                      <td>2.4 GHz</td>
                      <td>
                        <span :class="getStatusClass(connectionStatus['2.4GHz'].Status)">
                          {{ connectionStatus['2.4GHz'].Status === 'connected' ? 
                            t('wirelessExtender.connected') : t('wirelessExtender.disconnected') }}
                        </span>
                      </td>
                      <td>{{ connectionStatus['2.4GHz'].SSID }}</td>
                      <td>{{ connectionStatus['2.4GHz'].Security }}</td>
                    </tr>
                    <tr v-if="connectionStatus">
                      <td>5 GHz</td>
                      <td>
                        <span :class="getStatusClass(connectionStatus['5GHz'].Status)">
                          {{ connectionStatus['5GHz'].Status === 'connected' ? 
                            t('wirelessExtender.connected') : t('wirelessExtender.disconnected') }}
                        </span>
                      </td>
                      <td>{{ connectionStatus['5GHz'].SSID }}</td>
                      <td>{{ connectionStatus['5GHz'].Security }}</td>
                    </tr>
                    <tr v-if="connectionStatus">
                      <td>6 GHz</td>
                      <td>
                        <span :class="getStatusClass(connectionStatus['6GHz'].Status)">
                          {{ connectionStatus['6GHz'].Status === 'connected' ? 
                            t('wirelessExtender.connected') : t('wirelessExtender.disconnected') }}
                        </span>
                      </td>
                      <td>{{ connectionStatus['6GHz'].SSID }}</td>
                      <td>{{ connectionStatus['6GHz'].Security }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="mobile-cards">
                <div class="table-card" v-if="connectionStatus">
                  <div class="card-row">
                    <span class="card-label">{{ t('wirelessExtender.band') }}</span>
                    <span class="card-value">2.4 GHz</span>
                  </div>
                  <div class="card-row">
                    <span class="card-label">{{ t('wirelessExtender.status') }}</span>
                    <span class="card-value" :class="getStatusClass(connectionStatus['2.4GHz'].Status)">
                      {{ connectionStatus['2.4GHz'].Status === 'connected' ? 
                        t('wirelessExtender.connected') : t('wirelessExtender.disconnected') }}
                    </span>
                  </div>
                  <div class="card-row">
                    <span class="card-label">{{ t('wirelessExtender.ssid') }}</span>
                    <span class="card-value">{{ connectionStatus['2.4GHz'].SSID }}</span>
                  </div>
                  <div class="card-row">
                    <span class="card-label">{{ t('wirelessExtender.security') }}</span>
                    <span class="card-value">{{ connectionStatus['2.4GHz'].Security }}</span>
                  </div>
                </div>

                <div class="table-card" v-if="connectionStatus">
                  <div class="card-row">
                    <span class="card-label">{{ t('wirelessExtender.band') }}</span>
                    <span class="card-value">5 GHz</span>
                  </div>
                  <div class="card-row">
                    <span class="card-label">{{ t('wirelessExtender.status') }}</span>
                    <span class="card-value" :class="getStatusClass(connectionStatus['5GHz'].Status)">
                      {{ connectionStatus['5GHz'].Status === 'connected' ? 
                        t('wirelessExtender.connected') : t('wirelessExtender.disconnected') }}
                    </span>
                  </div>
                  <div class="card-row">
                    <span class="card-label">{{ t('wirelessExtender.ssid') }}</span>
                    <span class="card-value">{{ connectionStatus['5GHz'].SSID }}</span>
                  </div>
                  <div class="card-row">
                    <span class="card-label">{{ t('wirelessExtender.security') }}</span>
                    <span class="card-value">{{ connectionStatus['5GHz'].Security }}</span>
                  </div>
                </div>

                <div class="table-card" v-if="connectionStatus">
                  <div class="card-row">
                    <span class="card-label">{{ t('wirelessExtender.band') }}</span>
                    <span class="card-value">6 GHz</span>
                  </div>
                  <div class="card-row">
                    <span class="card-label">{{ t('wirelessExtender.status') }}</span>
                    <span class="card-value" :class="getStatusClass(connectionStatus['6GHz'].Status)">
                      {{ connectionStatus['6GHz'].Status === 'connected' ? 
                        t('wirelessExtender.connected') : t('wirelessExtender.disconnected') }}
                    </span>
                  </div>
                  <div class="card-row">
                    <span class="card-label">{{ t('wirelessExtender.ssid') }}</span>
                    <span class="card-value">{{ connectionStatus['6GHz'].SSID }}</span>
                  </div>
                  <div class="card-row">
                    <span class="card-label">{{ t('wirelessExtender.security') }}</span>
                    <span class="card-value">{{ connectionStatus['6GHz'].Security }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- WPS Section -->
          <div class="panel-section">
            <div class="section-title">{{ t('wirelessExtender.wps') }}</div>
            
            <div class="card-content">
              <div class="wps-info">
                <div class="wps-pin">
                  <span class="pin-label">{{ t('wirelessExtender.pinCode') }}:</span>
                  <span class="pin-value">{{ wpsPinCode }}</span>
                </div>
                <button 
                  class="btn btn-primary wps-button"
                  @click="handleWPSPairing"
                  :disabled="loading"
                >
                  {{ t('wirelessExtender.pairing') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Neighbor AP Scan Section -->
          <div class="panel-section">
            <div class="section-title">{{ t('wirelessExtender.neighborScan') }}</div>
            
            <div class="card-content">
              <div class="scan-button-container">
                <button 
                  class="btn btn-primary"
                  @click="handleScan"
                  :disabled="scanning"
                >
                  {{ scanning ? t('wirelessExtender.scanning') : t('wirelessExtender.scan') }}
                </button>
              </div>

              <div v-if="scanResults.length > 0" class="scan-results">
                <div class="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>{{ t('wirelessExtender.ssid') }}</th>
                        <th>{{ t('wirelessExtender.band') }}</th>
                        <th>{{ t('wifiNeighbor.channel') }}</th>
                        <th>{{ t('wifiNeighbor.signal') }}</th>
                        <th>{{ t('wirelessExtender.security') }}</th>
                        <th>{{ t('wirelessExtender.select') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(ap, index) in scanResults" :key="index">
                        <td>{{ ap.SSID }}</td>
                        <td>{{ ap.Band }}</td>
                        <td>{{ ap.Channel }}</td>
                        <td>{{ ap.Signal }}</td>
                        <td>{{ ap.Security }}</td>
                        <td>
                          <button 
                            class="btn btn-select"
                            @click="openConnectModal(ap)"
                          >
                            {{ t('wirelessExtender.select') }}
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="mobile-cards">
                  <div class="table-card" v-for="(ap, index) in scanResults" :key="index">
                    <div class="card-row">
                      <span class="card-label">{{ t('wirelessExtender.ssid') }}</span>
                      <span class="card-value">{{ ap.SSID }}</span>
                    </div>
                    <div class="card-row">
                      <span class="card-label">{{ t('wirelessExtender.band') }}</span>
                      <span class="card-value">{{ ap.Band }}</span>
                    </div>
                    <div class="card-row">
                      <span class="card-label">{{ t('wifiNeighbor.channel') }}</span>
                      <span class="card-value">{{ ap.Channel }}</span>
                    </div>
                    <div class="card-row">
                      <span class="card-label">{{ t('wifiNeighbor.signal') }}</span>
                      <span class="card-value">{{ ap.Signal }}</span>
                    </div>
                    <div class="card-row">
                      <span class="card-label">{{ t('wirelessExtender.security') }}</span>
                      <span class="card-value">{{ ap.Security }}</span>
                    </div>
                    <div class="card-actions">
                      <button 
                        class="btn btn-primary"
                        @click="openConnectModal(ap)"
                      >
                        {{ t('wirelessExtender.select') }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Connect to AP Modal -->
          <div v-if="showConnectModal && selectedAP" class="modal-overlay">
            <div class="modal-content">
              <div class="modal-header">
                <h3>{{ t('wirelessExtender.connectToAP') }}</h3>
                <button class="close-button" @click="closeConnectModal">&times;</button>
              </div>
              
              <div class="modal-body">
                <div class="form-group">
                  <label>{{ t('wirelessExtender.radioBand') }}</label>
                  <div class="info-value">{{ selectedAP.Band }}</div>
                </div>
                
                <div class="form-group">
                  <label>{{ t('wirelessExtender.ssid') }}</label>
                  <div class="info-value">{{ selectedAP.SSID }}</div>
                </div>
                
                <div class="form-group">
                  <label>{{ t('wirelessExtender.wifiMode') }}</label>
                  <div class="info-value">{{ selectedAP.Band === '2.4GHz' ? '11NG' : selectedAP.Band === '5GHz' ? '11AC' : '11AX' }}</div>
                </div>
                
                <div class="form-group">
                  <label>{{ t('wirelessExtender.security') }}</label>
                  <div class="info-value">{{ selectedAP.Security }}</div>
                </div>
                
                <div class="form-group">
                  <label>{{ t('wirelessExtender.wpaPreshareKey') }}</label>
                  <input 
                    type="password" 
                    v-model="password"
                    :placeholder="t('ntp.placeholder')"
                    required
                  />
                </div>
              </div>
              
              <div class="modal-footer">
                <button class="btn btn-secondary" @click="closeConnectModal">
                  {{ t('common.cancel') }}
                </button>
                <button 
                  class="btn btn-primary" 
                  @click="handleConnect"
                  :disabled="!password || loading"
                >
                  {{ t('wirelessExtender.connect') }}
                </button>
              </div>
            </div>
          </div>
        </template>
      </template>

      <!-- Success notification -->
      <div v-if="showSuccess" class="success-message">
        {{ successMessage }}
      </div>
    </div>
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

.role-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}

.status-connected {
  color: #4caf50;
  font-weight: 500;
}

.status-disconnected {
  color: #dc3545;
  font-weight: 500;
}

.wps-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.wps-pin {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pin-label {
  color: var(--text-secondary);
}

.pin-value {
  font-family: monospace;
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-primary);
}

.wps-button {
  padding: 0.5rem 1.5rem;
}

.scan-button-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.scan-results {
  margin-top: 1.5rem;
}

.btn-select {
  padding: 0.25rem 0.75rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-select:hover {
  opacity: 0.9;
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
  border-radius: 4px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
}

.modal-body {
  padding: 1.5rem;
}

.info-value {
  padding: 0.5rem;
  background-color: var(--bg-secondary);
  border-radius: 4px;
  color: var(--text-primary);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid var(--border-color);
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}

.success-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #4caf50;
  color: white;
  padding: 1rem 2rem;
  border-radius: 4px;
  animation: fadeInOut 3s ease-in-out;
  z-index: 100;
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

.error-state {
  padding: 2rem;
  text-align: center;
  color: #dc3545;
  background-color: white;
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
}

@media (max-width: 768px) {
  .wps-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .wps-button {
    width: 100%;
  }

  .scan-button-container .btn {
    width: 100%;
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-footer .btn {
    width: 100%;
  }
}
</style>