<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DiagnosticsResponse, Interface, TraceRouteRequest } from '../../../types/diagnostics';
import { getDiagnostics, startTraceRoute } from '../../../services/api/diagnostics';

const { t } = useI18n();
const interfaces = ref<Interface[]>([]);
const selectedInterface = ref('');
const protocolVersion = ref('IPv4');
const targetHost = ref('');
const loading = ref(false);
const error = ref<string | null>(null);
const results = ref<DiagnosticsResponse['ManagementDiagnostic']['TraceRoute'] | null>(null);

const fetchInterfaces = async () => {
  loading.value = true;
  error.value = null;
  try {
    const data = await getDiagnostics();
    interfaces.value = data.ManagementDiagnostic.Interfaces;
    results.value = data.ManagementDiagnostic.TraceRoute;
    if (interfaces.value.length > 0) {
      selectedInterface.value = interfaces.value[0].Interface;
    }
  } catch (err) {
    console.error('Error fetching interfaces:', err);
    error.value = 'Failed to fetch interfaces';
  } finally {
    loading.value = false;
  }
};

const handleTraceRoute = async () => {
  if (!selectedInterface.value || !targetHost.value) return;

  loading.value = true;
  error.value = null;
  try {
    const request: TraceRouteRequest = {
      SetNSubscribe: {
        DM: "Device.IP.Diagnostics.TraceRoute.",
        filter: "notification in ['dm:object-changed'] and (parameters.DiagnosticsState.from == 'Not_Complete')",
        Parameters: {
          DiagnosticsState: "Requested",
          Interface: selectedInterface.value,
          ProtocolVersion: protocolVersion.value,
          Host: targetHost.value,
          Timeout: 3000,
          MaxHopCount: 30,
          DataBlockSize: 38,
          NumberOfTries: 3
        }
      }
    };

    await startTraceRoute(request);
    
    // Add a 1-second delay before fetching results
    setTimeout(async () => {
      await fetchInterfaces(); // Refresh to get results
      loading.value = false;
    }, 1000);
    
  } catch (err) {
    console.error('Error starting trace route:', err);
    error.value = 'Failed to start trace route';
    loading.value = false;
  }
};

onMounted(fetchInterfaces);
</script>

<template>
  <div class="traceroute-tool">
    <form @submit.prevent="handleTraceRoute">
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
      <div v-else-if="results.DiagnosticsState === 'Complete'" class="trace-results">
        <div class="trace-header">
          <div class="hop">{{ t('diagnostics.hop') }}</div>
          <div class="host">{{ t('diagnostics.host') }}</div>
          <div class="address">{{ t('diagnostics.address') }}</div>
          <div class="rtt">{{ t('diagnostics.rtt') }}</div>
        </div>

        <div v-for="(hop, index) in results.RouteHops" :key="index" class="trace-row">
          <div class="hop">{{ index + 1 }}</div>
          <div class="host">{{ hop.Host }}</div>
          <div class="address">{{ hop.HostAddress }}</div>
          <div class="rtt">{{ hop.RTTimes }}</div>
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
.traceroute-tool {
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

.trace-results {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  overflow: hidden;
}

.trace-header {
  display: grid;
  grid-template-columns: 80px 1fr 1fr 1fr;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background-color: var(--bg-secondary);
  font-weight: 500;
  color: var(--text-primary);
}

.trace-row {
  display: grid;
  grid-template-columns: 80px 1fr 1fr 1fr;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--border-color);
}

.trace-row:hover {
  background-color: var(--bg-secondary);
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
  .traceroute-tool {
    padding: 1rem;
  }

  .trace-header, .trace-row {
    grid-template-columns: 50px 1fr;
    gap: 0.5rem;
  }

  .button-group {
    flex-direction: column;
  }

  .button-group .btn {
    width: 100%;
  }
}
</style>