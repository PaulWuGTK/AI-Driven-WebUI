<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ActionButtons, BaseSecretInput, BaseTable, SectionCard } from '../../../components/common';
import ConfirmationDialog from '../../../components/ConfirmationDialog.vue';
import { useQA } from '../../../utils/qa';
import { getAccountChtSettings, updateAccountCht } from '../../../services/api/accountCht';
import type { ManagementAccountChtResponse, ManagementAccountChtUserType } from '../../../types/accountCht';

const { t } = useI18n();
const { qa } = useQA();

type PanelMode = 'none' | 'password' | 'add';

const accountData = ref<ManagementAccountChtResponse | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const success = ref(false);
const panelMode = ref<PanelMode>('none');
const showDeleteDialog = ref(false);
const deleteTargetUsername = ref('');

const selectedUsername = ref('');
const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const addUsername = ref('');
const addPassword = ref('');
const addConfirmPassword = ref('');
const addUserType = ref<ManagementAccountChtUserType>('normal');

const users = computed(() => accountData.value?.ManagementAccountCht.Users ?? []);
const currentUser = computed(() => accountData.value?.ManagementAccountCht.CurrentUser ?? null);
const isSuper = computed(() => currentUser.value?.UserType === 'super');
const maxLength = computed(() => accountData.value?.ManagementAccountCht.MaxLength ?? 15);
const noSpace = computed(() => accountData.value?.ManagementAccountCht.NoSpace ?? true);
const requiresOldPassword = computed(() => true);
const showPasswordPanel = computed(() => panelMode.value === 'password');
const showAddPanel = computed(() => panelMode.value === 'add');
const deleteConfirmMessage = computed(() =>
  t('account.confirmDeleteUser', { username: deleteTargetUsername.value || '' })
);
const userColumns = computed(() => [
  {
    key: 'Username',
    label: t('login.username'),
    headerDataTestid: qa('account-cht-header-username')
  },
  {
    key: 'RoleAlias',
    label: t('account.role'),
    headerDataTestid: qa('account-cht-header-role')
  },
  {
    key: 'Enable',
    label: t('common.enabled'),
    headerDataTestid: qa('account-cht-header-enable')
  },
  {
    key: 'actions',
    label: t('common.action'),
    align: 'center' as const,
    headerDataTestid: qa('account-cht-header-action')
  }
]);

const hideSuccessLater = () => {
  success.value = true;
  setTimeout(() => {
    success.value = false;
  }, 3000);
};

const clearPasswordForm = () => {
  oldPassword.value = '';
  newPassword.value = '';
  confirmPassword.value = '';
  error.value = null;
};

const clearAddForm = () => {
  addUsername.value = '';
  addPassword.value = '';
  addConfirmPassword.value = '';
  addUserType.value = 'normal';
  error.value = null;
};

const closePanel = () => {
  panelMode.value = 'none';
  clearPasswordForm();
  clearAddForm();
};

const closeDeleteDialog = () => {
  showDeleteDialog.value = false;
  deleteTargetUsername.value = '';
};

const fetchAccountSettings = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await getAccountChtSettings();
    accountData.value = response;

    if (!selectedUsername.value && response.ManagementAccountCht.CurrentUser?.Username) {
      selectedUsername.value = response.ManagementAccountCht.CurrentUser.Username;
    }
  } catch (err) {
    console.error('Error fetching CHT account settings:', err);
    error.value = t('account.errorFetchSettings');
  } finally {
    loading.value = false;
  }
};

const validatePasswordForm = (): string | null => {
  if (!selectedUsername.value) {
    return t('login.usernameRequired');
  }

  if (requiresOldPassword.value && !oldPassword.value) {
    return t('account.errorAllFieldsRequired');
  }

  if (!newPassword.value || !confirmPassword.value) {
    return t('account.errorAllFieldsRequired');
  }

  if (newPassword.value !== confirmPassword.value) {
    return t('account.errorPasswordMismatch');
  }

  if (newPassword.value.length > maxLength.value) {
    return t('account.errorPasswordLength', { maxLength: maxLength.value });
  }

  if (
    noSpace.value &&
    (newPassword.value.includes(' ') || (requiresOldPassword.value && oldPassword.value.includes(' ')))
  ) {
    return t('account.errorPasswordSpace');
  }

  return null;
};

