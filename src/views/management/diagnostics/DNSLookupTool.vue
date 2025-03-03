<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DiagnosticsResponse, Interface, DNSLookupRequest } from '../../../types/diagnostics';
import { getDiagnostics, startDNSLookup } from '../../../services/api/diagnostics';

const { t } = useI18n();
const interfaces = ref<Interface[]>([]);
const selectedInterface = ref('');
const dnsServer = ref('8.8.8.8');
const targetHost = ref('');
const loading = ref(false);
const error = ref<string | null>(null);
const results = ref<DiagnosticsResponse['ManagementDiagnostic']['DNSLookup'] | null>(null);

const fetchInterfaces = async () => {
  loading.value = true;
  error.value = null;
  try {
    const data = await getDiagnostics();
    interfaces.value = data.ManagementDiagnostic.Interfaces;
    results.value = data.ManagementDiagnostic.DNSLookup;
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

const handleDNSLookup = async () => {
  if (!selectedInterface.value || !targetHost.value || !dnsServer.value) return;

  loading.value = true;
  error.value = null;
  try {
    const request: DNSLookupRequest = {
      SetNSubscribe: {
        DM: "Device.DNS.Diagnostics.NSLookupDiagnostics.",
        filter: "notification in ['dm:object-changed'] and (parameters.DiagnosticsState.from == 'Requested')",
        Parameters: {
          DiagnosticsState: "Requested",
          Interface: selectedInterface.value,
          HostName: targetHost.value,
          DNSServer: dnsServer.value,
          Timeout: 10000,
          NumberOfRepetitions: 1
        }
      }
    };

    await startDNSLookup(request);
    
    // Add a 1-second delay before fetching results
    setTimeout(async () => {
      await fetchInterfaces(); // Refresh to get results
      loading.value = false;
    }, 1000);
    
  } catch (err) {
    console.error('Error starting DNS lookup:', err);
    error.value = 'Failed to start DNS lookup';
    loading.value = false;
  }
};

onMounted(fetchInterfaces);
</script>

<template>
  <div class="dns-lookup-tool">
    <form @submit.prevent="handleDNSLookup">
      <div class="form-group">
        <label>{{ t('diagnostics.interface') }}</label>
        <select v-model="selectedInterface" required>
          <option v-for="iface in interfaces" :key="iface.Interface" :value="iface.Interface">
            {{ iface.Name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>{{ t('diagnostics.dnsServer') }}</label>
        <input type="text" v-model="dnsServer" required />
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
      <div v-else-if="results.DiagnosticsState === 'Complete'" class="dns-results">
        <div v-for="(result, index) in results.Result" :key="index" class="result-card">
          <div class="result-row">
            <span class="label">{{ t('diagnostics.status') }}</span>
            <span class="value">{{ result.Status }}</span>
          </div>
          <div class="result-row">
            <span class="label">{{ t('diagnostics.answerType') }}</span>
            <span class="value">{{ result.AnswerType }}</span>
          </div>
          <div class="result-row">
            <span class="label">{{ t('diagnostics.hostname') }}</span>
            <span class="value">{{ result.HostNameReturned }}</span>
          </div>
          <div class="result-row">
            <span class="label">{{ t('diagnostics.ipAddresses') }}</span>
            <span class="value">{{ result.IPAddresses }}</span>
          </div>
          <div class="result-row">
            <span class="label">{{ t('diagnostics.responseTime') }}</span>
            <span class="value">{{ result.ResponseTime }} ms</span>
          </div>
          <div class="result-row">
            <span class="label">{{ t('diagnostics.dnsServerIp') }}</span>
            <span class="value">{{ result.DNSServerIP }}</span>
          </div>
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
.dns-lookup-tool {
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

.dns-results {
  display: grid;
  gap: 1rem;
}

.result-card {
  padding: 1rem;
  background-color: var(--bg-secondary);
  border-radius: 4px;
}

.result-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 1rem;
  padding: 0.5rem 0;
}

.result-row:not(:last-child) {
  border-bottom: 1px solid var(--border-color);
}

.result-row .label {
  color: var(--text-secondary);
}

.result-row .value {
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
  .dns-lookup-tool {
    padding: 1rem;
  }

  .result-row {
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