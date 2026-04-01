<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DnsRouteResponse, DnsRouteRule } from '../../../types/dnsRoute';
import { getDnsRoute, updateDnsRoute } from '../../../services/api/dnsRoute';
import { ActionButtons, BaseModal, BaseSwitch, BaseTable, SectionCard } from '../../../components/common';
import { useQA } from '../../../utils/qa';

interface DnsRouteFormData {
  Enable: 0 | 1;
  DomainName: string;
  SubMask: string;
  WanIf: string;
}

const { qa } = useQA();
const { t } = useI18n();

const loading = ref(false);
const processing = ref(false);
const error = ref<string | null>(null);
const showSuccess = ref(false);

const dnsRoutes = ref<DnsRouteRule[]>([]);
const wanIfList = ref<string[]>([]);

const showModal = ref(false);
const editingIndex = ref<number | null>(null);
const formData = ref<DnsRouteFormData>({
  Enable: 1,
  DomainName: '',
  SubMask: '255.255.255.255',
  WanIf: ''
});
const formErrors = ref({
  DomainName: '',
  SubMask: '',
  WanIf: ''
});

const routeColumns = computed(() => [
  { key: 'no', label: '#', headerDataTestid: qa('dns-route-header-no') },
  { key: 'status', label: t('routing.status'), headerDataTestid: qa('dns-route-header-status') },
  { key: 'DomainName', label: t('routing.domainName'), headerDataTestid: qa('dns-route-header-domain-name') },
  { key: 'WanIf', label: t('routing.wanInterface'), headerDataTestid: qa('dns-route-header-wan-interface') },
  { key: 'SubMask', label: t('routing.subnetMask'), headerDataTestid: qa('dns-route-header-subnet-mask') },
  { key: 'actions', label: t('routing.action'), headerDataTestid: qa('dns-route-header-action') },
]);

const routeRows = computed(() => dnsRoutes.value.map((route, index) => ({
  ...route,
  rowKey: `dns-route-${index}`,
  rowIndex: index,
  no: index + 1
})));

const modalTitle = computed(() => (
  editingIndex.value === null ? t('routing.addDnsRoute') : t('routing.editDnsRoute')
));

const applyResponseData = (response: DnsRouteResponse) => {
  dnsRoutes.value = (response.DNSRoute || []).map((rule) => ({ ...rule }));

  const interfaces = response.WanIfList && response.WanIfList.length > 0
    ? response.WanIfList
    : Array.from(new Set(dnsRoutes.value.map((route) => route.WanIf).filter(Boolean)));

  wanIfList.value = interfaces;
};

const fetchDnsRoutes = async (silent = false) => {
  if (!silent) loading.value = true;
  error.value = null;

  try {
    const response = await getDnsRoute();
    applyResponseData(response);
  } catch (err) {
    console.error('Error fetching DNS routes:', err);
    error.value = t('routing.loadDnsRoutesFailed');
  } finally {
    if (!silent) loading.value = false;
  }
};

const resetFormErrors = () => {
  formErrors.value = {
    DomainName: '',
    SubMask: '',
    WanIf: ''
  };
};

const openAddModal = () => {
  editingIndex.value = null;
  resetFormErrors();
  formData.value = {
    Enable: 1,
    DomainName: '',
    SubMask: '255.255.255.255',
    WanIf: wanIfList.value[0] || ''
  };
  showModal.value = true;
};

const openEditModal = (index: number) => {
  const route = dnsRoutes.value[index];
  if (!route) return;

  editingIndex.value = index;
  resetFormErrors();
  formData.value = {
    Enable: route.Enable,
    DomainName: route.DomainName,
    SubMask: route.SubMask,
    WanIf: route.WanIf
  };
  showModal.value = true;
};

const closeModal = (force = false) => {
  if (processing.value && !force) return;
  showModal.value = false;
  editingIndex.value = null;
};

const validateIPv4 = (ip: string): boolean => {
  const ipv4Regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Regex.test(ip);
};

