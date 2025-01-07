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
.server-list {
  padding: 1.5rem;
}
.server-management {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
  
.ssh-title {
  font-size: 1rem;
  color: #333;
  text-align: left;
  background-color: #f8f8f8;
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

.server-edit {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
}

input, select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
}

.btn-edit,
.btn-delete {
  display: none;
}
</style>