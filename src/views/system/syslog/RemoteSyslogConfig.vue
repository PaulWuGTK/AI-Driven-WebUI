<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type {
  RemoteSyslogResponse,
  RemoteSyslogEntry,
  RemoteSyslogFormData,
  RemoteSyslogUpdateRequest
} from '../../../types/remoteSyslog';
import { PROTOCOL_OPTIONS, formatActionLabel } from '../../../types/remoteSyslog';
import { remoteSyslogApi } from '../../../services/api/remoteSyslog';
import { useQA } from '../../../utils/qa';
import { useAutoDismiss } from '../../../composables/useAutoDismiss';
import { extractNokMessage } from '../../../utils/apiUtils';
import { BaseTable, BaseModal, BaseInput, BaseSelect, BaseSwitch, BaseToast, SectionCard } from '../../../components/common';

const { qa } = useQA();
const { t } = useI18n();

const successMessage = ref('');
const errorToastMessage = ref('');
const { visible: showSuccessToast, show: triggerSuccessToast } = useAutoDismiss();
const { visible: showErrorToast, show: triggerErrorToast } = useAutoDismiss();

const data = ref<RemoteSyslogResponse | null>(null);
const loading = ref(false);
const saving = ref(false);
const error = ref<string | null>(null);

const showModal = ref(false);
const editingEntry = ref<RemoteSyslogEntry | null>(null);
const formError = ref<string | null>(null);

// Form state
const formData = ref<RemoteSyslogFormData>({
  Type: '',
  Enable: 1,
  Address: '',
  Port: 514,
  Protocol: 'UDP'
});

// Log type labels — use alias directly since types are dynamic from the data model
const getLogTypeLabel = (alias: string): string => {
  return formatActionLabel(alias);
};

// Transform backend response to table entries — only show entries with a configured Address
const tableEntries = computed<RemoteSyslogEntry[]>(() => {
  if (!data.value) return [];

  const actions = data.value.DeviceSyslogAction;
  const entries: RemoteSyslogEntry[] = [];

  for (const [actionName, actionData] of Object.entries(actions)) {
    // Only show types that have LogFile.Enable=1 AND a non-empty Address configured
    if (actionData.LogFile.Enable === 1 && actionData.LogRemote.Address) {
      entries.push({
        Type: actionName,
        TypeLabel: getLogTypeLabel(actionName),
        Enable: actionData.LogRemote.Enable,
        Address: actionData.LogRemote.Address,
        Port: actionData.LogRemote.Port,
        Protocol: actionData.LogRemote.Protocol as 'UDP' | 'TCP',
        Status: actionData.LogRemote.Status,
        LogFileEnabled: true
      });
    }
  }

  return entries;
});

// Available log types for dropdown — all LogFile.Enable=1 types, already-configured ones disabled
const availableTypes = computed(() => {
  if (!data.value) return [];

  const actions = data.value.DeviceSyslogAction;
  const configuredTypes = new Set(tableEntries.value.map(e => e.Type));

  const available: Array<{ value: string; label: string; disabled: boolean }> = [];

  for (const [actionName, actionData] of Object.entries(actions)) {
    if (actionData.LogFile.Enable === 1) {
      // When editing, the current type is always selectable
      const isCurrentEdit = editingEntry.value?.Type === actionName;
      available.push({
        value: actionName,
        label: getLogTypeLabel(actionName),
        disabled: !isCurrentEdit && configuredTypes.has(actionName)
      });
    }
  }

  return available;
});

// Protocol options
const protocolOptions = computed(() =>
  PROTOCOL_OPTIONS.map(opt => ({ label: opt.label, value: opt.value }))
);

