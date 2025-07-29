<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { 
  getMatterStatus, 
  sendLauncherCommand, 
  sendMediaControlCommand, 
  sendMediaReadCommand 
} from '../../../services/api/matter';
import type { 
  GetStatusResponse, 
  LauncherRequest, 
  MediaControlRequest, 
  MediaReadRequest,
  LaunchConfig 
} from '../../../services/api/matter';

const { t } = useI18n();

// Form data
const nodeAlias = ref('');
const nodeId = ref('');
const endPointId = ref(1);

// Launch configuration
const launchConfig: LaunchConfig = {
  catalogVendorID: '123',
  applicationID: 'exampleid'
};

// Available nodes
const availableNodes = ref<{ alias: string; id: string }[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const result = ref<string | null>(null);
const mediaReports = ref<{ report: string; timestamp: string }[]>([]);

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

// Launch App
const launchApp = async () => {
  if (!nodeAlias.value || !nodeId.value) {
    error.value = 'Node selection is required';
    return;
  }

  loading.value = true;
  error.value = null;
  result.value = null;

  try {
    const request: LauncherRequest = {
      nodeId: nodeId.value,
      endPointId: endPointId.value,
      type: 'launch',
      launchConf: launchConfig
    };

    const response = await sendLauncherCommand(request);

    if (response.MatterProxy.result === 'successful') {
      result.value = 'Launch App successful';
    } else {
      error.value = response.MatterProxy.message || 'Failed to launch app';
    }
  } catch (err) {
    console.error('Error:', err);
    error.value = 'An error occurred while launching app';
  } finally {
    loading.value = false;
  }
};

// Stop App
const stopApp = async () => {
  if (!nodeAlias.value || !nodeId.value) {
    error.value = 'Node selection is required';
    return;
  }

  loading.value = true;
  error.value = null;
  result.value = null;

  try {
    const request: LauncherRequest = {
      nodeId: nodeId.value,
      endPointId: endPointId.value,
      type: 'stop',
      launchConf: launchConfig
    };

    const response = await sendLauncherCommand(request);

    if (response.MatterProxy.result === 'successful') {
      result.value = 'Stop App successful';
    } else {
      error.value = response.MatterProxy.message || 'Failed to stop app';
    }
  } catch (err) {
    console.error('Error:', err);
    error.value = 'An error occurred while stopping app';
  } finally {
    loading.value = false;
  }
};

// Media Control
const mediaControl = async (type: 'play' | 'pause' | 'stop' | 'startover' | 'previous' | 'next' | 'rewind' | 'fastforward') => {
  if (!nodeAlias.value || !nodeId.value) {
    error.value = 'Node selection is required';
    return;
  }

  loading.value = true;
  error.value = null;
  result.value = null;

  try {
    const request: MediaControlRequest = {
      nodeId: nodeId.value,
      endPointId: endPointId.value,
      type
    };

    const response = await sendMediaControlCommand(request);

    if (response.MatterProxy.result === 'successful') {
      result.value = `Control Media App (${type}) successful`;
    } else {
      error.value = response.MatterProxy.message || `Failed to ${type} media`;
    }
  } catch (err) {
    console.error('Error:', err);
    error.value = `An error occurred while ${type} media`;
  } finally {
    loading.value = false;
  }
};

// Media Read
const mediaRead = async (type: 'currentstate' | 'starttime' | 'duration' | 'playbackspeed') => {
  if (!nodeAlias.value || !nodeId.value) {
    error.value = 'Node selection is required';
    return;
  }

  loading.value = true;
  error.value = null;
  result.value = null;

  try {
    const request: MediaReadRequest = {
      nodeAlias: nodeAlias.value,
      nodeId: nodeId.value,
      endPointId: endPointId.value,
      type
    };

    const response = await sendMediaReadCommand(request);

    if (response.MatterProxy.result === 'successful') {
      result.value = 'Read operation successful and got report';
      if (response.MatterProxy.report) {
        mediaReports.value.unshift({
          report: response.MatterProxy.report,
          timestamp: new Date().toLocaleTimeString()
        });
        
        // Keep only last 20 reports
        if (mediaReports.value.length > 20) {
          mediaReports.value = mediaReports.value.slice(0, 20);
        }
      }
    } else {
      error.value = response.MatterProxy.message || 'Read operation successful but failed to get report';
    }
  } catch (err) {
    console.error('Error:', err);
    error.value = 'An error occurred while reading media status';
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
    <h1 class="page-title">{{ t('matter.mediacontrolTitle') }}</h1>

    <div class="status-content">
      <!-- Media App Launch Section -->
      <div class="panel-section">
        <div class="section-title">{{ t('matter.mediaAppLaunch') }}</div>
        <div class="card-content">
          <div class="form-container">
            <div class="form-row">
              <div class="form-group half-width">
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

              <div class="form-group half-width">
                <label for="nodeId">{{ t('matter.nodeId') }}</label>
                <input 
                  type="text" 
                  id="nodeId" 
                  v-model="nodeId" 
                  class="form-control"
                  readonly
                />
              </div>
            </div>

            <div class="form-group">
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

            <div class="button-group">
              <button 
                class="btn btn-primary" 
                @click="launchApp"
                :disabled="loading || !nodeAlias"
              >
                {{ t('matter.launchApp') }}
              </button>
              <button 
                class="btn btn-secondary" 
                @click="stopApp"
                :disabled="loading || !nodeAlias"
              >
                {{ t('matter.stopApp') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Media Control Section -->
      <div class="panel-section">
        <div class="section-title">{{ t('matter.mediaControl') }}</div>
        <div class="card-content">
          <div class="control-grid">
            <button 
              class="btn btn-control" 
              @click="mediaControl('play')"
              :disabled="loading || !nodeAlias"
            >
              <span class="material-icons">play_arrow</span>
              {{ t('matter.play') }}
            </button>
            <button 
              class="btn btn-control" 
              @click="mediaControl('pause')"
              :disabled="loading || !nodeAlias"
            >
              <span class="material-icons">pause</span>
              {{ t('matter.pause') }}
            </button>
            <button 
              class="btn btn-control" 
              @click="mediaControl('stop')"
              :disabled="loading || !nodeAlias"
            >
              <span class="material-icons">stop</span>
              {{ t('matter.stop') }}
            </button>
          </div>

          <div class="control-grid">
            <button 
              class="btn btn-control" 
              @click="mediaControl('previous')"
              :disabled="loading || !nodeAlias"
            >
              <span class="material-icons">skip_previous</span>
              {{ t('matter.previous') }}
            </button>
            <button 
              class="btn btn-control" 
              @click="mediaControl('next')"
              :disabled="loading || !nodeAlias"
            >
              <span class="material-icons">skip_next</span>
              {{ t('matter.next') }}
            </button>
            <button 
              class="btn btn-control" 
              @click="mediaControl('startover')"
              :disabled="loading || !nodeAlias"
            >
              <span class="material-icons">replay</span>
              {{ t('matter.startOver') }}
            </button>
          </div>

          <div class="control-grid">
            <button 
              class="btn btn-control" 
              @click="mediaControl('rewind')"
              :disabled="loading || !nodeAlias"
            >
              <span class="material-icons">fast_rewind</span>
              {{ t('matter.rewind') }}
            </button>
            <button 
              class="btn btn-control" 
              @click="mediaControl('fastforward')"
              :disabled="loading || !nodeAlias"
            >
              <span class="material-icons">fast_forward</span>
              {{ t('matter.fastForward') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Media Status Section -->
      <div class="panel-section">
        <div class="section-title">{{ t('matter.mediaStatus') }}</div>
        <div class="card-content">
          <div class="status-grid">
            <button 
              class="btn btn-status" 
              @click="mediaRead('currentstate')"
              :disabled="loading || !nodeAlias"
            >
              {{ t('matter.currentState') }}
            </button>
            <button 
              class="btn btn-status" 
              @click="mediaRead('starttime')"
              :disabled="loading || !nodeAlias"
            >
              {{ t('matter.startTime') }}
            </button>
            <button 
              class="btn btn-status" 
              @click="mediaRead('duration')"
              :disabled="loading || !nodeAlias"
            >
              {{ t('matter.duration') }}
            </button>
            <button 
              class="btn btn-status" 
              @click="mediaRead('playbackspeed')"
              :disabled="loading || !nodeAlias"
            >
              {{ t('matter.playbackSpeed') }}
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

      <!-- Media Reports Section -->
      <div class="panel-section" v-if="mediaReports.length > 0">
        <div class="section-title">{{ t('matter.mediaReports') }}</div>
        <div class="card-content">
          <div class="reports-container">
            <div 
              class="report-item" 
              v-for="(item, index) in mediaReports" 
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

.control-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.btn {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
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

.btn-control {
  background-color: #4caf50;
  color: white;
}

.btn-status {
  background-color: #ff9800;
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

.reports-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: 4px;
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

  .control-grid {
    grid-template-columns: 1fr;
  }

  .status-grid {
    grid-template-columns: 1fr;
  }

  .btn {
    width: 100%;
  }
}
</style>