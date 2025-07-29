<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getMatterStatus, sendMultiAdminCommand } from '../../../services/api/matter';
import type { GetStatusResponse, MultiAdminRequest } from '../../../services/api/matter';

const { t } = useI18n();

// Form data
const nodeAlias = ref('');
const nodeId = ref('');
const windowTimeout = ref(300);
const option = ref('0');
const iteration = ref('1000');
const discriminator = ref('3840');

// Available nodes
const availableNodes = ref<{ alias: string; id: string }[]>([]);
const loading = ref(false);
const result = ref<string | null>(null);
const error = ref<string | null>(null);

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
      
      if (nodes.length > 0) {
        nodeAlias.value = nodes[0].alias;
        nodeId.value = nodes[0].id;
      }
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

// Handle node alias selection change
const handleNodeAliasChange = (selectedAlias: string) => {
  const selectedNode = availableNodes.value.find(node => node.alias === selectedAlias);
  if (selectedNode) {
    nodeId.value = selectedNode.id;
  }
};

// Open Commissioning Window with BCM
const openBCM = async () => {
  if (!nodeAlias.value || !nodeId.value) {
    error.value = 'Node selection is required';
    return;
  }

  if (!confirm('Are you sure you want to open commissioning window with BCM?')) {
    return;
  }

  loading.value = true;
  error.value = null;
  result.value = null;

  try {
    const request: MultiAdminRequest = {
      nodeId: nodeId.value,
      option: option.value,
      windowTimeout: windowTimeout.value,
      iteration: iteration.value,
      discriminator: discriminator.value
    };

    const response = await sendMultiAdminCommand(request);

    if (response.MatterProxy.result === 'successful') {
      result.value = 'Open Commissioning Window with BCM successful';
    } else {
      error.value = response.MatterProxy.message || 'Failed to open commissioning window';
    }
  } catch (err) {
    console.error('Error:', err);
    error.value = 'An error occurred while opening commissioning window';
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
    <h1 class="page-title">{{ t('matter.multiadminTitle') }}</h1>

    <div class="status-content">
      <div class="panel-section">
        <div class="card-content">
          <div class="form-container">
            <div class="form-group">
              <label for="nodeAlias">{{ t('matter.nodeAlias') }}</label>
              <select 
                id="nodeAlias" 
                v-model="nodeAlias" 
                @change="handleNodeAliasChange(nodeAlias)"
                class="form-control"
              >
                <option value="" disabled>Select Node Alias</option>
                <option 
                  v-for="node in availableNodes" 
                  :key="node.alias" 
                  :value="node.alias"
                >
                  {{ node.alias }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="nodeId">{{ t('matter.nodeId') }}</label>
              <input 
                type="text" 
                id="nodeId" 
                v-model="nodeId" 
                class="form-control"
                readonly
              />
            </div>

            <div class="form-group">
              <label for="windowTimeout">{{ t('matter.windowTimeout') }}</label>
              <input 
                type="number" 
                id="windowTimeout" 
                v-model="windowTimeout" 
                class="form-control"
                min="180"
                max="900"
                required
              />
              <small class="form-hint">The window timeout must be between 180 and 900.</small>
            </div>

            <div class="button-group">
              <button 
                class="btn btn-primary" 
                @click="openBCM"
                :disabled="loading || !nodeAlias"
              >
                <span class="material-icons" v-if="loading">sync</span>
                {{ t('matter.openCommissioningWindow') }}
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
  max-width: 600px;
  margin: 0 auto;
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
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>