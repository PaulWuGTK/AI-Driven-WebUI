<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ManagementServerLogData } from '../../../types/device';
import { getManagementServerLog } from '../../../services/api/device';
import { useQA } from '../../../utils/qa';

const { qa } = useQA();
const { t } = useI18n();

const loading = ref(false);
const error = ref<string | null>(null);
const logData = ref<ManagementServerLogData | null>(null);

const fetchLogs = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getManagementServerLog();
    logData.value = response.ManagementServerLog;
  } catch (err) {
    console.error('Error fetching TR-069 log:', err);
    error.value = 'Failed to fetch TR-069 log';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchLogs);
</script>

<template>
  <div class="tr069-log" :data-testid="qa('tr069-log-content')">
    <div v-if="loading" class="loading-state" :data-testid="qa('tr069-log-loading')">
      <div class="loading-spinner"></div>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="error" class="error-state" :data-testid="qa('tr069-log-error')">
      {{ error }}
    </div>

    <div v-else-if="logData" class="tr069-log-section" :data-testid="qa('tr069-log-panel')">
      <div class="meta-row">
        <span>{{ t('device.logCount') }}: {{ logData.count }}</span>
        <span>{{ t('device.logMaxEntries') }}: {{ logData.maxEntries }}</span>
        <span>{{ t('device.logServerTime') }}: {{ logData.serverTime }}</span>
      </div>

      <div class="table-container" :data-testid="qa('tr069-log-table')">
        <table>
          <thead>
            <tr>
              <th>{{ t('device.logTimestamp') }}</th>
              <th>{{ t('device.logEventType') }}</th>
              <th>{{ t('device.logDetail') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(entry, index) in logData.entries" :key="index">
              <td>{{ entry.timestamp }}</td>
              <td>{{ entry.eventType }}</td>
              <td>{{ entry.detail }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tr069-log {
  padding: 1.5rem;
}

.tr069-log-section {
  background: transparent;
  box-shadow: none;
}

.meta-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
  color: var(--text-secondary);
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

@media (max-width: 768px) {
  .tr069-log {
    padding: 1rem;
  }
}
</style>
