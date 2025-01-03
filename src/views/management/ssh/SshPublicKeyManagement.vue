<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { SshAuthorizedKey } from '../../../types/ssh';
import { getSshAuthorizedKeys, updateSshAuthorizedKeys } from '../../../services/api/ssh';
import { extractKeyComment, isValidSshKey } from '../../../utils/sshUtils';
import SshPublicKeyViewer from '../../../components/ssh/SshPublicKeyViewer.vue';

const { t } = useI18n();
const keys = ref<SshAuthorizedKey[]>([]);
const loading = ref(true);
const showKeyModal = ref(false);
const selectedKey = ref<SshAuthorizedKey | null>(null);
const newKey = ref('');
const error = ref('');

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

const handleCloseViewer = () => {
  showKeyModal.value = false;
  selectedKey.value = null;
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
  const key = newKey.value.trim();
  if (!key) return;

  if (!isValidSshKey(key)) {
    error.value = 'Invalid SSH key format';
    return;
  }

  try {
    const newKeyObj: SshAuthorizedKey = { Key: key };
    await updateSshAuthorizedKeys([...keys.value, newKeyObj]);
    await fetchKeys();
    newKey.value = '';
    error.value = '';
  } catch (error) {
    console.error('Error adding SSH key:', error);
  }
};

onMounted(fetchKeys);
</script>

<template>
  <div class="key-management">
    <div class="header">
      <div class="ssh-title">{{ t('ssh.publicKeyManagement') }}</div>
    </div>

    <div class="key-list">
      <table>
        <thead>
          <tr>
            <th>{{ t('ssh.comment') }}</th>
            <th>{{ t('ssh.publicKey') }}</th>
            <th>{{ t('ssh.select') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="key in keys" :key="key.Key">
            <td>{{ extractKeyComment(key.Key) }}</td>
            <td>
              <button class="btn btn-view" @click="handleViewKey(key)">
                {{ t('ssh.clickToView') }}
              </button>
            </td>
            <td>
              <button class="icon-btn" @click="handleDelete(key)" title="Delete">
                <span class="material-icons">delete</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="add-key-section">
      <div class="header">
      <div class="ssh-title">{{ t('ssh.newSshKey') }}</div>
      </div>
      <div class="form-group">
        <textarea
          v-model="newKey"
          :placeholder="t('ssh.enterNewSshKey')"
          rows="4"
        ></textarea>
        <div v-if="error" class="error-message">{{ error }}</div>
      </div>
      <div class="button-group">
        <button class="btn btn-secondary" @click="newKey = ''">
          {{ t('common.cancel') }}
        </button>
        <button class="btn btn-primary" @click="handleAddKey">
          {{ t('common.create') }}
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
              <div class="value">{{ selectedKey ? extractKeyComment(selectedKey.Key) : '' }}</div>
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

  <SshPublicKeyViewer
    v-if="showKeyModal && selectedKey"
    :public-key="selectedKey"
    :on-close="handleCloseViewer"
  />
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
  
.ssh-title {
  font-size: 1rem;
  color: #333;
  text-align: left;
  background-color: #f8f8f8;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 2rem;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f8f8;
}

.key-list {
  padding: 1.5rem;
}

.btn-view {
  background-color: #0070BB;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: #666;
}

.add-key-section {
  border-top: 1px solid #e0e0e0;
}

.form-group {
  padding: 1rem;
}

textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  font-family: monospace;
}

.error-message {
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 0.5rem;
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
  padding: 1rem;
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