<template>
  <div class="qos-rule-tab">
    <BaseCard>
      <div class="rule-header">
        <h3>{{ t('qos.qosRuleLists') }}</h3>
        <BaseButton @click="openAddModal" variant="primary">
          {{ t('qos.addRule') }}
        </BaseButton>
      </div>

      <div class="rule-table-container">
        <BaseTable
          :columns="columns"
          :data="formData.RuleList"
          :bordered="true"
          :hover="true"
        >
          <template #cell-no="{ index }">
            {{ index + 1 }}
          </template>
          <template #cell-type="{ row }">
            {{ row.Type }}
          </template>
          <template #cell-name="{ row }">
            {{ row.Type === 'Application' ? row.ApplicationName : row.DeviceName }}
          </template>
          <template #cell-description="{ row }">
            {{ formatDescription(row) }}
          </template>
          <template #cell-priority="{ row }">
            {{ row.Priority }}
          </template>
          <template #cell-action="{ row, index }">
            <div class="action-buttons">
              <button @click="handleEdit(row, index)" class="icon-btn" :title="t('common.edit')">
                <span class="material-icons">edit</span>
              </button>
              <button @click="handleDelete(index)" class="icon-btn" :title="t('common.delete')">
                <span class="material-icons">delete</span>
              </button>
            </div>
          </template>
        </BaseTable>
      </div>

      <div class="button-group">
        <BaseButton @click="handleCancel" variant="secondary">
          {{ t('common.cancel') }}
        </BaseButton>
        <BaseButton @click="handleApply" variant="primary">
          {{ t('common.apply') }}
        </BaseButton>
      </div>
    </BaseCard>

    <BaseModal
      v-model="showAddModal"
      :title="editingIndex !== null ? t('qos.editRule') : t('qos.addQosRule')"
      @close="closeModal"
    >
      <div class="modal-form">
        <div class="form-group">
          <label class="form-label">{{ t('qos.type') }}</label>
          <BaseSelect
            v-model="currentRule.Type"
            :options="typeOptions"
            @change="handleTypeChange"
          />
        </div>

        <template v-if="currentRule.Type === 'Device'">
          <div class="form-group">
            <label class="form-label">{{ t('qos.device') }}</label>
            <BaseSelect
              v-model="selectedDevice"
              :options="deviceOptions"
              @change="handleDeviceChange"
            />
          </div>

          <div class="form-group">
            <label class="form-label">{{ t('qos.macAddress') }}</label>
            <BaseInput
              v-model="currentRule.MACAddress"
              :disabled="true"
            />
          </div>
        </template>

        <template v-if="currentRule.Type === 'Application'">
          <div class="form-group">
            <label class="form-label">{{ t('qos.applicationType') }}</label>
            <BaseSelect
              v-model="selectedApplicationType"
              :options="applicationTypeOptions"
              @change="handleApplicationTypeChange"
            />
          </div>

          <div class="form-group">
            <label class="form-label">{{ t('qos.applicationName') }}</label>
            <BaseInput
              v-model="currentRule.ApplicationName"
              :disabled="selectedApplicationType !== 'Self-defined'"
            />
          </div>

          <div class="form-group">
            <label class="form-label">{{ t('qos.port') }}</label>
            <BaseInput
              v-model="currentRule.Port"
              :disabled="selectedApplicationType !== 'Self-defined'"
              :placeholder="t('qos.portPlaceholder')"
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
            />
          </div>
        </template>

        <div class="form-group">
          <label class="form-label">{{ t('qos.priority') }}</label>
          <BaseSelect
            v-model="currentRule.Priority"
            :options="priorityOptions"
          />
        </div>

        <div class="modal-actions">
          <BaseButton @click="handleAddOrUpdate" variant="primary">
            {{ editingIndex !== null ? t('common.update') : t('common.add') }}
          </BaseButton>
          <BaseButton @click="closeModal" variant="secondary">
            {{ t('common.cancel') }}
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseCard from '../../../components/common/BaseCard.vue';
import BaseButton from '../../../components/common/BaseButton.vue';
import BaseTable from '../../../components/common/BaseTable.vue';
import BaseModal from '../../../components/common/BaseModal.vue';
import BaseInput from '../../../components/common/BaseInput.vue';
import BaseSelect from '../../../components/common/BaseSelect.vue';
import { qosApi } from '../../../services/api/qos';
import type { QosRule, QosRuleData, QosApplicationType, QosDevice } from '../../../types/qos';

