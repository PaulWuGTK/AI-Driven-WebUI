<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { GeneralMacFilteringEntry } from '../../../types/generalMacFiltering';
import { getGeneralMacFiltering, updateGeneralMacFiltering } from '../../../services/api/generalMacFiltering';
import { BaseSwitch, BaseToast } from '../../../components/common';
import { useAutoDismiss } from '../../../composables/useAutoDismiss';
import { extractNokMessage } from '../../../utils/apiUtils';
import { useQA } from '../../../utils/qa';

const { isQAMode, qa, slug } = useQA();
const { t } = useI18n();
const toFlag01 = (value: unknown): 0 | 1 => (
  value === 1 || value === '1' || value === true ? 1 : 0
);

const loading = ref(false);
const error = ref<string | null>(null);
const successMessage = ref('');
const errorToastMessage = ref('');
const { visible: showSuccessToast, show: triggerSuccessToast } = useAutoDismiss();
const { visible: showErrorToast, show: triggerErrorToast } = useAutoDismiss();

const macFilteringEnabled = ref<0 | 1>(0);
const filterMode = ref<'blacklist' | 'whitelist'>('blacklist');
const newMacAddress = ref('');
const newComment = ref('');
const whiteList = ref<GeneralMacFilteringEntry[]>([]);
const blackList = ref<GeneralMacFilteringEntry[]>([]);

const showSuccessMessage = (message = t('common.saveSuccess')) => {
  successMessage.value = message;
  triggerSuccessToast();
};

const showErrorMessage = (message: string) => {
  errorToastMessage.value = message;
  triggerErrorToast();
};

const currentList = computed(() => {
  return filterMode.value === 'blacklist' ? blackList.value : whiteList.value;
});

const currentTableTitle = computed(() => {
  return filterMode.value === 'blacklist'
    ? t('generalMacFiltering.currentBlacklistFilterTable')
    : t('generalMacFiltering.currentWhitelistFilterTable');
});

const validateMacAddress = (mac: string): boolean => {
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  return macRegex.test(mac);
};

const fetchMacFiltering = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getGeneralMacFiltering();
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      error.value = nokMessage;
      return;
    }
    macFilteringEnabled.value = toFlag01(response.MACFiltering.Enable);
    whiteList.value = [...response.MACFiltering.WhiteList];
    blackList.value = [...response.MACFiltering.BlackList];
  } catch (err) {
    console.error('Error fetching MAC filtering data:', err);
    error.value = 'Failed to fetch MAC filtering data';
  } finally {
    loading.value = false;
  }
};

const addMacAddress = () => {
  if (!newMacAddress.value.trim()) {
    error.value = t('generalMacFiltering.emptyMacError');
    return;
  }

  if (!validateMacAddress(newMacAddress.value)) {
    error.value = t('generalMacFiltering.invalidMacFormat');
    return;
  }

  const targetList = filterMode.value === 'blacklist' ? blackList.value : whiteList.value;

  const exists = targetList.some(entry => entry.MACAddress.toLowerCase() === newMacAddress.value.toLowerCase());
  if (exists) {
    error.value = t('generalMacFiltering.duplicateMacError');
    return;
  }

  if (targetList.length >= 32) {
    error.value = t('generalMacFiltering.maxEntriesReached');
    return;
  }

  const newNo = targetList.length > 0 ? Math.max(...targetList.map(e => e.No)) + 1 : 1;

  const newEntry: GeneralMacFilteringEntry = {
    No: newNo,
    MACAddress: newMacAddress.value,
    Comment: newComment.value || ''
  };

  if (filterMode.value === 'blacklist') {
    blackList.value.push(newEntry);
  } else {
    whiteList.value.push(newEntry);
  }

  newMacAddress.value = '';
  newComment.value = '';
  error.value = null;
};

const removeMacAddress = (no: number) => {
  if (filterMode.value === 'blacklist') {
    blackList.value = blackList.value.filter(entry => entry.No !== no);
  } else {
    whiteList.value = whiteList.value.filter(entry => entry.No !== no);
  }
};

