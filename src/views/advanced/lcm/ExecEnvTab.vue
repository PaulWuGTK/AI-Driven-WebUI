<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ExecEnvItem } from '../../../types/lcmExecEnv';
import { getLcmExecEnvConfig, updateLcmExecEnv } from '../../../services/api/lcmExecEnv';
import { ActionButtons, BaseSwitch, SectionCard } from '../../../components/common';
import { useQA } from '../../../utils/qa';

const { qa } = useQA();
const { t } = useI18n();

const loading = ref(false);
const togglingName = ref<string | null>(null);
const error = ref<string | null>(null);
const maxMem = ref(1024);
const maxDisk = ref(4096);
const execEnvList = ref<ExecEnvItem[]>([]);
const tempExecEnvList = ref<ExecEnvItem[]>([]);
const showAddModal = ref(false);
const editingItem = ref<ExecEnvItem | null>(null);
const showSuccess = ref(false);

const formData = ref({
  Name: '',
  AllocatedCpu: 100,
  AllocatedMem: 1,
  AllocatedDisk: 1
});

const formErrors = ref({
  Name: '',
  AllocatedCpu: '',
  AllocatedMem: '',
  AllocatedDisk: ''
});

const isEditMode = computed(() => editingItem.value !== null);
const modalTitle = computed(() => isEditMode.value ? t('lcm.editExecEnv') : t('lcm.addExecEnv'));

const fetchConfig = async (silent = false) => {
  if (!silent) loading.value = true;
  error.value = null;
  try {
    const response = await getLcmExecEnvConfig();
    maxMem.value = response.AdvancedLcmExecEnv.MaxMem;
    maxDisk.value = response.AdvancedLcmExecEnv.MaxDisk;
    execEnvList.value = response.AdvancedLcmExecEnv.ExecEnvList;
    tempExecEnvList.value = [...response.AdvancedLcmExecEnv.ExecEnvList];
  } catch (err) {
    console.error('Error fetching LCM ExecEnv config:', err);
    error.value = 'Failed to fetch LCM ExecEnv configuration';
  } finally {
    if (!silent) loading.value = false;
  }
};

const validateForm = (): boolean => {
  formErrors.value = {
    Name: '',
    AllocatedCpu: '',
    AllocatedMem: '',
    AllocatedDisk: ''
  };

  let isValid = true;

  if (!formData.value.Name.trim()) {
    formErrors.value.Name = t('lcm.nameRequired');
    isValid = false;
  } else if (!isEditMode.value && tempExecEnvList.value.some(item => item.Name === formData.value.Name)) {
    formErrors.value.Name = t('lcm.nameExists');
    isValid = false;
  }

  if (formData.value.AllocatedCpu < 1 || formData.value.AllocatedCpu > 100) {
    formErrors.value.AllocatedCpu = t('lcm.cpuRange');
    isValid = false;
  }

  if (formData.value.AllocatedMem < 1 || formData.value.AllocatedMem > maxMem.value) {
    formErrors.value.AllocatedMem = t('lcm.memRange', { max: maxMem.value });
    isValid = false;
  }

  if (formData.value.AllocatedDisk < 1 || formData.value.AllocatedDisk > maxDisk.value) {
    formErrors.value.AllocatedDisk = t('lcm.diskRange', { max: maxDisk.value });
    isValid = false;
  }

  return isValid;
};

const openAddModal = () => {
  editingItem.value = null;
  formData.value = {
    Name: '',
    AllocatedCpu: 100,
    AllocatedMem: 1,
    AllocatedDisk: 1
  };
  formErrors.value = {
    Name: '',
    AllocatedCpu: '',
    AllocatedMem: '',
    AllocatedDisk: ''
  };
  showAddModal.value = true;
};

const openEditModal = (item: ExecEnvItem) => {
  editingItem.value = { ...item };
  formData.value = {
    Name: item.Name,
    AllocatedCpu: item.AllocatedCpu,
    AllocatedMem: item.AllocatedMem,
    AllocatedDisk: item.AllocatedDisk
  };
  formErrors.value = {
    Name: '',
    AllocatedCpu: '',
    AllocatedMem: '',
    AllocatedDisk: ''
  };
  showAddModal.value = true;
};

