<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DiagnosticsResponse, Interface, PingRequest } from '../../../types/diagnostics';
import { getDiagnostics, startPing } from '../../../services/api/diagnostics';

const { t } = useI18n();
const interfaces = ref<Interface[]>([]);
const selectedInterface = ref('');
const protocolVersion = ref('IPv4');
const targetHost = ref('');
const repeatTimes = ref(3);
const loading = ref(false);
const error = ref<string | null>(null);
const results = ref<DiagnosticsResponse['ManagementDiagnostic']['IPPing'] | null>(null);

const fetchInterfaces = async () => {
  loading.value = true;
  error.value = null;
  try {
    const data = await getDiagnostics();
    interfaces.value = data.ManagementDiagnostic.Interfaces;
    results.value = data.ManagementDiagnostic.IPPing;
    if (interfaces.value.length > 0) {
      if (results.value && results.value.Interface) {
        selectedInterface.value = results.value.Interface; // 選擇 TraceRoute 目前的 Interface
      } else {
        selectedInterface.value = interfaces.value[0].Interface; // 預設選擇第一個 Interface
      }
    }
  } catch (err) {
    console.error('Error fetching interfaces:', err);
    error.value = 'Failed to fetch interfaces';
  } finally {
    loading.value = false;
  }
};

const handlePing = async () => {
  if (!selectedInterface.value || !targetHost.value) return;

  loading.value = true;
  error.value = null;
  try {
    const request: PingRequest = {
      SetNSubscribe: {
        DM: "Device.IP.Diagnostics.IPPing.",
        filter: "notification in ['dm:object-changed'] and (parameters.DiagnosticsState.from == 'Requested')",
        Parameters: {
          DiagnosticsState: "Requested",
          Interface: selectedInterface.value,  // 直接使用完整路徑
          ProtocolVersion: protocolVersion.value,
          NumberOfRepetitions: repeatTimes.value,
          Host: targetHost.value,
          Timeout: 10000,
          DataBlockSize: 16
        }
      }
    };

    await startPing(request);
    
    // Add a 1-second delay before fetching results
    setTimeout(async () => {
      await fetchInterfaces(); // Refresh to get results
      loading.value = false;
    }, 1000);
    
  } catch (err) {
    console.error('Error starting ping:', err);
    error.value = 'Failed to start ping';
    loading.value = false;
  }
};

onMounted(fetchInterfaces);
</script>

<template>
  <div class="ping-tool">
    <form @submit.prevent="handlePing">
      <div class="form-group">
        <label>{{ t('diagnostics.interface') }}</label>
        <select v-model="selectedInterface" required>
          <option v-for="iface in interfaces" :key="iface.Interface" :value="iface.Interface">
            {{ iface.Name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>{{ t('diagnostics.protocol') }}</label>
        <select v-model="protocolVersion" required>
          <option value="IPv4">IPv4</option>
          <option value="IPv6">IPv6</option>
        </select>
      </div>

      <div class="form-group">
        <label>{{ t('diagnostics.repeatTimes') }}</label>
        <input type="number" v-model="repeatTimes" min="1" max="10" required />
      </div>

      <div class="form-group">
        <label>{{ t('diagnostics.targetHost') }}</label>
        <input type="text" v-model="targetHost" required />
      </div>

      <div class="button-group">
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? t('diagnostics.processing') : t('diagnostics.start') }}
        </button>
      </div>
    </form>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="results && results.DiagnosticsState !== 'None'" class="results-section">
      <h3>{{ t('diagnostics.results') }}</h3>
      
      <!-- Show error state if not Complete -->
      <div v-if="results.DiagnosticsState.startsWith('Error_')" class="error-state">
        {{ t('diagnostics.errorState', { state: results.DiagnosticsState }) }}
      </div>

      <!-- Show results only if Complete -->
      <div v-else-if="results.DiagnosticsState === 'Complete'" class="result-grid">
        <div class="result-item">
          <span class="label">{{ t('diagnostics.hostAddress') }}</span>
          <span class="value">{{ results.Host }}</span>
        </div>
        <div class="result-item">
          <span class="label">{{ t('diagnostics.packetsInfo') }}</span>
          <span class="value">
            {{ t('diagnostics.sent') }}: {{ results.NumberOfRepetitions }},
            {{ t('diagnostics.received') }}: {{ results.SuccessCount }},
            {{ t('diagnostics.lost') }}: {{ results.FailureCount }}
          </span>
        </div>
        <div class="result-item">
          <span class="label">{{ t('diagnostics.minRoundTrip') }}</span>
          <span class="value">{{ (results.MinimumResponseTimeDetailed / 1000 ).toFixed(2) }} ms</span>
        </div>
        <div class="result-item">
          <span class="label">{{ t('diagnostics.maxRoundTrip') }}</span>
          <span class="value">{{ (results.MaximumResponseTimeDetailed / 1000 ).toFixed(2) }} ms</span>
        </div>
        <div class="result-item">
          <span class="label">{{ t('diagnostics.avgRoundTrip') }}</span>
          <span class="value">{{ (results.AverageResponseTimeDetailed / 1000 ).toFixed(2) }} ms</span>
        </div>
      </div>

      <!-- Show processing state -->
      <div v-else class="processing-state">
        <div class="loading-spinner"></div>
        <span>{{ t('diagnostics.processing') }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ping-tool {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

select, input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.error-message {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #fee;
  color: #dc3545;
  border-radius: 4px;
}

.results-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.results-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.result-grid {
  display: grid;
  gap: 1rem;
}

.result-item {
  display: grid;
  grid-template-columns: 200px 1fr;
  align-items: center;
  padding: 0.5rem;
  background-color: var(--bg-secondary);
  border-radius: 4px;
}

.result-item .label {
  color: var(--text-secondary);
}

.result-item .value {
  color: var(--text-primary);
  font-weight: 500;
}

.processing-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  background-color: var(--bg-secondary);
  border-radius: 4px;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-state {
  padding: 1rem;
  background-color: #fee;
  color: #dc3545;
  border-radius: 4px;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .ping-tool {
    padding: 1rem;
  }

  .result-item {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }

  .button-group {
    flex-direction: column;
  }

  .button-group .btn {
    width: 100%;
  }
}
</style>