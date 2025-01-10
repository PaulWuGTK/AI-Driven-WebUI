<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { SshServer } from '../../../types/ssh';
import { getSshServers, updateSshServers } from '../../../services/api/ssh';
import SshServerEditForm from '../../../components/ssh/SshServerEditForm.vue';

const { t } = useI18n();
const servers = ref<SshServer[]>([]);
const interfaces = ref<string[]>([]);
const isEditing = ref(false);
const editingServer = ref<SshServer | null>(null);
const loading = ref(true);

const fetchServers = async () => {
  try {
    const response = await getSshServers();
    servers.value = response.SshServer.SshServers;
    interfaces.value = response.SshServer.Interfaces;
  } catch (error) {
    console.error('Error fetching SSH servers:', error);
  } finally {
    loading.value = false;
  }
};

const handleEdit = (server: SshServer) => {
  editingServer.value = { ...server };
  isEditing.value = true;
};

const handleAdd = () => {
  editingServer.value = {
    ID: `server-${Date.now()}`,
    Interface: interfaces.value[0],
    Status: 'Disabled',
    AllowAllIPv4: 0,
    AllowAllIPv6: 0,
    AllowPasswordLogin: 1,
    AllowRootLogin: 0,
    AllowRootPasswordLogin: 0,
    AutoDisableDuration: 0,
    Enable: 1,
    IPv4AllowedSourcePrefix: '',
    IPv6AllowedSourcePrefix: '',
    IdleTimeout: 180,
    KeepAlive: 300,
    MaxAuthTries: 3,
    Port: 22
  };
  isEditing.value = true;
};

const handleSave = async () => {
  if (!editingServer.value) return;

  try {
    const updatedServers = editingServer.value.ID
      ? servers.value.map(s => s.ID === editingServer.value!.ID ? editingServer.value! : s)
      : [...servers.value, editingServer.value];

    await updateSshServers(updatedServers);
    await fetchServers();
    isEditing.value = false;
    editingServer.value = null;
  } catch (error) {
    console.error('Error saving SSH server:', error);
  }
};

const handleDelete = async (serverId: string) => {
  if (!confirm(t('ssh.confirmDelete'))) return;

  try {
    const updatedServers = servers.value.filter(s => s.ID !== serverId);
    await updateSshServers(updatedServers);
    await fetchServers();
  } catch (error) {
    console.error('Error deleting SSH server:', error);
  }
};

onMounted(fetchServers);
</script>

<template>
  <div class="server-management">
    <div class="header_btn">
      <div class="ssh-title">{{ t('ssh.serverManagement') }}</div>
      <button v-if="!isEditing" class="btn btn-primary" @click="handleAdd">
        {{ t('ssh.addServer') }}
      </button>
    </div>

    <div v-if="!isEditing" class="server-list">
      <!-- PC版表格 -->
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>{{ t('ssh.id') }}</th>
              <th>{{ t('ssh.interface') }}</th>
              <th>{{ t('ssh.status') }}</th>
              <th>{{ t('ssh.loginWithPassword') }}</th>
              <th>{{ t('ssh.rootLogin') }}</th>
              <th>{{ t('ssh.rootLoginWithPassword') }}</th>
              <th>{{ t('ssh.action') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="server in servers" :key="server.ID">
              <td>{{ server.ID }}</td>
              <td>{{ server.Interface }}</td>
              <td>{{ server.Status }}</td>
              <td>{{ server.AllowPasswordLogin ? '1' : '0' }}</td>
              <td>{{ server.AllowRootLogin ? '1' : '0' }}</td>
              <td>{{ server.AllowRootPasswordLogin ? '1' : '0' }}</td>
              <td>
                <div class="action-buttons">
                  <button class="icon-btn" @click="handleEdit(server)" title="Edit">
                    <span class="material-icons">edit</span>
                  </button>
                  <button class="icon-btn" @click="handleDelete(server.ID)" title="Delete">
                    <span class="material-icons">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 手機版卡片 -->
      <div class="mobile-cards">
        <div class="table-card" v-for="server in servers" :key="server.ID">
          <div class="card-row">
            <span class="card-label">{{ t('ssh.id') }}</span>
            <span class="card-value">{{ server.ID }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">{{ t('ssh.interface') }}</span>
            <span class="card-value">{{ server.Interface }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">{{ t('ssh.status') }}</span>
            <span class="card-value">{{ server.Status }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">{{ t('ssh.loginWithPassword') }}</span>
            <span class="card-value">{{ server.AllowPasswordLogin ? '1' : '0' }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">{{ t('ssh.rootLogin') }}</span>
            <span class="card-value">{{ server.AllowRootLogin ? '1' : '0' }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">{{ t('ssh.rootLoginWithPassword') }}</span>
            <span class="card-value">{{ server.AllowRootPasswordLogin ? '1' : '0' }}</span>
          </div>
          <div class="card-actions">
            <button class="btn btn-primary" @click="handleEdit(server)">
              {{ t('common.edit') }}
            </button>
            <button class="btn btn-danger" @click="handleDelete(server.ID)">
              {{ t('common.delete') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <SshServerEditForm
      v-else
      v-if="editingServer"
      :server="editingServer"
      :interfaces="interfaces"
      @update:server="(server) => editingServer = server"
      @save="handleSave"
      @cancel="isEditing = false"
    />
  </div>
</template>

<style scoped>
.server-management {
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

.server-list {
  padding: 1.5rem;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: #666;
}

.icon-btn:hover {
  color: #333;
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

.card-actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-primary {
  background-color: #0070BB;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
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

  .server-list {
    padding: 1rem;
  }

  .table-wrapper {
    display: none;
  }

  .mobile-cards {
    display: block;
  }

  .btn {
    width: 100%;
  }
}
</style>