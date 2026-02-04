<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ExecutionUnitItem } from '../../../types/lcmExecutionUnit';
import { getLcmExecutionUnitConfig, controlExecutionUnit } from '../../../services/api/lcmExecutionUnit';
import { useQA } from '../../../utils/qa';

const { qa } = useQA();
const { t } = useI18n();

const loading = ref(false);
const actioningEUID = ref<string | null>(null);
const error = ref<string | null>(null);
const executionUnits = ref<ExecutionUnitItem[]>([]);
const showSuccess = ref(false);

const fetchConfig = async (silent = false) => {
  if (!silent) loading.value = true;
  error.value = null;
  try {
    const response = await getLcmExecutionUnitConfig();
    executionUnits.value = response.AdvancedLcmExecutionUnit;
  } catch (err) {
    console.error('Error fetching LCM ExecutionUnit config:', err);
    error.value = 'Failed to fetch LCM ExecutionUnit configuration';
  } finally {
    if (!silent) loading.value = false;
  }
};

const handleStart = async (euid: string) => {
  actioningEUID.value = euid;
  try {
    await controlExecutionUnit({
      AdvancedLcmExecutionUnit: {
        Action: 'Start',
        EUID: euid
      }
    });
    await fetchConfig(true);
    showSuccessMessage();
  } catch (err) {
    console.error('Error starting ExecutionUnit:', err);
    error.value = 'Failed to start ExecutionUnit';
  } finally {
    actioningEUID.value = null;
  }
};

const handleStop = async (euid: string) => {
  actioningEUID.value = euid;
  try {
    await controlExecutionUnit({
      AdvancedLcmExecutionUnit: {
        Action: 'Stop',
        EUID: euid
      }
    });
    await fetchConfig(true);
    showSuccessMessage();
  } catch (err) {
    console.error('Error stopping ExecutionUnit:', err);
    error.value = 'Failed to stop ExecutionUnit';
  } finally {
    actioningEUID.value = null;
  }
};

const formatUptime = (seconds: number): string => {
  if (seconds === 0) return '-';

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
};

const showSuccessMessage = () => {
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
  }, 3000);
};

onMounted(fetchConfig);
</script>