const closeModal = () => {
  showAddModal.value = false;
  editingItem.value = null;
};

const handleSave = async () => {
  if (!validateForm()) {
    return;
  }

  loading.value = true;
  try {
    if (isEditMode.value) {
      await updateLcmExecEnv({
        AdvancedLcmExecEnv: {
          Action: 'Update',
          Name: formData.value.Name,
          Enable: editingItem.value!.Enable,
          AllocatedCpu: formData.value.AllocatedCpu,
          AllocatedMem: formData.value.AllocatedMem,
          AllocatedDisk: formData.value.AllocatedDisk
        }
      });
    } else {
      await updateLcmExecEnv({
        AdvancedLcmExecEnv: {
          Action: 'Add',
          Name: formData.value.Name,
          AllocatedCpu: formData.value.AllocatedCpu,
          AllocatedMem: formData.value.AllocatedMem,
          AllocatedDisk: formData.value.AllocatedDisk
        }
      });
    }

    await fetchConfig();
    showSuccessMessage();
    closeModal();
  } catch (err) {
    console.error('Error saving ExecEnv:', err);
    error.value = 'Failed to save ExecEnv';
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (name: string) => {
  if (!confirm(t('lcm.confirmDelete'))) return;

  loading.value = true;
  try {
    await updateLcmExecEnv({
      AdvancedLcmExecEnv: {
        Action: 'Delete',
        Name: name
      }
    });

    await fetchConfig();
    showSuccessMessage();
  } catch (err) {
    console.error('Error deleting ExecEnv:', err);
    error.value = 'Failed to delete ExecEnv';
  } finally {
    loading.value = false;
  }
};

const handleToggleEnable = async (item: ExecEnvItem) => {
  const originalEnable = item.Enable;
  const nextEnable: 0 | 1 = originalEnable === 1 ? 0 : 1;
  item.Enable = nextEnable;

  togglingName.value = item.Name;
  try {
    await updateLcmExecEnv({
      AdvancedLcmExecEnv: {
        Action: 'Update',
        Name: item.Name,
        Enable: nextEnable,
        AllocatedCpu: item.AllocatedCpu,
        AllocatedMem: item.AllocatedMem,
        AllocatedDisk: item.AllocatedDisk
      }
    });

    await fetchConfig(true); 
    showSuccessMessage();
  } catch (err) {
    console.error('Error toggling ExecEnv:', err);
    error.value = 'Failed to toggle ExecEnv';
    item.Enable = originalEnable;
  } finally {
    togglingName.value = null;
  }
};

const showSuccessMessage = () => {
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
  }, 3000);
};

onMounted(fetchConfig);
</script>

