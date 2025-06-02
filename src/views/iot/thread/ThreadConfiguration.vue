<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { 
  ThreadConfigurationResponse, 
  ThreadConfigurationUpdateRequest,
  ThreadDatasetConfig,
  ThreadSecurityPolicy
} from '../../../types/thread';
import { getThreadConfiguration, updateThreadConfiguration } from '../../../services/api/thread';

const { t } = useI18n();
const threadConfig = ref<ThreadConfigurationResponse | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const showSuccess = ref(false);
const successMessage = ref('');

// UI state
const threadEnabled = ref(false);
const tempThreadEnabled = ref(false); // Temporary state for enable toggle
const activeDataset = ref<ThreadDatasetConfig | null>(null);
const pendingDataset = ref<ThreadDatasetConfig | null>(null);
const showActiveNetworkKey = ref(false);
const showPendingNetworkKey = ref(false);
const showActivePSKc = ref(false);
const showPendingPSKc = ref(false);
const activeMode = ref<'Auto' | 'Manual'>('Auto');
const pendingMode = ref<'Auto' | 'Manual'>('Manual');

// Default dataset configuration
const defaultDatasetConfig: ThreadDatasetConfig = {
  'Active Timestamp': 1,
  NetworkName: '',
  NetworkKey: '',
  Channel: 1,
  ChannelMask: 0,
  PanId: '',
  ExtPanId: '',
  MeshLocalPrefix: '',
  PSKc: '',
  SecurityPolicy: {
    AutonomousEnrollment: false,
    CommercialCommissioning: false,
    ExternalCommissioning: false,
    NativeCommissioning: false,
    NetworkKeyProvisioning: false,
    NonCcmRouters: false,
    ObtainNetworkKey: false,
    RotationTime: 0,
    Routers: false,
    TobleLink: false
  }
};

const defaultPendingDatasetConfig: ThreadDatasetConfig = {
  ...defaultDatasetConfig,
  'Pending Timestamp': 1,
  Delay: 30000,
  'Active Timestamp': 2,
};

// Fetch thread configuration
const fetchThreadConfiguration = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getThreadConfiguration();
    threadConfig.value = response;
    threadEnabled.value = response.ThreadConfiguration.Enable;
    tempThreadEnabled.value = response.ThreadConfiguration.Enable; // Initialize temp state
    
    // Handle case where ActiveDataset or PendingDataset are empty arrays
    if (Array.isArray(response.ThreadConfiguration.ActiveDataset) && 
        response.ThreadConfiguration.ActiveDataset.length === 0) {
      activeDataset.value = { ...defaultDatasetConfig };
    } else {
      activeDataset.value = { ...response.ThreadConfiguration.ActiveDataset };
    }
    
    if (Array.isArray(response.ThreadConfiguration.PendingDataset) && 
        response.ThreadConfiguration.PendingDataset.length === 0) {
      pendingDataset.value = { ...defaultPendingDatasetConfig };
    } else {
      pendingDataset.value = { ...response.ThreadConfiguration.PendingDataset };
    }
  } catch (err) {
    console.error('Error fetching Thread configuration:', err);
    error.value = 'Failed to fetch Thread configuration';
  } finally {
    loading.value = false;
  }
};

// Generate a random dataset
const generateDataset = async (type: 'Active' | 'Pending') => {
  loading.value = true;
  error.value = null;
  try {
    const request: ThreadConfigurationUpdateRequest = {
      ThreadConfiguration: {
        Enable: threadEnabled.value,
        Type: type,
        Mode: 'Auto'
      }
    };
    
    await updateThreadConfiguration(request);
    await fetchThreadConfiguration();
    showSuccessNotification(`${type} dataset generated successfully`);
  } catch (err) {
    console.error(`Error generating ${type} dataset:`, err);
    error.value = `Failed to generate ${type} dataset`;
  } finally {
    loading.value = false;
  }
};

// Update active dataset
const updateActiveDataset = async () => {
  if (!activeDataset.value) return;
  
  loading.value = true;
  error.value = null;
  try {
    const request: ThreadConfigurationUpdateRequest = {
      ThreadConfiguration: {
        Enable: threadEnabled.value,
        Type: 'Active',
        Mode: 'Manual',
        Dataset: activeDataset.value
      }
    };
    
    await updateThreadConfiguration(request);
    await fetchThreadConfiguration();
    showSuccessNotification('Active dataset updated successfully');
  } catch (err) {
    console.error('Error updating active dataset:', err);
    error.value = 'Failed to update active dataset';
  } finally {
    loading.value = false;
  }
};