<template>
  <div class="execution-unit-tab" :data-testid="qa('lcm-execution-unit-tab')">
    <div v-if="loading" class="loading-state" :data-testid="qa('lcm-execution-unit-loading')">
      <div class="loading-spinner"></div>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="error" class="error-state" :data-testid="qa('lcm-execution-unit-error')">
      {{ error }}
    </div>

    <template v-else>
      <div class="panel-section" :data-testid="qa('lcm-execution-unit-section')">
        <div class="header-row">
          <div class="section-title-sp" :data-testid="qa('lcm-execution-unit-title')">
            {{ t('lcm.executionUnit') }}
          </div>
        </div>

        <div class="card-content">
          <div class="table-container" :data-testid="qa('lcm-execution-unit-table')">
            <table>
              <thead>
                <tr>
                  <th :data-testid="qa('lcm-execution-unit-header-no')">{{ t('lcm.no') }}</th>
                  <th :data-testid="qa('lcm-execution-unit-header-name')">{{ t('lcm.name') }}</th>
                  <th :data-testid="qa('lcm-execution-unit-header-autoRestart')">{{ t('lcm.autoRestart') }}</th>
                  <th :data-testid="qa('lcm-execution-unit-header-status')">{{ t('lcm.status') }}</th>
                  <th :data-testid="qa('lcm-execution-unit-header-uptime')">{{ t('lcm.uptime') }}</th>
                  <th :data-testid="qa('lcm-execution-unit-header-action')">{{ t('lcm.action') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in executionUnits"
                  :key="item.EUID"
                  :data-testid="qa(`lcm-execution-unit-row-${index}`)"
                >
                  <td :data-testid="qa(`lcm-execution-unit-no-${index}`)">{{ index + 1 }}</td>
                  <td :data-testid="qa(`lcm-execution-unit-name-${index}`)">{{ item.Name }}</td>
                  <td :data-testid="qa(`lcm-execution-unit-autorestart-${index}`)">
                    {{ item.AutoRestart ? t('common.enabled') : t('common.disabled') }}
                  </td>
                  <td :data-testid="qa(`lcm-execution-unit-status-${index}`)">
                    <span class="status-badge" :class="item.Status.toLowerCase()">
                      {{ item.Status }}
                    </span>
                  </td>
                  <td :data-testid="qa(`lcm-execution-unit-uptime-${index}`)">
                    {{ formatUptime(item.Uptime) }}
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button
                        class="action-btn play"
                        :disabled="actioningEUID === item.EUID || item.Status === 'Active'"
                        :data-testid="qa(`lcm-execution-unit-start-${index}`)"
                        @click="handleStart(item.EUID)"
                        :title="t('lcm.start')"
                      >
                        <span class="material-icons">play_circle</span>
                      </button>
                      <button
                        class="action-btn stop"
                        :disabled="actioningEUID === item.EUID || item.Status === 'Idle'"
                        :data-testid="qa(`lcm-execution-unit-stop-${index}`)"
                        @click="handleStop(item.EUID)"
                        :title="t('lcm.stop')"
                      >
                        <span class="material-icons">stop_circle</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mobile-cards" :data-testid="qa('lcm-execution-unit-mobile')">
            <div
              class="table-card"
              v-for="(item, index) in executionUnits"
              :key="item.EUID"
              :data-testid="qa(`lcm-execution-unit-card-${index}`)"
            >
              <div class="card-row">
                <span class="card-label">{{ t('lcm.name') }}</span>
                <span class="card-value">{{ item.Name }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('lcm.autoRestart') }}</span>
                <span class="card-value">{{ item.AutoRestart ? t('common.enabled') : t('common.disabled') }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('lcm.status') }}</span>
                <span class="status-badge" :class="item.Status.toLowerCase()">
                  {{ item.Status }}
                </span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('lcm.uptime') }}</span>
                <span class="card-value">{{ formatUptime(item.Uptime) }}</span>
              </div>
              <div class="card-actions">
                <button
                  class="action-btn play"
                  :disabled="actioningEUID === item.EUID || item.Status === 'Active'"
                  @click="handleStart(item.EUID)"
                  :title="t('lcm.start')"
                >
                  <span class="material-icons">play_circle</span>
                </button>
                <button
                  class="action-btn stop"
                  :disabled="actioningEUID === item.EUID || item.Status === 'Idle'"
                  @click="handleStop(item.EUID)"
                  :title="t('lcm.stop')"
                >
                  <span class="material-icons">stop_circle</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div
      v-if="showSuccess"
      class="success-message"
      :data-testid="qa('lcm-execution-unit-success-message')"
    >
      {{ t('common.operationSuccessful') }}
    </div>
  </div>
</template>

<style scoped>
.execution-unit-tab {
  padding: 0;
}

.section-title-sp {
  font-size: 1rem;
  color: var(--text-primary);
  padding: 0.5rem 0;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: left;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s;
}

.action-btn .material-icons {
  font-size: 1.5rem;
}

.action-btn.play {
  color: #4caf50;
}

.action-btn.play:hover:not(:disabled) {
  background-color: rgba(76, 175, 80, 0.1);
}

.action-btn.stop {
  color: #f44336;
}

.action-btn.stop:hover:not(:disabled) {
  background-color: rgba(244, 67, 54, 0.1);
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.active {
  background-color: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.status-badge.idle {
  background-color: rgba(158, 158, 158, 0.2);
  color: #9e9e9e;
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

.success-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #4caf50;
  color: white;
  padding: 1rem 2rem;
  border-radius: 4px;
  animation: fadeInOut 3s ease-in-out;
  z-index: 2000;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  10% {
    opacity: 1;
    transform: translateY(0);
  }
  90% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px);
  }
}

@media (max-width: 768px) {
  .action-btn .material-icons {
    font-size: 1.25rem;
  }
}
</style>
