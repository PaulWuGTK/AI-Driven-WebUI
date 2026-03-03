<template>
  <div class="qos-rule-tab">
    <SectionCard
      :title="t('qos.qosRuleLists')"
      header-mode="row"
      :data-testid="qa('qos-rule-section')"
      :title-data-testid="qa('qos-rule-title')"
    >
      <template #actions>
        <BaseButton
          variant="primary"
          :data-testid="qa('qos-rule-add-button')"
          @click="openAddModal"
        >
          {{ t('qos.addRule') }}
        </BaseButton>
      </template>

      <div class="rule-table-container">
        <table class="draggable-table">
          <thead>
            <tr>
              <th></th>
              <th>{{ t('qos.no') }}</th>
              <th>{{ t('qos.type') }}</th>
              <th>{{ t('qos.name') }}</th>
              <th>{{ t('qos.description') }}</th>
              <th>{{ t('qos.priority') }}</th>
              <th>{{ t('qos.action') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, index) in formData.RuleList"
              :key="`rule-${index}`"
              draggable="true"
              @dragstart="handleDragStart($event, index)"
              @dragover="handleDragOver($event, index)"
              @dragenter="handleDragEnter($event, index)"
              @dragleave="handleDragLeave($event)"
              @drop="handleDrop($event, index)"
              @dragend="handleDragEnd"
              :class="{ 'drag-over': dragOverIndex === index }"
            >
              <td class="drag-handle">
                <span class="material-icons">drag_indicator</span>
              </td>
              <td>{{ index + 1 }}</td>
              <td>{{ row.Type }}</td>
              <td>{{ row.Type === 'Application' ? row.ApplicationName : row.DeviceName }}</td>
              <td>{{ formatDescription(row) }}</td>
              <td>{{ row.Priority }}</td>
              <td>
                <div class="action-buttons">
                  <button @click="handleEdit(row, index)" class="icon-btn" :title="t('common.edit')" :data-testid="qa(`qos-rule-edit-${index}`)">
                    <span class="material-icons">edit</span>
                  </button>
                  <button @click="handleDelete(index)" class="icon-btn" :title="t('common.delete')" :data-testid="qa(`qos-rule-delete-${index}`)">
                    <span class="material-icons">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <ActionButtons
        class="button-group"
        :apply-loading="loading"
        :cancel-data-testid="qa('qos-rule-cancel-button')"
        :apply-data-testid="qa('qos-rule-apply-button')"
        @cancel="handleCancel"
        @apply="handleApply"
      />
    </SectionCard>

    <BaseModal
      v-model="showAddModal"
      :title="editingIndex !== null ? t('qos.editRule') : t('qos.addQosRule')"
      :close-button-data-testid="qa('qos-rule-modal-close-button')"
      @close="closeModal"
    >
      <div class="modal-form">
        <div
          v-if="modalErrorMessage"
          class="modal-error-banner"
          :data-testid="qa('qos-rule-modal-error')"
        >
          {{ modalErrorMessage }}
        </div>

        <div class="form-group">
          <label class="form-label">{{ t('qos.type') }}</label>
          <BaseSelect
            v-model="currentRule.Type"
            :options="typeOptions"
            :data-testid="qa('qos-rule-modal-type-select')"
            @change="handleTypeChange"
          />
        </div>

        <template v-if="currentRule.Type === 'Device'">
          <div class="form-group">
            <label class="form-label">{{ t('qos.device') }}</label>
            <BaseSelect
              v-model="selectedDevice"
              :options="deviceOptions"
              :data-testid="qa('qos-rule-modal-device-select')"
              @change="handleDeviceChange"
            />
          </div>

          <div class="form-group">
            <label class="form-label">{{ t('qos.macAddress') }}</label>
            <BaseInput
              v-model="currentRule.MACAddress"
              :disabled="true"
              :data-testid="qa('qos-rule-modal-mac-address-input')"
            />
          </div>
        </template>

        <template v-if="currentRule.Type === 'Application'">
          <div class="form-group">
            <label class="form-label">{{ t('qos.applicationType') }}</label>
            <BaseSelect
              v-model="selectedApplicationType"
              :options="applicationTypeOptions"
              :data-testid="qa('qos-rule-modal-application-type-select')"
              @change="handleApplicationTypeChange"
            />
          </div>

          <div class="form-group">
            <label class="form-label">{{ t('qos.applicationName') }}</label>
            <BaseInput
              v-model="currentRule.ApplicationName"
              :disabled="selectedApplicationType !== 'Self-defined'"
              :data-testid="qa('qos-rule-modal-application-name-input')"
            />
          </div>

          <div class="form-group">
            <label class="form-label">{{ t('qos.port') }}</label>
            <BaseInput
              v-model="currentRule.Port"
              :disabled="selectedApplicationType !== 'Self-defined'"
              :placeholder="t('qos.portPlaceholder')"
              :data-testid="qa('qos-rule-modal-port-input')"
            />
            <div class="field-hint">
              {{ t('qos.portHint') }}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">{{ t('qos.protocol') }}</label>
            <BaseSelect
              v-model="currentRule.Protocol"
              :options="protocolOptions"
              :disabled="selectedApplicationType !== 'Self-defined'"
              :data-testid="qa('qos-rule-modal-protocol-select')"
            />
          </div>
        </template>

        <div class="form-group">
          <label class="form-label">{{ t('qos.priority') }}</label>
          <BaseSelect
            v-model="currentRule.Priority"
            :options="priorityOptions"
            :data-testid="qa('qos-rule-modal-priority-select')"
          />
        </div>

        <ActionButtons
          class="modal-actions"
          :apply-text="editingIndex !== null ? t('common.save') : t('common.add')"
          :cancel-data-testid="qa('qos-rule-modal-cancel-button')"
          :apply-data-testid="qa('qos-rule-modal-add-or-update-button')"
          @cancel="closeModal"
          @apply="handleAddOrUpdate"
        />
      </div>
    </BaseModal>

    <BaseToast
      v-model="showSuccessToast"
      :message="successMessage"
      type="success"
      :data-testid="qa('qos-rule-success-message')"
    />
    <BaseToast
      v-model="showErrorToast"
      :message="errorToastMessage"
      type="error"
      :data-testid="qa('qos-rule-error-message')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQA } from '../../../utils/qa';
import { ActionButtons, BaseButton, BaseInput, BaseModal, BaseSelect, BaseToast, SectionCard } from '../../../components/common';
import { qosApi } from '../../../services/api/qos';
import type { QosRule, QosRuleData, QosApplicationType, QosDevice } from '../../../types/qos';
import { useAutoDismiss } from '../../../composables/useAutoDismiss';

const { t } = useI18n();
const { qa } = useQA();

const formData = ref<QosRuleData>({
  ApplicationTypeList: [],
  DeviceList: [],
  ProtocolList: [],
  PriorityList: [],
  RuleList: []
});

const originalData = ref<QosRuleData | null>(null);
const showAddModal = ref(false);
const editingIndex = ref<number | null>(null);
const selectedApplicationType = ref('');
const selectedDevice = ref('');
const loading = ref(false);
const modalErrorMessage = ref('');
const successMessage = ref('');
const errorToastMessage = ref('');
const { visible: showSuccessToast, show: triggerSuccessToast } = useAutoDismiss();
const { visible: showErrorToast, show: triggerErrorToast } = useAutoDismiss();

const draggedIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);

