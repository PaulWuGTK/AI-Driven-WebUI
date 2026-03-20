<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type {
  AdvancedMclMGMT,
  AdvancedMclMGMTUpdateRequest,
  AdvancedMclServiceField,
  AdvancedMclServiceName,
} from '../../types/advancedMcl';
import {
  ADVANCED_MCL_SERVICE_ORDER,
  getAdvancedMclMGMT,
  getAdvancedMclTrustDomain,
  updateAdvancedMclMGMT,
  updateAdvancedMclTrustDomain,
} from '../../services/api/advancedMcl';
import { ActionButtons, BaseCheckbox, BaseInput, BaseModal, BaseTable, BaseToast, SectionCard } from '../../components/common';
import ConfirmationDialog from '../../components/ConfirmationDialog.vue';
import { useAutoDismiss } from '../../composables/useAutoDismiss';
import { extractNokMessage } from '../../utils/apiUtils';
import { useQA } from '../../utils/qa';

const { t } = useI18n();
const { qa } = useQA();

type TabId = 'mgmt' | 'trust';

const loading = ref(false);
const error = ref<string | null>(null);

const activeTab = ref<TabId>('mgmt');
const tabs = computed<Array<{ id: TabId; label: string }>>(() => [
  { id: 'mgmt', label: t('mcl.mgmtServices') },
  { id: 'trust', label: t('mcl.trustDomain') },
]);

const mgmtOriginal = ref<AdvancedMclMGMT | null>(null);
const mgmtDraft = ref<AdvancedMclMGMT | null>(null);
const savingMgmt = ref(false);

const trustDomains = ref<string[]>([]);
const savingTrust = ref(false);
const showAddTrustDomainModal = ref(false);
const newTrustDomain = ref('');
const showDeleteTrustDomainDialog = ref(false);
const deleteTrustDomainTarget = ref('');

const successMessage = ref('');
const errorToastMessage = ref('');
const { visible: showSuccessToast, show: triggerSuccessToast } = useAutoDismiss();
const { visible: showErrorToast, show: triggerErrorToast } = useAutoDismiss();

const WAN_INTERFACE_ORDER = ['IPoE', 'PPPoE', 'Bridge'];

const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const showSuccessMessage = (message = t('common.saveSuccess')) => {
  successMessage.value = message;
  triggerSuccessToast();
};

const showErrorMessage = (message: string) => {
  errorToastMessage.value = message;
  triggerErrorToast();
};

const mgmtColumns = computed(() => [
  { key: 'service', label: t('mcl.service'), headerDataTestid: qa('mcl-mgmt-header-service') },
  { key: 'lan', label: t('mcl.lan'), align: 'center' as const, headerDataTestid: qa('mcl-mgmt-header-lan') },
  { key: 'wan', label: t('mcl.wan'), align: 'center' as const, headerDataTestid: qa('mcl-mgmt-header-wan') },
  {
    key: 'trustdomain',
    label: t('mcl.trustDomain'),
    align: 'center' as const,
    headerDataTestid: qa('mcl-mgmt-header-trust-domain'),
  },
  { key: 'port', label: t('mcl.port'), align: 'center' as const, headerDataTestid: qa('mcl-mgmt-header-port') },
]);

const trustDomainColumns = computed(() => [
  {
    key: 'ipAddress',
    label: t('mcl.ipAddresses'),
    headerDataTestid: qa('mcl-trust-header-ip-addresses'),
  },
  {
    key: 'actions',
    label: t('common.action'),
    align: 'center' as const,
    headerDataTestid: qa('mcl-trust-header-action'),
  },
]);

const mgmtRows = computed(() => {
  if (!mgmtDraft.value) return [];
  return ADVANCED_MCL_SERVICE_ORDER.map((serviceName) => ({
    id: serviceName,
    service: serviceName,
    config: mgmtDraft.value!.Services[serviceName],
  }));
});