const validateAddForm = (): string | null => {
  if (!addUsername.value || !addPassword.value || !addConfirmPassword.value) {
    return t('account.errorAllFieldsRequired');
  }

  if (addUsername.value.includes(' ')) {
    return t('account.errorPasswordSpace');
  }

  if (addPassword.value !== addConfirmPassword.value) {
    return t('account.errorPasswordMismatch');
  }

  if (addPassword.value.length > maxLength.value) {
    return t('account.errorPasswordLength', { maxLength: maxLength.value });
  }

  if (noSpace.value && addPassword.value.includes(' ')) {
    return t('account.errorPasswordSpace');
  }

  return null;
};

const openPasswordPanel = (username: string) => {
  selectedUsername.value = username;
  clearPasswordForm();
  panelMode.value = 'password';
};

const openAddPanel = () => {
  if (!isSuper.value) {
    return;
  }
  clearAddForm();
  panelMode.value = 'add';
};

const handlePasswordCancel = () => {
  closePanel();
};

const handlePasswordApply = async () => {
  error.value = null;

  const validationError = validatePasswordForm();
  if (validationError) {
    error.value = validationError;
    return;
  }

  loading.value = true;
  try {
    const response = await updateAccountCht({
      ManagementAccountCht: {
        Action: 'SetPassword',
        TargetUsername: selectedUsername.value,
        OldPassword: requiresOldPassword.value ? oldPassword.value : '',
        NewPassword: newPassword.value
      }
    });

    if (response.ManagementAccountCht.result === 'Success') {
      hideSuccessLater();
      closePanel();
      await fetchAccountSettings();
    } else {
      error.value = response.ManagementAccountCht.reason || t('account.errorUpdateFailed');
    }
  } catch (err) {
    console.error('Error updating CHT account password:', err);
    error.value = t('account.errorUpdateFailed');
  } finally {
    loading.value = false;
  }
};

const handleAddApply = async () => {
  if (!isSuper.value) {
    return;
  }

  error.value = null;
  const validationError = validateAddForm();
  if (validationError) {
    error.value = validationError;
    return;
  }

  loading.value = true;
  try {
    const response = await updateAccountCht({
      ManagementAccountCht: {
        Action: 'AddUser',
        Username: addUsername.value,
        NewPassword: addPassword.value,
        UserType: addUserType.value,
        Enable: true
      }
    });

    if (response.ManagementAccountCht.result === 'Success') {
      hideSuccessLater();
      closePanel();
      await fetchAccountSettings();
    } else {
      error.value = response.ManagementAccountCht.reason || t('account.errorUpdateFailed');
    }
  } catch (err) {
    console.error('Error adding CHT account user:', err);
    error.value = t('account.errorUpdateFailed');
  } finally {
    loading.value = false;
  }
};

const handleDelete = (username: string) => {
  if (!isSuper.value) {
    return;
  }
  deleteTargetUsername.value = username;
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  if (!deleteTargetUsername.value) {
    closeDeleteDialog();
    return;
  }

  const username = deleteTargetUsername.value;
  loading.value = true;
  error.value = null;
  try {
    const response = await updateAccountCht({
      ManagementAccountCht: {
        Action: 'DeleteUser',
        TargetUsername: username
      }
    });

    if (response.ManagementAccountCht.result === 'Success') {
      hideSuccessLater();
      if (selectedUsername.value === username) {
        closePanel();
      }
      await fetchAccountSettings();
    } else {
      error.value = response.ManagementAccountCht.reason || t('account.errorUpdateFailed');
    }
  } catch (err) {
    console.error('Error deleting CHT account user:', err);
    error.value = t('account.errorUpdateFailed');
  } finally {
    loading.value = false;
    closeDeleteDialog();
  }
};

const rowDataTestid = (row: { Username: string }, _index: number, mobile: boolean) =>
  qa(mobile ? `account-cht-user-card-${row.Username}` : `account-cht-user-${row.Username}`) || '';

