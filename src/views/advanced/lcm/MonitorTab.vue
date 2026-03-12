<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ExecEnvMonitorInfo } from '../../../types/lcmMonitor';
import { getLcmMonitorInfo } from '../../../services/api/lcmMonitor';
import { SectionCard } from '../../../components/common';
import { useQA } from '../../../utils/qa';

const { qa } = useQA();
const { t } = useI18n();

const loading = ref(false);
const error = ref<string | null>(null);
const monitorData = ref<ExecEnvMonitorInfo[]>([]);
let refreshInterval: number | null = null;

const fetchMonitorData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getLcmMonitorInfo();
    monitorData.value = response.AdvancedLcmMonitor;
  } catch (err) {
    console.error('Error fetching LCM Monitor data:', err);
    error.value = 'Failed to fetch LCM Monitor data';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchMonitorData();
  refreshInterval = window.setInterval(() => {
    fetchMonitorData();
  }, 5000);
});

onUnmounted(() => {
  if (refreshInterval !== null) {
    clearInterval(refreshInterval);
  }
});
</script>

<template>
  <div class="monitor-tab" :data-testid="qa('lcm-monitor-tab')">
    <div v-if="loading && monitorData.length === 0" class="loading-state" :data-testid="qa('lcm-monitor-loading')">
      <div class="loading-spinner"></div>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="error" class="error-state" :data-testid="qa('lcm-monitor-error')">
      {{ error }}
    </div>

    <template v-else>
      <SectionCard
        :data-testid="qa('lcm-monitor-section')"
        header-mode="row"
        :title="t('lcm.systemResourceUsage')"
        :title-data-testid="qa('lcm-monitor-title')"
      >
        <div class="monitor-content">
          <div
            v-for="(ee, eeIndex) in monitorData"
            :key="ee.EEName"
            class="ee-container"
            :data-testid="qa(`lcm-monitor-ee-${eeIndex}`)"
          >
            <div class="ee-header" :data-testid="qa(`lcm-monitor-ee-header-${eeIndex}`)">
              <h3 class="ee-name">{{ ee.EEName }}</h3>
            </div>

            <div class="ee-resources" :data-testid="qa(`lcm-monitor-ee-resources-${eeIndex}`)">
              <div class="resource-item">
                <span class="resource-label">{{ t('lcm.availableMemory') }}:</span>
                <span class="resource-value">{{ ee.AvailableMemory }} MiB</span>
              </div>
              <div class="resource-item">
                <span class="resource-label">{{ t('lcm.availableDiskSpace') }}:</span>
                <span class="resource-value">{{ ee.AvailableDiskSpace }} MiB</span>
              </div>
            </div>

            <div class="eu-grid" :data-testid="qa(`lcm-monitor-eu-grid-${eeIndex}`)">
              <div
                v-for="(eu, euIndex) in ee.EUList"
                :key="eu.EUName"
                class="eu-card"
                :data-testid="qa(`lcm-monitor-eu-card-${eeIndex}-${euIndex}`)"
              >
                <div class="eu-card-header">
                  <span class="eu-name">{{ eu.EUName }}</span>
                </div>
                <div class="eu-card-body">
                  <div class="eu-info-row">
                    <span class="eu-label">{{ t('lcm.state') }}:</span>
                    <span class="eu-value" :class="'state-' + eu.State.toLowerCase()">{{ eu.State }}</span>
                  </div>
                  <div class="eu-info-row">
                    <span class="eu-label">{{ t('lcm.pid') }}:</span>
                    <span class="eu-value">{{ eu.PID }}</span>
                  </div>
                  <div class="eu-info-row">
                    <span class="eu-label">{{ t('lcm.ipAddress') }}:</span>
                    <span class="eu-value">
                      <template v-if="eu.IPAddress.length > 0">
                        {{ eu.IPAddress.join(', ') }}
                      </template>
                      <template v-else>
                        <span class="no-value">-</span>
                      </template>
                    </span>
                  </div>
                  <div class="eu-info-row">
                    <span class="eu-label">{{ t('lcm.rootUid') }}:</span>
                    <span class="eu-value">{{ eu.UID }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    </template>
  </div>
</template>

<style scoped>
.monitor-tab {
  padding: 0;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  color: var(--text-secondary);
}

.error-state {
  padding: 2rem;
  text-align: center;
  color: #dc3545;
}

.monitor-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.ee-container {
  border: 2px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  background: var(--bg-secondary);
  margin: 1.5rem;
}

.ee-header {
  margin-bottom: 1rem;
}

.ee-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.ee-resources {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.resource-label {
  font-weight: 500;
  color: var(--text-secondary);
}

.resource-value {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.eu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.eu-card {
  border: 2px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  overflow: hidden;
}

.eu-card-header {
  background: var(--bg-secondary);
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
}

.eu-name {
  font-weight: 600;
  color: var(--text-primary);
  word-break: break-word;
}

.eu-card-body {
  padding: 1rem;
}

.eu-info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 0.5rem;
}

.eu-info-row:last-child {
  margin-bottom: 0;
}

.eu-label {
  font-weight: 500;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.eu-value {
  color: var(--text-primary);
  text-align: right;
  word-break: break-word;
}

.state-running {
  color: #4caf50;
  font-weight: 600;
}

.state-stopped {
  color: #dc3545;
  font-weight: 600;
}

.state-error {
  color: #ff9800;
  font-weight: 600;
}

.no-value {
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .ee-resources {
    flex-direction: column;
    gap: 0.75rem;
  }

  .eu-grid {
    grid-template-columns: 1fr;
  }

  .ee-container {
    padding: 1rem;
  }
}
</style>