const trustDomainRows = computed(() =>
  trustDomains.value.map((domain) => ({
    id: domain,
    ipAddress: domain,
  }))
);

const availableWanInterfaces = computed(() => {
  const fromBackend = mgmtDraft.value?.WanAccessInterfaces ?? [];
  const ordered = WAN_INTERFACE_ORDER.filter((item) => fromBackend.includes(item));
  const remaining = fromBackend.filter((item) => !WAN_INTERFACE_ORDER.includes(item));
  return [...ordered, ...remaining];
});

const isMultipleWanMode = computed(() => mgmtDraft.value?.WanAccessMode === 'MultipleWAN');
const selectedWanInterfaces = computed(() => mgmtDraft.value?.WanAccessInterfaces ?? []);

const buildMgmtPayload = (data: AdvancedMclMGMT): AdvancedMclMGMTUpdateRequest => ({
  AdvancedMclMGMT: {
    WanAccessMode: data.WanAccessMode,
    WanAccessInterfaces: [...data.WanAccessInterfaces],
    Services: deepClone(data.Services),
  },
});

const hasMgmtChanges = computed(() => {
  if (!mgmtOriginal.value || !mgmtDraft.value) return false;
  return JSON.stringify(buildMgmtPayload(mgmtOriginal.value)) !== JSON.stringify(buildMgmtPayload(mgmtDraft.value));
});

const rowDataTestid = (
  row: { id: string },
  _index: number,
  mobile: boolean
) => qa(mobile ? `mcl-row-card-${row.id.toLowerCase()}` : `mcl-row-${row.id.toLowerCase()}`) || '';

const trustRowDataTestid = (
  row: { id: string },
  _index: number,
  mobile: boolean
) => qa(mobile ? `mcl-trust-row-card-${row.id}` : `mcl-trust-row-${row.id}`) || '';

const isReadOnlyField = (serviceName: AdvancedMclServiceName, field: AdvancedMclServiceField) =>
  mgmtDraft.value?.ReadOnly?.[serviceName]?.includes(field) ?? false;

const setWanAccessMode = (mode: 'AnyWAN' | 'MultipleWAN') => {
  if (!mgmtDraft.value || savingMgmt.value) return;
  mgmtDraft.value.WanAccessMode = mode;
};

const toggleWanInterface = (interfaceName: string, enabled: boolean) => {
  if (!mgmtDraft.value || !isMultipleWanMode.value || savingMgmt.value) return;

  const current = new Set(mgmtDraft.value.WanAccessInterfaces);
  if (enabled) {
    current.add(interfaceName);
  } else {
    current.delete(interfaceName);
  }
  mgmtDraft.value.WanAccessInterfaces = [...current];
};

const setServiceBooleanField = (
  serviceName: AdvancedMclServiceName,
  field: Exclude<AdvancedMclServiceField, 'Port'>,
  value: boolean
) => {
  if (!mgmtDraft.value || isReadOnlyField(serviceName, field) || savingMgmt.value) return;
  mgmtDraft.value.Services[serviceName][field] = value;
};

const setServicePort = (serviceName: AdvancedMclServiceName, value: string | number) => {
  if (!mgmtDraft.value || isReadOnlyField(serviceName, 'Port') || savingMgmt.value) return;
  mgmtDraft.value.Services[serviceName].Port = String(value);
};

const refreshAll = async () => {
  loading.value = true;
  error.value = null;

  try {
    const [mgmtResponse, trustResponse] = await Promise.all([
      getAdvancedMclMGMT(),
      getAdvancedMclTrustDomain(),
    ]);

    const nokMessage = extractNokMessage(mgmtResponse) || extractNokMessage(trustResponse);
    if (nokMessage) {
      error.value = nokMessage;
      return;
    }

    mgmtOriginal.value = deepClone(mgmtResponse.AdvancedMclMGMT);
    mgmtDraft.value = deepClone(mgmtResponse.AdvancedMclMGMT);
    trustDomains.value = [...trustResponse.AdvancedMclTrustDomain];
  } catch (err) {
    console.error('Error fetching MCL settings:', err);
    error.value = t('mcl.errorFetch');
  } finally {
    loading.value = false;
  }
};