const handleApply = async () => {
  loading.value = true;

  try {
    const response = await updateGeneralMacFiltering({
      MACFiltering: {
        Enable: macFilteringEnabled.value,
        WhiteList: whiteList.value,
        BlackList: blackList.value
      }
    });
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      showErrorMessage(nokMessage);
      return;
    }
    showSuccessMessage();
    await fetchMacFiltering();
  } catch (err) {
    console.error('Error updating MAC filtering:', err);
    showErrorMessage('Failed to update MAC filtering');
  } finally {
    loading.value = false;
  }
};

const handleCancel = async () => {
  await fetchMacFiltering();
  newMacAddress.value = '';
  newComment.value = '';
  error.value = null;
};

onMounted(fetchMacFiltering);
</script>

<template>
  <div class="general-mac-filtering" :data-testid="qa('general-mac-filtering')">
    <div v-if="loading && macFilteringEnabled === 0" class="loading-state" :data-testid="qa('general-mac-loading')">
      <div class="loading-spinner"></div>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="error && macFilteringEnabled === 0" class="error-state" :data-testid="qa('general-mac-error')">
      {{ error }}
    </div>

    <template v-else>
      <div class="form-group toggle-group" :data-testid="qa('general-mac-enable')">
        <label>{{ t('generalMacFiltering.enableMacFiltering') }}</label>
        <BaseSwitch
          v-model="macFilteringEnabled"
          :true-value="1"
          :false-value="0"
          :data-testid="qa('general-mac-enable-checkbox')"
          :slider-data-testid="qa('general-mac-enable-slider')"
        />
      </div>

      <template v-if="macFilteringEnabled === 1">
        <div class="form-group radio-group" :data-testid="qa('general-mac-filter-mode')">
          <label>{{ t('generalMacFiltering.filterMode') }}</label>
          <div class="radio-options">
            <label class="radio-label">
              <input
                type="radio"
                value="blacklist"
                v-model="filterMode"
                :data-testid="qa('general-mac-blacklist-radio')"
              />
              <span>{{ t('generalMacFiltering.blacklist') }}</span>
            </label>
            <label class="radio-label">
              <input
                type="radio"
                value="whitelist"
                v-model="filterMode"
                :data-testid="qa('general-mac-whitelist-radio')"
              />
              <span>{{ t('generalMacFiltering.whitelist') }}</span>
            </label>
          </div>
        </div>

        <div class="form-group" :data-testid="qa('general-mac-address-input')">
          <label>{{ t('generalMacFiltering.sourceMacAddress') }}</label>
          <input
            type="text"
            v-model="newMacAddress"
            class="form-input"
            :placeholder="t('generalMacFiltering.macPlaceholder')"
            :data-testid="qa('general-mac-address-field')"
          />
        </div>

        <div class="form-group" :data-testid="qa('general-mac-comment-input')">
          <label>{{ t('generalMacFiltering.comment') }}</label>
          <input
            type="text"
            v-model="newComment"
            class="form-input"
            maxlength="30"
            :placeholder="t('generalMacFiltering.commentPlaceholder')"
            :data-testid="qa('general-mac-comment-field')"
          />
        </div>

        <div v-if="error" class="error-message" :data-testid="qa('general-mac-error-message')">
          {{ error }}
        </div>

        <div class="form-actions" :data-testid="qa('general-mac-add-button-group')">
          <button
            type="button"
            class="btn-add"
            @click="addMacAddress"
            :disabled="loading"
            :data-testid="qa('general-mac-add-button')"
          >
            <span class="material-icons">add</span>
            {{ t('generalMacFiltering.add') }}
          </button>
        </div>

        <div class="filter-table-section" :data-testid="qa('general-mac-table')">
          <h3>{{ currentTableTitle }}</h3>
          <table class="filter-table">
            <thead>
              <tr>
                <th>{{ t('generalMacFiltering.number') }}</th>
                <th>{{ t('generalMacFiltering.sourceMacAddress') }}</th>
                <th>{{ t('generalMacFiltering.comment') }}</th>
                <th>{{ t('generalMacFiltering.active') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="entry in currentList"
                :key="entry.No"
                :data-testid="qa(`general-mac-entry-${entry.No}`)"
              >
                <td>{{ entry.No }}</td>
                <td>{{ entry.MACAddress }}</td>
                <td>{{ entry.Comment }}</td>
                <td>
                  <button
                    type="button"
                    class="btn-icon"
                    @click="removeMacAddress(entry.No)"
                    :data-testid="qa(`general-mac-delete-${entry.No}`)"
                  >
                    <span class="material-icons">delete</span>
                  </button>
                </td>
              </tr>
              <tr v-if="currentList.length === 0">
                <td colspan="4" class="empty-message">{{ t('generalMacFiltering.noEntries') }}</td>
              </tr>
            </tbody>
          </table>
          <div class="note-text" :data-testid="qa('general-mac-max-note')">
            {{ t('generalMacFiltering.maxEntriesNote') }}
          </div>
        </div>
      </template>

      <div class="form-footer" :data-testid="qa('general-mac-actions')">
        <button
          type="button"
          class="btn btn-outline"
          @click="handleCancel"
          :disabled="loading"
          :data-testid="qa('general-mac-cancel-button')"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          type="button"
          class="btn btn-primary"
          @click="handleApply"
          :disabled="loading"
          :data-testid="qa('general-mac-apply-button')"
        >
          {{ t('common.apply') }}
        </button>
      </div>
    </template>

    <BaseToast
      v-model="showSuccessToast"
      :message="successMessage"
      type="success"
      :data-testid="qa('general-mac-success-message')"
    />
    <BaseToast
      v-model="showErrorToast"
      :message="errorToastMessage"
      type="error"
      :data-testid="qa('general-mac-error-toast')"
    />
  </div>
</template>

<style scoped>
.general-mac-filtering {
  padding: var(--space-6);
}

.form-group {
  margin-bottom: var(--space-5);
}


.toggle-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) 0;
}

