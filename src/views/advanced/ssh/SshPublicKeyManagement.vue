<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { SshAuthorizedKey } from '../../../types/ssh';
import { getSshAuthorizedKeys, updateSshAuthorizedKeys } from '../../../services/api/ssh';
import { extractKeyComment, isValidSshKey } from '../../../utils/sshUtils';
import SshPublicKeyViewer from '../../../components/ssh/SshPublicKeyViewer.vue';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const keys = ref<SshAuthorizedKey[]>([]);
const loading = ref(true);
const showKeyModal = ref(false);
const selectedKey = ref<SshAuthorizedKey | null>(null);
const newKey = ref('');
const error = ref('');

const fetchKeys = async () => {
  loading.value = true;
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
  <div class="key-management" :data-testid="qa('ssh-key-management-content')">
    <div class="header-row">
      <div class="section-title-sp" :data-testid="qa('ssh-key-management-title')">{{ t('ssh.publicKeyManagement') }}</div>
    </div>

    <div v-if="loading" class="loading-state" :data-testid="qa('ssh-key-management-loading')">
      <div class="loading-spinner"></div>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else class="key-list" :data-testid="qa('ssh-key-management-list')">
      <!-- PC版表格 -->
      <div class="table-container" :data-testid="qa('ssh-key-management-table')">
        <table>
          <thead>
            <tr>
              <th :data-testid="qa('ssh-key-management-header-comment')">{{ t('ssh.comment') }}</th>
              <th :data-testid="qa('ssh-key-management-header-algorithm')">{{ t('ssh.algorithm') }}</th>
              <th :data-testid="qa('ssh-key-management-header-public-key')">{{ t('ssh.publicKey') }}</th>
              <th :data-testid="qa('ssh-key-management-header-action')">{{ t('ssh.action') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(key, index) in keys" :key="key.Key" :data-testid="qa(`ssh-key-management-row-${index}`)">
              <td :data-testid="qa(`ssh-key-management-comment-${index}`)">{{ extractKeyComment(key.Key) }}</td>
              <td :data-testid="qa(`ssh-key-management-algorithm-${index}`)">{{ key.Key.split(' ')[0] }}</td>
              <td>
                <button class="btn btn-view" :data-testid="qa(`ssh-key-management-view-${index}`)" @click="handleViewKey(key)">
                  {{ t('ssh.clickToView') }}
                </button>
              </td>
              <td>
                <button class="btn-action" :data-testid="qa(`ssh-key-management-delete-${index}`)" @click="handleDelete(key)" title="Delete">
                  <span class="material-icons">delete</span>
                </button>
              </td>
            </tr>
            <tr v-if="keys.length === 0" :data-testid="qa('ssh-key-management-no-data-row')">
              <td colspan="4" class="no-data" :data-testid="qa('ssh-key-management-no-data')">No public keys added</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 手機版卡片 -->
      <div class="mobile-cards" :data-testid="qa('ssh-key-management-mobile')">
        <div v-if="keys.length === 0" class="no-data-mobile" :data-testid="qa('ssh-key-management-no-data-mobile')">
          No public keys added
        </div>
        <div class="table-card" v-else v-for="(key, index) in keys" :key="key.Key" :data-testid="qa(`ssh-key-management-card-${index}`)">
          <div class="card-row">
            <span class="card-label" :data-testid="qa(`ssh-key-management-card-comment-label-${index}`)">{{ t('ssh.comment') }}</span>
            <span class="card-value" :data-testid="qa(`ssh-key-management-card-comment-value-${index}`)">{{ extractKeyComment(key.Key) }}</span>
          </div>
          <div class="card-row">
            <span class="card-label" :data-testid="qa(`ssh-key-management-card-algorithm-label-${index}`)">{{ t('ssh.algorithm') }}</span>
            <span class="card-value" :data-testid="qa(`ssh-key-management-card-algorithm-value-${index}`)">{{ key.Key.split(' ')[0] }}</span>
          </div>
          <div class="card-actions">
            <button class="btn btn-view" :data-testid="qa(`ssh-key-management-card-view-${index}`)" @click="handleViewKey(key)">
              {{ t('ssh.clickToView') }}
            </button>
            <button class="btn-action" :data-testid="qa(`ssh-key-management-card-delete-${index}`)" @click="handleDelete(key)" title="Delete">
              <span class="material-icons">delete</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Add New Key Section -->
      <div class="add-key-section" :data-testid="qa('ssh-key-management-add-section')">
        <div class="section-title" :data-testid="qa('ssh-key-management-add-title')">{{ t('ssh.newSshKey') }}</div>
        <div class="form-group">
          <textarea
            :data-testid="qa('ssh-key-management-add-textarea')"
            v-model="newKey"
            :placeholder="t('ssh.enterNewSshKey')"
            rows="4"
          ></textarea>
          <div v-if="error" class="error-message" :data-testid="qa('ssh-key-management-add-error')">{{ error }}</div>
        </div>
        <div class="button-group">
          <button class="btn btn-secondary" :data-testid="qa('ssh-key-management-add-cancel')" @click="newKey = ''">
            {{ t('common.cancel') }}
          </button>
          <button class="btn btn-primary" :data-testid="qa('ssh-key-management-add-create')" @click="handleAddKey">
            {{ t('common.create') }}
          </button>
        </div>
      </div>
    </div>

    <SshPublicKeyViewer
      v-if="showKeyModal && selectedKey"
      :data-testid="qa('ssh-key-management-viewer')"
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

.section-title-sp {
  font-size: 1rem;
  color: var(--text-primary);
  padding: 0.5rem 0;
}

.key-list {
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

.btn-view {
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
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

.add-key-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.section-title {
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9rem;
  resize: vertical;
}

.error-message {
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
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
  .header-row {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .section-title-sp {
    padding: 0;
  }

  .key-list {
    padding: 1rem;
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