onMounted(fetchAccountSettings);
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('account-cht-title')">{{ t('account.title') }}</h1>

    <div class="status-content" :data-testid="qa('account-cht-content')">
      <div v-if="loading && !accountData" class="loading-state" :data-testid="qa('account-cht-loading')">
        <div class="loading-spinner"></div>
        <span>{{ t('common.loading') }}</span>
      </div>

      <template v-else>
        <SectionCard
          v-if="panelMode === 'none'"
          :title="t('account.users')"
          header-mode="row"
          :header-data-testid="qa('account-cht-users-panel-header')"
          :title-data-testid="qa('account-cht-users-panel-title')"
          :content-data-testid="qa('account-cht-users-panel')"
        >
          <template #actions>
            <button
              v-if="isSuper"
              class="btn btn-primary add-user-btn"
              :data-testid="qa('account-cht-add-user-button')"
              :disabled="loading"
              @click="openAddPanel"
            >
              <span class="material-icons">add</span>
              <span>{{ t('common.add') }}</span>
            </button>
          </template>

          <BaseTable
            :columns="userColumns"
            :data="users"
            row-key="UserPath"
            :table-data-testid="qa('account-cht-users-table')"
            :mobile-data-testid="qa('account-cht-users-mobile-cards')"
            :row-data-testid="rowDataTestid"
          >
            <template #cell-RoleAlias="{ row }">
              {{ row.RoleAlias || row.UserType }}
            </template>

            <template #cell-Enable="{ row }">
              {{ row.Enable ? t('common.yes') : t('common.no') }}
            </template>

            <template #cell-actions="{ row, mobile }">
              <div class="action-buttons" :data-testid="qa(mobile ? `account-cht-card-actions-${row.Username}` : `account-cht-actions-${row.Username}`)">
                <button
                  class="btn-action"
                  :data-testid="qa(mobile ? `account-cht-card-view-${row.Username}` : `account-cht-view-${row.Username}`)"
                  :disabled="loading"
                  :title="t('common.edit')"
                  @click="openPasswordPanel(row.Username)"
                >
                  <span class="material-icons">edit</span>
                </button>
                <button
                  v-if="isSuper && row.Deletable"
                  class="btn-action"
                  :data-testid="qa(mobile ? `account-cht-card-delete-${row.Username}` : `account-cht-delete-${row.Username}`)"
                  :disabled="loading"
                  :title="t('common.delete')"
                  @click="handleDelete(row.Username)"
                >
                  <span class="material-icons">delete</span>
                </button>
              </div>
            </template>
          </BaseTable>
        </SectionCard>

        <div v-else-if="showPasswordPanel" class="panel-section" :data-testid="qa('account-cht-password-panel')">
          <div class="card-content">
            <h3 class="section-title">{{ t('account.passwordSectionTitle') }}</h3>

            <div class="info-box">
              <p>{{ t('account.infoMessage', { maxLength }) }}</p>
              <p v-if="noSpace" class="note">{{ t('account.noteMessage') }}</p>
            </div>

            <div v-if="error" class="error-message" :data-testid="qa('account-cht-error')">
              {{ error }}
            </div>

            <div class="form-group">
              <label :data-testid="qa('account-cht-target-user-label')">{{ t('login.username') }}</label>
              <input :value="selectedUsername" class="input-select" disabled />
            </div>

            <div v-if="requiresOldPassword" class="form-group">
              <label :data-testid="qa('account-cht-old-password-label')">{{ t('account.oldPassword') }}</label>
              <BaseSecretInput
                v-model="oldPassword"
                :input-data-testid="qa('account-cht-old-password-input')"
                :toggle-data-testid="qa('account-cht-old-password-toggle')"
                :placeholder="t('account.passwordPlaceholder')"
                :max-length="maxLength"
                :disabled="loading"
              />
            </div>

            <div class="form-group">
              <label :data-testid="qa('account-cht-new-password-label')">{{ t('account.newPassword') }}</label>
              <BaseSecretInput
                v-model="newPassword"
                :input-data-testid="qa('account-cht-new-password-input')"
                :toggle-data-testid="qa('account-cht-new-password-toggle')"
                :placeholder="t('account.passwordPlaceholder')"
                :max-length="maxLength"
                :disabled="loading"
              />
            </div>

            <div class="form-group">
              <label :data-testid="qa('account-cht-confirm-password-label')">{{ t('account.confirmPassword') }}</label>
              <BaseSecretInput
                v-model="confirmPassword"
                :input-data-testid="qa('account-cht-confirm-password-input')"
                :toggle-data-testid="qa('account-cht-confirm-password-toggle')"
                :placeholder="t('account.passwordPlaceholder')"
                :max-length="maxLength"
                :disabled="loading"
              />
            </div>

            <div class="button-group">
              <ActionButtons
                :cancel-disabled="loading"
                :apply-disabled="loading"
                :cancel-data-testid="qa('account-cht-cancel-button')"
                :apply-data-testid="qa('account-cht-apply-button')"
                @cancel="handlePasswordCancel"
                @apply="handlePasswordApply"
              />
            </div>
          </div>
        </div>

        <div v-else-if="showAddPanel" class="panel-section" :data-testid="qa('account-cht-add-panel')">
          <div class="card-content">
            <h3 class="section-title">{{ t('account.addUserSectionTitle') }}</h3>

            <div v-if="error" class="error-message" :data-testid="qa('account-cht-add-error')">
              {{ error }}
            </div>

            <div class="form-group">
              <label :data-testid="qa('account-cht-add-username-label')">{{ t('login.username') }}</label>
              <input
                v-model="addUsername"
                class="input-select"
                :data-testid="qa('account-cht-add-username-input')"
                :placeholder="t('login.usernamePlaceholder')"
                :disabled="loading"
              />
            </div>

            <div class="form-group">
              <label :data-testid="qa('account-cht-add-role-label')">{{ t('account.role') }}</label>
              <select
                v-model="addUserType"
                class="input-select"
                :data-testid="qa('account-cht-add-role-select')"
                :disabled="loading"
              >
                <option value="normal">guest-role</option>
                <option value="super">admin-role</option>
              </select>
            </div>

            <div class="form-group">
              <label :data-testid="qa('account-cht-add-password-label')">{{ t('account.newPassword') }}</label>
              <BaseSecretInput
                v-model="addPassword"
                :input-data-testid="qa('account-cht-add-password-input')"
                :toggle-data-testid="qa('account-cht-add-password-toggle')"
                :placeholder="t('account.passwordPlaceholder')"
                :max-length="maxLength"
                :disabled="loading"
              />
            </div>

            <div class="form-group">
              <label :data-testid="qa('account-cht-add-confirm-password-label')">{{ t('account.confirmPassword') }}</label>
              <BaseSecretInput
                v-model="addConfirmPassword"
                :input-data-testid="qa('account-cht-add-confirm-password-input')"
                :toggle-data-testid="qa('account-cht-add-confirm-password-toggle')"
                :placeholder="t('account.passwordPlaceholder')"
                :max-length="maxLength"
                :disabled="loading"
              />
            </div>

            <div class="button-group">
              <ActionButtons
                :cancel-disabled="loading"
                :apply-disabled="loading"
                :cancel-data-testid="qa('account-cht-add-cancel-button')"
                :apply-data-testid="qa('account-cht-add-apply-button')"
                @cancel="closePanel"
                @apply="handleAddApply"
              />
            </div>
          </div>
        </div>
      </template>

      <div v-if="success" class="success-message" :data-testid="qa('account-cht-success')">
        {{ t('account.successUpdate') }}
      </div>

      <ConfirmationDialog
        :is-open="showDeleteDialog"
        :title="t('common.delete')"
        :message="deleteConfirmMessage"
        :data-testid="qa('account-cht-delete-confirm-dialog')"
        @confirm="confirmDelete"
        @cancel="closeDeleteDialog"
      />
    </div>
  </div>
