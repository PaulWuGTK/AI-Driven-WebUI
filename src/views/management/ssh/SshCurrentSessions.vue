```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { SshSession } from '../../../types/ssh';
import { getSshSessions } from '../../../services/api/ssh';

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
  <div class="sessions-management">
    <div class="header-row">
      <div class="section-title-sp">{{ t('ssh.currentSessions') }}</div>
      <button class="btn btn-primary" @click="fetchSessions" :disabled="loading">
        <span class="material-icons">refresh</span>
        {{ t('common.refresh') }}
      </button>
    </div>

    <div class="sessions-list">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>Loading...</span>
      </div>

      <template v-else>
        <!-- PC版表格 -->
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>{{ t('ssh.user') }}</th>
                <th>{{ t('ssh.clientAddress') }}</th>
                <th>{{ t('ssh.clientPort') }}</th>
                <th>{{ t('ssh.serverId') }}</th>
                <th>{{ t('ssh.serverPort') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(session, index) in sessions" :key="index">
                <td>{{ session.User }}</td>
                <td>{{ session.ClientIP }}</td>
                <td>{{ session.ClientPort }}</td>
                <td>{{ session.ServerID }}</td>
                <td>{{ session.ServerPort }}</td>
              </tr>
              <tr v-if="sessions.length === 0">
                <td colspan="5" class="no-data">No active sessions</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 手機版卡片 -->
        <div class="mobile-cards">
          <div v-if="sessions.length === 0" class="no-data-mobile">
            No active sessions
          </div>
          <div class="table-card" v-else v-for="(session, index) in sessions" :key="index">
            <div class="card-row">
              <span class="card-label">{{ t('ssh.user') }}</span>
              <span class="card-value">{{ session.User }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('ssh.clientAddress') }}</span>
              <span class="card-value">{{ session.ClientIP }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('ssh.clientPort') }}</span>
              <span class="card-value">{{ session.ClientPort }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('ssh.serverId') }}</span>
              <span class="card-value">{{ session.ServerID }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('ssh.serverPort') }}</span>
              <span class="card-value">{{ session.ServerPort }}</span>
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