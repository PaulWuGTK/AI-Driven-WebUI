<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { SshServer } from '../../../types/ssh';
import { getSshServers, updateSshServers } from '../../../services/api/ssh';

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
    <div class="header">
      <h2 class="section-title">{{ t('ssh.serverManagement') }}</h2>
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
            <th>{{ t('ssh.port') }}</th>
            <th>{{ t('ssh.action') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="server in servers" :key="server.ID">
            <td>{{ server.ID }}</td>
            <td>{{ server.Interface }}</td>
            <td>{{ server.Status }}</td>
            <td>{{ server.Port }}</td>
            <td>
              <div class="action-buttons">
                <button class="icon-btn" @click="handleEdit(server)">
                  <span class="material-icons">edit</span>
                </button>
                <button class="icon-btn" @click="handleDelete(server.ID)">
                  <span class="material-icons">delete</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="server-edit">
      <h3>{{ editingServer?.ID ? t('ssh.editServer') : t('ssh.addServer') }}</h3>
      <form @submit.prevent="handleSave" v-if="editingServer">
        <div class="form-group">
          <label>{{ t('ssh.interface') }}</label>
          <select v-model="editingServer.Interface">
            <option v-for="iface in interfaces" :key="iface" :value="iface">
              {{ iface }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>{{ t('ssh.port') }}</label>
          <input 
            type="number" 
            v-model="editingServer.Port"
            min="1"
            max="65535"
            required
          >
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="editingServer.Enable"
              :true-value="1"
              :false-value="0"
            >
            {{ t('ssh.enable') }}
          </label>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="editingServer.AllowPasswordLogin"
              :true-value="1"
              :false-value="0"
            >
            {{ t('ssh.allowPasswordLogin') }}
          </label>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="editingServer.AllowRootLogin"
              :true-value="1"
              :false-value="0"
            >
            {{ t('ssh.allowRootLogin') }}
          </label>
        </div>

        <div class="form-group">
          <label>{{ t('ssh.maxAuthTries') }}</label>
          <input 
            type="number" 
            v-model="editingServer.MaxAuthTries"
            min="1"
            required
          >
        </div>

        <div class="form-group">
          <label>{{ t('ssh.idleTimeout') }}</label>
          <input 
            type="number" 
            v-model="editingServer.IdleTimeout"
            min="0"
            required
          >
        </div>

        <div class="button-group">
          <button type="button" class="btn btn-secondary" @click="isEditing = false">
            {{ t('common.cancel') }}
          </button>
          <button type="submit" class="btn btn-primary">
            {{ t('common.save') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.server-management {
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

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
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

.btn-secondary {
  background-color: #f0f0f0;
  color: #666;
}

.btn:hover {
  opacity: 0.9;
}
</style>