</template>

<style scoped>
.section-title {
  margin: 0;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  min-width: 4.5rem;
}

:deep(.table-container th:last-child),
:deep(.table-container td:last-child) {
  width: 7rem;
  text-align: center;
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border: none;
  background: none;
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: pointer;
}

.btn-action .material-icons {
  font-size: 24px;
  line-height: 1;
}

.btn-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-action:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.add-user-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.add-user-btn .material-icons {
  font-size: 20px;
  line-height: 1;
}

.input-select {
  width: 100%;
  height: 42px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0 12px;
  background: #fff;
}

.input-select:disabled {
  background: #f3f4f6;
  color: #6b7280;
  border-color: #d1d5db;
  cursor: not-allowed;
}

.info-box {
  background-color: #f5f5f5;
  border-left: 4px solid #2196f3;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.info-box p {
  margin: 0.5rem 0;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.info-box .note {
  color: #666;
  font-style: italic;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.error-message {
  background-color: #fff3cd;
  border-left: 4px solid #dc3545;
  padding: 1rem;
  margin-bottom: 1.5rem;
  color: #856404;
  font-size: 0.9rem;
}

.success-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #4caf50;
  color: white;
  padding: 1rem 2rem;
  border-radius: 4px;
  animation: fadeInOut 3s ease-in-out;
  z-index: 100;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  background-color: white;
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
}

@media (max-width: 768px) {
  :deep(.header-row) {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 1rem !important;
    flex-wrap: nowrap !important;
  }

  :deep(.section-title-sp) {
    flex: 1;
    min-width: 0;
    text-align: left;
  }

  :deep(.header-actions) {
    width: auto !important;
    flex-shrink: 0;
    display: flex !important;
    justify-content: flex-end !important;
    align-items: center !important;
  }

  :deep(.header-actions .btn) {
    width: auto;
  }
}
</style>