// Table columns
const columns = computed(() => [
  {
    key: 'Enable',
    label: t('remoteSyslog.enable'),
    sortable: false,
    headerDataTestid: qa('remote-syslog-header-enable')
  },
  {
    key: 'TypeLabel',
    label: t('remoteSyslog.logType'),
    sortable: true,
    headerDataTestid: qa('remote-syslog-header-type')
  },
  {
    key: 'Address',
    label: t('remoteSyslog.address'),
    sortable: true,
    headerDataTestid: qa('remote-syslog-header-address')
  },
  {
    key: 'Port',
    label: t('remoteSyslog.port'),
    sortable: true,
    headerDataTestid: qa('remote-syslog-header-port')
  },
  {
    key: 'Protocol',
    label: t('remoteSyslog.protocol'),
    sortable: true,
    headerDataTestid: qa('remote-syslog-header-protocol')
  },
  {
    key: 'actions',
    label: t('common.action'),
    sortable: false,
    headerDataTestid: qa('remote-syslog-header-actions')
  }
]);

// Validation
const validateIPAddress = (addr: string): boolean => {
  const ipv4 = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4.test(addr);
};

const validatePort = (port: number): boolean => {
  return port >= 1 && port <= 65535;
};

const validateEntry = (): string | null => {
  // Required fields
  if (!formData.value.Type) {
    return t('remoteSyslog.errors.typeRequired');
  }
  if (!formData.value.Address) {
    return t('remoteSyslog.errors.addressRequired');
  }

  // IP format validation
  if (!validateIPAddress(formData.value.Address)) {
    return t('remoteSyslog.errors.invalidIp');
  }

  // Port range validation
  if (!validatePort(formData.value.Port)) {
    return t('remoteSyslog.errors.invalidPort');
  }

  // Rule 1: Type must be unique (dropdown disables already-configured, but validate as safety)
  const existingEntry = tableEntries.value.find(e =>
    e.Type === formData.value.Type &&
    (!editingEntry.value || e.Type !== editingEntry.value.Type)
  );
  if (existingEntry) {
    return t('remoteSyslog.errors.typeDuplicate');
  }

  // Rule 2: IP:Port combination must be unique (avoid persist-name conflict)
  const destination = `${formData.value.Address}:${formData.value.Port}`;
  const duplicateDestination = tableEntries.value.find(e =>
    `${e.Address}:${e.Port}` === destination &&
    e.Type !== formData.value.Type
  );
  if (duplicateDestination) {
    return t('remoteSyslog.errors.destinationDuplicate', {
      type: duplicateDestination.TypeLabel,
      destination: destination
    });
  }

  return null;
};

// Handlers
const showSuccessMessage = (message: string) => {
  successMessage.value = message;
  triggerSuccessToast();
};

const showErrorMessage = (message: string) => {
  errorToastMessage.value = message;
  triggerErrorToast();
};

const handleAdd = () => {
  editingEntry.value = null;
  formData.value = {
    Type: '',
    Enable: 1,
    Address: '',
    Port: 514,
    Protocol: 'UDP'
  };
  formError.value = null;
  showModal.value = true;
};

const handleEdit = (entry: RemoteSyslogEntry) => {
  editingEntry.value = entry;
  formData.value = {
    Type: entry.Type,
    Enable: entry.Enable,
    Address: entry.Address,
    Port: entry.Port,
    Protocol: entry.Protocol
  };
  formError.value = null;
  showModal.value = true;
};

const handleDelete = async (entry: RemoteSyslogEntry) => {
  if (!confirm(t('remoteSyslog.confirmDelete', { type: entry.TypeLabel }))) {
    return;
  }

  // Delete = Set Enable=0, Address=""
  const payload: RemoteSyslogUpdateRequest = {
    [entry.Type]: {
      LogRemote: {
        Enable: 0 as const,
        Address: '',
        Port: 514,
        Protocol: 'UDP'
      }
    }
  };

  saving.value = true;
  error.value = null;

  try {
    const result = await remoteSyslogApi.updateConfig(payload);
    if (result.NOK) {
      const errorMsg = extractNokMessage(result.NOK) || t('remoteSyslog.errors.deleteFailed');
      showErrorMessage(errorMsg);
    } else {
      showSuccessMessage(t('remoteSyslog.deleteSuccess', { type: entry.TypeLabel }));
      await loadData();
    }
  } catch (err) {
    console.error('Error deleting remote syslog:', err);
    const errorMsg = err instanceof Error ? err.message : String(err);
    showErrorMessage(errorMsg);
  } finally {
    saving.value = false;
  }
};