<template>
  <div class="execenv-tab" :data-testid="qa('lcm-execenv-tab')">
    <div v-if="loading" class="loading-state" :data-testid="qa('lcm-execenv-loading')">
      <div class="loading-spinner"></div>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="error" class="error-state" :data-testid="qa('lcm-execenv-error')">
      {{ error }}
    </div>

    <template v-else>
      <SectionCard
        :data-testid="qa('lcm-execenv-section')"
        header-mode="row"
        :title="t('lcm.executionEnvironment')"
        :title-data-testid="qa('lcm-execenv-title')"
      >
        <template #actions>
          <button
            class="btn btn-primary"
            :data-testid="qa('lcm-execenv-add-button')"
            @click="openAddModal"
          >
            <span class="material-icons">add</span>
            {{ t('lcm.addEE') }}
          </button>
        </template>

          <div class="table-container" :data-testid="qa('lcm-execenv-table')">
            <table>
              <thead>
                <tr>
                  <th :data-testid="qa('lcm-execenv-header-no')">{{ t('lcm.no') }}</th>
                  <th :data-testid="qa('lcm-execenv-header-name')">{{ t('lcm.name') }}</th>
                  <th :data-testid="qa('lcm-execenv-header-status')">{{ t('lcm.status') }}</th>
                  <th :data-testid="qa('lcm-execenv-header-enabled')">{{ t('lcm.enabled') }}</th>
                  <th :data-testid="qa('lcm-execenv-header-action')">{{ t('lcm.action') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in tempExecEnvList" :key="item.Name" :data-testid="qa(`lcm-execenv-row-${index}`)">
                  <td :data-testid="qa(`lcm-execenv-no-${index}`)">{{ index + 1 }}</td>
                  <td :data-testid="qa(`lcm-execenv-name-${index}`)">{{ item.Name }}</td>
                  <td :data-testid="qa(`lcm-execenv-status-${index}`)">{{ item.Status }}</td>
                  <td :data-testid="qa(`lcm-execenv-enabled-${index}`)">
                    <BaseSwitch
                      :model-value="item.Enable"
                      :true-value="1"
                      :false-value="0"
                      :disabled="togglingName === item.Name"
                      :data-testid="qa(`lcm-execenv-enable-toggle-table-${index}`)"
                      :slider-data-testid="qa(`lcm-execenv-enable-toggle-slider-table-${index}`)"
                      @update:model-value="() => handleToggleEnable(item)"
                    />
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button
                        class="btn-action"
                        :data-testid="qa(`lcm-execenv-edit-${index}`)"
                        @click="openEditModal(item)"
                        title="Edit"
                      >
                        <span class="material-icons">edit</span>
                      </button>
                      <button
                        class="btn-action"
                        :data-testid="qa(`lcm-execenv-delete-${index}`)"
                        @click="handleDelete(item.Name)"
                        title="Delete"
                      >
                        <span class="material-icons">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mobile-cards" :data-testid="qa('lcm-execenv-mobile')">
            <div
              class="table-card"
              v-for="(item, index) in tempExecEnvList"
              :key="item.Name"
              :data-testid="qa(`lcm-execenv-card-${index}`)"
            >
              <div class="card-row">
                <span class="card-label">{{ t('lcm.name') }}</span>
                <span class="card-value">{{ item.Name }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('lcm.status') }}</span>
                <span class="card-value">{{ item.Status }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('lcm.enabled') }}</span>
                <BaseSwitch
                  :model-value="item.Enable"
                  :true-value="1"
                  :false-value="0"
                  :disabled="togglingName === item.Name"
                  :data-testid="qa(`lcm-execenv-enable-toggle-card-${index}`)"
                  :slider-data-testid="qa(`lcm-execenv-enable-toggle-slider-card-${index}`)"
                  @update:model-value="() => handleToggleEnable(item)"
                />
              </div>
              <div class="card-actions">
                <span class="card-label">{{ t('lcm.action') }}</span>
                <div class="action-buttons">
                  <button class="btn-action" :data-testid="qa(`lcm-execenv-mobile-edit-${index}`)" @click="openEditModal(item)" title="Edit">
                    <span class="material-icons">edit</span>
                  </button>
                  <button class="btn-action" :data-testid="qa(`lcm-execenv-mobile-delete-${index}`)" @click="handleDelete(item.Name)" title="Delete">
                    <span class="material-icons">delete</span>
                  </button>
                </div>
                </div>
              </div>
            </div>
      </SectionCard>
    </template>

    <div v-if="showAddModal" class="modal-overlay" @mousedown.self="closeModal">
      <div class="modal-content" :data-testid="qa('lcm-execenv-modal')">
        <div class="modal-header">
          <h2>{{ modalTitle }}</h2>
          <button class="close-btn" :data-testid="qa('lcm-execenv-modal-close')" @click="closeModal">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="modal-body compact-modal-form">
          <div class="form-group">
            <label>{{ t('lcm.name') }}</label>
            <input
              type="text"
              v-model="formData.Name"
              :disabled="isEditMode"
              :class="{ 'error': formErrors.Name }"
              :data-testid="qa('lcm-execenv-modal-name')"
            />
            <span v-if="formErrors.Name" class="error-message">{{ formErrors.Name }}</span>
          </div>

          <div class="resource-config-section">
            <div class="section-header">{{ t('lcm.resourceConfiguration') }}</div>

            <div class="form-group">
              <label>
                {{ t('lcm.cpuPercent') }}
                <span class="hint">{{ t('lcm.cpuHint') }}</span>
              </label>
              <input
                type="number"
                v-model.number="formData.AllocatedCpu"
                min="1"
                max="100"
                :class="{ 'error': formErrors.AllocatedCpu }"
                :data-testid="qa('lcm-execenv-modal-cpu')"
              />
              <span v-if="formErrors.AllocatedCpu" class="error-message">{{ formErrors.AllocatedCpu }}</span>
            </div>

            <div class="form-group">
              <label>
                {{ t('lcm.memorySize') }}
                <span class="hint">{{ t('lcm.memHint', { max: maxMem }) }}</span>
              </label>
              <div class="input-with-unit">
                <input
                  type="number"
                  v-model.number="formData.AllocatedMem"
                  :min="1"
                  :max="maxMem"
                  :class="{ 'error': formErrors.AllocatedMem }"
                  :data-testid="qa('lcm-execenv-modal-mem')"
                />
                <span class="unit">MiB</span>
              </div>
              <span v-if="formErrors.AllocatedMem" class="error-message">{{ formErrors.AllocatedMem }}</span>
            </div>

            <div class="form-group">
              <label>
                {{ t('lcm.diskSpace') }}
                <span class="hint">{{ t('lcm.diskHint', { max: maxDisk }) }}</span>
              </label>
              <div class="input-with-unit">
                <input
                  type="number"
                  v-model.number="formData.AllocatedDisk"
                  :min="1"
                  :max="maxDisk"
                  :class="{ 'error': formErrors.AllocatedDisk }"
                  :data-testid="qa('lcm-execenv-modal-disk')"
                />
                <span class="unit">MiB</span>
              </div>
              <span v-if="formErrors.AllocatedDisk" class="error-message">{{ formErrors.AllocatedDisk }}</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <ActionButtons
            :apply-text="isEditMode ? t('common.save') : t('common.add')"
            :cancel-data-testid="qa('lcm-execenv-modal-cancel')"
            :apply-data-testid="qa('lcm-execenv-modal-add')"
            @cancel="closeModal"
            @apply="handleSave"
          />
        </div>
      </div>
    </div>

    <div v-if="showSuccess" class="success-message" :data-testid="qa('lcm-execenv-success-message')">
      {{ t('common.operationSuccessful') }}
    </div>
  </div>
