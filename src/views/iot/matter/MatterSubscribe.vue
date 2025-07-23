<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getMatterStatus, sendSubscribeCommand } from '../../../services/api/matter';
import type { GetStatusResponse, SubscribeRequest } from '../../../services/api/matter';

const { t } = useI18n();

// Form data
const nodeAlias = ref('');
const nodeId = ref('');
const endPointId = ref(1);
const minInterval = ref('10');
const maxInterval = ref('50');
const subscribeCluster = ref('onoff subscribe on-off');

// Available nodes
const availableNodes = ref<{ alias: string; id: string }[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const subscribeStatus = ref<{ status: string; timestamp: string }[]>([]);

// WebSocket connection
let ws: WebSocket | null = null;
const wsServerPort = '9002';

// Fetch status on component mount
const fetchStatus = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response: GetStatusResponse = await getMatterStatus();
    
    if (response.result === 'successful' && response.status) {
      const nodes = Object.entries(response.status).map(([alias, id]) => ({
        alias,
        id: String(id)
      }));
      
      availableNodes.value = nodes;
      
      if (nodes.length > 0) {
        nodeAlias.value = nodes[0].alias;
        nodeId.value = nodes[0].id;
      }
    } else {
      error.value = 'No nodes available';
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

// Trigger Subscribe
const triggerSubscribe = async () => {
  if (!nodeAlias.value || !nodeId.value) {
    error.value = 'Node selection is required';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    // Close existing WebSocket connection if any
    if (ws) {
      ws.close();
    }

    // Create new WebSocket connection
    ws = new WebSocket(`ws://${window.location.hostname}:${wsServerPort}`);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      const data: SubscribeRequest = {
        subscribe_cluster: subscribeCluster.value,
        minInterval: minInterval.value,
        maxInterval: maxInterval.value,
        nodeAlias: nodeAlias.value,
        nodeId: nodeId.value,
        endPointId: endPointId.value
      };
      
      if (ws) {
        ws.send(JSON.stringify(data));
      }
      loading.value = false;
    };

    ws.onerror = () => {
      console.error('WebSocket error');
      error.value = 'WebSocket connection error';
      loading.value = false;
    };

    ws.onmessage = (event) => {
      const statusStr = event.data;
      subscribeStatus.value.unshift({
        status: statusStr,
        timestamp: new Date().toLocaleTimeString()
      });
      
      // Keep only last 50 messages
      if (subscribeStatus.value.length > 50) {
        subscribeStatus.value = subscribeStatus.value.slice(0, 50);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

  } catch (err) {
    console.error('Error:', err);
    error.value = 'An error occurred while setting up subscription';
    loading.value = false;
  }
};

// Clear subscribe status
const clearStatus = () => {
  subscribeStatus.value = [];
};

// Cleanup on component unmount
onUnmounted(() => {
  if (ws) {
    ws.close();
  }
});

onMounted(() => {
  fetchStatus();
});
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">{{ t('matter.subscribeTitle') }}</h1>

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

            <div class="form-row">
              <div class="form-group half-width">
                <label for="endPointId">{{ t('matter.endpointId') }}</label>
                <input 
                  type="number" 
                  id="endPointId" 
                  v-model="endPointId" 
                  class="form-control"
                  min="1"
                  max="240"
                  required
                />
              </div>

              <div class="form-group half-width">
                <label for="minInterval">{{ t('matter.minInterval') }}</label>
                <input 
                  type="text" 
                  id="minInterval" 
                  v-model="minInterval" 
                  class="form-control"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label for="maxInterval">{{ t('matter.maxInterval') }}</label>
              <input 
                type="text" 
                id="maxInterval" 
                v-model="maxInterval" 
                class="form-control"
                required
              />
            </div>

            <div class="button-group">
              <button 
                class="btn btn-primary" 
                @click="triggerSubscribe"
                :disabled="loading || !nodeAlias"
              >
                <span class="material-icons" v-if="loading">sync</span>
                {{ t('matter.subscribe') }}
              </button>
              <button 
                class="btn btn-secondary" 
                @click="clearStatus"
                :disabled="subscribeStatus.length === 0"
              >
                {{ t('matter.clearStatus') }}
              </button>
            </div>

            <div v-if="error" class="error-message">
              {{ error }}
            </div>
          </div>
        </div>
      </div>

      <!-- Subscribe Status Section -->
      <div class="panel-section">
        <div class="section-title">{{ t('matter.subscribeStatus') }}</div>
        <div class="card-content">
          <div class="status-container">
            <div v-if="subscribeStatus.length === 0" class="no-status">
              No subscribe status available
            </div>
            <div 
              v-else
              class="status-item" 
              v-for="(item, index) in subscribeStatus" 
              :key="index"
            >
              <div class="status-timestamp">{{ item.timestamp }}</div>
              <div class="status-content">{{ item.status }}</div>
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

.btn-secondary {
  background-color: var(--secondary-color);
  color: var(--text-primary);
}

.error-message {
  padding: 1rem;
  background-color: #ffebee;
  color: #f44336;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.status-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.no-status {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.status-item {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.status-item:last-child {
  border-bottom: none;
}

.status-timestamp {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.status-content {
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-word;
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
    justify-content: center;
  }
}
</style>