const handleSubmit = async () => {
  // Validate
  const validationError = validateEntry();
  if (validationError) {
    formError.value = validationError;
    return;
  }

  // Build payload
  const payload = {
    [formData.value.Type]: {
      LogRemote: {
        Enable: formData.value.Enable,
        Address: formData.value.Address,
        Port: formData.value.Port,
        Protocol: formData.value.Protocol
      }
    }
  };

  saving.value = true;
  formError.value = null;

  try {
    const result = await remoteSyslogApi.updateConfig(payload);
    if (result.NOK) {
      const errorMsg = extractNokMessage(result.NOK) || t('remoteSyslog.errors.saveFailed');
      formError.value = errorMsg;
    } else {
      showModal.value = false;
      showSuccessMessage(t('remoteSyslog.updateSuccess'));
      await loadData();
    }
  } catch (err) {
    console.error('Error saving remote syslog:', err);
    const errorMsg = err instanceof Error ? err.message : String(err);
    formError.value = errorMsg;
  } finally {
    saving.value = false;
  }
};

const loadData = async () => {
  loading.value = true;
  error.value = null;
  try {
    data.value = await remoteSyslogApi.getConfig();
  } catch (err) {
    console.error('Error loading remote syslog config:', err);
    error.value = t('remoteSyslog.errors.loadFailed');
  } finally {
    loading.value = false;
  }
};

const getRowTestId = (_row: RemoteSyslogEntry, index: number, mobile: boolean) =>
  qa(mobile ? `remote-syslog-card-${index}` : `remote-syslog-row-${index}`) ?? '';

