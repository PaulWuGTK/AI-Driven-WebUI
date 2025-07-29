<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getMatterStatus, writeACL, writeBinding } from '../../../services/api/matter';
import type { GetStatusResponse, WriteACLRequest, WriteBindingRequest, ACLConfig, BindingConfig } from '../../../services/api/matter';

const { t } = useI18n();

// Form data for ACL
const lightNodeAlias = ref('');
const lightNodeId = ref('');
const switchNodeAlias = ref('');
const switchNodeId = ref('');
const aclEndpointId = ref(0);

// Form data for Binding
const lightEndpointId = ref(1);
const switchEndpointId = ref(2);

// Available nodes
const availableNodes = ref<{ alias: string; id: string }[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const result = ref<string | null>(null);

// ACL Configuration
const aclConf1: ACLConfig = {
  fabricIndex: '1',
  privilege: '5',
  authMode: '2',
  subjects: '112233',
  targets: 'null'
};

const aclConf2: ACLConfig = {
  fabricIndex: '1',
  privilege: '3',
  authMode: '2',
  subjects: '',
  targets: 'null'
};

// Binding Configuration
const bindingConf: BindingConfig = {
  fabricIndex: '1',
  node: '',
  endPointId: 1,
  cluster: '6'
};

// Fetch status on component mount
const fetchStatus = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response: GetStatusResponse = await getMatterStatus();
    
    if (response.MatterProxy.result === 'successful' && response.MatterProxy.status) {
      const nodes = Object.entries(response.MatterProxy.status).map(([alias, id]) => ({
        alias,
        id: String(id)
      }));
      
      availableNodes.value = nodes;
    } else {
      error.value = response.MatterProxy.result === 'error' ? 'Failed to fetch node status' : 'No nodes available';
    }
  } catch (err) {
    console.error('Error fetching status:', err);
    error.value = 'An error occurred while fetching status';
  } finally {
    loading.value = false;
  }
};

// Handle light node alias selection change
const handleLightNodeAliasChange = (selectedAlias: string) => {
  const selectedNode = availableNodes.value.find(node => node.alias === selectedAlias);
  if (selectedNode) {
    lightNodeId.value = selectedNode.id;
  }
};

// Handle switch node alias selection change
const handleSwitchNodeAliasChange = (selectedAlias: string) => {
  const selectedNode = availableNodes.value.find(node => node.alias === selectedAlias);
  if (selectedNode) {
    switchNodeId.value = selectedNode.id;
  }
};

// Write ACL
const handleWriteACL = async () => {
  if (!lightNodeAlias.value || !lightNodeId.value || !switchNodeAlias.value || !switchNodeId.value) {
    error.value = 'Please select both light and switch nodes';
    return;
  }

  const confirmMessage = 'This button can trigger the Write ACL command. But before using it, please confirm that the light device and switch device node id and the endpoint you want to write ACL.';
  
  if (!confirm(confirmMessage)) {
    return;
  }

  loading.value = true;
  error.value = null;
  result.value = null;

  try {
    // Update aclConf2 subjects with switch node ID
    const updatedAclConf2 = {
      ...aclConf2,
      subjects: switchNodeId.value
    };

    const request: WriteACLRequest = {
      aclConf1,
      aclConf2: updatedAclConf2,
      lightNodeId: lightNodeId.value,
      aclEndpointId: aclEndpointId.value
    };

    const response = await writeACL(request);

    if (response.MatterProxy.result === 'successful') {
      result.value = 'Write ACL successful. Please write the binding by pressing the Write Binding button.';
    } else {
      error.value = response.MatterProxy.message || 'Failed to write ACL';
    }
  } catch (err) {
    console.error('Error:', err);
    error.value = 'An error occurred while writing ACL';
  } finally {
    loading.value = false;
  }
};