const currentRule = ref<QosRule>({
  Order: 0,
  Type: 'Application',
  ApplicationName: '',
  DeviceName: '',
  MACAddress: '',
  Port: '',
  Protocol: '',
  Priority: ''
});

const typeOptions = computed(() => [
  { value: 'Application', label: t('qos.application') },
  { value: 'Device', label: t('qos.device') }
]);

const applicationTypeOptions = computed(() => {
  return formData.value.ApplicationTypeList.map((app: QosApplicationType) => ({
    value: app.ApplicationType,
    label: app.ApplicationType
  }));
});

const deviceOptions = computed(() => {
  return formData.value.DeviceList.map((device: QosDevice) => ({
    value: device.DeviceName,
    label: device.DeviceName
  }));
});

const protocolOptions = computed(() => {
  return formData.value.ProtocolList.map((protocol: string) => ({
    value: protocol,
    label: protocol
  }));
});

const priorityOptions = computed(() => {
  return formData.value.PriorityList.map((priority: string) => ({
    value: priority,
    label: priority
  }));
});

const showSuccessMessage = (message: string) => {
  successMessage.value = message;
  triggerSuccessToast();
};

const showErrorMessage = (message: string) => {
  errorToastMessage.value = message;
  triggerErrorToast();
};

const formatDescription = (rule: QosRule): string => {
  if (rule.Type === 'Device') {
    return rule.MACAddress;
  }

  const parts = [];
  if (rule.Port) parts.push(rule.Port);
  if (rule.Protocol) parts.push(rule.Protocol.toLowerCase());
  return parts.join('/');
};