// Update pending dataset
const updatePendingDataset = async () => {
  if (!pendingDataset.value) return;
  
  loading.value = true;
  error.value = null;
  try {
    const request: ThreadConfigurationUpdateRequest = {
      ThreadConfiguration: {
        Enable: threadEnabled.value,
        Type: 'Pending',
        Mode: 'Manual',
        Dataset: pendingDataset.value
      }
    };
    
    await updateThreadConfiguration(request);
    await fetchThreadConfiguration();
    showSuccessNotification('Pending dataset updated successfully');
  } catch (err) {
    console.error('Error updating pending dataset:', err);
    error.value = 'Failed to update pending dataset';
  } finally {
    loading.value = false;
  }
};

// Update thread enabled state
const updateThreadEnabled = async () => {
  loading.value = true;
  error.value = null;
  try {
    const request: ThreadConfigurationUpdateRequest = {
      ThreadConfiguration: {
        Enable: tempThreadEnabled.value
      }
    };
    
    await updateThreadConfiguration(request);
    await fetchThreadConfiguration();
    showSuccessNotification(`Thread ${tempThreadEnabled.value ? 'enabled' : 'disabled'} successfully`);
  } catch (err) {
    console.error('Error updating Thread enabled state:', err);
    error.value = 'Failed to update Thread enabled state';
  } finally {
    loading.value = false;
  }
};

// Cancel enable/disable changes
const cancelEnableChanges = () => {
  tempThreadEnabled.value = threadEnabled.value;
};

// Show success notification
const showSuccessNotification = (message: string) => {
  successMessage.value = message;
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
  }, 3000);
};

// Format security policy for display
const formatSecurityPolicy = (policy: ThreadSecurityPolicy | undefined) => {
  if (!policy) return '';
  
  const enabledOptions = [];
  if (policy.AutonomousEnrollment) enabledOptions.push('Autonomous Enrollment');
  if (policy.CommercialCommissioning) enabledOptions.push('Commercial Commissioning');
  if (policy.ExternalCommissioning) enabledOptions.push('External Commissioning');
  if (policy.NativeCommissioning) enabledOptions.push('Native Commissioning');
  if (policy.NetworkKeyProvisioning) enabledOptions.push('Network Key Provisioning');
  if (policy.NonCcmRouters) enabledOptions.push('Non CCM Routers');
  if (policy.ObtainNetworkKey) enabledOptions.push('Obtain Network Key');
  if (policy.Routers) enabledOptions.push('Routers');
  if (policy.TobleLink) enabledOptions.push('Toble Link');
  
  return `${policy.RotationTime} hours, ${enabledOptions.join(', ')}`;
};

onMounted(() => {
  fetchThreadConfiguration();
});
</script>

