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
    <div class="header">
      <h2 class="section-title">{{ t('ssh.currentSessions') }}</h2>
      <button class="btn btn-refresh" @click="fetchSessions" :disabled="loading">
        {{ t('common.refresh') }}
      </button>
    </div>

    <div class="sessions-list">
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
  </div>
</template>

<style scoped>
.sessions-management {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.section-title {
  font-size: 1rem;
  color: #333;
  margin: 0;
}

.sessions-list {
  padding: 1.5rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

th {
  background-color: #f8f8f8;
  font-weight: normal;
  color: #666;
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
</style>