const handleCancelMgmt = () => {
  if (!mgmtOriginal.value) return;
  mgmtDraft.value = deepClone(mgmtOriginal.value);
  error.value = null;
};

const handleApplyMgmt = async () => {
  if (!mgmtDraft.value || savingMgmt.value) return;

  if (mgmtDraft.value.WanAccessMode === 'MultipleWAN' && mgmtDraft.value.WanAccessInterfaces.length === 0) {
    showErrorMessage(t('mcl.errorSelectWanInterface'));
    return;
  }

  savingMgmt.value = true;
  error.value = null;
  try {
    const response = await updateAdvancedMclMGMT(buildMgmtPayload(mgmtDraft.value));
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      showErrorMessage(nokMessage);
      return;
    }

    const updatedMgmt: AdvancedMclMGMT = {
      ...response.AdvancedMclMGMT,
      ReadOnly: mgmtOriginal.value?.ReadOnly ?? mgmtDraft.value.ReadOnly,
    };

    mgmtOriginal.value = deepClone(updatedMgmt);
    mgmtDraft.value = deepClone(updatedMgmt);
    showSuccessMessage(t('mcl.saveSuccess'));
  } catch (err) {
    console.error('Error saving MCL MGMT settings:', err);
    showErrorMessage(t('mcl.errorSave'));
  } finally {
    savingMgmt.value = false;
  }
};

const openAddTrustDomainModal = () => {
  newTrustDomain.value = '';
  showAddTrustDomainModal.value = true;
};

const closeAddTrustDomainModal = () => {
  showAddTrustDomainModal.value = false;
  newTrustDomain.value = '';
};

const isValidIpv4Cidr = (value: string): boolean => {
  const [ip, prefix] = value.split('/');
  if (!ip || prefix === undefined) return false;
  if (!/^\d+$/.test(prefix)) return false;

  const prefixNumber = Number(prefix);
  if (prefixNumber < 0 || prefixNumber > 32) return false;

  const octets = ip.split('.');
  if (octets.length !== 4) return false;

  return octets.every((octet) => {
    if (!/^\d+$/.test(octet)) return false;
    const number = Number(octet);
    return number >= 0 && number <= 255;
  });
};

const handleAddTrustDomain = async () => {
  if (savingTrust.value) return;

  const candidate = newTrustDomain.value.trim();
  if (!candidate) {
    showErrorMessage(t('mcl.errorTrustDomainRequired'));
    return;
  }

  if (!isValidIpv4Cidr(candidate)) {
    showErrorMessage(t('mcl.errorTrustDomainFormat'));
    return;
  }

  if (trustDomains.value.includes(candidate)) {
    showErrorMessage(t('mcl.errorTrustDomainDuplicate'));
    return;
  }

  savingTrust.value = true;
  try {
    const payload = {
      AdvancedMclTrustDomain: [...trustDomains.value, candidate],
    };
    const response = await updateAdvancedMclTrustDomain(payload);
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      showErrorMessage(nokMessage);
      return;
    }

    trustDomains.value = [...response.AdvancedMclTrustDomain];
    closeAddTrustDomainModal();
    showSuccessMessage(t('mcl.addTrustDomainSuccess'));
  } catch (err) {
    console.error('Error adding trust domain:', err);
    showErrorMessage(t('mcl.errorSave'));
  } finally {
    savingTrust.value = false;
  }
};

const openDeleteTrustDomainDialog = (domain: string) => {
  deleteTrustDomainTarget.value = domain;
  showDeleteTrustDomainDialog.value = true;
};

const closeDeleteTrustDomainDialog = () => {
  deleteTrustDomainTarget.value = '';
  showDeleteTrustDomainDialog.value = false;
};

