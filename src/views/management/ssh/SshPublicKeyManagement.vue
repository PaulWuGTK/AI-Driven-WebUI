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
    <div class="header_btn">
      <div class="ssh-title">{{ t('ssh.publicKeyManagement') }}</div>
    </div>

    <div class="key-list">
      <!-- PC版表格 -->
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>{{ t('ssh.comment') }}</th>
              <th>{{ t('ssh.algorithm') }}</th>
              <th>{{ t('ssh.publicKey') }}</th>
              <th>{{ t('ssh.action') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="key in keys" :key="key.Key">
              <td>{{ extractKeyComment(key.Key) }}</td>
              <td>{{ key.Key.split(' ')[0] }}</td>
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

      <!-- 手機版卡片 -->
      <div class="mobile-cards">
        <div class="table-card" v-for="key in keys" :key="key.Key">
          <div class="card-row">
            <span class="card-label">{{ t('ssh.comment') }}</span>
            <span class="card-value">{{ extractKeyComment(key.Key) }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">{{ t('ssh.algorithm') }}</span>
            <span class="card-value">{{ key.Key.split(' ')[0] }}</span>
          </div>
          <div class="card-actions">
            <button class="btn btn-primary" @click="handleViewKey(key)">
              {{ t('ssh.viewKey') }}
            </button>
            <button class="btn btn-danger" @click="handleDelete(key)">
              {{ t('common.delete') }}
            </button>
          </div>
        </div>
      </div>
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

    <SshPublicKeyViewer
      v-if="showKeyModal && selectedKey"
      :public-key="selectedKey"
      :on-close="handleCloseViewer"
    />
  </div>
</template>

<style scoped>
.key-management {
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

.key-list {
  padding: 1.5rem;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
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

.add-key-section {
  border-top: 1px solid #e0e0e0;
}

.header {
  padding: 0.5rem 2rem;
  background-color: #f8f8f8;
  border-bottom: 1px solid #e0e0e0;
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
  resize: vertical;
}

.error-message {
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 0.5rem;
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
  .key-list {
    padding: 1rem;
  }

  .table-wrapper {
    display: none;
  }

  .mobile-cards {
    display: block;
  }

  .form-group {
    padding: 1rem;
  }

  .button-group {
    flex-direction: column;
  }

  .button-group .btn {
    width: 100%;
  }

  textarea {
    min-height: 120px;
  }
}
</style>