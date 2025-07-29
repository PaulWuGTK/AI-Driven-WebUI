<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getMatterStatus, deleteStorageNode } from '../../../services/api/matter';
import type { GetStatusResponse, DeleteNodeRequest } from '../../../services/api/matter';

const { t } = useI18n();

// Form data
const selectedNodeAlias = ref('');
const selectedNodeId = ref('');

// Available nodes
const availableNodes = ref<{ alias: string; id: string }[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const result = ref<string | null>(null);

// Fetch status
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
      
      // Clear selection if current selection no longer exists
      if (selectedNodeAlias.value && !nodes.find(n => n.alias === selectedNodeAlias.value)) {
        selectedNodeAlias.value = '';
        selectedNodeId.value = '';
      }
    } else {
      availableNodes.value = [];
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
    selectedNodeId.value = selectedNode.id;
  }
};

// Delete storage node
const handleDeleteStorageNode = async () => {
  if (!selectedNodeAlias.value || !selectedNodeId.value) {
    error.value = 'Please select a node to delete';
    return;
  }

  const confirmMessage = `Are you sure you want to delete the stored provisioned nodeId: ${selectedNodeId.value} with nodeAlias: ${selectedNodeAlias.value}?`;
  
  if (!confirm(confirmMessage)) {
    return;
  }

  loading.value = true;
  error.value = null;
  result.value = null;

  try {
    const request: DeleteNodeRequest = {
      nodeAlias: selectedNodeAlias.value,
      nodeId: selectedNodeId.value
    };

    const response = await deleteStorageNode(request);

    if (response.MatterProxy.result === 'successful') {
      result.value = 'Delete Provisioned NodeId successful';
      selectedNodeAlias.value = '';
      selectedNodeId.value = '';
      // Refresh the status list
      await fetchStatus();
    } else {
      error.value = response.MatterProxy.message || 'Failed to delete provisioned NodeId';
    }
  } catch (err) {
    console.error('Error:', err);
    error.value = 'An error occurred while deleting the node';
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
    <h1 class="page-title">{{ t('matter.getstatusTitle') }}</h1>

    <div class="status-content">
      <!-- Node Management Section -->
      <div class="panel-section">
        <div class="section-title">{{ t('matter.nodesManagement') }}</div>
        <div class="card-content">
          <div class="form-container">
            <div class="form-group">
              <label for="nodeAlias">{{ t('matter.nodeAlias') }}</label>
              <select 
                id="nodeAlias" 
                v-model="selectedNodeAlias" 
                @change="handleNodeAliasChange(selectedNodeAlias)"
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
                v-model="selectedNodeId" 
                class="form-control"
                readonly
              />
            </div>

            <div class="button-group">
              <button 
                class="btn btn-primary" 
                @click="fetchStatus"
                :disabled="loading"
              >
                <span class="material-icons" v-if="loading">sync</span>
                {{ t('matter.refreshStatus') }}
              </button>
              <button 
                class="btn btn-danger" 
                @click="handleDeleteStorageNode"
                :disabled="loading || !selectedNodeAlias"
              >
                <span class="material-icons" v-if="loading">sync</span>
                {{ t('matter.deleteStorageNode') }}
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

      <!-- Provisioned Nodes Section -->
      <div class="panel-section">
        <div class="section-title">{{ t('matter.provisionedNodes') }}</div>
        <div class="card-content">
          <div class="nodes-container">
            <div v-if="availableNodes.length === 0" class="no-nodes">
              No provisioned nodes available
            </div>
            <div 
              v-else
              class="node-item" 
              v-for="node in availableNodes" 
              :key="node.alias"
              :class="{ selected: selectedNodeAlias === node.alias }"
              @click="selectedNodeAlias = node.alias; handleNodeAliasChange(node.alias)"
            >
              <div class="node-icon">
                <span class="material-icons">device_hub</span>
              </div>
              <div class="node-info">
                <div class="node-alias">Node Alias: {{ node.alias }}</div>
                <div class="node-id">Node ID: {{ node.id }}</div>
              </div>
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

.button-group {
  display: flex;
  gap: 1rem;
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

.btn-danger {
  background-color: #f44336;
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

.nodes-container {
  display: grid;
  gap: 1rem;
}

.no-nodes {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
  background-color: var(--bg-secondary);
  border-radius: 4px;
}

.node-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.node-item:hover {
  background-color: var(--bg-secondary);
}

.node-item.selected {
  border-color: var(--primary-color);
  background-color: rgba(0, 112, 187, 0.1);
}

.node-icon {
  color: var(--primary-color);
}

.node-info {
  flex: 1;
}

.node-alias {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.node-id {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .button-group {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>