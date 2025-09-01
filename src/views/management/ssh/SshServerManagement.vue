<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { SshServer } from '../../../types/ssh';
import { getSshServers, updateSshServers } from '../../../services/api/ssh';
import SshServerEditForm from '../../../components/ssh/SshServerEditForm.vue';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

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
  <div class="server-management" :data-testid="qa('ssh-server-management-content')">
    <div class="header-row">
      <div class="section-title-sp" :data-testid="qa('ssh-server-management-title')">{{ t('ssh.serverManagement') }}</div>
      <button v-if="!isEditing" class="btn btn-primary" :data-testid="qa('ssh-server-management-add-button')" @click="handleAdd">
        <span class="material-icons">add</span>
        {{ t('ssh.addServer') }}
      </button>
    </div>

    <div v-if="loading" class="loading-state" :data-testid="qa('ssh-server-management-loading')">
      <div class="loading-spinner"></div>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="!isEditing" class="server-list" :data-testid="qa('ssh-server-management-list')">
      <!-- PC版表格 -->
      <div class="table-container" :data-testid="qa('ssh-server-management-table')">
        <table>
          <thead>
            <tr>
              <th :data-testid="qa('ssh-server-management-header-id')">{{ t('ssh.id') }}</th>
              <th :data-testid="qa('ssh-server-management-header-interface')">{{ t('ssh.interface') }}</th>
              <th :data-testid="qa('ssh-server-management-header-status')">{{ t('ssh.status') }}</th>
              <th :data-testid="qa('ssh-server-management-header-password-login')">{{ t('ssh.loginWithPassword') }}</th>
              <th :data-testid="qa('ssh-server-management-header-root-login')">{{ t('ssh.rootLogin') }}</th>
              <th :data-testid="qa('ssh-server-management-header-root-password-login')">{{ t('ssh.rootLoginWithPassword') }}</th>
              <th :data-testid="qa('ssh-server-management-header-action')">{{ t('ssh.action') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(server, index) in servers" :key="server.ID" :data-testid="qa(`ssh-server-management-row-${index}`)">
              <td :data-testid="qa(`ssh-server-management-id-${index}`)">{{ server.ID }}</td>
              <td :data-testid="qa(`ssh-server-management-interface-${index}`)">{{ server.Interface }}</td>
              <td :data-testid="qa(`ssh-server-management-status-${index}`)">{{ server.Status }}</td>
              <td :data-testid="qa(`ssh-server-management-password-login-${index}`)">{{ server.AllowPasswordLogin ? t('ssh.enabled') : t('ssh.disabled') }}</td>
              <td :data-testid="qa(`ssh-server-management-root-login-${index}`)">{{ server.AllowRootLogin ? t('ssh.enabled') : t('ssh.disabled') }}</td>
              <td :data-testid="qa(`ssh-server-management-root-password-login-${index}`)">{{ server.AllowRootPasswordLogin ? t('ssh.enabled') : t('ssh.disabled') }}</td>
              <td>
                <div class="action-buttons">
                  <button class="btn-action" :data-testid="qa(`ssh-server-management-edit-${index}`)" @click="handleEdit(server)" title="Edit">
                    <span class="material-icons">edit</span>
                  </button>
                  <button class="btn-action" :data-testid="qa(`ssh-server-management-delete-${index}`)" @click="handleDelete(server.ID)" title="Delete">
                    <span class="material-icons">delete</span>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="servers.length === 0" :data-testid="qa('ssh-server-management-no-data-row')">
              <td colspan="7" class="no-data" :data-testid="qa('ssh-server-management-no-data')">No servers configured</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 手機版卡片 -->
      <div class="mobile-cards" :data-testid="qa('ssh-server-management-mobile')">
        <div v-if="servers.length === 0" class="no-data-mobile" :data-testid="qa('ssh-server-management-no-data-mobile')">
          No servers configured
        </div>
        <div class="table-card" v-else v-for="(server, index) in servers" :key="server.ID" :data-testid="qa(`ssh-server-management-card-${index}`)">
          <div class="card-row">
            <span class="card-label" :data-testid="qa(`ssh-server-management-card-id-label-${index}`)">{{ t('ssh.id') }}</span>
            <span class="card-value" :data-testid="qa(`ssh-server-management-card-id-value-${index}`)">{{ server.ID }}</span>
          </div>
          <div class="card-row">
            <span class="card-label" :data-testid="qa(`ssh-server-management-card-interface-label-${index}`)">{{ t('ssh.interface') }}</span>
            <span class="card-value" :data-testid="qa(`ssh-server-management-card-interface-value-${index}`)">{{ server.Interface }}</span>
          </div>
          <div class="card-row">
            <span class="card-label" :data-testid="qa(`ssh-server-management-card-status-label-${index}`)">{{ t('ssh.status') }}</span>
            <span class="card-value" :data-testid="qa(`ssh-server-management-card-status-value-${index}`)">{{ server.Status }}</span>
          </div>
          <div class="card-row">
            <span class="card-label" :data-testid="qa(`ssh-server-management-card-password-login-label-${index}`)">{{ t('ssh.loginWithPassword') }}</span>
            <span class="card-value" :data-testid="qa(`ssh-server-management-card-password-login-value-${index}`)">{{ server.AllowPasswordLogin ? t('ssh.enabled') : t('ssh.disabled') }}</span>
          </div>
          <div class="card-row">
            <span class="card-label" :data-testid="qa(`ssh-server-management-card-root-login-label-${index}`)">{{ t('ssh.rootLogin') }}</span>
            <span class="card-value" :data-testid="qa(`ssh-server-management-card-root-login-value-${index}`)">{{ server.AllowRootLogin ? t('ssh.enabled') : t('ssh.disabled') }}</span>
          </div>
          <div class="card-row">
            <span class="card-label" :data-testid="qa(`ssh-server-management-card-root-password-login-label-${index}`)">{{ t('ssh.rootLoginWithPassword') }}</span>
            <span class="card-value" :data-testid="qa(`ssh-server-management-card-root-password-login-value-${index}`)">{{ server.AllowRootPasswordLogin ? t('ssh.enabled') : t('ssh.disabled') }}</span>
          </div>
          <div class="card-actions">
            <button class="btn-action" :data-testid="qa(`ssh-server-management-card-edit-${index}`)" @click="handleEdit(server)" title="Edit">
              <span class="material-icons">edit</span>
            </button>
            <button class="btn-action" :data-testid="qa(`ssh-server-management-card-delete-${index}`)" @click="handleDelete(server.ID)" title="Delete">
              <span class="material-icons">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <SshServerEditForm
      v-else
      v-if="editingServer"
      :data-testid="qa('ssh-server-management-edit-form')"
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