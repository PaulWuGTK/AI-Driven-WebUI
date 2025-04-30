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
  loading.value = true;
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
    <div class="header-row">
      <div class="section-title-sp">{{ t('ssh.serverManagement') }}</div>
      <button v-if="!isEditing" class="btn btn-primary" @click="handleAdd">
        <span class="material-icons">add</span>
        {{ t('ssh.addServer') }}
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="!isEditing" class="server-list">
      <!-- PC版表格 -->
      <div class="table-container">
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
              <td>{{ server.AllowPasswordLogin ? t('ssh.enabled') : t('ssh.disabled') }}</td>
              <td>{{ server.AllowRootLogin ? t('ssh.enabled') : t('ssh.disabled') }}</td>
              <td>{{ server.AllowRootPasswordLogin ? t('ssh.enabled') : t('ssh.disabled') }}</td>
              <td>
                <div class="action-buttons">
                  <button class="btn-action" @click="handleEdit(server)" title="Edit">
                    <span class="material-icons">edit</span>
                  </button>
                  <button class="btn-action" @click="handleDelete(server.ID)" title="Delete">
                    <span class="material-icons">delete</span>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="servers.length === 0">
              <td colspan="7" class="no-data">No servers configured</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 手機版卡片 -->
      <div class="mobile-cards">
        <div v-if="servers.length === 0" class="no-data-mobile">
          No servers configured
        </div>
        <div class="table-card" v-else v-for="server in servers" :key="server.ID">
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
            <span class="card-value">{{ server.AllowPasswordLogin ? t('ssh.enabled') : t('ssh.disabled') }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">{{ t('ssh.rootLogin') }}</span>
            <span class="card-value">{{ server.AllowRootLogin ? t('ssh.enabled') : t('ssh.disabled') }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">{{ t('ssh.rootLoginWithPassword') }}</span>
            <span class="card-value">{{ server.AllowRootPasswordLogin ? t('ssh.enabled') : t('ssh.disabled') }}</span>
          </div>
          <div class="card-actions">
            <button class="btn-action" @click="handleEdit(server)" title="Edit">
              <span class="material-icons">edit</span>
            </button>
            <button class="btn-action" @click="handleDelete(server.ID)" title="Delete">
              <span class="material-icons">delete</span>
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

.section-title-sp {
  font-size: 1rem;
  color: var(--text-primary);
  padding: 0.5rem 0;
}

.server-list {
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

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 4px;
}

.btn-action:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
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

  .section-title-sp {
    padding: 0;
  }

  .server-list {
    padding: 1rem;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .loading-state {
    padding: 1rem;
  }

  .table-container {
    display: none;
  }

  .mobile-cards {
    display: block;
  }

  .card-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
  }
}
</style>