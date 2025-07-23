<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { sendOnOffCommand, getMatterStatus, sendOnOffReportCommand } from '../../../services/api/matter';
import type { GetStatusResponse } from '../../../services/api/matter';

const { t } = useI18n();

// Form data
const nodeId = ref('1');
const endPointId = ref(1);
const nodeAlias = ref('');
const availableNodes = ref<{ alias: string; id: string }[]>([]);
const loading = ref(false);
const result = ref<string | null>(null);
const error = ref<string | null>(null);
const reports = ref<{ report: string; timestamp: string }[]>([]);

// Fetch status on component mount
const fetchStatus = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response: GetStatusResponse = await getMatterStatus();
    
    if (response.result === 'successful' && response.status) {
      // Convert status object to array of nodes
      const nodes = Object.entries(response.status).map(([alias, id]) => ({
        alias,
        id: String(id)
      }));
      
      availableNodes.value = nodes;
      
      // Set default selection to first node if available
      if (nodes.length > 0) {
        nodeAlias.value = nodes[0].alias;
        nodeId.value = nodes[0].id;
      }
    } else {
      error.value = response.result === 'error' ? 'Failed to fetch node status' : 'No nodes available';
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

// Send command
const sendCommand = async (type: 'on' | 'off' | 'toggle' | 'read') => {
  if (!nodeAlias.value || !nodeId.value) {
    error.value = 'Node selection is required';
    return;
  }

  loading.value = true;
  error.value = null;
  result.value = null;

  try {
    if (type === 'read') {
      // Use onoff_report for read operations
      const response = await sendOnOffReportCommand({
        attr: 'on-off',
        nodeAlias: nodeAlias.value,
        nodeId: nodeId.value,
        endPointId: endPointId.value,
        type: 'read'
      });

      if (response.result === 'successful') {
        result.value = 'Read operation successful and got report';
        if (response.report) {
          reports.value.unshift({
            report: response.report,
            timestamp: new Date().toLocaleTimeString()
          });
          
          // Keep only last 20 reports
          if (reports.value.length > 20) {
            reports.value = reports.value.slice(0, 20);
          }
        }
      } else {
        error.value = response.message || 'Read operation successful but failed to get report';
      }
    } else {
      // Use regular onoff for control operations
      const response = await sendOnOffCommand({
        nodeId: nodeId.value,
        endPointId: endPointId.value,
        type
      });

      if (response.status === 'success') {
        result.value = `Command ${type.toUpperCase()} sent successfully`;
      } else {
        error.value = response.message || 'Failed to send command';
      }
    }
  } catch (err) {
    console.error('Error:', err);
    error.value = 'An error occurred while sending the command';
  } finally {
    loading.value = false;
  }
};

// Initialize component
import { onMounted } from 'vue';
onMounted(() => {
  fetchStatus();
});
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">{{ t('matter.onoffTitle') }}</h1>

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
              <label for="endPointId">{{ t('matter.endpointId') }}</label>
              <input 
                type="number" 
                id="endPointId" 
                v-model="endPointId" 
                class="form-control"
                min="1"
              />
            </div>

            <div class="button-group">
              <button 
                class="btn btn-primary on-btn" 
                @click="sendCommand('on')"
                :disabled="loading || !nodeAlias"
              >
                {{ t('matter.on') }}
              </button>
              <button 
                class="btn btn-primary toggle-btn" 
                @click="sendCommand('toggle')"
                :disabled="loading || !nodeAlias"
              >
                {{ t('matter.toggle') }}
              </button>
              <button 
                class="btn btn-primary off-btn" 
                @click="sendCommand('off')"
                :disabled="loading || !nodeAlias"
              >
                {{ t('matter.off') }}
              </button>
              <button 
                class="btn btn-secondary read-btn" 
                @click="sendCommand('read')"
                :disabled="loading"
              >
                {{ t('matter.read') }}
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

      <div class="panel-section">
        <div class="section-title">{{ t('matter.getReport') }}</div>
        <div class="card-content">
          <div class="reports-container">
            <div v-if="reports.length === 0" class="no-reports">
              No reports available
            </div>
            <div 
              v-else
              class="report-item" 
              v-for="(item, index) in reports" 
              :key="index"
            >
              <div class="report-timestamp">{{ item.timestamp }}</div>
              <div class="report-content">{{ item.report }}</div>
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
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.btn {
  padding: 0.75rem 1rem;
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
  background-color: var(--secondary-color);
  color: var(--text-primary);
}

.on-btn {
  background-color: #4caf50;
}

.off-btn {
  background-color: #f44336;
}

.toggle-btn {
  background-color: #ff9800;
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

.reports-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.no-reports {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.report-item {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.report-item:last-child {
  border-bottom: none;
}

.report-timestamp {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.report-content {
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-word;
}

@media (max-width: 768px) {
  .button-group {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .button-group {
    grid-template-columns: 1fr;
  }
}
</style>