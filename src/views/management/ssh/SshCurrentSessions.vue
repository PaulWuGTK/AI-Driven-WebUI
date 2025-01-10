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
    <div class="header_btn">
      <div class="ssh-title">{{ t('ssh.currentSessions') }}</div>
      <button class="btn btn-refresh" @click="fetchSessions" :disabled="loading">
        {{ t('common.refresh') }}
      </button>
    </div>

    <div class="sessions-list">
      <!-- PC版表格 -->
      <div class="table-wrapper">
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
          </tbody>
        </table>
      </div>

      <!-- 手機版卡片 -->
      <div class="mobile-cards">
        <div class="table-card" v-for="(session, index) in sessions" :key="index">
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
    </div>
  </div>
</template>

<style scoped>
.sessions-management {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header_btn {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f8f8;
  border-bottom: 1px solid #e0e0e0;
}

.ssh-title {
  font-size: 1rem;
  color: #333;
}

.sessions-list {
  padding: 1.5rem;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.btn-refresh {
  background-color: #0070BB;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-refresh:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-refresh:hover:not(:disabled) {
  opacity: 0.9;
}

/* 手機版卡片樣式 */
.mobile-cards {
  display: none;
  gap: 1rem;
}

.table-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.card-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.card-row:last-child {
  border-bottom: none;
}

.card-label {
  color: #666;
  font-size: 0.9rem;
}

.card-value {
  color: #333;
  font-weight: 500;
  word-break: break-all;
}

/* 響應式設計 */
@media (min-width: 768px) {
  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
    white-space: nowrap;
  }

  th {
    background-color: #f8f8f8;
    font-weight: 500;
    color: #333;
  }

  td {
    color: #666;
  }

  .mobile-cards {
    display: none;
  }
}

@media (max-width: 767px) {
  .header_btn {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .sessions-list {
    padding: 1rem;
  }

  .table-wrapper {
    display: none;
  }

  .mobile-cards {
    display: block;
  }

  .btn-refresh {
    width: 100%;
  }
}
</style>