const resetCurrentRule = () => {
  currentRule.value = {
    Order: 0,
    Type: 'Application',
    ApplicationName: '',
    DeviceName: '',
    MACAddress: '',
    Port: '',
    Protocol: '',
    Priority: ''
  };
};

const handleTypeChange = () => {
  currentRule.value = {
    Order: currentRule.value.Order,
    Type: currentRule.value.Type,
    ApplicationName: '',
    DeviceName: '',
    MACAddress: '',
    Port: '',
    Protocol: '',
    Priority: currentRule.value.Priority
  };
  selectedApplicationType.value = '';
  selectedDevice.value = '';
  modalErrorMessage.value = '';
};

const handleApplicationTypeChange = () => {
  const appType = formData.value.ApplicationTypeList.find(
    (app: QosApplicationType) => app.ApplicationType === selectedApplicationType.value
  );

  if (appType && selectedApplicationType.value !== 'Self-defined') {
    currentRule.value.ApplicationName = appType.ApplicationType;
    currentRule.value.Port = appType.Port;
    currentRule.value.Protocol = appType.Protocol;
  } else if (selectedApplicationType.value === 'Self-defined') {
    currentRule.value.ApplicationName = '';
    currentRule.value.Port = '';
    currentRule.value.Protocol = '';
  }

  modalErrorMessage.value = '';
};

const openAddModal = () => {
  editingIndex.value = null;

  const defaultProtocol =
    formData.value.ProtocolList.includes('TCP,UDP')
      ? 'TCP,UDP'
      : formData.value.ProtocolList[0] || '';

  const defaultPriority =
    formData.value.PriorityList.includes('Medium')
      ? 'Medium'
      : formData.value.PriorityList[0] || '';

  currentRule.value = {
    Order: 0,
    Type: 'Application',
    ApplicationName: '',
    DeviceName: '',
    MACAddress: '',
    Port: '',
    Protocol: defaultProtocol,
    Priority: defaultPriority
  };

  selectedApplicationType.value = 'Self-defined';
  selectedDevice.value = '';
  modalErrorMessage.value = '';
  showAddModal.value = true;
};

const handleDeviceChange = () => {
  const device = formData.value.DeviceList.find(
    (d: QosDevice) => d.DeviceName === selectedDevice.value
  );

  if (device) {
    currentRule.value.DeviceName = device.DeviceName;
    currentRule.value.MACAddress = device.MACAddress;
  }

  modalErrorMessage.value = '';
};

const handleEdit = (rule: QosRule, index: number) => {
  editingIndex.value = index;
  currentRule.value = { ...rule };

  if (rule.Type === 'Application') {
    selectedApplicationType.value = rule.ApplicationName;
  } else {
    selectedDevice.value = rule.DeviceName;
  }

  modalErrorMessage.value = '';
  showAddModal.value = true;
};

const handleDelete = (index: number) => {
  if (confirm(t('qos.confirmDelete'))) {
    formData.value.RuleList.splice(index, 1);
    formData.value.RuleList.forEach((rule, idx) => {
      rule.Order = idx + 1;
    });
  }
};

const validateRule = (): boolean => {
  if (!currentRule.value.Priority) {
    modalErrorMessage.value = t('qos.priorityRequired');
    return false;
  }

  if (currentRule.value.Type === 'Application') {
    if (!currentRule.value.ApplicationName) {
      modalErrorMessage.value = t('qos.applicationNameRequired');
      return false;
    }
    if (selectedApplicationType.value === 'Self-defined') {
      if (!currentRule.value.Port) {
        modalErrorMessage.value = t('qos.portRequired');
        return false;
      }
      if (!currentRule.value.Protocol) {
        modalErrorMessage.value = t('qos.protocolRequired');
        return false;
      }
    }
  } else if (!currentRule.value.DeviceName) {
    modalErrorMessage.value = t('qos.deviceRequired');
    return false;
  }

  modalErrorMessage.value = '';
  return true;
};

const handleAddOrUpdate = () => {
  if (!validateRule()) {
    return;
  }

  if (editingIndex.value !== null) {
    formData.value.RuleList[editingIndex.value] = { ...currentRule.value };
  } else {
    currentRule.value.Order = formData.value.RuleList.length + 1;
    formData.value.RuleList.push({ ...currentRule.value });
  }

  closeModal();
};

const closeModal = () => {
  showAddModal.value = false;
  editingIndex.value = null;
  selectedApplicationType.value = '';
  selectedDevice.value = '';
  modalErrorMessage.value = '';
  resetCurrentRule();
};