// Write Binding
const handleWriteBinding = async () => {
  if (!lightNodeId.value || !switchNodeId.value) {
    error.value = 'Please complete ACL setup first';
    return;
  }

  const confirmMessage = 'This button can trigger the Write Binding command. Before using it, make sure you have written the ACL and that the light endpoint id and switch endpoint id are correct.';
  
  if (!confirm(confirmMessage)) {
    return;
  }

  loading.value = true;
  error.value = null;
  result.value = null;

  try {
    // Update binding configuration
    const updatedBindingConf = {
      ...bindingConf,
      node: lightNodeId.value,
      endPointId: lightEndpointId.value
    };

    const request: WriteBindingRequest = {
      bindingConf: updatedBindingConf,
      switchNodeId: switchNodeId.value,
      switchEndpointId: switchEndpointId.value
    };

    const response = await writeBinding(request);

    if (response.MatterProxy.result === 'successful') {
      result.value = 'Write Binding successful. Please register the binding entry on switch device.';
    } else {
      error.value = response.MatterProxy.message || 'Failed to write binding';
    }
  } catch (err) {
    console.error('Error:', err);
    error.value = 'An error occurred while writing binding';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchStatus();
});
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">{{ t('matter.bindingTitle') }}</h1>

    <div class="status-content">
      <!-- Write ACL Section -->
      <div class="panel-section">
        <div class="section-title">{{ t('matter.writeAcl') }}</div>
        <div class="card-content">
          <div class="form-container">
            <div class="form-row">
              <div class="form-group half-width">
                <label for="lightNodeAlias">{{ t('matter.lightNodeAlias') }}</label>
                <select 
                  id="lightNodeAlias" 
                  v-model="lightNodeAlias" 
                  @change="handleLightNodeAliasChange(lightNodeAlias)"
                  class="form-control"
                >
                  <option value="" disabled>Select Light Node Alias</option>
                  <option 
                    v-for="node in availableNodes" 
                    :key="node.alias" 
                    :value="node.alias"
                  >
                    {{ node.alias }}
                  </option>
                </select>
              </div>

              <div class="form-group half-width">
                <label for="lightNodeId">{{ t('matter.lightNodeId') }}</label>
                <input 
                  type="text" 
                  id="lightNodeId" 
                  v-model="lightNodeId" 
                  class="form-control"
                  readonly
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group half-width">
                <label for="switchNodeAlias">{{ t('matter.switchNodeAlias') }}</label>
                <select 
                  id="switchNodeAlias" 
                  v-model="switchNodeAlias" 
                  @change="handleSwitchNodeAliasChange(switchNodeAlias)"
                  class="form-control"
                >
                  <option value="" disabled>Select Switch Node Alias</option>
                  <option 
                    v-for="node in availableNodes" 
                    :key="node.alias" 
                    :value="node.alias"
                  >
                    {{ node.alias }}
                  </option>
                </select>
              </div>

              <div class="form-group half-width">
                <label for="switchNodeId">{{ t('matter.switchNodeId') }}</label>
                <input 
                  type="text" 
                  id="switchNodeId" 
                  v-model="switchNodeId" 
                  class="form-control"
                  readonly
                />
              </div>
            </div>

            <div class="form-group">
              <label for="aclEndpointId">{{ t('matter.aclEndpointId') }}</label>
              <input 
                type="number" 
                id="aclEndpointId" 
                v-model="aclEndpointId" 
                class="form-control"
                min="0"
                max="2"
                required
              />
              <small class="form-hint">The endpoint id should be between 0 and 2. 0 means all endpoints.</small>
            </div>

            <div class="button-group">
              <button 
                class="btn btn-primary" 
                @click="handleWriteACL"
                :disabled="loading || !lightNodeAlias || !switchNodeAlias"
              >
                <span class="material-icons" v-if="loading">sync</span>
                {{ t('matter.writeAcl') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Write Binding Section -->
      <div class="panel-section">
        <div class="section-title">{{ t('matter.writeBinding') }}</div>
        <div class="card-content">
          <div class="form-container">
            <div class="form-row">
              <div class="form-group half-width">
                <label for="lightEndpointId">{{ t('matter.lightEndpointId') }}</label>
                <input 
                  type="number" 
                  id="lightEndpointId" 
                  v-model="lightEndpointId" 
                  class="form-control"
                  min="1"
                  max="2"
                  required
                />
                <small class="form-hint">The endpoint id must be between 1 and 2, and it must be the light endpoint you want to bind.</small>
              </div>

              <div class="form-group half-width">
                <label for="switchEndpointId">{{ t('matter.switchEndpointId') }}</label>
                <input 
                  type="number" 
                  id="switchEndpointId" 
                  v-model="switchEndpointId" 
                  class="form-control"
                  min="1"
                  max="2"
                  required
                />
                <small class="form-hint">The endpoint id must be between 1 and 2, and it must be the switch endpoint you want to bind.</small>
              </div>
            </div>

            <div class="button-group">
              <button 
                class="btn btn-primary" 
                @click="handleWriteBinding"
                :disabled="loading || !lightNodeId || !switchNodeId"
              >
                <span class="material-icons" v-if="loading">sync</span>
                {{ t('matter.writeBinding') }}
              </button>
            </div>

            <div v-if="error" class="error-message">
              {{ error }}
            </div>

            <div v-if="result" class="result-message">
              {{ result }}
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

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
}

.form-control:read-only {
  background-color: var(--bg-secondary);
  cursor: not-allowed;
}

.form-hint {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.button-group {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.error-message {
  padding: 1rem;
  background-color: #ffebee;
  color: #f44336;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.result-message {
  padding: 1rem;
  background-color: #e8f5e9;
  color: #4caf50;
  border-radius: 4px;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .half-width {
    width: 100%;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>