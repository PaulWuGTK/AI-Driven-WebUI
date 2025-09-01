```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { SshSession } from '../../../types/ssh';
import { getSshSessions } from '../../../services/api/ssh';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const sessions = ref<SshSession[]>([]);
const loading = ref(true);

const fetchSessions = async () => {
  loading.value = true;
  try {
    const response = await getSshSessions();
    sessions.value = response.SshSession;
  } catch (error) {
    console.error('Error fetching SSH sessions:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchSessions);
</script>

<template>
  <div class="sessions-management" :data-testid="qa('ssh-sessions-content')">
    <div class="header-row">
      <div class="section-title-sp" :data-testid="qa('ssh-sessions-title')">{{ t('ssh.currentSessions') }}</div>
      <button class="btn btn-primary" :data-testid="qa('ssh-sessions-refresh-button')" @click="fetchSessions" :disabled="loading">
        <span class="material-icons">refresh</span>
        {{ t('common.refresh') }}
      </button>
    </div>

    <div class="sessions-list" :data-testid="qa('ssh-sessions-list')">
      <div v-if="loading" class="loading-state" :data-testid="qa('ssh-sessions-loading')">
        <div class="loading-spinner"></div>
        <span>{{ t('common.loading') }}</span>
      </div>

      <template v-else>
        <!-- PC版表格 -->
        <div class="table-container" :data-testid="qa('ssh-sessions-table')">
          <table>
            <thead>
              <tr>
                <th :data-testid="qa('ssh-sessions-header-user')">{{ t('ssh.user') }}</th>
                <th :data-testid="qa('ssh-sessions-header-client-address')">{{ t('ssh.clientAddress') }}</th>
                <th :data-testid="qa('ssh-sessions-header-client-port')">{{ t('ssh.clientPort') }}</th>
                <th :data-testid="qa('ssh-sessions-header-server-id')">{{ t('ssh.serverId') }}</th>
                <th :data-testid="qa('ssh-sessions-header-server-port')">{{ t('ssh.serverPort') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(session, index) in sessions" :key="index" :data-testid="qa(`ssh-sessions-row-${index}`)">
                <td :data-testid="qa(`ssh-sessions-user-${index}`)">{{ session.User }}</td>
                <td :data-testid="qa(`ssh-sessions-client-address-${index}`)">{{ session.ClientIP }}</td>
                <td :data-testid="qa(`ssh-sessions-client-port-${index}`)">{{ session.ClientPort }}</td>
                <td :data-testid="qa(`ssh-sessions-server-id-${index}`)">{{ session.ServerID }}</td>
                <td :data-testid="qa(`ssh-sessions-server-port-${index}`)">{{ session.ServerPort }}</td>
              </tr>
              <tr v-if="sessions.length === 0" :data-testid="qa('ssh-sessions-no-data-row')">
                <td colspan="5" class="no-data" :data-testid="qa('ssh-sessions-no-data')">No active sessions</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 手機版卡片 -->
        <div class="mobile-cards" :data-testid="qa('ssh-sessions-mobile')">
          <div v-if="sessions.length === 0" class="no-data-mobile" :data-testid="qa('ssh-sessions-no-data-mobile')">
            No active sessions
          </div>
          <div class="table-card" v-else v-for="(session, index) in sessions" :key="index" :data-testid="qa(`ssh-sessions-card-${index}`)">
            <div class="card-row">
              <span class="card-label" :data-testid="qa(`ssh-sessions-card-user-label-${index}`)">{{ t('ssh.user') }}</span>
              <span class="card-value" :data-testid="qa(`ssh-sessions-card-user-value-${index}`)">{{ session.User }}</span>
            </div>
            <div class="card-row">
              <span class="card-label" :data-testid="qa(`ssh-sessions-card-client-address-label-${index}`)">{{ t('ssh.clientAddress') }}</span>
              <span class="card-value" :data-testid="qa(`ssh-sessions-card-client-address-value-${index}`)">{{ session.ClientIP }}</span>
            </div>
            <div class="card-row">
              <span class="card-label" :data-testid="qa(`ssh-sessions-card-client-port-label-${index}`)">{{ t('ssh.clientPort') }}</span>
              <span class="card-value" :data-testid="qa(`ssh-sessions-card-client-port-value-${index}`)">{{ session.ClientPort }}</span>
            </div>
            <div class="card-row">
              <span class="card-label" :data-testid="qa(`ssh-sessions-card-server-id-label-${index}`)">{{ t('ssh.serverId') }}</span>
              <span class="card-value" :data-testid="qa(`ssh-sessions-card-server-id-value-${index}`)">{{ session.ServerID }}</span>
            </div>
            <div class="card-row">
              <span class="card-label" :data-testid="qa(`ssh-sessions-card-server-port-label-${index}`)">{{ t('ssh.serverPort') }}</span>
              <span class="card-value" :data-testid="qa(`ssh-sessions-card-server-port-value-${index}`)">{{ session.ServerPort }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.sessions-management {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title-sp {
  font-size: 1rem;
  color: var(--text-primary);
  padding: 0.5rem 0;
}

.sessions-list {
  padding: 1.5rem;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
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

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn .material-icons {
  font-size: 1.25rem;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.no-data-mobile {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  background-color: var(--bg-secondary);
  border-radius: 4px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .header-row {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .section-title-sp {
    padding: 0;
  }

  .sessions-list {
    padding: 1rem;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .loading-state {
    padding: 1rem;
  }
}
</style>
```