.toggle-group label:first-child {
  margin-bottom: 0;
}


.radio-group .radio-options {
  display: flex;
  gap: var(--space-6);
}

.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.radio-label input[type="radio"] {
  margin-right: var(--space-2);
  cursor: pointer;
}

.form-input {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.form-input:focus {
  outline: none;
  border-color: var(--border-color-focus);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--space-8);
}

.btn-add {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-6);
  background-color: var(--bg-secondary);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-add:hover {
  background-color: var(--color-primary-light);
}

.btn-add .material-icons {
  font-size: 18px;
}

.filter-table-section {
  margin-top: var(--space-8);
  margin-bottom: var(--space-8);
}

.filter-table-section h3 {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--space-3);
  font-weight: var(--font-weight-normal);
}

.filter-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
}

.filter-table th,
.filter-table td {
  padding: var(--space-3);
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.filter-table th {
  background-color: var(--bg-tertiary);
  font-weight: var(--font-weight-normal);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.filter-table td {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.filter-table tbody tr:hover {
  background-color: var(--color-gray-50);
}

.empty-message {
  text-align: center;
  color: var(--text-tertiary);
  padding: var(--space-8);
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-1);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--transition-fast);
}

.btn-icon:hover {
  color: var(--color-error);
}

.btn-icon .material-icons {
  font-size: 20px;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding-top: var(--space-6);
  border-top: 1px solid var(--border-color);
}

.error-message {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  margin-top: var(--space-2);
  margin-bottom: var(--space-4);
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  padding: 2rem;
  text-align: center;
  color: #dc3545;
}

.note-text {
  margin-top: 1.25rem;
  font-size: 0.95rem;
  color: var(--text-secondary);
}

</style>