const validateDomainName = (domainName: string): boolean => {
  const domainRegex = /^(?:\*\.)?[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*$/;
  return domainRegex.test(domainName);
};

const validateForm = (): boolean => {
  resetFormErrors();
  let isValid = true;

  const domainName = formData.value.DomainName.trim();
  const subnetMask = formData.value.SubMask.trim();

  if (!domainName) {
    formErrors.value.DomainName = t('routing.domainNameRequired');
    isValid = false;
  } else if (!validateDomainName(domainName)) {
    formErrors.value.DomainName = t('routing.domainNameInvalid');
    isValid = false;
  } else {
    const duplicate = dnsRoutes.value.some((route, index) => {
      if (editingIndex.value !== null && index === editingIndex.value) return false;
      return route.DomainName.trim().toLowerCase() === domainName.toLowerCase();
    });

    if (duplicate) {
      formErrors.value.DomainName = t('routing.duplicateDomainName');
      isValid = false;
    }
  }

  if (!subnetMask) {
    formErrors.value.SubMask = t('routing.subnetMaskRequired');
    isValid = false;
  } else if (!validateIPv4(subnetMask)) {
    formErrors.value.SubMask = t('routing.invalidSubnetMask');
    isValid = false;
  }

  if (!formData.value.WanIf) {
    formErrors.value.WanIf = t('routing.wanInterfaceRequired');
    isValid = false;
  }

  if (editingIndex.value === null && dnsRoutes.value.length >= 20) {
    formErrors.value.DomainName = t('routing.maxDnsRoutesReached');
    isValid = false;
  }

  return isValid;
};

const createAlias = (): string => {
  const aliases = new Set(dnsRoutes.value.map((route) => route.Alias).filter(Boolean));
  let number = dnsRoutes.value.length + 1;
  let alias = `dnsroute${number}`;

  while (aliases.has(alias)) {
    number += 1;
    alias = `dnsroute${number}`;
  }

  return alias;
};

const showSuccessMessage = () => {
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
  }, 3000);
};

const handleSave = async () => {
  if (processing.value) return;
  error.value = null;

  if (!validateForm()) return;

  processing.value = true;
  try {
    const updatedRoutes = [...dnsRoutes.value];
    const currentRoute = editingIndex.value !== null ? dnsRoutes.value[editingIndex.value] : null;

    const savedRule: DnsRouteRule = {
      Enable: formData.value.Enable,
      Alias: currentRoute?.Alias || createAlias(),
      DomainName: formData.value.DomainName.trim(),
      SubMask: formData.value.SubMask.trim(),
      WanIf: formData.value.WanIf
    };

    if (editingIndex.value !== null) {
      updatedRoutes[editingIndex.value] = savedRule;
    } else {
      updatedRoutes.push(savedRule);
    }

    const response = await updateDnsRoute({ DNSRoute: updatedRoutes });
    applyResponseData(response);
    closeModal(true);
    showSuccessMessage();
  } catch (err) {
    console.error('Error saving DNS route:', err);
    error.value = t('routing.saveDnsRoutesFailed');
  } finally {
    processing.value = false;
  }
};

const handleDelete = async (index: number) => {
  if (processing.value) return;

  const route = dnsRoutes.value[index];
  if (!route) return;

  if (!confirm(t('routing.confirmDeleteDnsRoute'))) return;

  error.value = null;
  processing.value = true;

  try {
    const updatedRoutes = [...dnsRoutes.value];
    updatedRoutes.splice(index, 1);

    const response = await updateDnsRoute({ DNSRoute: updatedRoutes });
    applyResponseData(response);
    showSuccessMessage();
  } catch (err) {
    console.error('Error deleting DNS route:', err);
    error.value = t('routing.saveDnsRoutesFailed');
  } finally {
    processing.value = false;
  }
};

onMounted(() => {
  fetchDnsRoutes();
});
</script>