<template>
  <div class="thread-content">
    <div v-if="loading && !threadConfig" class="loading-state">
      <div class="loading-spinner"></div>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>

    <template v-else-if="threadConfig">
      <!-- Thread Enable Toggle -->
      <div class="panel-section">
        <div class="card-content">
          <div class="form-group">
            <div class="switch-label">
              <span>{{ t('common.enable') }}</span>
              <label class="switch">
                <input
                  type="checkbox"
                  v-model="tempThreadEnabled"
                >
                <span class="slider"></span>
              </label>
            </div>
          </div>
          
          <div class="button-group">
            <button type="button" class="btn btn-secondary" @click="cancelEnableChanges">
              {{ t('common.cancel') }}
            </button>
            <button type="button" class="btn btn-primary" @click="updateThreadEnabled">
              {{ t('common.apply') }}
            </button>
          </div>
        </div>
      </div>

      <template v-if="threadEnabled">
        <!-- Active Dataset Section -->
        <div class="panel-section">
          <div class="section-title">{{ t('thread.activeDataset') }}</div>
          
          <div class="card-content" v-if="activeDataset">
            <div class="dataset-header">
              <button class="btn btn-secondary" @click="generateDataset('Active')">
                <span class="material-icons">autorenew</span>
                {{ t('thread.generateDataset') }}
              </button>
            </div>

            <div class="form-group">
              <label>{{ t('thread.activeTimestamp') }}</label>
              <input 
                type="number" 
                v-model="activeDataset['Active Timestamp']" 
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label>{{ t('thread.networkName') }}</label>
              <input 
                type="text" 
                v-model="activeDataset.NetworkName" 
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label>{{ t('thread.networkKey') }}</label>
              <div class="password-input">
                <input 
                  :type="showActiveNetworkKey ? 'text' : 'password'" 
                  v-model="activeDataset.NetworkKey" 
                  class="form-control"
                />
                <button 
                  type="button" 
                  class="toggle-password"
                  @click="showActiveNetworkKey = !showActiveNetworkKey"
                >
                  <span class="material-icons">
                    {{ showActiveNetworkKey ? 'visibility_off' : 'visibility' }}
                  </span>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>{{ t('thread.channel') }}</label>
              <input 
                type="number" 
                v-model="activeDataset.Channel" 
                class="form-control"
                min="11"
                max="26"
              />
            </div>

            <div class="form-group">
              <label>{{ t('thread.channelMask') }}</label>
              <input 
                type="number" 
                v-model="activeDataset.ChannelMask" 
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label>{{ t('thread.panId') }}</label>
              <input 
                type="text" 
                v-model="activeDataset.PanId" 
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label>{{ t('thread.extendedPanId') }}</label>
              <input 
                type="text" 
                v-model="activeDataset.ExtPanId" 
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label>{{ t('thread.meshLocalPrefix') }}</label>
              <input 
                type="text" 
                v-model="activeDataset.MeshLocalPrefix" 
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label>{{ t('thread.pskc') }}</label>
              <div class="password-input">
                <input 
                  :type="showActivePSKc ? 'text' : 'password'" 
                  v-model="activeDataset.PSKc" 
                  class="form-control"
                />
                <button 
                  type="button" 
                  class="toggle-password"
                  @click="showActivePSKc = !showActivePSKc"
                >
                  <span class="material-icons">
                    {{ showActivePSKc ? 'visibility_off' : 'visibility' }}
                  </span>
                </button>
              </div>
            </div>

            <!-- Security Policy Section -->
            <div class="security-policy-section">
              <label>{{ t('thread.securityPolicy') }}</label>
              
              <div class="security-policy-grid">
                <div class="form-group">
                  <label>{{ t('thread.rotationTime') }}</label>
                  <input 
                    type="number" 
                    v-model="activeDataset.SecurityPolicy.RotationTime" 
                    class="form-control"
                  />
                </div>
                
                <div class="checkbox-group">
                  <div class="form-check">
                    <input 
                      type="checkbox" 
                      id="active-autonomous-enrollment" 
                      v-model="activeDataset.SecurityPolicy.AutonomousEnrollment"
                    />
                    <label for="active-autonomous-enrollment">
                      {{ t('thread.autonomousEnrollment') }}
                    </label>
                  </div>
                  
                  <div class="form-check">
                    <input 
                      type="checkbox" 
                      id="active-commercial-commissioning" 
                      v-model="activeDataset.SecurityPolicy.CommercialCommissioning"
                    />
                    <label for="active-commercial-commissioning">
                      {{ t('thread.commercialCommissioning') }}
                    </label>
                  </div>
                  
                  <div class="form-check">
                    <input 
                      type="checkbox" 
                      id="active-external-commissioning" 
                      v-model="activeDataset.SecurityPolicy.ExternalCommissioning"
                    />
                    <label for="active-external-commissioning">
                      {{ t('thread.externalCommissioning') }}
                    </label>
                  </div>
                  
                  <div class="form-check">
                    <input 
                      type="checkbox" 
                      id="active-native-commissioning" 
                      v-model="activeDataset.SecurityPolicy.NativeCommissioning"
                    />
                    <label for="active-native-commissioning">
                      {{ t('thread.nativeCommissioning') }}
                    </label>
                  </div>
                  
                  <div class="form-check">
                    <input 
                      type="checkbox" 
                      id="active-network-key-provisioning" 
                      v-model="activeDataset.SecurityPolicy.NetworkKeyProvisioning"
                    />
                    <label for="active-network-key-provisioning">
                      {{ t('thread.networkKeyProvisioning') }}
                    </label>
                  </div>
                  
                  <div class="form-check">
                    <input 
                      type="checkbox" 
                      id="active-non-ccm-routers" 
                      v-model="activeDataset.SecurityPolicy.NonCcmRouters"
                    />
                    <label for="active-non-ccm-routers">
                      {{ t('thread.nonCcmRouters') }}
                    </label>
                  </div>
                  
                  <div class="form-check">
                    <input 
                      type="checkbox" 
                      id="active-obtain-network-key" 
                      v-model="activeDataset.SecurityPolicy.ObtainNetworkKey"
                    />
                    <label for="active-obtain-network-key">
                      {{ t('thread.obtainNetworkKey') }}
                    </label>
                  </div>
                  
                  <div class="form-check">
                    <input 
                      type="checkbox" 
                      id="active-routers" 
                      v-model="activeDataset.SecurityPolicy.Routers"
                    />
                    <label for="active-routers">
                      {{ t('thread.routers') }}
                    </label>
                  </div>
                  
                  <div class="form-check">
                    <input 
                      type="checkbox" 
                      id="active-toble-link" 
                      v-model="activeDataset.SecurityPolicy.TobleLink"
                    />
                    <label for="active-toble-link">
                      {{ t('thread.tobleLink') }}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div class="mode-section">
              <div class="mode-label">{{ t('common.manual') }}</div>
            </div>

            <div class="button-group">
              <button type="button" class="btn btn-secondary" @click="fetchThreadConfiguration">
                {{ t('common.cancel') }}
              </button>
              <button type="button" class="btn btn-primary" @click="updateActiveDataset">
                {{ t('thread.update') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Pending Dataset Section -->
        <div class="panel-section">
          <div class="section-title">{{ t('thread.pendingDataset') }}</div>
          
          <div class="card-content" v-if="pendingDataset">
            <div class="dataset-header">
              <button class="btn btn-secondary" @click="generateDataset('Pending')">
                <span class="material-icons">autorenew</span>
                {{ t('thread.generateDataset') }}
              </button>
            </div>

            <div class="form-group">
              <label>{{ t('thread.pendingTimestamp') }}</label>
              <input 
                type="number" 
                v-model="pendingDataset['Pending Timestamp']" 
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label>{{ t('thread.delay') }} (ms)</label>
              <input 
                type="number" 
                v-model="pendingDataset.Delay" 
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label>{{ t('thread.activeTimestamp') }}</label>
              <input 
                type="number" 
                v-model="pendingDataset['Active Timestamp']" 
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label>{{ t('thread.networkName') }}</label>
              <input 
                type="text" 
                v-model="pendingDataset.NetworkName" 
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label>{{ t('thread.networkKey') }}</label>
              <div class="password-input">
                <input 
                  :type="showPendingNetworkKey ? 'text' : 'password'" 
                  v-model="pendingDataset.NetworkKey" 
                  class="form-control"
                />
                <button 
                  type="button" 
                  class="toggle-password"
                  @click="showPendingNetworkKey = !showPendingNetworkKey"
                >
                  <span class="material-icons">
                    {{ showPendingNetworkKey ? 'visibility_off' : 'visibility' }}
                  </span>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>{{ t('thread.channel') }}</label>
              <input 
                type="number" 
                v-model="pendingDataset.Channel" 
                class="form-control"
                min="11"
                max="26"
              />
            </div>

            <div class="form-group">
              <label>{{ t('thread.channelMask') }}</label>
              <input 
                type="number" 
                v-model="pendingDataset.ChannelMask" 
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label>{{ t('thread.panId') }}</label>
              <input 
                type="text" 
                v-model="pendingDataset.PanId" 
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label>{{ t('thread.extendedPanId') }}</label>
              <input 
                type="text" 
                v-model="pendingDataset.ExtPanId" 
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label>{{ t('thread.meshLocalPrefix') }}</label>
              <input 
                type="text" 
                v-model="pendingDataset.MeshLocalPrefix" 
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label>{{ t('thread.pskc') }}</label>
              <div class="password-input">
                <input 
                  :type="showPendingPSKc ? 'text' : 'password'" 
                  v-model="pendingDataset.PSKc" 
                  class="form-control"
                />
                <button 
                  type="button" 
                  class="toggle-password"
                  @click="showPendingPSKc = !showPendingPSKc"
                >
                  <span class="material-icons">
                    {{ showPendingPSKc ? 'visibility_off' : 'visibility' }}
                  </span>
                </button>
              </div>
            </div>

            <!-- Security Policy Section -->
            <div class="security-policy-section">
              <label>{{ t('thread.securityPolicy') }}</label>
              
              <div class="security-policy-grid">
                <div class="form-group">
                  <label>{{ t('thread.rotationTime') }}</label>
                  <input 
                    type="number" 
                    v-model="pendingDataset.SecurityPolicy.RotationTime" 
                    class="form-control"
                  />
                </div>
                
                <div class="checkbox-group">
                  <div class="form-check">
                    <input 
                      type="checkbox" 
                      id="pending-autonomous-enrollment" 
                      v-model="pendingDataset.SecurityPolicy.AutonomousEnrollment"
                    />
                    <label for="pending-autonomous-enrollment">
                      {{ t('thread.autonomousEnrollment') }}
                    </label>
                  </div>
                  
                  <div class="form-check">
                    <input 
                      type="checkbox" 
                      id="pending-commercial-commissioning" 
                      v-model="pendingDataset.SecurityPolicy.CommercialCommissioning"
                    />
                    <label for="pending-commercial-commissioning">
                      {{ t('thread.commercialCommissioning') }}
                    </label>
                  </div>
                  
                  <div class="form-check">
                    <input 
                      type="checkbox" 
                      id="pending-external-commissioning" 
                      v-model="pendingDataset.SecurityPolicy.ExternalCommissioning"
                    />
                    <label for="pending-external-commissioning">
                      {{ t('thread.externalCommissioning') }}
                    </label>
                  </div>
                  
                  <div class="form-check">
                    <input 
                      type="checkbox" 
                      id="pending-native-commissioning" 
                      v-model="pendingDataset.SecurityPolicy.NativeCommissioning"
                    />
                    <label for="pending-native-commissioning">
                      {{ t('thread.nativeCommissioning') }}
                    </label>
                  </div>
                  
                  <div class="form-check">
                    <input 
                      type="checkbox" 
                      id="pending-network-key-provisioning" 
                      v-model="pendingDataset.SecurityPolicy.NetworkKeyProvisioning"
                    />
                    <label for="pending-network-key-provisioning">
                      {{ t('thread.networkKeyProvisioning') }}
                    </label>
                  </div>
                  
                  <div class="form-check">
                    <input 
                      type="checkbox" 
                      id="pending-non-ccm-routers" 
                      v-model="pendingDataset.SecurityPolicy.NonCcmRouters"
                    />
                    <label for="pending-non-ccm-routers">
                      {{ t('thread.nonCcmRouters') }}
                    </label>
                  </div>
                  
                  <div class="form-check">
                    <input 
                      type="checkbox" 
                      id="pending-obtain-network-key" 
                      v-model="pendingDataset.SecurityPolicy.ObtainNetworkKey"
                    />
                    <label for="pending-obtain-network-key">
                      {{ t('thread.obtainNetworkKey') }}
                    </label>
                  </div>
                  
                  <div class="form-check">
                    <input 
                      type="checkbox" 
                      id="pending-routers" 
                      v-model="pendingDataset.SecurityPolicy.Routers"
                    />
                    <label for="pending-routers">
                      {{ t('thread.routers') }}
                    </label>
                  </div>
                  
                  <div class="form-check">
                    <input 
                      type="checkbox" 
                      id="pending-toble-link" 
                      v-model="pendingDataset.SecurityPolicy.TobleLink"
                    />
                    <label for="pending-toble-link">
                      {{ t('thread.tobleLink') }}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div class="mode-section">
              <div class="mode-label">{{ t('common.manual') }}</div>
            </div>

            <div class="button-group">
              <button type="button" class="btn btn-secondary" @click="fetchThreadConfiguration">
                {{ t('common.cancel') }}
              </button>
              <button type="button" class="btn btn-primary" @click="updatePendingDataset">
                {{ t('thread.update') }}
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
</template>

<style scoped>
.thread-content {
  padding: 1.5rem;
}

.panel-section {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
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

.dataset-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.security-policy-section {
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}

.security-policy-grid {
  background-color: var(--bg-secondary);
  padding: 1rem;
  border-radius: 4px;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 0.5rem;
  margin-top: 1rem;
}

.form-check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-check input[type="checkbox"] {
  width: auto;
}

.mode-section {
  margin-bottom: 1.5rem;
  padding: 0.5rem;
  background-color: var(--bg-secondary);
  border-radius: 4px;
  text-align: center;
}

.mode-label {
  font-weight: 500;
  color: var(--text-primary);
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.password-input {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input input {
  padding-right: 2.5rem;
}

.toggle-password {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0.25rem;
}

.toggle-password:hover {
  color: var(--text-primary);
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
  .thread-content {
    padding: 1rem;
  }
  
  .panel-section {
    margin-bottom: 1rem;
  }
  
  .checkbox-group {
    grid-template-columns: 1fr;
  }

  .button-group {
    flex-direction: column;
  }

  .button-group .btn {
    width: 100%;
  }
}
</style>