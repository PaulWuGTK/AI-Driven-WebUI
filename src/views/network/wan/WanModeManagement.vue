<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WanModeConfig } from '../../../types/wanManagement';
import { getWanModeManagement, updateWanModeManagement } from '../../../services/api/wanManagement';
import WanModeEdit from './WanModeEdit.vue';
import WanModeDetail from './WanModeDetail.vue';
import { ActionButtons, BaseTable, BaseToast } from '../../../components/common';
import { useAutoDismiss } from '../../../composables/useAutoDismiss';
import { extractNokMessage } from '../../../utils/apiUtils';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const managementData = ref<WanModeConfig[]>([]);
const tempManagementData = ref<WanModeConfig[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const successMessage = ref('');
const errorToastMessage = ref('');
const { visible: showSuccessToast, show: triggerSuccessToast } = useAutoDismiss();
const { visible: showErrorToast, show: triggerErrorToast } = useAutoDismiss();
const isEditing = ref(false);
const editingMode = ref<WanModeConfig | null>(null);
const viewingMode = ref<WanModeConfig | null>(null);

// Dynamic lists from backend
const listPhysicalType = ref<string[]>([]);
const listInterface = ref<string[]>([]);
const listDNSMode = ref<string[]>([]);
const listIPv6DNSMode = ref<string[]>([]);
const listIPv4Mode = ref<string[]>([]);
const listIPv6Mode = ref<string[]>([]);
const listVLANType = ref<string[]>([]);
const listConnectionTrigger = ref<string[]>([]);

const modeColumns = computed(() => [
  { key: 'WANMode', label: t('wanManagement.name'), headerDataTestid: qa('wan-mode-management-header-name') },
  { key: 'EnableSensing', label: t('wanManagement.enableSensing'), headerDataTestid: qa('wan-mode-management-header-enable-sensing') },
  { key: 'DNSMode', label: t('wanManagement.ipv4DnsMode'), headerDataTestid: qa('wan-mode-management-header-ipv4-dns-mode') },
  { key: 'IPv6DNSMode', label: t('wanManagement.ipv6DnsMode'), headerDataTestid: qa('wan-mode-management-header-ipv6-dns-mode') },
  { key: 'PhysicalType', label: t('wanManagement.physicalType'), headerDataTestid: qa('wan-mode-management-header-physical-type') },
  { key: 'Status', label: t('wanManagement.status'), headerDataTestid: qa('wan-mode-management-header-status') },
  { key: 'actions', label: t('wanManagement.action'), headerDataTestid: qa('wan-mode-management-header-action') },
]);

const fetchManagementData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getWanModeManagement();
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      error.value = nokMessage;
      managementData.value = [];
      tempManagementData.value = [];
      return;
    }
    const data = response.WanModeManagement;
    listPhysicalType.value = data.ListPhysicalType || [];
    listInterface.value = data.ListInterface || [];
    listDNSMode.value = data.ListDNSMode || [];
    listIPv6DNSMode.value = data.ListIPv6DNSMode || [];
    listIPv4Mode.value = data.ListIPv4Mode || [];
    listIPv6Mode.value = data.ListIPv6Mode || [];
    listVLANType.value = data.ListVLANType || [];
    listConnectionTrigger.value = data.ListConnectionTrigger || [];
    managementData.value = data.Profiles || [];
    tempManagementData.value = JSON.parse(JSON.stringify(data.Profiles || []));
  } catch (err) {
    console.error('Error fetching WAN mode management:', err);
    error.value = 'Failed to fetch WAN mode management';
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
  editingMode.value = {
    WANMode: '',
    Status: 'Enabled',
    PhysicalType: listPhysicalType.value[0] || 'Ethernet',
    EnableSensing: 1,
    DNSMode: listDNSMode.value[0] || 'Dynamic',
    IPv6DNSMode: listIPv6DNSMode.value[0] || 'Dynamic',
    Interfaces: [{
      Interface: listInterface.value[0] || 'wan',
      IPv4Mode: listIPv4Mode.value[0] || 'dhcp4',
      IPv6Mode: 'none',
      PPPoEUserName: '',
      PPPoEPassword: '',
      ConnectionTrigger: 'AlwaysOn',
      ServiceName: '',
      IdleTime: 0,
      VLANType: listVLANType.value[0] || 'untagged',
      VLANID: 100,
      VLANPriority: 0,
      MTU: 1500,
      StaticIPv4Address: {
        IPv4Address: '',
        SubnetMask: '',
        DNSServers: '',
        DefaultRouter: ''
      },
      StaticIPv6Address: {
        IPv6Address: '',
        PrefixLength: 0,
        DNSServers: '',
        DefaultRouter: ''
      }
    }]
  };
  isEditing.value = true;
};