<template>
  <div class="dns-route-tab" :data-testid="qa('dns-route-tab')">
    <div v-if="loading" class="loading-state" :data-testid="qa('dns-route-loading')">
      <div class="loading-spinner"></div>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="error" class="error-state" :data-testid="qa('dns-route-error')">
      {{ error }}
    </div>

    <template v-else>
      <SectionCard
        :data-testid="qa('dns-route-section')"
        header-mode="row"
        :title="t('routing.dnsRoute')"
        :title-data-testid="qa('dns-route-title')"
      >
        <template #actions>
          <button
            class="btn btn-primary"
            :disabled="processing"
            :data-testid="qa('dns-route-add-button')"
            @click="openAddModal"
          >
            <span class="material-icons">add</span>
            {{ t('routing.addDnsRoute') }}
          </button>
        </template>

        <div class="info-message" :data-testid="qa('dns-route-info')">
          {{ t('routing.dnsRouteDescription') }}
        </div>

        <BaseTable
          :columns="routeColumns"
          :data="routeRows"
          row-key="rowKey"
          :empty-text="t('routing.noDnsRoutes')"
          :table-data-testid="qa('dns-route-table')"
          :mobile-data-testid="qa('dns-route-mobile')"
        >
          <template #cell-no="{ row, mobile }">
            <span :data-testid="!mobile ? qa(`dns-route-no-${row.rowIndex}`) : undefined">
              {{ row.no }}
            </span>
          </template>

          <template #cell-status="{ row, mobile }">
            <span
              class="material-icons status-icon"
              :class="{ enabled: row.Enable === 1, disabled: row.Enable !== 1 }"
              :data-testid="!mobile ? qa(`dns-route-status-${row.rowIndex}`) : undefined"
            >
              {{ row.Enable === 1 ? 'check_circle' : 'cancel' }}
            </span>
          </template>

          <template #cell-DomainName="{ row, mobile }">
            <span :data-testid="!mobile ? qa(`dns-route-domain-${row.rowIndex}`) : undefined">
              {{ row.DomainName }}
            </span>
          </template>

          <template #cell-WanIf="{ row, mobile }">
            <span :data-testid="!mobile ? qa(`dns-route-wan-if-${row.rowIndex}`) : undefined">
              {{ row.WanIf }}
            </span>
          </template>

          <template #cell-SubMask="{ row, mobile }">
            <span :data-testid="!mobile ? qa(`dns-route-submask-${row.rowIndex}`) : undefined">
              {{ row.SubMask }}
            </span>
          </template>

          <template #cell-actions="{ row, mobile }">
            <div class="action-buttons">
              <button
                class="btn-action"
                :disabled="processing"
                :data-testid="!mobile ? qa(`dns-route-edit-${row.rowIndex}`) : undefined"
                :title="t('common.edit')"
                @click="openEditModal(row.rowIndex)"
              >
                <span class="material-icons">edit</span>
              </button>

              <button
                class="btn-action"
                :disabled="processing"
                :data-testid="!mobile ? qa(`dns-route-delete-${row.rowIndex}`) : undefined"
                :title="t('common.delete')"
                @click="handleDelete(row.rowIndex)"
              >
                <span class="material-icons">delete</span>
              </button>
            </div>
          </template>

          <template #empty>
            <div class="no-data" :data-testid="qa('dns-route-no-data')">
              {{ t('routing.noDnsRoutes') }}
            </div>
          </template>
        </BaseTable>

        <div class="note-text" :data-testid="qa('dns-route-note')">
          {{ t('routing.maxDnsRoutesNote') }}
        </div>
      </SectionCard>
    </template>

    <BaseModal
      v-model="showModal"
      size="md"
      :title="modalTitle"
      :closable="!processing"
      :close-on-overlay="!processing"
      :close-button-data-testid="qa('dns-route-modal-close')"
      @close="closeModal"
    >
      <div class="form-section" :data-testid="qa('dns-route-form')">
        <div class="form-group">
          <label class="toggle-label">
            {{ t('routing.enable') }}
            <BaseSwitch
              v-model="formData.Enable"
              :true-value="1"
              :false-value="0"
              :disabled="processing"
              :data-testid="qa('dns-route-form-enable')"
              :slider-data-testid="qa('dns-route-form-enable-slider')"
            />
          </label>
        </div>

        <div class="form-group">
          <label>
            {{ t('routing.domainName') }}
            <span class="required">*</span>
          </label>
          <input
            v-model="formData.DomainName"
            type="text"
            :disabled="processing"
            :class="{ error: formErrors.DomainName }"
            :placeholder="t('routing.domainNamePlaceholder')"
            :data-testid="qa('dns-route-form-domain-name')"
          />
          <span v-if="formErrors.DomainName" class="error-message">{{ formErrors.DomainName }}</span>
        </div>

        <div class="form-group">
          <label>
            {{ t('routing.wanInterface') }}
            <span class="required">*</span>
          </label>
          <select
            v-model="formData.WanIf"
            :disabled="processing"
            :class="{ error: formErrors.WanIf }"
            :data-testid="qa('dns-route-form-wan-if')"
          >
            <option value="" disabled>{{ t('routing.selectWanInterface') }}</option>
            <option v-for="iface in wanIfList" :key="iface" :value="iface">{{ iface }}</option>
          </select>
          <span v-if="formErrors.WanIf" class="error-message">{{ formErrors.WanIf }}</span>
        </div>

        <div class="form-group">
          <label>
            {{ t('routing.subnetMask') }}
            <span class="required">*</span>
          </label>
          <input
            v-model="formData.SubMask"
            type="text"
            :disabled="processing"
            :class="{ error: formErrors.SubMask }"
            placeholder="255.255.255.255"
            :data-testid="qa('dns-route-form-submask')"
          />
          <span v-if="formErrors.SubMask" class="error-message">{{ formErrors.SubMask }}</span>
        </div>

      </div>

      <template #footer>
        <ActionButtons
          :apply-loading="processing"
          :apply-disabled="processing"
          :cancel-disabled="processing"
          :cancel-data-testid="qa('dns-route-form-cancel')"
          :apply-data-testid="qa('dns-route-form-save')"
          :apply-text="t('common.confirm')"
          @cancel="() => closeModal()"
          @apply="handleSave"
        />
      </template>
    </BaseModal>

    <div v-if="showSuccess" class="success-message" :data-testid="qa('dns-route-success-message')">
      {{ t('common.operationSuccessful') }}
    </div>
  </div>