const handleDeleteTrustDomain = async () => {
  if (!deleteTrustDomainTarget.value || savingTrust.value) return;

  savingTrust.value = true;
  try {
    const payload = {
      AdvancedMclTrustDomain: trustDomains.value.filter((item) => item !== deleteTrustDomainTarget.value),
    };

    const response = await updateAdvancedMclTrustDomain(payload);
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      showErrorMessage(nokMessage);
      return;
    }

    trustDomains.value = [...response.AdvancedMclTrustDomain];
    closeDeleteTrustDomainDialog();
    showSuccessMessage(t('mcl.deleteTrustDomainSuccess'));
  } catch (err) {
    console.error('Error deleting trust domain:', err);
    showErrorMessage(t('mcl.errorSave'));
  } finally {
    savingTrust.value = false;
  }
};

const deleteTrustDomainMessage = computed(() =>
  t('mcl.confirmDeleteTrustDomainMessage', { cidr: deleteTrustDomainTarget.value })
);

onMounted(refreshAll);
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('mcl-title')">{{ t('mcl.title') }}</h1>

    <div class="status-content" :data-testid="qa('mcl-content')">
      <div v-if="loading && !mgmtDraft" class="loading-state" :data-testid="qa('mcl-loading')">
        <div class="loading-spinner"></div>
        <span>{{ t('common.loading') }}</span>
      </div>

      <div v-else-if="error" class="error-state" :data-testid="qa('mcl-error')">
        {{ error }}
      </div>

      <SectionCard
        v-else
        :content-data-testid="qa('mcl-panel')"
      >
        <div class="tab-navigation" :data-testid="qa('mcl-tabs')">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-button"
            :class="{ active: activeTab === tab.id }"
            :data-testid="qa(`mcl-tab-${tab.id === 'mgmt' ? 'mgmt' : 'trust-domain'}`)"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <div v-if="activeTab === 'mgmt'" class="tab-content" :data-testid="qa('mcl-mgmt-content')">
          <div class="wan-access-row">
            <div class="wan-access-label">{{ t('mcl.wanInterfacesForAccessingServices') }}</div>

            <label class="radio-option" :data-testid="qa('mcl-mode-any-wan')">
              <input
                type="radio"
                name="wanAccessMode"
                :checked="mgmtDraft?.WanAccessMode === 'AnyWAN'"
                :disabled="savingMgmt"
                @change="setWanAccessMode('AnyWAN')"
              />
              <span>{{ t('mcl.anyWan') }}</span>
            </label>

            <label class="radio-option" :data-testid="qa('mcl-mode-multiple-wans')">
              <input
                type="radio"
                name="wanAccessMode"
                :checked="mgmtDraft?.WanAccessMode === 'MultipleWAN'"
                :disabled="savingMgmt"
                @change="setWanAccessMode('MultipleWAN')"
              />
              <span>{{ t('mcl.multipleWans') }}</span>
            </label>

            <div class="wan-interfaces">
              <BaseCheckbox
                v-for="wanInterface in availableWanInterfaces"
                :key="wanInterface"
                :model-value="selectedWanInterfaces.includes(wanInterface)"
                :label="wanInterface"
                :disabled="!isMultipleWanMode || savingMgmt"
                :data-testid="qa(`mcl-interface-${wanInterface.toLowerCase()}`)"
                @update:model-value="(checked) => toggleWanInterface(wanInterface, checked)"
              />
            </div>
          </div>

          <BaseTable
            :columns="mgmtColumns"
            :data="mgmtRows"
            row-key="id"
            :table-data-testid="qa('mcl-mgmt-table')"
            :mobile-data-testid="qa('mcl-mgmt-mobile-cards')"
            :row-data-testid="rowDataTestid"
          >
            <template #cell-service="{ row }">
              <span :data-testid="qa(`mcl-service-name-${row.service.toLowerCase()}`)">{{ row.service }}</span>
            </template>

            <template #cell-lan="{ row }">
              <div class="cell-checkbox">
                <BaseCheckbox
                  :model-value="row.config.LAN"
                  :disabled="isReadOnlyField(row.service, 'LAN') || savingMgmt"
                  :data-testid="qa(`mcl-lan-${row.service.toLowerCase()}`)"
                  @update:model-value="(checked) => setServiceBooleanField(row.service, 'LAN', checked)"
                />
              </div>
            </template>

            <template #cell-wan="{ row }">
              <div class="cell-checkbox">
                <BaseCheckbox
                  :model-value="row.config.WAN"
                  :disabled="isReadOnlyField(row.service, 'WAN') || savingMgmt"
                  :data-testid="qa(`mcl-wan-${row.service.toLowerCase()}`)"
                  @update:model-value="(checked) => setServiceBooleanField(row.service, 'WAN', checked)"
                />
              </div>
            </template>

            <template #cell-trustdomain="{ row }">
              <div class="cell-checkbox">
                <BaseCheckbox
                  :model-value="row.config.TrustDomain"
                  :disabled="isReadOnlyField(row.service, 'TrustDomain') || savingMgmt"
                  :data-testid="qa(`mcl-trust-domain-${row.service.toLowerCase()}`)"
                  @update:model-value="(checked) => setServiceBooleanField(row.service, 'TrustDomain', checked)"
                />
              </div>
            </template>

            <template #cell-port="{ row }">
              <div class="port-cell">
                <BaseInput
                  :model-value="isReadOnlyField(row.service, 'Port') && !row.config.Port ? '-' : row.config.Port"
                  :readonly="isReadOnlyField(row.service, 'Port')"
                  :disabled="isReadOnlyField(row.service, 'Port') || savingMgmt"
                  :data-testid="qa(`mcl-port-${row.service.toLowerCase()}`)"
                  @update:model-value="(value) => setServicePort(row.service, value)"
                />
              </div>
            </template>
          </BaseTable>

          <div class="footer-actions">
            <ActionButtons
              :cancel-disabled="savingMgmt"
              :apply-disabled="savingMgmt || !hasMgmtChanges"
              :apply-loading="savingMgmt"
              :cancel-data-testid="qa('mcl-mgmt-cancel-button')"
              :apply-data-testid="qa('mcl-mgmt-apply-button')"
              @cancel="handleCancelMgmt"
              @apply="handleApplyMgmt"
            />
          </div>
        </div>

        <div v-else class="tab-content" :data-testid="qa('mcl-trust-content')">
          <SectionCard
            header-mode="row"
            :title="t('mcl.trustDomain')"
            :title-data-testid="qa('mcl-trust-section-title')"
            :content-data-testid="qa('mcl-trust-section-content')"
          >
            <template #actions>
              <button
                class="btn btn-primary add-trust-domain-btn"
                :data-testid="qa('mcl-add-trust-domain-button')"
                :disabled="savingTrust"
                @click="openAddTrustDomainModal"
              >
                <span class="material-icons">add</span>
                <span>{{ t('mcl.addTrustDomain') }}</span>
              </button>
            </template>

            <BaseTable
              :columns="trustDomainColumns"
              :data="trustDomainRows"
              row-key="id"
              :table-data-testid="qa('mcl-trust-table')"
              :mobile-data-testid="qa('mcl-trust-mobile-cards')"
              :row-data-testid="trustRowDataTestid"
            >
              <template #cell-actions="{ row, mobile }">
                <div class="action-buttons" :data-testid="qa(mobile ? `mcl-trust-card-actions-${row.id}` : `mcl-trust-actions-${row.id}`)">
                  <button
                    class="btn-action"
                    :data-testid="qa(mobile ? `mcl-trust-card-delete-${row.id}` : `mcl-trust-delete-${row.id}`)"
                    :disabled="savingTrust"
                    :title="t('common.delete')"
                    @click="openDeleteTrustDomainDialog(row.id)"
                  >
                    <span class="material-icons">delete</span>
                  </button>
                </div>
              </template>
            </BaseTable>
          </SectionCard>
        </div>
      </SectionCard>

      <BaseModal
        v-model="showAddTrustDomainModal"
        size="md"
        :close-button-data-testid="qa('mcl-add-trust-modal-close')"
        @close="closeAddTrustDomainModal"
      >
        <template #header>
          <h3 class="modal-title" :data-testid="qa('mcl-add-trust-modal-title')">
            {{ t('mcl.addTrustDomain') }}
          </h3>
        </template>

        <div class="modal-form" :data-testid="qa('mcl-add-trust-modal-content')">
          <div class="form-group">
            <label class="form-label" :data-testid="qa('mcl-add-trust-domain-label')">
              {{ t('mcl.ipAddress') }}
            </label>
            <BaseInput
              v-model="newTrustDomain"
              :placeholder="t('mcl.trustDomainPlaceholder')"
              :disabled="savingTrust"
              :data-testid="qa('mcl-add-trust-domain-input')"
            />
            <p class="cidr-hint" :data-testid="qa('mcl-add-trust-domain-hint')">{{ t('mcl.cidrHint') }}</p>
          </div>
        </div>

        <template #footer>
          <ActionButtons
            :cancel-text="t('common.cancel')"
            :apply-text="t('common.add')"
            :cancel-disabled="savingTrust"
            :apply-disabled="savingTrust"
            :apply-loading="savingTrust"
            :cancel-data-testid="qa('mcl-add-trust-domain-cancel-button')"
            :apply-data-testid="qa('mcl-add-trust-domain-apply-button')"
            @cancel="closeAddTrustDomainModal"
            @apply="handleAddTrustDomain"
          />
        </template>
      </BaseModal>

      <ConfirmationDialog
        :is-open="showDeleteTrustDomainDialog"
        :title="t('mcl.confirmDeleteTrustDomainTitle')"
        :message="deleteTrustDomainMessage"
        :confirm-text="t('common.delete')"
        :cancel-text="t('common.cancel')"
        @confirm="handleDeleteTrustDomain"
        @cancel="closeDeleteTrustDomainDialog"
      />

      <BaseToast
        v-model="showSuccessToast"
        :message="successMessage"
        type="success"
        :data-testid="qa('mcl-success-toast')"
      />
      <BaseToast
        v-model="showErrorToast"
        :message="errorToastMessage"
        type="error"
        :data-testid="qa('mcl-error-toast')"
      />
    </div>
  </div>