</template>

<style scoped>
.execenv-tab {
  padding: 0;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  min-width: 4.5rem;
}

.card-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: var(--space-3) 0;
}

.card-actions .action-buttons {
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-end;
  min-width: 0;
}

.table-container th:last-child,
.table-container td:last-child {
  width: 7rem;
  text-align: center;
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

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  color: var(--text-secondary);
}

.error-state {
  padding: 2rem;
  text-align: center;
  color: #dc3545;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-secondary);
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0.25rem;
}

.close-btn:hover {
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
}

.compact-modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.375rem;
  color: var(--text-primary);
  font-weight: 500;
}

.form-group .hint {
  display: block;
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: normal;
  margin-top: 0.125rem;
}

.form-group input[type="text"],
.form-group input[type="number"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.form-group input.error {
  border-color: #dc3545;
}

.form-group input:disabled {
  background-color: var(--bg-primary);
  cursor: not-allowed;
}

.input-with-unit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-with-unit input {
  flex: 1;
}

.input-with-unit .unit {
  color: var(--text-secondary);
  font-weight: 500;
}

.error-message {
  display: block;
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.resource-config-section {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-header {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
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

  .modal-content {
    width: 95%;
    max-height: 95vh;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-footer :deep(.btn) {
    width: 100%;
  }

  .card-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>