</template>

<style scoped>
.dns-route-tab {
  padding: 0;
}

.info-message {
  background-color: var(--bg-info);
  border-left: 4px solid var(--info-color);
  padding: 1rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  font-size: 0.9rem;
  line-height: 1.5;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-icon {
  font-size: 1.25rem;
  vertical-align: middle;
}

.status-icon.enabled {
  color: #4caf50;
}

.status-icon.disabled {
  color: #9e9e9e;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  min-width: 4.5rem;
}

:deep(.table-container table th:last-child),
:deep(.table-container table td:last-child) {
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

.btn-action:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.btn-action:hover:not(:disabled) {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
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

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-group label {
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.95rem;
}

.toggle-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.required {
  color: #dc3545;
}

.form-group input[type='text'],
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.95rem;
}

.form-group input.error,
.form-group select.error {
  border-color: #dc3545;
}

.form-group input:disabled,
.form-group select:disabled {
  background-color: var(--bg-primary);
  cursor: not-allowed;
  opacity: 0.6;
}

.error-message {
  color: #dc3545;
  font-size: 0.85rem;
}

.note-text {
  margin-top: 1.25rem;
  font-size: 0.95rem;
  color: var(--text-secondary);
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
  z-index: 2000;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }

  10% {
    opacity: 1;
    transform: translateY(0);
  }

  90% {
    opacity: 1;
    transform: translateY(0);
  }

  100% {
    opacity: 0;
    transform: translateY(-20px);
  }
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
