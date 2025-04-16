<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { SpeedTestResponse } from '../../types/speedtest';
import { runSpeedTest } from '../../services/api/speedtest';

const { t } = useI18n();
const loading = ref(false);
const error = ref<string | null>(null);
const testResults = ref<SpeedTestResponse | null>(null);

const handleSpeedTest = async () => {
  loading.value = true;
  error.value = null;
  testResults.value = null;
  
  try {
    const response = await runSpeedTest();
    
    if (response.AppXperienceControl.status_code === 300) {
      testResults.value = response;
    } else {
      error.value = t('xperienceControl.testFailed');
    }
  } catch (err) {
    console.error('Speed test error:', err);
    error.value = t('xperienceControl.testFailed');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">{{ t('xperienceControl.title') }}</h1>

    <div class="status-content">
      <div class="panel-section">
        <div class="section-title">{{ t('xperienceControl.title') }}</div>
        
        <div class="card-content">
          <div class="description">
            {{ t('xperienceControl.description') }}
          </div>
          
          <div class="button-container">
            <button 
              class="btn btn-primary" 
              @click="handleSpeedTest"
              :disabled="loading"
            >
              <span class="material-icons">speed</span>
              {{ loading ? t('xperienceControl.testing') : t('xperienceControl.startTest') }}
            </button>
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <div v-if="testResults && !error" class="results-container">
            <!-- Download Speed Card -->
            <div class="result-card">
              <div class="result-icon">
                <span class="material-icons">download</span>
              </div>
              <div class="result-title">{{ t('xperienceControl.downloadSpeed') }}</div>
              <div class="result-value">
                {{ testResults.AppXperienceControl.data.download_udp.throughput }}
                <span class="result-unit">{{ t('xperienceControl.mbps') }}</span>
              </div>
            </div>

            <!-- Upload Speed Card -->
            <div class="result-card">
              <div class="result-icon">
                <span class="material-icons">upload</span>
              </div>
              <div class="result-title">{{ t('xperienceControl.uploadSpeed') }}</div>
              <div class="result-value">
                {{ testResults.AppXperienceControl.data.upload_udp.throughput }}
                <span class="result-unit">{{ t('xperienceControl.mbps') }}</span>
              </div>
            </div>

            <!-- Ping Info Card -->
            <div class="result-card">
              <div class="result-icon">
                <span class="material-icons">network_ping</span>
              </div>
              <div class="result-title">{{ t('xperienceControl.pingInfo') }}</div>
              <div class="ping-details">
                <div class="ping-row">
                  <span class="ping-label">{{ t('xperienceControl.packetLoss') }}</span>
                  <span class="ping-value">{{ testResults.AppXperienceControl.data.ping.packet_loss }}%</span>
                </div>
                <div class="ping-row">
                  <span class="ping-label">{{ t('xperienceControl.minEchoTime') }}</span>
                  <span class="ping-value">{{ testResults.AppXperienceControl.data.ping.min_echo_time }} {{ t('xperienceControl.ms') }}</span>
                </div>
                <div class="ping-row">
                  <span class="ping-label">{{ t('xperienceControl.meanEchoTime') }}</span>
                  <span class="ping-value">{{ testResults.AppXperienceControl.data.ping.mean_echo_time }} {{ t('xperienceControl.ms') }}</span>
                </div>
                <div class="ping-row">
                  <span class="ping-label">{{ t('xperienceControl.maxEchoTime') }}</span>
                  <span class="ping-value">{{ testResults.AppXperienceControl.data.ping.max_echo_time }} {{ t('xperienceControl.ms') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.description {
  margin-bottom: 2rem;
  text-align: center;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.button-container {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.error-message {
  padding: 1rem;
  background-color: #fee;
  color: #dc3545;
  border-radius: 4px;
  text-align: center;
  margin-bottom: 1.5rem;
}

.results-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.result-card {
  background-color: var(--bg-secondary);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.result-icon {
  background-color: var(--primary-color);
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.result-icon .material-icons {
  font-size: 30px;
}

.result-title {
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.result-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-color);
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.result-unit {
  font-size: 1rem;
  color: var(--text-secondary);
  font-weight: normal;
}

.ping-details {
  width: 100%;
  margin-top: 0.5rem;
}

.ping-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}

.ping-row:last-child {
  border-bottom: none;
}

.ping-label {
  color: var(--text-secondary);
}

.ping-value {
  color: var(--text-primary);
  font-weight: 500;
}

@media (max-width: 768px) {
  .results-container {
    grid-template-columns: 1fr;
  }
  
  .button-container {
    margin-bottom: 1.5rem;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>