const { t } = useI18n();

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

const columns = [
  { key: 'no', label: t('qos.no'), slot: 'no' },
  { key: 'type', label: t('qos.type'), slot: 'type' },
  { key: 'name', label: t('qos.name'), slot: 'name' },
  { key: 'description', label: t('qos.description'), slot: 'description' },
  { key: 'priority', label: t('qos.priority'), slot: 'priority' },
  { key: 'action', label: t('qos.action'), slot: 'action', width: '120px' }
];

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

const formatDescription = (rule: QosRule): string => {
  if (rule.Type === 'Device') {
    return rule.MACAddress;
  } else {
    const parts = [];
    if (rule.Port) parts.push(rule.Port);
    if (rule.Protocol) parts.push(rule.Protocol.toLowerCase());
    return parts.join('/');
  }
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
};

const openAddModal = () => {
  // 這次是新增，不是編輯
  editingIndex.value = null;

  // 從後端帶回來的清單裡挑預設值
  const defaultProtocol =
    formData.value.ProtocolList.includes('TCP,UDP')
      ? 'TCP,UDP'
      : formData.value.ProtocolList[0] || '';

  const defaultPriority =
    formData.value.PriorityList.includes('Medium')
      ? 'Medium'
      : formData.value.PriorityList[0] || '';

  // 初始化這次要新增的 rule
  currentRule.value = {
    Order: 0,
    Type: 'Application',      // 走 Application 分支
    ApplicationName: '',
    DeviceName: '',
    MACAddress: '',
    Port: '',                 // 留空，顯示 placeholder
    Protocol: defaultProtocol,
    Priority: defaultPriority
  };

  // dropdown 的預設值
  selectedApplicationType.value = 'Self-defined'; // Application Type
  selectedDevice.value = '';

  // 打開彈窗
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
};

const handleEdit = (rule: QosRule, index: number) => {
  editingIndex.value = index;
  currentRule.value = { ...rule };

  if (rule.Type === 'Application') {
    selectedApplicationType.value = rule.ApplicationName;
  } else {
    selectedDevice.value = rule.DeviceName;
  }

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

const validateRule = (): boolean => {
  if (!currentRule.value.Priority) {
    alert(t('qos.priorityRequired'));
    return false;
  }

  if (currentRule.value.Type === 'Application') {
    if (!currentRule.value.ApplicationName) {
      alert(t('qos.applicationNameRequired'));
      return false;
    }
    if (selectedApplicationType.value === 'Self-defined') {
      if (!currentRule.value.Port) {
        alert(t('qos.portRequired'));
        return false;
      }
      if (!currentRule.value.Protocol) {
        alert(t('qos.protocolRequired'));
        return false;
      }
    }
  } else {
    if (!currentRule.value.DeviceName) {
      alert(t('qos.deviceRequired'));
      return false;
    }
  }

  return true;
};

const closeModal = () => {
  showAddModal.value = false;
  editingIndex.value = null;
  selectedApplicationType.value = '';
  selectedDevice.value = '';
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

const handleApply = async () => {
  try {
    loading.value = true;
    await qosApi.updateRule({
      QosRule: {
        RuleList: formData.value.RuleList
      }
    });
    originalData.value = JSON.parse(JSON.stringify(formData.value));
    alert(t('common.saveSuccess'));
  } catch (error) {
    console.error('Failed to save QoS rules:', error);
    alert(t('common.saveFailed'));
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
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.qos-rule-tab {
  padding: 20px;
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.rule-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
}

.rule-table-container {
  width: 100%;
  overflow-x: auto;
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 8px;
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
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 500;
  color: var(--text-primary, #1f2937);
}

.field-hint {
  font-size: 12px;
  color: var(--text-secondary, #6b7280);
  margin-top: 4px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .rule-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