onMounted(loadData);
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('remote-syslog-title')">
      {{ t('remoteSyslog.title') }}
    </h1>

    <div class="page-content" :data-testid="qa('remote-syslog-content')">
      <div v-if="loading" class="loading-state" :data-testid="qa('remote-syslog-loading')">
        <div class="loading-spinner"></div>
        <span>{{ t('common.loading') }}</span>
      </div>

      <div v-else-if="error" class="error-state" :data-testid="qa('remote-syslog-error')">
        {{ error }}
      </div>

      <template v-else-if="data">
        <SectionCard
          :data-testid="qa('remote-syslog-section')"
          header-mode="row"
          :title="t('remoteSyslog.sectionTitle')"
          :title-data-testid="qa('remote-syslog-section-title')"
        >
          <template #actions>
            <button
              class="btn btn-primary add-rule-btn"
              :data-testid="qa('remote-syslog-add-button')"
              @click="handleAdd"
            >
              <span class="material-icons">add</span>
              <span>{{ t('remoteSyslog.addDestination') }}</span>
            </button>
          </template>

          <BaseTable
            :columns="columns"
            :data="tableEntries"
            row-key="Type"
            :table-data-testid="qa('remote-syslog-table')"
            :mobile-data-testid="qa('remote-syslog-mobile')"
            initial-sort-key="TypeLabel"
            initial-sort-order="asc"
            :row-data-testid="getRowTestId"
          >
            <!-- Enable column -->
            <template #cell-Enable="{ row }">
              <span
                class="status-badge"
                :class="row.Enable ? 'status-enabled' : 'status-disabled'"
                :data-testid="qa(`status-badge-${row.Type}`)"
              >
                {{ row.Enable ? t('common.enabled') : t('common.disabled') }}
              </span>
            </template>

            <!-- Actions column -->
            <template #cell-actions="{ row }">
              <div class="action-buttons">
                <button
                  class="btn-action"
                  :data-testid="qa(`edit-${row.Type}`)"
                  :title="t('common.edit')"
                  @click="handleEdit(row)"
                >
                  <span class="material-icons">edit</span>
                </button>
                <button
                  class="btn-action"
                  :data-testid="qa(`delete-${row.Type}`)"
                  :title="t('common.delete')"
                  @click="handleDelete(row)"
                >
                  <span class="material-icons">delete</span>
                </button>
              </div>
            </template>
          </BaseTable>
        </SectionCard>
      </template>
    </div>

    <!-- Add/Edit Modal -->
    <BaseModal
      v-model="showModal"
      :title="editingEntry ? t('remoteSyslog.editDestination') : t('remoteSyslog.addDestination')"
      size="md"
      :data-testid="qa('remote-syslog-modal')"
    >
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <BaseSwitch
            v-model="formData.Enable"
            :true-value="1"
            :false-value="0"
            :label="t('remoteSyslog.enableRemoteLogging')"
            :data-testid="qa('modal-enable-switch')"
          />
        </div>

        <div class="form-group">
          <label class="form-label">{{ t('remoteSyslog.logType') }} <span class="required">*</span></label>
          <select
            v-model="formData.Type"
            class="form-control"
            :disabled="!!editingEntry"
            :data-testid="qa('modal-type-select')"
          >
            <option value="">{{ t('remoteSyslog.selectType') }}</option>
            <option
              v-for="opt in availableTypes"
              :key="opt.value"
              :value="opt.value"
              :disabled="opt.disabled"
            >
              {{ opt.label }}{{ opt.disabled ? ` ${t('remoteSyslog.typeConfigured')}` : '' }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">{{ t('remoteSyslog.address') }} <span class="required">*</span></label>
          <input
            v-model="formData.Address"
            type="text"
            class="form-control"
            placeholder="192.168.1.100"
            :data-testid="qa('modal-address-input')"
          />
        </div>

        <div class="form-group">
          <label class="form-label">{{ t('remoteSyslog.port') }} <span class="required">*</span></label>
          <input
            v-model.number="formData.Port"
            type="number"
            class="form-control"
            min="1"
            max="65535"
            :data-testid="qa('modal-port-input')"
          />
        </div>

        <div class="form-group">
          <label class="form-label">{{ t('remoteSyslog.protocol') }}</label>
          <select
            v-model="formData.Protocol"
            class="form-control"
            :data-testid="qa('modal-protocol-select')"
          >
            <option v-for="opt in protocolOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div v-if="formError" class="form-error" :data-testid="qa('modal-error')">
          {{ formError }}
        </div>

        <div class="form-actions">
          <button
            type="button"
            class="btn btn-secondary"
            :data-testid="qa('modal-cancel')"
            @click="showModal = false"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="saving"
            :data-testid="qa('modal-save')"
          >
            {{ saving ? t('common.saving') : t('common.save') }}
          </button>
        </div>
      </form>
    </BaseModal>

    <BaseToast
      v-model="showSuccessToast"
      :message="successMessage"
      type="success"
      :data-testid="qa('remote-syslog-success-message')"
    />
    <BaseToast
      v-model="showErrorToast"
      :message="errorToastMessage"
      type="error"
      :data-testid="qa('remote-syslog-error-message')"
    />
  </div>
</template>

<style scoped>
.add-rule-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  white-space: nowrap;
}

.add-rule-btn .material-icons {
  font-size: 1.125rem;
}

.action-buttons {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
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

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-align: center;
}

.status-enabled {
  background-color: #d4edda;
  color: #155724;
}

.status-disabled {
  background-color: #f8d7da;
  color: #721c24;
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.required {
  color: var(--color-error);
}

.form-control {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 112, 187, 0.1);
}

.form-control:disabled {
  background-color: var(--bg-disabled);
  cursor: not-allowed;
}

.form-control option:disabled {
  color: var(--text-disabled, #aaa);
}

.form-error {
  padding: var(--space-3);
  margin-bottom: var(--space-4);
  background-color: var(--color-error-light, #f8d7da);
  color: var(--color-error);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-6);
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-8);
  background-color: var(--bg-secondary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.error-state {
  padding: var(--space-6);
  text-align: center;
  color: var(--color-error);
  background-color: var(--bg-secondary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
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

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons button {
    width: 100%;
  }
}
</style>