const handleEdit = (mode: WanModeConfig) => {
  editingMode.value = JSON.parse(JSON.stringify(mode));
  isEditing.value = true;
};

const handleDelete = async (mode: WanModeConfig) => {
  if (!confirm(t('wanManagement.confirmDelete'))) return;

  try {
    const updatedModes = tempManagementData.value.filter(m => m.WANMode !== mode.WANMode);
    tempManagementData.value = updatedModes;
  } catch (err) {
    console.error('Error deleting WAN mode:', err);
    showErrorMessage('Failed to delete WAN mode');
  }
};

const handleDetail = (mode: WanModeConfig) => {
  viewingMode.value = mode;
};

const handleSave = async (mode: WanModeConfig) => {
  try {
    const updatedModes = editingMode.value?.WANMode
      ? tempManagementData.value.map(m => m.WANMode === editingMode.value?.WANMode ? mode : m)
      : [...tempManagementData.value, mode];

    tempManagementData.value = updatedModes;
    isEditing.value = false;
    editingMode.value = null;
  } catch (err) {
    console.error('Error saving WAN mode:', err);
    showErrorMessage('Failed to save WAN mode');
  }
};

const showSuccessMessage = (message = `${t('common.apply')} successful`) => {
  successMessage.value = message;
  triggerSuccessToast();
};

const showErrorMessage = (message: string) => {
  errorToastMessage.value = message;
  triggerErrorToast();
};

const handleApply = async () => {
  loading.value = true;
  try {
    const response = await updateWanModeManagement({
      WanModeManagement: {
        Profiles: tempManagementData.value
      }
    });
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      showErrorMessage(nokMessage);
      return;
    }
    managementData.value = JSON.parse(JSON.stringify(tempManagementData.value));
    showSuccessMessage();
  } catch (err) {
    console.error('Error applying WAN mode changes:', err);
    showErrorMessage('Failed to apply changes');
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  tempManagementData.value = JSON.parse(JSON.stringify(managementData.value));
};

onMounted(fetchManagementData);
</script>

