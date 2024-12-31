<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { SshAuthorizedKey } from '../../../types/ssh';
import { getSshAuthorizedKeys, updateSshAuthorizedKeys } from '../../../services/api/ssh';

const { t } = useI18n();
const keys = ref<SshAuthorizedKey[]>([]);
const loading = ref(true);
const showKeyModal = ref(false);
const selectedKey = ref<SshAuthorizedKey | null>(null);
const newKey = ref('');

const fetchKeys = async () => {
  try {
    const response = await getSshAuthorizedKeys();
    keys.value = response.SshAuthorizedKey;
  } catch (error) {
    console.error('Error fetching SSH keys:', error);
  } finally {
    loading.value = false;
  }
};

const handleViewKey = (key: SshAuthorizedKey) => {
  selectedKey.value = key;
  showKeyModal.value = true;
};

const handleDelete = async (key: SshAuthorizedKey) => {
  if (!confirm(t('ssh.confirmDeleteKey'))) return;

  try {
    const updatedKeys = keys.value.filter(k => k.Key !== key.Key);
    await updateSshAuthorizedKeys(updatedKeys);
    await fetchKeys();
  } catch (error) {
    console.error('Error deleting SSH key:', error);
  }
};

const handleAddKey = async () => {
  if (!newKey.value.trim()) return;

  try {
    const keyParts = newKey.value.trim().split(' ');
    const comment = keyParts[2] || `key-${Date.now()}`;
    
    const newKeyObj: SshAuthorizedKey = {
      Key: newKey.value.trim(),
      Comment: comment
    };

    await updateSshAuthorizedKeys([...keys.value, newKeyObj]);
    await fetchKeys();
    newKey.value = '';
  } catch (error) {
    console.error('Error adding SSH key:', error);
  }
};

onMounted(fetchKeys);
</script>

<template>
  <div class="key-management">
    <div class="header">
      <h2 class="section-title">{{ t('ssh.publicKeyManagement') }}</h2>
    </div>

    <div class="key-list">
      <table>
        <thead>
          <tr>
            <th>{{ t('ssh.comment') }}</th>
            <th>{{ t('ssh.action') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="key in keys" :key="key.Comment">
            <td>{{ key.Comment }}</td>
            <td>
              <div class="action-buttons">
                <button class="btn btn-view" @click="handleViewKey(key)">
                  {{ t('ssh.viewKey') }}
                </button>
                <button class="icon-btn" @click="handleDelete(key)">
                  <span class="material-icons">delete</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="add-key-section">
      <h3>{{ t('ssh.addNewKey') }}</h3>
      <div class="form-group">
        <textarea
          v-model="newKey"
          :placeholder="t('ssh.enterPublicKey')"
          rows="4"
        ></textarea>
      </div>
      <div class="button-group">
        <button class="btn btn-primary" @click="handleAddKey">
          {{ t('ssh.addKey') }}
        </button>
      </div>
    </div>

    <!-- Key View Modal -->
    <div v-if="showKeyModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ t('ssh.publicKey') }}</h3>
          <button class="close-btn" @click="showKeyModal = false">×</button>
        </div>
        <div class="modal-content">
          <div class="key-details">
            <div class="form-group">
              <label>{{ t('ssh.comment') }}</label>
              <div class="value">{{ selectedKey?.Comment }}</div>
            </div>
            <div class="form-group">
              <label>{{ t('ssh.key') }}</label>
              <div class="value key-text">{{ selectedKey?.Key }}</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showKeyModal = false">
            {{ t('common.close') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.key-management {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.section-title {
  font-size: 1rem;
  color: #333;
  margin: 0;
}

.key-list {
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

.action-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-view {
  background-color: #0070BB;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: #666;
}

.add-key-section {
  padding: 1.5rem;
  border-top: 1px solid #e0e0e0;
}

.form-group {
  margin-bottom: 1.5rem;
}

textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  font-family: monospace;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  border-radius: 4px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-content {
  padding: 1.5rem;
  overflow-y: auto;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.key-details .value {
  padding: 0.5rem;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.key-text {
  font-family: monospace;
  word-break: break-all;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
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