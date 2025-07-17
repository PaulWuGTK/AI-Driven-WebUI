<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { sendOnOffCommand } from '../../../services/api/matter';

const { t } = useI18n();

// Form data
const nodeId = ref('');
const endPointId = ref(1);
const loading = ref(false);
const result = ref<string | null>(null);
const error = ref<string | null>(null);

// Send command
const sendCommand = async (type: 'on' | 'off' | 'toggle' | 'read') => {
  if (!nodeId.value && type !== 'read') {
    error.value = 'Node ID is required';
    return;
  }

  loading.value = true;
  error.value = null;
  result.value = null;

  try {
    const response = await sendOnOffCommand({
      nodeId: nodeId.value,
      endPointId: endPointId.value,
      type
    });

    if (response.status === 'success') {
      if (type === 'read' && response.data) {
        result.value = `Current state: ${response.data.state ? 'ON' : 'OFF'}`;
      } else {
        result.value = `Command ${type.toUpperCase()} sent successfully`;
      }
    } else {
      error.value = response.message || 'Failed to send command';
    }
  } catch (err) {
    console.error('Error:', err);
    error.value = 'An error occurred while sending the command';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">{{ t('matter.onoffTitle') }}</h1>

    <div class="status-content">
      <div class="panel-section">
        <div class="card-content">
          <div class="form-container">
            <div class="form-group">
              <label for="nodeId">{{ t('matter.nodeId') }}</label>
              <input 
                type="text" 
                id="nodeId" 
                v-model="nodeId" 
                class="form-control"
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
                :disabled="loading"
              >
                {{ t('matter.on') }}
              </button>
              <button 
                class="btn btn-primary toggle-btn" 
                @click="sendCommand('toggle')"
                :disabled="loading"
              >
                {{ t('matter.toggle') }}
              </button>
              <button 
                class="btn btn-primary off-btn" 
                @click="sendCommand('off')"
                :disabled="loading"
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
          <div class="report-container">
            <!-- Report content will be displayed here -->
            <p>No report available</p>
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

.report-container {
  min-height: 200px;
  background-color: var(--bg-secondary);
  border-radius: 4px;
  padding: 1rem;
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