const handleApply = async () => {
  try {
    loading.value = true;
    await qosApi.updateRule({
      QosRule: {
        RuleList: formData.value.RuleList
      }
    });
    originalData.value = JSON.parse(JSON.stringify(formData.value));
    showSuccessMessage(t('common.saveSuccess'));
  } catch (error) {
    console.error('Failed to save QoS rules:', error);
    showErrorMessage(t('common.saveFailed'));
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  if (originalData.value) {
    formData.value = JSON.parse(JSON.stringify(originalData.value));
  }
};

const loadData = async () => {
  try {
    loading.value = true;
    const response = await qosApi.getRule();
    formData.value = response.QosRule;
    originalData.value = JSON.parse(JSON.stringify(response.QosRule));
  } catch (error) {
    console.error('Failed to load QoS rules:', error);
    showErrorMessage('Failed to load QoS rules');
  } finally {
    loading.value = false;
  }
};

const handleDragStart = (event: DragEvent, index: number) => {
  draggedIndex.value = index;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', String(index));
  }
  const target = event.target as HTMLElement;
  target.style.opacity = '0.4';
};

const handleDragOver = (event: DragEvent, index: number) => {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
};

const handleDragEnter = (event: DragEvent, index: number) => {
  event.preventDefault();
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    dragOverIndex.value = index;
  }
};

const handleDragLeave = (event: DragEvent) => {
  const relatedTarget = event.relatedTarget as HTMLElement;
  const currentTarget = event.currentTarget as HTMLElement;

  if (!currentTarget.contains(relatedTarget)) {
    dragOverIndex.value = null;
  }
};

const handleDrop = (event: DragEvent, dropIndex: number) => {
  event.preventDefault();
  event.stopPropagation();

  if (draggedIndex.value !== null && draggedIndex.value !== dropIndex) {
    const items = [...formData.value.RuleList];
    const draggedItem = items[draggedIndex.value];

    items.splice(draggedIndex.value, 1);
    items.splice(dropIndex, 0, draggedItem);

    items.forEach((item, idx) => {
      item.Order = idx + 1;
    });

    formData.value.RuleList = items;
  }

  dragOverIndex.value = null;
};

const handleDragEnd = (event: DragEvent) => {
  const target = event.target as HTMLElement;
  target.style.opacity = '1';
  draggedIndex.value = null;
  dragOverIndex.value = null;
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.qos-rule-tab {
  padding: 20px;
}

.rule-table-container {
  width: 100%;
  overflow-x: auto;
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  min-width: 4.5rem;
}

.icon-btn {
  padding: 4px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary, #6b7280);
  transition: color 0.2s;
}

.icon-btn:hover {
  color: var(--primary-color, #2563eb);
}

.icon-btn .material-icons {
  font-size: 20px;
}

.button-group {
  justify-content: flex-end;
  margin-top: 2rem;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 0;
}

.form-label {
  font-weight: 500;
  color: var(--text-primary, #1f2937);
}

.form-group :deep(.form-group) {
  margin-bottom: 0;
}

.field-hint {
  font-size: 12px;
  color: var(--text-secondary, #6b7280);
  margin-top: 2px;
}

.modal-actions {
  justify-content: flex-end;
  margin-top: 4px;
}

.modal-error-banner {
  padding: 0.75rem 1rem;
  border-left: 4px solid #c62828;
  background-color: #ffebee;
  color: #c62828;
  border-radius: 4px;
}

.draggable-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.draggable-table th,
.draggable-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.draggable-table th:last-child,
.draggable-table td:last-child {
  width: 7rem;
  text-align: center;
}

.draggable-table th {
  background: var(--bg-secondary, #f9fafb);
  font-weight: 600;
  color: var(--text-primary, #1f2937);
  font-size: 14px;
}

.draggable-table tbody tr {
  cursor: move;
  transition: background-color 0.2s;
}

.draggable-table tbody tr:hover {
  background-color: var(--bg-hover, #f3f4f6);
}

.draggable-table tbody tr.drag-over {
  background-color: var(--primary-light, #dbeafe);
  border-top: 2px solid var(--primary-color, #2563eb);
}

.drag-handle {
  width: 40px;
  cursor: grab;
  color: var(--text-secondary, #6b7280);
}

.drag-handle:active {
  cursor: grabbing;
}

.drag-handle .material-icons {
  font-size: 20px;
  vertical-align: middle;
}

@media (max-width: 768px) {
  .draggable-table {
    font-size: 14px;
  }

  .draggable-table th,
  .draggable-table td {
    padding: 8px;
  }
}
</style>
