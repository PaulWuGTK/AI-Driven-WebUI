<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { 
  getMatterStatus, 
  sendEevseEventCommand, 
  sendEevseControlCommand, 
  sendEevseReadCommand 
} from '../../../services/api/matter';
import type { 
  GetStatusResponse, 
  EevseEventRequest, 
  EevseControlRequest, 
  EevseReadRequest 
} from '../../../services/api/matter';

const { t } = useI18n();

// Form data
const nodeAlias = ref('');
const nodeId = ref('');
const endPointId = ref(1);

// EEVSE Event data
const eventKey = ref('000102030405060708090a0b0c0d0e0f');

// EEVSE Control data
const chargingEnabledUntil = ref('null');
const minimumChargeCurrent = ref('6000');
const maximumChargeCurrent = ref('32000');
const userMaximumChargeCurrent = ref('32000');

// Available nodes
const availableNodes = ref<{ alias: string; id: string }[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const result = ref<string | null>(null);
const eevseReports = ref<{ report: string; timestamp: string }[]>([]);

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

// Event Trigger
const eventTrigger = async (type: 'triggerBasic' | 'triggerBasicClear' | 'triggerPluggedin' | 'triggerPluggedinClear' | 'triggerChargeDemand' | 'triggerChargeDemandClear') => {
  if (!nodeAlias.value || !nodeId.value) {
    error.value = 'Node selection is required';
    return;
  }

  loading.value = true;
  error.value = null;
  result.value = null;

  try {
    const request: EevseEventRequest = {
      nodeAlias: nodeAlias.value,
      nodeId: nodeId.value,
      key: eventKey.value,
      type
    };

    const response = await sendEevseEventCommand(request);

    if (response.result === 'successful') {
      result.value = `Trigger EEVSE event (${type}) successful`;
    } else {
      error.value = response.message || `Failed to trigger EEVSE event (${type})`;
    }
  } catch (err) {
    console.error('Error:', err);
    error.value = `An error occurred while triggering EEVSE event (${type})`;
  } finally {
    loading.value = false;
  }
};

// EEVSE Control
const eevseControl = async (type: 'enablecharging' | 'write' | 'disable') => {
  if (!nodeAlias.value || !nodeId.value) {
    error.value = 'Node selection is required';
    return;
  }

  loading.value = true;
  error.value = null;
  result.value = null;

  try {
    const request: EevseControlRequest = {
      nodeAlias: nodeAlias.value,
      nodeId: nodeId.value,
      endPointId: endPointId.value,
      type
    };

    // Add specific fields based on type
    if (type === 'enablecharging') {
      request.chargingEnabledUntil = chargingEnabledUntil.value;
      request.minimumChargeCurrent = minimumChargeCurrent.value;
      request.maximumChargeCurrent = maximumChargeCurrent.value;
    } else if (type === 'write') {
      request.userMaximumChargeCurrent = userMaximumChargeCurrent.value;
    }

    const response = await sendEevseControlCommand(request);

    if (response.result === 'successful') {
      result.value = `EEVSE control (${type}) successful`;
    } else {
      error.value = response.message || `Failed to control EEVSE (${type})`;
    }
  } catch (err) {
    console.error('Error:', err);
    error.value = `An error occurred while controlling EEVSE (${type})`;
  } finally {
    loading.value = false;
  }
};

// EEVSE Read
const eevseRead = async (type: 'state' | 'supplystate' | 'faultstate' | 'chargingenableduntil' | 'minimumchargecurrent' | 'maximumchargecurrent' | 'sessionid' | 'sessionduration') => {
  if (!nodeAlias.value || !nodeId.value) {
    error.value = 'Node selection is required';
    return;
  }

  loading.value = true;
  error.value = null;
  result.value = null;

  try {
    const request: EevseReadRequest = {
      nodeAlias: nodeAlias.value,
      nodeId: nodeId.value,
      endPointId: endPointId.value,
      type
    };

    const response = await sendEevseReadCommand(request);

    if (response.result === 'successful') {
      result.value = `Get EEVSE report (${type}) successful`;
      if (response.report) {
        eevseReports.value.unshift({
          report: response.report,
          timestamp: new Date().toLocaleTimeString()
        });
        
        // Keep only last 20 reports
        if (eevseReports.value.length > 20) {
          eevseReports.value = eevseReports.value.slice(0, 20);
        }
      }
    } else {
      error.value = response.message || `Failed to get EEVSE report (${type})`;
    }
  } catch (err) {
    console.error('Error:', err);
    error.value = `An error occurred while reading EEVSE status (${type})`;
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
    <h1 class="page-title">{{ t('matter.eevsecontrolTitle') }}</h1>

    <div class="status-content">
      <!-- Node Selection Section -->
      <div class="panel-section">
        <div class="section-title">{{ t('matter.nodeSelection') }}</div>
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
          </div>
        </div>
      </div>

      <!-- EEVSE Event Trigger Section -->
      <div class="panel-section">
        <div class="section-title">{{ t('matter.eevseEventTrigger') }}</div>
        <div class="card-content">
          <div class="form-group">
            <label for="eventKey">{{ t('matter.key') }}</label>
            <input 
              type="text" 
              id="eventKey" 
              v-model="eventKey" 
              class="form-control"
              pattern=".{32}"
              required
            />
            <small class="form-hint">This is the key value which enable on the cluster end devices.</small>
          </div>

          <div class="event-grid">
            <button 
              class="btn btn-event" 
              @click="eventTrigger('triggerBasic')"
              :disabled="loading || !nodeAlias"
            >
              {{ t('matter.startTriggerEvent') }}
            </button>
            <button 
              class="btn btn-event" 
              @click="eventTrigger('triggerBasicClear')"
              :disabled="loading || !nodeAlias"
            >
              {{ t('matter.clearTriggerEvent') }}
            </button>
          </div>

          <div class="event-grid">
            <button 
              class="btn btn-event" 
              @click="eventTrigger('triggerPluggedin')"
              :disabled="loading || !nodeAlias"
            >
              {{ t('matter.triggerPluggedIn') }}
            </button>
            <button 
              class="btn btn-event" 
              @click="eventTrigger('triggerPluggedinClear')"
              :disabled="loading || !nodeAlias"
            >
              {{ t('matter.clearPluggedIn') }}
            </button>
          </div>

          <div class="event-grid">
            <button 
              class="btn btn-event" 
              @click="eventTrigger('triggerChargeDemand')"
              :disabled="loading || !nodeAlias"
            >
              {{ t('matter.triggerChargingDemand') }}
            </button>
            <button 
              class="btn btn-event" 
              @click="eventTrigger('triggerChargeDemandClear')"
              :disabled="loading || !nodeAlias"
            >
              {{ t('matter.clearChargingDemand') }}
            </button>
          </div>
        </div>
      </div>

      <!-- EEVSE Charging Enable Section -->
      <div class="panel-section">
        <div class="section-title">{{ t('matter.eevseChargingEnable') }}</div>
        <div class="card-content">
          <div class="form-row">
            <div class="form-group half-width">
              <label for="minimumChargeCurrent">{{ t('matter.minimumChargeCurrent') }}</label>
              <input 
                type="text" 
                id="minimumChargeCurrent" 
                v-model="minimumChargeCurrent" 
                class="form-control"
                required
              />
              <small class="form-hint">This value is the minimum charge current (mA) when charging.</small>
            </div>

            <div class="form-group half-width">
              <label for="maximumChargeCurrent">{{ t('matter.maximumChargeCurrent') }}</label>
              <input 
                type="text" 
                id="maximumChargeCurrent" 
                v-model="maximumChargeCurrent" 
                class="form-control"
                required
              />
              <small class="form-hint">This value is the maximum charge current (mA) when charging.</small>
            </div>
          </div>

          <div class="button-group">
            <button 
              class="btn btn-primary" 
              @click="eevseControl('enablecharging')"
              :disabled="loading || !nodeAlias"
            >
              {{ t('matter.enableCharging') }}
            </button>
          </div>
        </div>
      </div>

      <!-- EEVSE Write Section -->
      <div class="panel-section">
        <div class="section-title">{{ t('matter.eevseWrite') }}</div>
        <div class="card-content">
          <div class="form-group">
            <label for="userMaximumChargeCurrent">{{ t('matter.userMaximumChargeCurrent') }}</label>
            <input 
              type="text" 
              id="userMaximumChargeCurrent" 
              v-model="userMaximumChargeCurrent" 
              class="form-control"
              required
            />
            <small class="form-hint">This value is the user maximum charge current (mA) when charging.</small>
          </div>

          <div class="button-group">
            <button 
              class="btn btn-primary" 
              @click="eevseControl('write')"
              :disabled="loading || !nodeAlias"
            >
              {{ t('matter.writeUserMaximumChargeCurrent') }}
            </button>
          </div>
        </div>
      </div>

      <!-- EEVSE Disable Section -->
      <div class="panel-section">
        <div class="section-title">{{ t('matter.eevseDisable') }}</div>
        <div class="card-content">
          <div class="button-group">
            <button 
              class="btn btn-danger" 
              @click="eevseControl('disable')"
              :disabled="loading || !nodeAlias"
            >
              {{ t('matter.disableCharging') }}
            </button>
          </div>
        </div>
      </div>

      <!-- EEVSE Status Section -->
      <div class="panel-section">
        <div class="section-title">{{ t('matter.eevseStatus') }}</div>
        <div class="card-content">
          <div class="status-grid">
            <button 
              class="btn btn-status" 
              @click="eevseRead('state')"
              :disabled="loading || !nodeAlias"
            >
              {{ t('matter.state') }}
            </button>
            <button 
              class="btn btn-status" 
              @click="eevseRead('supplystate')"
              :disabled="loading || !nodeAlias"
            >
              {{ t('matter.supplyState') }}
            </button>
            <button 
              class="btn btn-status" 
              @click="eevseRead('faultstate')"
              :disabled="loading || !nodeAlias"
            >
              {{ t('matter.faultState') }}
            </button>
            <button 
              class="btn btn-status" 
              @click="eevseRead('chargingenableduntil')"
              :disabled="loading || !nodeAlias"
            >
              {{ t('matter.chargingEnabledUntil') }}
            </button>
            <button 
              class="btn btn-status" 
              @click="eevseRead('minimumchargecurrent')"
              :disabled="loading || !nodeAlias"
            >
              {{ t('matter.minimumChargeCurrent') }}
            </button>
            <button 
              class="btn btn-status" 
              @click="eevseRead('maximumchargecurrent')"
              :disabled="loading || !nodeAlias"
            >
              {{ t('matter.maximumChargeCurrent') }}
            </button>
            <button 
              class="btn btn-status" 
              @click="eevseRead('sessionid')"
              :disabled="loading || !nodeAlias"
            >
              {{ t('matter.sessionId') }}
            </button>
            <button 
              class="btn btn-status" 
              @click="eevseRead('sessionduration')"
              :disabled="loading || !nodeAlias"
            >
              {{ t('matter.sessionDuration') }}
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

      <!-- EEVSE Reports Section -->
      <div class="panel-section" v-if="eevseReports.length > 0">
        <div class="section-title">{{ t('matter.eevseReports') }}</div>
        <div class="card-content">
          <div class="reports-container">
            <div 
              class="report-item" 
              v-for="(item, index) in eevseReports" 
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

.event-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
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

.btn-danger {
  background-color: #f44336;
  color: white;
}

.btn-event {
  background-color: #9c27b0;
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

  .event-grid {
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