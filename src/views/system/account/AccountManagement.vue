<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { getAccountSettings, updateAccountPassword } from '../../../services/api/account';
import type { ManagementAccountResponse } from '../../../types/account';
import { ActionButtons, BaseSecretInput } from '../../../components/common';
import { useQA } from '../../../utils/qa';

const { qa } = useQA();
const { t } = useI18n();

const accountData = ref<ManagementAccountResponse | null>(null);
const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const showSuccess = ref(false);
const error = ref<string | null>(null);

const maxLength = computed(() => accountData.value?.ManagementAccount.MaxLength || 15);
const noSpace = computed(() => accountData.value?.ManagementAccount.NoSpace || true);

const fetchAccountSettings = async () => {
  loading.value = true;
  error.value = null;
  try {
    accountData.value = await getAccountSettings();
  } catch (err) {
    console.error('Error fetching account settings:', err);
    error.value = t('account.errorFetchSettings');
  } finally {
    loading.value = false;
  }
};

const validatePasswords = (): string | null => {
  if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
    return t('account.errorAllFieldsRequired');
  }

  if (noSpace.value && (oldPassword.value.includes(' ') || newPassword.value.includes(' ') || confirmPassword.value.includes(' '))) {
    return t('account.errorPasswordSpace');
  }

  if (newPassword.value.length > maxLength.value) {
    return t('account.errorPasswordLength', { maxLength: maxLength.value });
  }

  if (newPassword.value !== confirmPassword.value) {
    return t('account.errorPasswordMismatch');
  }

  return null;
};

const showSuccessMessage = () => {
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
  }, 3000);
};

const handleCancel = () => {
  oldPassword.value = '';
  newPassword.value = '';
  confirmPassword.value = '';
  error.value = null;
};

const handleApply = async () => {
  error.value = null;

  const validationError = validatePasswords();
  if (validationError) {
    error.value = validationError;
    return;
  }

  loading.value = true;
  try {
    const response = await updateAccountPassword({
      ManagementAccount: {
        OldPassword: oldPassword.value,
        NewPassword: newPassword.value
      }
    });

    if (response.ManagementAccount.result === 'Success') {
      showSuccessMessage();
      handleCancel();
    } else {
      error.value = response.ManagementAccount.reason || t('account.errorUpdateFailed');
    }
  } catch (err) {
    console.error('Error updating password:', err);
    error.value = t('account.errorUpdateFailed');
  } finally {
    loading.value = false;
  }
};

onMounted(fetchAccountSettings);
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('account-title')">{{ t('account.title') }}</h1>

    <div class="status-content" :data-testid="qa('account-content')">
      <div v-if="loading && !accountData" class="loading-state" :data-testid="qa('account-loading')">
        <div class="loading-spinner"></div>
        <span>{{ t('common.loading') }}</span>
      </div>

      <template v-else>
        <div class="panel-section" :data-testid="qa('account-panel')">
          <div class="card-content">
            <div class="info-box">
              <p>{{ t('account.infoMessage', { maxLength }) }}</p>
              <p v-if="noSpace" class="note">{{ t('account.noteMessage') }}</p>
            </div>

            <div v-if="error" class="error-message" :data-testid="qa('account-error')">
              {{ error }}
            </div>

            <div class="form-group">
              <label :data-testid="qa('account-old-password-label')">{{ t('account.oldPassword') }}</label>
              <BaseSecretInput
                v-model="oldPassword"
                :input-data-testid="qa('account-old-password-input')"
                :toggle-data-testid="qa('account-old-password-toggle')"
                :placeholder="t('account.passwordPlaceholder')"
                :max-length="maxLength"
                :disabled="loading"
              />
            </div>

            <div class="form-group">
              <label :data-testid="qa('account-new-password-label')">{{ t('account.newPassword') }}</label>
              <BaseSecretInput
                v-model="newPassword"
                :input-data-testid="qa('account-new-password-input')"
                :toggle-data-testid="qa('account-new-password-toggle')"
                :placeholder="t('account.passwordPlaceholder')"
                :max-length="maxLength"
                :disabled="loading"
              />
            </div>

            <div class="form-group">
              <label :data-testid="qa('account-confirm-password-label')">{{ t('account.confirmPassword') }}</label>
              <BaseSecretInput
                v-model="confirmPassword"
                :input-data-testid="qa('account-confirm-password-input')"
                :toggle-data-testid="qa('account-confirm-password-toggle')"
                :placeholder="t('account.passwordPlaceholder')"
                :max-length="maxLength"
                :disabled="loading"
              />
            </div>

            <div class="button-group">
              <ActionButtons
                :cancel-disabled="loading"
                :apply-disabled="loading"
                :cancel-data-testid="qa('account-cancel-button')"
                :apply-data-testid="qa('account-apply-button')"
                @cancel="handleCancel"
                @apply="handleApply"
              />
            </div>
          </div>
        </div>
      </template>

      <div v-if="showSuccess" class="success-message" :data-testid="qa('account-success-message')">
        {{ t('account.successUpdate') }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.info-box {
  background-color: #f5f5f5;
  border-left: 4px solid #2196F3;
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
  .button-group {
    flex-direction: column;
  }

  .button-group :deep(.btn) {
    width: 100%;
  }
}
</style>