</template>

<style scoped>
.wan-access-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.wan-access-label {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  margin-right: var(--space-4);
}

.radio-option {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-primary);
}

.wan-interfaces {
  display: inline-flex;
  align-items: center;
  gap: var(--space-4);
  margin-left: auto;
}

.cell-checkbox {
  display: flex;
  justify-content: center;
}

.port-cell {
  display: flex;
  justify-content: center;
  min-width: 5.5rem;
}

.port-cell :deep(.form-group) {
  margin-bottom: 0;
  width: 6.5rem;
}

.port-cell :deep(input) {
  text-align: center;
}

.footer-actions {
  margin-top: var(--space-5);
  display: flex;
  justify-content: center;
}

.add-trust-domain-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.add-trust-domain-btn .material-icons {
  font-size: 24px;
  line-height: 1;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  min-width: 4.5rem;
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
}

.btn-action .material-icons {
  font-size: 24px;
}

.btn-action:hover {
  color: var(--text-primary);
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.cidr-hint {
  margin-top: var(--space-2);
  color: #dc3545;
  font-size: var(--font-size-sm);
}

@media (max-width: 1024px) {
  .wan-interfaces {
    margin-left: 0;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .wan-access-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .wan-interfaces {
    flex-wrap: wrap;
    gap: var(--space-3);
  }

  .footer-actions :deep(.action-buttons) {
    width: 100%;
    justify-content: stretch;
  }

  .footer-actions :deep(.action-buttons .btn) {
    width: 100%;
  }
}
</style>