<template>
  <div class="wan-mode-management" :data-testid="qa('wan-mode-management-content')">
    <div v-if="loading" class="loading-state" :data-testid="qa('wan-mode-management-loading')">
      <div class="loading-spinner"></div>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="error" class="error-state" :data-testid="qa('wan-mode-management-error')">
      {{ error }}
    </div>

    <template v-else>
      <div v-if="!isEditing && !viewingMode" class="management-list" :data-testid="qa('wan-mode-management-list')">
        <div class="header-row">
          <div class="section-title-sp" :data-testid="qa('wan-mode-management-title')">{{ t('wanSetup.modeManagement') }}</div>
          <button class="btn btn-primary" :data-testid="qa('wan-mode-management-add-button')" @click="handleAdd">
            <span class="material-icons">add</span>
            {{ t('wanManagement.addMode') }}
          </button>
        </div>

        <BaseTable
          class="wan-mode-table"
          :columns="modeColumns"
          :data="tempManagementData"
          row-key="WANMode"
          :table-data-testid="qa('wan-mode-management-table-container')"
          :mobile-data-testid="qa('wan-mode-management-mobile')"
        >
          <template #cell-WANMode="{ row, index, mobile }">
            <span :data-testid="qa(mobile ? `wan-mode-management-card-name-value-${index}` : `wan-mode-management-name-${index}`)">
              {{ row.WANMode }}
            </span>
          </template>
          <template #cell-EnableSensing="{ row, index, mobile }">
            <span :data-testid="qa(mobile ? `wan-mode-management-card-enable-sensing-value-${index}` : `wan-mode-management-enable-sensing-${index}`)">
              {{ row.EnableSensing ? 'True' : 'False' }}
            </span>
          </template>
          <template #cell-DNSMode="{ row, index, mobile }">
            <span :data-testid="qa(mobile ? `wan-mode-management-card-ipv4-dns-mode-value-${index}` : `wan-mode-management-ipv4-dns-mode-${index}`)">
              {{ row.DNSMode }}
            </span>
          </template>
          <template #cell-IPv6DNSMode="{ row, index, mobile }">
            <span :data-testid="qa(mobile ? `wan-mode-management-card-ipv6-dns-mode-value-${index}` : `wan-mode-management-ipv6-dns-mode-${index}`)">
              {{ row.IPv6DNSMode }}
            </span>
          </template>
          <template #cell-PhysicalType="{ row, index, mobile }">
            <span :data-testid="qa(mobile ? `wan-mode-management-card-physical-type-value-${index}` : `wan-mode-management-physical-type-${index}`)">
              {{ row.PhysicalType }}
            </span>
          </template>
          <template #cell-Status="{ row, index, mobile }">
            <span :data-testid="qa(mobile ? `wan-mode-management-card-status-value-${index}` : `wan-mode-management-status-${index}`)">
              {{ row.Status }}
            </span>
          </template>
          <template #cell-actions="{ row, index, mobile }">
            <div class="action-buttons" :data-testid="qa(mobile ? `wan-mode-management-card-actions-${index}` : `wan-mode-management-actions-${index}`)">
              <button class="btn-action" :data-testid="qa(mobile ? `wan-mode-management-card-edit-${index}` : `wan-mode-management-edit-${index}`)" @click="handleEdit(row)" title="Edit">
                <span class="material-icons">edit</span>
              </button>
              <button class="btn-action" :data-testid="qa(mobile ? `wan-mode-management-card-delete-${index}` : `wan-mode-management-delete-${index}`)" @click="handleDelete(row)" title="Delete">
                <span class="material-icons">delete</span>
              </button>
              <button class="btn-action" :data-testid="qa(mobile ? `wan-mode-management-card-detail-${index}` : `wan-mode-management-detail-${index}`)" @click="handleDetail(row)" title="Detail">
                <span class="material-icons">info</span>
              </button>
            </div>
          </template>
        </BaseTable>

        <div class="button-group">
          <ActionButtons
            :cancel-data-testid="qa('wan-mode-management-cancel-button')"
            :apply-data-testid="qa('wan-mode-management-apply-button')"
            @cancel="handleCancel"
            @apply="handleApply"
          />
        </div>
      </div>

      <WanModeEdit
        v-else-if="isEditing"
        :data-testid="qa('wan-mode-management-edit')"
        :mode="editingMode"
        :listPhysicalType="listPhysicalType"
        :listInterface="listInterface"
        :listDNSMode="listDNSMode"
        :listIPv6DNSMode="listIPv6DNSMode"
        :listIPv4Mode="listIPv4Mode"
        :listIPv6Mode="listIPv6Mode"
        :listVLANType="listVLANType"
        :listConnectionTrigger="listConnectionTrigger"
        @save="handleSave"
        @cancel="isEditing = false"
      />

      <WanModeDetail
        v-else-if="viewingMode"
        :data-testid="qa('wan-mode-management-detail')"
        :mode="viewingMode"
        @back="viewingMode = null"
      />
    </template>

    <BaseToast
      v-model="showSuccessToast"
      :message="successMessage"
      type="success"
      :data-testid="qa('wan-mode-management-success-message')"
    />
    <BaseToast
      v-model="showErrorToast"
      :message="errorToastMessage"
      type="error"
      :data-testid="qa('wan-mode-management-error-toast')"
    />
  </div>
</template>

<style scoped>
.section-title-sp {
  font-size: 1rem;
  color: var(--text-primary);
  padding: 0.5rem 0;
}

.wan-mode-table :deep(.table-container) {
  padding: 1.5rem;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn .material-icons {
  font-size: 1.25rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  min-width: 4.5rem;
}

.wan-mode-table :deep(.table-container table th:last-child),
.wan-mode-table :deep(.table-container table td:last-child) {
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

.btn-action .material-icons {
  font-size: 1.25rem;
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

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
}

@media (max-width: 768px) {
  .header-row {
    flex-direction: column;
    gap: 1rem;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .wan-mode-table :deep(.mobile-cards) {
    padding: 1.5rem;
  }

  .button-group {
    flex-direction: column;
    padding: 1rem;
  }

  .button-group :deep(.btn) {
    width: 100%;
  }
}
</style>
