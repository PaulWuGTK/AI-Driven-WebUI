<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { BasicWanInterface, BasicWanResponse } from '../../../types/basicWan';
import { getBasicWan, updateBasicWan } from '../../../services/api/basicWan';
import { ActionButtons, BaseSwitch, BaseSecretInput, SectionCard, BaseToast } from '../../../components/common';
import { useAutoDismiss } from '../../../composables/useAutoDismiss';
import { extractNokMessage } from '../../../utils/apiUtils';
import { useQA } from '../../../utils/qa';
const { qa } = useQA();

const { t } = useI18n();
const loading = ref(false);
const error = ref<string | null>(null);
const successMessage = ref('');
const errorToastMessage = ref('');
const { visible: showSuccessToast, show: triggerSuccessToast } = useAutoDismiss();
const { visible: showErrorToast, show: triggerErrorToast } = useAutoDismiss();

const originalData = ref<BasicWanResponse | null>(null);
const interfaces = ref<BasicWanInterface[]>([]);
const editIndex = ref<number | null>(null);
const draft = ref<BasicWanInterface | null>(null);
const isNew = ref(false);
const detailIndex = ref<number | null>(null);
const formErrors = ref<Record<string, string>>({});

// Validation helpers
const validateIPv4 = (ip: string): boolean => {
  const re = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return re.test(ip);
};

const validateIPv6 = (ip: string): boolean => {
  const re = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]+|::(ffff(:0{1,4})?:)?((25[0-5]|(2[0-4]|1?[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1?[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9]))$/;
  return re.test(ip);
};

const clearFieldError = (field: string) => {
  if (formErrors.value[field]) {
    delete formErrors.value[field];
  }
};

const isInteger = (v: unknown): boolean => typeof v === 'number' && Number.isFinite(v) && Number.isInteger(v);

const validateForm = (): boolean => {
  formErrors.value = {};
  if (!draft.value) return false;
  const d = draft.value;

  // Common: MTU (576-1500)
  if (!isInteger(d.MTU) || d.MTU < 576 || d.MTU > 1500) {
    formErrors.value.MTU = t('basicWan.validationMtuRange');
  }
  // Common: VLAN ID & Priority (only when tagged)
  if (d.VLANType === 'tagged') {
    if (!isInteger(d.VLANID) || d.VLANID < 1 || d.VLANID > 4094) {
      formErrors.value.VLANID = t('basicWan.validationVlanIdRange');
    }
    if (!isInteger(d.VLANPriority) || d.VLANPriority < 0 || d.VLANPriority > 7) {
      formErrors.value.VLANPriority = t('basicWan.validationVlanPriorityRange');
    }
  }

  // IPv4 validation
  if (d.IPv4Enable) {
    if (d.IPv4Mode === 'dhcp4') {
      if (d.Option12 && d.HostName && d.HostName.length > 64) {
        formErrors.value.HostName = t('basicWan.validationMaxLength', { field: t('basicWan.hostName'), max: 64 });
      }
      if (d.Option60 && !d.VendorClassID.trim()) {
        formErrors.value.VendorClassID = t('basicWan.validationRequired', { field: t('basicWan.vendorClassId') });
      } else if (d.Option60 && d.VendorClassID.length > 64) {
        formErrors.value.VendorClassID = t('basicWan.validationMaxLength', { field: t('basicWan.vendorClassId'), max: 64 });
      }
      if (d.Option61 && !d.ClientID.trim()) {
        formErrors.value.ClientID = t('basicWan.validationRequired', { field: t('basicWan.clientId') });
      } else if (d.Option61 && d.ClientID.length > 64) {
        formErrors.value.ClientID = t('basicWan.validationMaxLength', { field: t('basicWan.clientId'), max: 64 });
      }
    }

    if (d.IPv4Mode === 'ppp4') {
      if (!d.UserName.trim()) {
        formErrors.value.UserName = t('basicWan.validationRequired', { field: t('basicWan.userName') });
      } else if (d.UserName.length > 64) {
        formErrors.value.UserName = t('basicWan.validationMaxLength', { field: t('basicWan.userName'), max: 64 });
      }
      if (!d.Password.trim()) {
        formErrors.value.Password = t('basicWan.validationRequired', { field: t('basicWan.password') });
      } else if (d.Password.length > 64) {
        formErrors.value.Password = t('basicWan.validationMaxLength', { field: t('basicWan.password'), max: 64 });
      }
      if (d.ServiceName && d.ServiceName.length > 64) {
        formErrors.value.ServiceName = t('basicWan.validationMaxLength', { field: t('basicWan.serviceName'), max: 64 });
      }
      if (!isInteger(d.IdleTime) || d.IdleTime < 0 || d.IdleTime > 65535) {
        formErrors.value.IdleTime = t('basicWan.validationIdleTimeRange');
      }
    }

    if (d.IPv4Mode === 'static') {
      if (!d.IPv4Address.trim()) {
        formErrors.value.IPv4Address = t('basicWan.validationRequired', { field: t('basicWan.ipv4Address') });
      } else if (!validateIPv4(d.IPv4Address.trim())) {
        formErrors.value.IPv4Address = t('basicWan.validationInvalidIPv4');
      }
      if (!d.IPv4SubnetMask.trim()) {
        formErrors.value.IPv4SubnetMask = t('basicWan.validationRequired', { field: t('basicWan.subnetMask') });
      } else if (!validateIPv4(d.IPv4SubnetMask.trim())) {
        formErrors.value.IPv4SubnetMask = t('basicWan.validationInvalidIPv4');
      }
      if (d.IPv4DefaultRouter.trim() && !validateIPv4(d.IPv4DefaultRouter.trim())) {
        formErrors.value.IPv4DefaultRouter = t('basicWan.validationInvalidIPv4');
      }
      if (d.IPv4DNSServers.trim()) {
        const servers = d.IPv4DNSServers.split(',').map(s => s.trim()).filter(Boolean);
        if (servers.some(s => !validateIPv4(s))) {
          formErrors.value.IPv4DNSServers = t('basicWan.validationInvalidIPv4');
        }
      }
    }
  }

  // IPv6 PPPoEv6 validation: validate credentials when IPv4 is not PPPoE
  if (d.IPv6Enable && d.IPv6Mode === 'ppp6' && d.IPv4Mode !== 'ppp4') {
    if (!d.UserName.trim()) {
      formErrors.value.UserName = t('basicWan.validationRequired', { field: t('basicWan.userName') });
    } else if (d.UserName.length > 64) {
      formErrors.value.UserName = t('basicWan.validationMaxLength', { field: t('basicWan.userName'), max: 64 });
    }
    if (!d.Password.trim()) {
      formErrors.value.Password = t('basicWan.validationRequired', { field: t('basicWan.password') });
    } else if (d.Password.length > 64) {
      formErrors.value.Password = t('basicWan.validationMaxLength', { field: t('basicWan.password'), max: 64 });
    }
    if (d.ServiceName && d.ServiceName.length > 64) {
      formErrors.value.ServiceName = t('basicWan.validationMaxLength', { field: t('basicWan.serviceName'), max: 64 });
    }
    if (!isInteger(d.IdleTime) || d.IdleTime < 0 || d.IdleTime > 65535) {
      formErrors.value.IdleTime = t('basicWan.validationIdleTimeRange');
    }
  }

  // IPv6 validation
  if (d.IPv6Enable && d.IPv6Mode === 'static') {
    if (!d.IPv6Address.trim()) {
      formErrors.value.IPv6Address = t('basicWan.validationRequired', { field: t('basicWan.ipv6Address') });
    } else if (!validateIPv6(d.IPv6Address.trim())) {
      formErrors.value.IPv6Address = t('basicWan.validationInvalidIPv6');
    }
    if (!isInteger(d.IPv6PrefixLength) || d.IPv6PrefixLength < 1 || d.IPv6PrefixLength > 128) {
      formErrors.value.IPv6PrefixLength = t('basicWan.validationPrefixLengthRange');
    }
    if (d.IPv6DefaultRouter.trim() && !validateIPv6(d.IPv6DefaultRouter.trim())) {
      formErrors.value.IPv6DefaultRouter = t('basicWan.validationInvalidIPv6');
    }
    if (d.IPv6DNSServers.trim()) {
      const servers = d.IPv6DNSServers.split(',').map(s => s.trim()).filter(Boolean);
      if (servers.some(s => !validateIPv6(s))) {
        formErrors.value.IPv6DNSServers = t('basicWan.validationInvalidIPv6');
      }
    }
  }

  return Object.keys(formErrors.value).length === 0;
};

// List options from API
const listIPv4Mode = computed(() => originalData.value?.BasicWan.ListIPv4Mode ?? []);
const listIPv6Mode = computed(() => originalData.value?.BasicWan.ListIPv6Mode ?? []);
const listVLANType = computed(() => originalData.value?.BasicWan.ListVLANType ?? []);
const listConnectionTrigger = computed(() => originalData.value?.BasicWan.ListConnectionTrigger ?? []);

// Auto-set Connection Trigger default when entering PPPoE mode (IPv4 or IPv6)
watch(() => draft.value?.IPv4Mode, (mode) => {
  if (draft.value && mode === 'ppp4' && !draft.value.Contrigger) {
    draft.value.Contrigger = 'AlwaysOn';
  }
});
watch(() => draft.value?.IPv6Mode, (mode) => {
  if (draft.value && mode === 'ppp6' && draft.value.IPv4Mode !== 'ppp4' && !draft.value.Contrigger) {
    draft.value.Contrigger = 'AlwaysOn';
  }
});

const createDefaultInterface = (name: string): BasicWanInterface => ({
  Interface: name,
  VLANType: 'untagged',
  VLANID: 100,
  VLANPriority: 0,
  MTU: 1500,
  IPv4Enable: 1,
  IPv4Mode: 'dhcp4',
  IPv4Address: '',
  IPv4SubnetMask: '',
  IPv4DefaultRouter: '',
  IPv4DNSServers: '',
  HostName: '',
  Option60: 0,
  VendorClassID: '',
  Option61: 0,
  ClientID: '',
  Option12: 0,
  UserName: '',
  Password: '',
  ServiceName: '',
  Contrigger: '',
  IdleTime: 0,
  IPv6Enable: 0,
  IPv6Mode: 'none',
  IPv6Address: '',
  IPv6PrefixLength: 64,
  IPv6DefaultRouter: '',
  IPv6DNSServers: '',
  SLAAC: 0,
  IANA: 0,
  IAPD: 0
});

const fetchData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getBasicWan();
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      error.value = nokMessage;
      return;
    }
    originalData.value = response;
    interfaces.value = JSON.parse(JSON.stringify(response.BasicWan.Interfaces));
  } catch (err) {
    error.value = 'Failed to fetch WAN settings';
  } finally {
    loading.value = false;
  }
};

const handleEdit = (index: number) => {
  formErrors.value = {};
  editIndex.value = index;
  draft.value = JSON.parse(JSON.stringify(interfaces.value[index]));
  isNew.value = false;
  // Ensure Connection Trigger has a default for PPPoE mode (IPv4 or IPv6)
  if (draft.value && (draft.value.IPv4Mode === 'ppp4' || (draft.value.IPv6Enable && draft.value.IPv6Mode === 'ppp6')) && !draft.value.Contrigger) {
    draft.value.Contrigger = 'AlwaysOn';
  }
};

const handleDetail = (index: number) => {
  detailIndex.value = index;
};

const detailItem = computed(() =>
  detailIndex.value !== null ? interfaces.value[detailIndex.value] : null
);

const handleAdd = () => {
  const nextNum = interfaces.value.length + 1;
  const newIface = createDefaultInterface(`wan${nextNum}`);
  interfaces.value.push(newIface);
  editIndex.value = interfaces.value.length - 1;
  draft.value = JSON.parse(JSON.stringify(newIface));
  isNew.value = true;
};

const handleDelete = (index: number) => {
  if (index === 0) return;
  if (!confirm(t('basicWan.deleteConfirm'))) return;
  interfaces.value.splice(index, 1);
};

const handleSave = () => {
  if (draft.value === null || editIndex.value === null) return;
  // Run form validation
  if (!validateForm()) return;
  // Validate PPPoE uniqueness: only one interface can use PPPoE (IPv4 ppp4 or IPv6 ppp6)
  if (draft.value.IPv4Mode === 'ppp4' || (draft.value.IPv6Enable && draft.value.IPv6Mode === 'ppp6')) {
    const otherPppoe = interfaces.value.find(
      (iface, idx) => idx !== editIndex.value && (iface.IPv4Mode === 'ppp4' || (iface.IPv6Enable && iface.IPv6Mode === 'ppp6'))
    );
    if (otherPppoe) {
      errorToastMessage.value = t('basicWan.duplicatePppoe', { iface: otherPppoe.Interface });
      triggerErrorToast();
      return;
    }
  }
  // Validate VLAN ID uniqueness for tagged interfaces
  if (draft.value.VLANType === 'tagged') {
    const duplicate = interfaces.value.find(
      (iface, idx) => idx !== editIndex.value && iface.VLANType === 'tagged' && iface.VLANID === draft.value!.VLANID
    );
    if (duplicate) {
      errorToastMessage.value = t('basicWan.vlanIdDuplicate', { id: draft.value.VLANID, iface: duplicate.Interface });
      triggerErrorToast();
      return;
    }
  }
  interfaces.value[editIndex.value] = JSON.parse(JSON.stringify(draft.value));
  editIndex.value = null;
  draft.value = null;
  isNew.value = false;
};

const handleEditCancel = () => {
  if (isNew.value && editIndex.value !== null) {
    interfaces.value.splice(editIndex.value, 1);
  }
  editIndex.value = null;
  draft.value = null;
  isNew.value = false;
  formErrors.value = {};
};

const handleApply = async () => {
  if (loading.value) return;
  // Block if two PPPoE interfaces exist (IPv4 ppp4 or IPv6 ppp6)
  const pppoeCount = interfaces.value.filter(i => i.IPv4Mode === 'ppp4' || (i.IPv6Enable && i.IPv6Mode === 'ppp6')).length;
  if (pppoeCount > 1) {
    errorToastMessage.value = t('basicWan.duplicatePppoe', { iface: '' });
    triggerErrorToast();
    return;
  }
  // Block if two untagged interfaces exist
  const untaggedCount = interfaces.value.filter(i => i.VLANType === 'untagged').length;
  if (untaggedCount > 1) {
    errorToastMessage.value = t('basicWan.duplicateUntagged');
    triggerErrorToast();
    return;
  }
  loading.value = true;
  error.value = null;
  try {
    const response = await updateBasicWan({
      BasicWan: { Interfaces: interfaces.value }
    });
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      errorToastMessage.value = nokMessage;
      triggerErrorToast();
      return;
    }
    successMessage.value = `${t('common.apply')} successful`;
    triggerSuccessToast();
    await fetchData();
  } catch (err) {
    errorToastMessage.value = t('basicWan.applyFailed');
    triggerErrorToast();
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  if (originalData.value) {
    interfaces.value = JSON.parse(JSON.stringify(originalData.value.BasicWan.Interfaces));
  }
};

const modeLabel = (mode: string): string => {
  const labels: Record<string, string> = {
    dhcp4: 'DHCP',
    ppp4: 'PPPoE',
    static: 'Static',
    none: 'None',
    dhcp6: 'DHCPv6',
    ppp6: 'PPPoEv6'
  };
  return labels[mode] ?? mode;
};

onMounted(fetchData);
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('basic-wan-title')">{{ t('basicWan.title') }}</h1>

    <div class="status-content" :data-testid="qa('basic-wan-content')">
      <!-- Loading -->
      <div v-if="loading && !originalData" class="loading-state" :data-testid="qa('basic-wan-loading')">
        <div class="loading-spinner"></div>
        <span>{{ t('common.loading') }}</span>
      </div>

      <!-- Error -->
      <div v-else-if="error && !originalData" class="error-state" :data-testid="qa('basic-wan-error')">
        {{ error }}
      </div>

      <!-- TABLE VIEW -->
      <template v-else-if="originalData">
        <SectionCard
          header-mode="row"
          :title="t('basicWan.interfaceManagement')"
          :title-data-testid="qa('basic-wan-management-title')"
        >
          <template #actions>
            <button
              class="btn btn-primary"
              :data-testid="qa('basic-wan-add-button')"
              @click="handleAdd"
              :disabled="loading || interfaces.length >= 2"
            >
              <span class="material-icons">add</span>
              {{ t('basicWan.addInterface') }}
            </button>
          </template>

          <!-- Desktop Table -->
          <div class="table-container" :data-testid="qa('basic-wan-table-container')">
            <table :data-testid="qa('basic-wan-table')">
              <thead>
                <tr>
                  <th :data-testid="qa('basic-wan-header-interface')">{{ t('basicWan.interface') }}</th>
                  <th :data-testid="qa('basic-wan-header-ipv4-mode')">{{ t('basicWan.ipv4Mode') }}</th>
                  <th :data-testid="qa('basic-wan-header-ipv6-mode')">{{ t('basicWan.ipv6Mode') }}</th>
                  <th :data-testid="qa('basic-wan-header-vlan-id')">{{ t('basicWan.vlanId') }}</th>
                  <th :data-testid="qa('basic-wan-header-mtu')">{{ t('basicWan.mtu') }}</th>
                  <th :data-testid="qa('basic-wan-header-actions')">{{ t('basicWan.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(iface, idx) in interfaces" :key="iface.Interface" :data-testid="qa(`basic-wan-row-${idx}`)">
                  <td :data-testid="qa(`basic-wan-interface-${idx}`)">{{ iface.Interface }}</td>
                  <td :data-testid="qa(`basic-wan-ipv4-mode-${idx}`)">{{ modeLabel(iface.IPv4Mode) }}</td>
                  <td :data-testid="qa(`basic-wan-ipv6-mode-${idx}`)">{{ modeLabel(iface.IPv6Mode) }}</td>
                  <td :data-testid="qa(`basic-wan-vlan-id-${idx}`)">{{ iface.VLANType === 'tagged' ? iface.VLANID : 'untagged' }}</td>
                  <td :data-testid="qa(`basic-wan-mtu-${idx}`)">{{ iface.MTU }}</td>
                  <td>
                    <div class="action-buttons">
                      <button
                        class="btn-action"
                        :title="t('common.edit')"
                        :data-testid="qa(`basic-wan-edit-${idx}`)"
                        @click="handleEdit(idx)"
                      >
                        <span class="material-icons">edit</span>
                      </button>
                      <button
                        v-if="idx > 0"
                        class="btn-action btn-action-danger"
                        :title="t('common.delete')"
                        :data-testid="qa(`basic-wan-delete-${idx}`)"
                        @click="handleDelete(idx)"
                      >
                        <span class="material-icons">delete</span>
                      </button>
                      <button
                        class="btn-action"
                        :title="t('basicWan.detail')"
                        :data-testid="qa(`basic-wan-detail-${idx}`)"
                        @click="handleDetail(idx)"
                      >
                        <span class="material-icons">info</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards -->
          <div class="mobile-cards" :data-testid="qa('basic-wan-mobile')">
            <div class="table-card" v-for="(iface, idx) in interfaces" :key="iface.Interface" :data-testid="qa(`basic-wan-card-${idx}`)">
              <div class="card-row">
                <span class="card-label">{{ t('basicWan.interface') }}</span>
                <span class="card-value">{{ iface.Interface }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('basicWan.ipv4Mode') }}</span>
                <span class="card-value">{{ modeLabel(iface.IPv4Mode) }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('basicWan.ipv6Mode') }}</span>
                <span class="card-value">{{ modeLabel(iface.IPv6Mode) }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('basicWan.vlanId') }}</span>
                <span class="card-value">{{ iface.VLANType === 'tagged' ? iface.VLANID : 'untagged' }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('basicWan.mtu') }}</span>
                <span class="card-value">{{ iface.MTU }}</span>
              </div>
              <div class="card-actions">
                <button class="btn-action" @click="handleEdit(idx)" :data-testid="qa(`basic-wan-card-edit-${idx}`)">
                  <span class="material-icons">edit</span>
                </button>
                <button v-if="idx > 0" class="btn-action btn-action-danger" @click="handleDelete(idx)" :data-testid="qa(`basic-wan-card-delete-${idx}`)">
                  <span class="material-icons">delete</span>
                </button>
                <button class="btn-action" @click="handleDetail(idx)" :data-testid="qa(`basic-wan-card-detail-${idx}`)">
                  <span class="material-icons">info</span>
                </button>
              </div>
            </div>
          </div>
        </SectionCard>

        <div class="button-group" :data-testid="qa('basic-wan-button-group')">
          <ActionButtons
            :cancel-disabled="loading"
            :apply-disabled="loading"
            :apply-loading="loading"
            :cancel-data-testid="qa('basic-wan-cancel-button')"
            :apply-data-testid="qa('basic-wan-apply-button')"
            @cancel="handleCancel"
            @apply="handleApply"
          />
        </div>
      </template>

    <!-- EDIT MODAL OVERLAY -->
    <div v-if="draft" class="modal-overlay" @mousedown.self="handleEditCancel" :data-testid="qa('basic-wan-edit-overlay')">
      <div class="modal-content" :data-testid="qa('basic-wan-edit-modal')">
        <div class="modal-header">
          <button class="back-btn" @click="handleEditCancel" :data-testid="qa('basic-wan-edit-back')">
            <span class="material-icons">arrow_back</span>
          </button>
          <h2 :data-testid="qa('basic-wan-edit-title')">
            {{ isNew ? t('basicWan.addInterface') : t('basicWan.editInterface') }} - {{ draft.Interface }}
          </h2>
          <button class="close-btn" @click="handleEditCancel" :data-testid="qa('basic-wan-edit-close')">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="modal-body">
          <div class="compact-modal-form">
            <!-- IPv4 Settings -->
            <div class="switch-label">
              <span :data-testid="qa('basic-wan-ipv4-enable-label')">{{ t('basicWan.ipv4Enable') }}</span>
              <BaseSwitch
                v-model="draft.IPv4Enable"
                :true-value="1"
                :false-value="0"
                :data-testid="qa('basic-wan-ipv4-enable-toggle')"
                :slider-data-testid="qa('basic-wan-ipv4-enable-slider')"
              />
            </div>

            <template v-if="draft.IPv4Enable">
              <div class="form-group">
                <label :data-testid="qa('basic-wan-ipv4-mode-label')">{{ t('basicWan.ipv4Mode') }}</label>
                <select v-model="draft.IPv4Mode" :data-testid="qa('basic-wan-ipv4-mode-select')">
                  <option v-for="m in listIPv4Mode" :key="m" :value="m">{{ modeLabel(m) }}</option>
                </select>
              </div>

              <!-- DHCP4 -->
              <template v-if="draft.IPv4Mode === 'dhcp4'">
                <div class="switch-label">
                  <span :data-testid="qa('basic-wan-option60-label')">{{ t('basicWan.option60') }}</span>
                  <BaseSwitch v-model="draft.Option60" :true-value="1" :false-value="0"
                    :data-testid="qa('basic-wan-option60-toggle')" :slider-data-testid="qa('basic-wan-option60-slider')" />
                </div>
                <div v-if="draft.Option60" class="form-group">
                  <label :data-testid="qa('basic-wan-vendor-class-label')">{{ t('basicWan.vendorClassId') }}</label>
                  <input type="text" v-model="draft.VendorClassID" :class="{ error: formErrors.VendorClassID }" @input="clearFieldError('VendorClassID')" :data-testid="qa('basic-wan-vendor-class-input')" />
                  <span v-if="formErrors.VendorClassID" class="error-message">{{ formErrors.VendorClassID }}</span>
                </div>
                <div class="switch-label">
                  <span :data-testid="qa('basic-wan-option61-label')">{{ t('basicWan.option61') }}</span>
                  <BaseSwitch v-model="draft.Option61" :true-value="1" :false-value="0"
                    :data-testid="qa('basic-wan-option61-toggle')" :slider-data-testid="qa('basic-wan-option61-slider')" />
                </div>
                <div v-if="draft.Option61" class="form-group">
                  <label :data-testid="qa('basic-wan-client-id-label')">{{ t('basicWan.clientId') }}</label>
                  <input type="text" v-model="draft.ClientID" :class="{ error: formErrors.ClientID }" @input="clearFieldError('ClientID')" :data-testid="qa('basic-wan-client-id-input')" />
                  <span v-if="formErrors.ClientID" class="error-message">{{ formErrors.ClientID }}</span>
                </div>
                <div class="switch-label">
                  <span :data-testid="qa('basic-wan-option12-label')">{{ t('basicWan.option12') }}</span>
                  <BaseSwitch v-model="draft.Option12" :true-value="1" :false-value="0"
                    :data-testid="qa('basic-wan-option12-toggle')" :slider-data-testid="qa('basic-wan-option12-slider')" />
                </div>
                <div v-if="draft.Option12" class="form-group">
                  <label :data-testid="qa('basic-wan-hostname-label')">{{ t('basicWan.hostName') }}</label>
                  <input type="text" v-model="draft.HostName" :class="{ error: formErrors.HostName }" @input="clearFieldError('HostName')" :data-testid="qa('basic-wan-hostname-input')" />
                  <span v-if="formErrors.HostName" class="error-message">{{ formErrors.HostName }}</span>
                </div>
              </template>

              <!-- PPP4 -->
              <template v-if="draft.IPv4Mode === 'ppp4'">
                <div class="form-group">
                  <label :data-testid="qa('basic-wan-username-label')">{{ t('basicWan.userName') }}</label>
                  <input type="text" v-model="draft.UserName" :class="{ error: formErrors.UserName }" @input="clearFieldError('UserName')" :data-testid="qa('basic-wan-username-input')" />
                  <span v-if="formErrors.UserName" class="error-message">{{ formErrors.UserName }}</span>
                </div>
                <div class="form-group">
                  <label :data-testid="qa('basic-wan-password-label')">{{ t('basicWan.password') }}</label>
                  <BaseSecretInput v-model="draft.Password" :input-data-testid="qa('basic-wan-password-input')" />
                  <span v-if="formErrors.Password" class="error-message">{{ formErrors.Password }}</span>
                </div>
                <div class="form-group">
                  <label :data-testid="qa('basic-wan-service-name-label')">{{ t('basicWan.serviceName') }}</label>
                  <input type="text" v-model="draft.ServiceName" :class="{ error: formErrors.ServiceName }" @input="clearFieldError('ServiceName')" :data-testid="qa('basic-wan-service-name-input')" />
                  <span v-if="formErrors.ServiceName" class="error-message">{{ formErrors.ServiceName }}</span>
                </div>
                <div class="form-group">
                  <label :data-testid="qa('basic-wan-trigger-label')">{{ t('basicWan.connectionTrigger') }}</label>
                  <select v-model="draft.Contrigger" :data-testid="qa('basic-wan-trigger-select')">
                    <option v-for="ct in listConnectionTrigger" :key="ct" :value="ct">{{ ct }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label :data-testid="qa('basic-wan-idle-time-label')">{{ t('basicWan.idleTime') }}</label>
                  <input type="number" v-model.number="draft.IdleTime" min="0" max="65535" :class="{ error: formErrors.IdleTime }" @input="clearFieldError('IdleTime')" :data-testid="qa('basic-wan-idle-time-input')" />
                  <span v-if="formErrors.IdleTime" class="error-message">{{ formErrors.IdleTime }}</span>
                </div>
              </template>

              <!-- Static IPv4 -->
              <template v-if="draft.IPv4Mode === 'static'">
                <div class="form-group">
                  <label :data-testid="qa('basic-wan-ipv4-address-label')">{{ t('basicWan.ipv4Address') }}</label>
                  <input type="text" v-model="draft.IPv4Address" :class="{ error: formErrors.IPv4Address }" @input="clearFieldError('IPv4Address')" :data-testid="qa('basic-wan-ipv4-address-input')" />
                  <span v-if="formErrors.IPv4Address" class="error-message">{{ formErrors.IPv4Address }}</span>
                </div>
                <div class="form-group">
                  <label :data-testid="qa('basic-wan-subnet-mask-label')">{{ t('basicWan.subnetMask') }}</label>
                  <input type="text" v-model="draft.IPv4SubnetMask" :class="{ error: formErrors.IPv4SubnetMask }" @input="clearFieldError('IPv4SubnetMask')" :data-testid="qa('basic-wan-subnet-mask-input')" />
                  <span v-if="formErrors.IPv4SubnetMask" class="error-message">{{ formErrors.IPv4SubnetMask }}</span>
                </div>
                <div class="form-group">
                  <label :data-testid="qa('basic-wan-default-router-label')">{{ t('basicWan.defaultRouter') }}</label>
                  <input type="text" v-model="draft.IPv4DefaultRouter" :class="{ error: formErrors.IPv4DefaultRouter }" @input="clearFieldError('IPv4DefaultRouter')" :data-testid="qa('basic-wan-default-router-input')" />
                  <span v-if="formErrors.IPv4DefaultRouter" class="error-message">{{ formErrors.IPv4DefaultRouter }}</span>
                </div>
                <div class="form-group">
                  <label :data-testid="qa('basic-wan-dns-label')">{{ t('basicWan.dnsServers') }}</label>
                  <input type="text" v-model="draft.IPv4DNSServers" :class="{ error: formErrors.IPv4DNSServers }" @input="clearFieldError('IPv4DNSServers')" :data-testid="qa('basic-wan-dns-input')" />
                  <span v-if="formErrors.IPv4DNSServers" class="error-message">{{ formErrors.IPv4DNSServers }}</span>
                </div>
              </template>
            </template>

            <!-- IPv6 Settings -->
            <div class="form-divider"></div>
            <div class="switch-label">
              <span :data-testid="qa('basic-wan-ipv6-enable-label')">{{ t('basicWan.ipv6Enable') }}</span>
              <BaseSwitch
                v-model="draft.IPv6Enable"
                :true-value="1"
                :false-value="0"
                :data-testid="qa('basic-wan-ipv6-enable-toggle')"
                :slider-data-testid="qa('basic-wan-ipv6-enable-slider')"
              />
            </div>

            <template v-if="draft.IPv6Enable">
              <div class="form-group">
                <label :data-testid="qa('basic-wan-ipv6-mode-label')">{{ t('basicWan.ipv6Mode') }}</label>
                <select v-model="draft.IPv6Mode" :data-testid="qa('basic-wan-ipv6-mode-select')">
                  <option v-for="m in listIPv6Mode" :key="m" :value="m">{{ modeLabel(m) }}</option>
                </select>
              </div>

              <!-- DHCPv6 -->
              <template v-if="draft.IPv6Mode === 'dhcp6'">
                <div class="switch-label">
                  <span :data-testid="qa('basic-wan-slaac-label')">{{ t('basicWan.slaac') }}</span>
                  <BaseSwitch v-model="draft.SLAAC" :true-value="1" :false-value="0"
                    :data-testid="qa('basic-wan-slaac-toggle')" :slider-data-testid="qa('basic-wan-slaac-slider')" />
                </div>
                <div class="switch-label">
                  <span :data-testid="qa('basic-wan-iana-label')">{{ t('basicWan.iana') }}</span>
                  <BaseSwitch v-model="draft.IANA" :true-value="1" :false-value="0"
                    :data-testid="qa('basic-wan-iana-toggle')" :slider-data-testid="qa('basic-wan-iana-slider')" />
                </div>
                <div class="switch-label">
                  <span :data-testid="qa('basic-wan-iapd-label')">{{ t('basicWan.iapd') }}</span>
                  <BaseSwitch v-model="draft.IAPD" :true-value="1" :false-value="0"
                    :data-testid="qa('basic-wan-iapd-toggle')" :slider-data-testid="qa('basic-wan-iapd-slider')" />
                </div>
              </template>

              <!-- PPPoEv6 -->
              <template v-if="draft.IPv6Mode === 'ppp6'">
                <!-- When IPv4 is also PPPoE, credentials are shared -->
                <div v-if="draft.IPv4Mode === 'ppp4'" class="info-banner" :data-testid="qa('basic-wan-pppv6-hint')">
                  <span class="material-icons">info</span>
                  <span>{{ t('basicWan.pppv6SharesCredentials') }}</span>
                </div>
                <!-- When IPv4 is NOT PPPoE, show credential fields here -->
                <template v-else>
                  <div class="form-group">
                    <label :data-testid="qa('basic-wan-ppp6-username-label')">{{ t('basicWan.userName') }}</label>
                    <input type="text" v-model="draft.UserName" :class="{ error: formErrors.UserName }" @input="clearFieldError('UserName')" :data-testid="qa('basic-wan-ppp6-username-input')" />
                    <span v-if="formErrors.UserName" class="error-message">{{ formErrors.UserName }}</span>
                  </div>
                  <div class="form-group">
                    <label :data-testid="qa('basic-wan-ppp6-password-label')">{{ t('basicWan.password') }}</label>
                    <BaseSecretInput v-model="draft.Password" :input-data-testid="qa('basic-wan-ppp6-password-input')" />
                    <span v-if="formErrors.Password" class="error-message">{{ formErrors.Password }}</span>
                  </div>
                  <div class="form-group">
                    <label :data-testid="qa('basic-wan-ppp6-service-name-label')">{{ t('basicWan.serviceName') }}</label>
                    <input type="text" v-model="draft.ServiceName" :class="{ error: formErrors.ServiceName }" @input="clearFieldError('ServiceName')" :data-testid="qa('basic-wan-ppp6-service-name-input')" />
                    <span v-if="formErrors.ServiceName" class="error-message">{{ formErrors.ServiceName }}</span>
                  </div>
                  <div class="form-group">
                    <label :data-testid="qa('basic-wan-ppp6-trigger-label')">{{ t('basicWan.connectionTrigger') }}</label>
                    <select v-model="draft.Contrigger" :data-testid="qa('basic-wan-ppp6-trigger-select')">
                      <option v-for="ct in listConnectionTrigger" :key="ct" :value="ct">{{ ct }}</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label :data-testid="qa('basic-wan-ppp6-idle-time-label')">{{ t('basicWan.idleTime') }}</label>
                    <input type="number" v-model.number="draft.IdleTime" min="0" max="65535" :class="{ error: formErrors.IdleTime }" @input="clearFieldError('IdleTime')" :data-testid="qa('basic-wan-ppp6-idle-time-input')" />
                    <span v-if="formErrors.IdleTime" class="error-message">{{ formErrors.IdleTime }}</span>
                  </div>
                </template>
                <div class="switch-label">
                  <span :data-testid="qa('basic-wan-ppp6-slaac-label')">{{ t('basicWan.slaac') }}</span>
                  <BaseSwitch v-model="draft.SLAAC" :true-value="1" :false-value="0"
                    :data-testid="qa('basic-wan-ppp6-slaac-toggle')" :slider-data-testid="qa('basic-wan-ppp6-slaac-slider')" />
                </div>
                <div class="switch-label">
                  <span :data-testid="qa('basic-wan-ppp6-iana-label')">{{ t('basicWan.iana') }}</span>
                  <BaseSwitch v-model="draft.IANA" :true-value="1" :false-value="0"
                    :data-testid="qa('basic-wan-ppp6-iana-toggle')" :slider-data-testid="qa('basic-wan-ppp6-iana-slider')" />
                </div>
                <div class="switch-label">
                  <span :data-testid="qa('basic-wan-ppp6-iapd-label')">{{ t('basicWan.iapd') }}</span>
                  <BaseSwitch v-model="draft.IAPD" :true-value="1" :false-value="0"
                    :data-testid="qa('basic-wan-ppp6-iapd-toggle')" :slider-data-testid="qa('basic-wan-ppp6-iapd-slider')" />
                </div>
              </template>

              <!-- Static IPv6 -->
              <template v-if="draft.IPv6Mode === 'static'">
                <div class="form-group">
                  <label :data-testid="qa('basic-wan-ipv6-address-label')">{{ t('basicWan.ipv6Address') }}</label>
                  <input type="text" v-model="draft.IPv6Address" :class="{ error: formErrors.IPv6Address }" @input="clearFieldError('IPv6Address')" :data-testid="qa('basic-wan-ipv6-address-input')" />
                  <span v-if="formErrors.IPv6Address" class="error-message">{{ formErrors.IPv6Address }}</span>
                </div>
                <div class="form-group">
                  <label :data-testid="qa('basic-wan-prefix-length-label')">{{ t('basicWan.prefixLength') }}</label>
                  <input type="number" v-model.number="draft.IPv6PrefixLength" min="1" max="128" :class="{ error: formErrors.IPv6PrefixLength }" @input="clearFieldError('IPv6PrefixLength')" :data-testid="qa('basic-wan-prefix-length-input')" />
                  <span v-if="formErrors.IPv6PrefixLength" class="error-message">{{ formErrors.IPv6PrefixLength }}</span>
                </div>
                <div class="form-group">
                  <label :data-testid="qa('basic-wan-ipv6-router-label')">{{ t('basicWan.ipv6DefaultRouter') }}</label>
                  <input type="text" v-model="draft.IPv6DefaultRouter" :class="{ error: formErrors.IPv6DefaultRouter }" @input="clearFieldError('IPv6DefaultRouter')" :data-testid="qa('basic-wan-ipv6-router-input')" />
                  <span v-if="formErrors.IPv6DefaultRouter" class="error-message">{{ formErrors.IPv6DefaultRouter }}</span>
                </div>
                <div class="form-group">
                  <label :data-testid="qa('basic-wan-ipv6-dns-label')">{{ t('basicWan.ipv6DnsServers') }}</label>
                  <input type="text" v-model="draft.IPv6DNSServers" :class="{ error: formErrors.IPv6DNSServers }" @input="clearFieldError('IPv6DNSServers')" :data-testid="qa('basic-wan-ipv6-dns-input')" />
                  <span v-if="formErrors.IPv6DNSServers" class="error-message">{{ formErrors.IPv6DNSServers }}</span>
                </div>
              </template>
            </template>

            <!-- Common Settings -->
            <div class="form-divider"></div>
            <div class="form-group">
              <label :data-testid="qa('basic-wan-vlan-type-label')">{{ t('basicWan.vlanType') }}</label>
              <select v-model="draft.VLANType" :data-testid="qa('basic-wan-vlan-type-select')">
                <option v-for="vt in listVLANType" :key="vt" :value="vt">{{ vt }}</option>
              </select>
            </div>
            <div v-if="draft.VLANType === 'tagged'" class="form-group">
              <label :data-testid="qa('basic-wan-vlan-id-label')">{{ t('basicWan.vlanId') }}</label>
              <input type="number" v-model.number="draft.VLANID" min="1" max="4094" :class="{ error: formErrors.VLANID }" @input="clearFieldError('VLANID')" :data-testid="qa('basic-wan-vlan-id-input')" />
              <span v-if="formErrors.VLANID" class="error-message">{{ formErrors.VLANID }}</span>
            </div>
            <div v-if="draft.VLANType === 'tagged'" class="form-group">
              <label :data-testid="qa('basic-wan-vlan-priority-label')">{{ t('basicWan.vlanPriority') }}</label>
              <input type="number" v-model.number="draft.VLANPriority" min="0" max="7" :class="{ error: formErrors.VLANPriority }" @input="clearFieldError('VLANPriority')" :data-testid="qa('basic-wan-vlan-priority-input')" />
              <span v-if="formErrors.VLANPriority" class="error-message">{{ formErrors.VLANPriority }}</span>
            </div>
            <div class="form-group">
              <label :data-testid="qa('basic-wan-mtu-label')">{{ t('basicWan.mtu') }}</label>
              <input type="number" v-model.number="draft.MTU" min="576" max="1500" :class="{ error: formErrors.MTU }" @input="clearFieldError('MTU')" :data-testid="qa('basic-wan-mtu-input')" />
              <span v-if="formErrors.MTU" class="error-message">{{ formErrors.MTU }}</span>
            </div>
          </div>
        </div>

        <div class="modal-footer" :data-testid="qa('basic-wan-edit-buttons')">
          <ActionButtons
            :apply-text="t('basicWan.save')"
            :cancel-data-testid="qa('basic-wan-edit-cancel')"
            :apply-data-testid="qa('basic-wan-edit-save')"
            @cancel="handleEditCancel"
            @apply="handleSave"
          />
        </div>
      </div>
    </div>
    </div>

    <!-- DETAIL MODAL OVERLAY -->
    <div v-if="detailItem" class="modal-overlay" @mousedown.self="detailIndex = null" :data-testid="qa('basic-wan-detail-overlay')">
      <div class="modal-content" :data-testid="qa('basic-wan-detail-modal')">
        <div class="modal-header">
          <button class="back-btn" @click="detailIndex = null" :data-testid="qa('basic-wan-detail-back')">
            <span class="material-icons">arrow_back</span>
          </button>
          <h2 :data-testid="qa('basic-wan-detail-title')">
            {{ t('basicWan.detail') }} - {{ detailItem.Interface }}
          </h2>
          <button class="close-btn" @click="detailIndex = null" :data-testid="qa('basic-wan-detail-close')">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="modal-body">
          <div class="detail-card">
            <!-- IPv4 -->
            <div class="detail-section-title" :data-testid="qa('basic-wan-detail-ipv4-title')">{{ t('basicWan.ipv4Settings') }}</div>
            <div class="detail-row">
              <span class="detail-label">{{ t('basicWan.ipv4Enable') }}</span>
              <span class="detail-value" :data-testid="qa('basic-wan-detail-ipv4-enable')">{{ detailItem.IPv4Enable ? 'Enabled' : 'Disabled' }}</span>
            </div>
            <template v-if="detailItem.IPv4Enable">
              <div class="detail-row">
                <span class="detail-label">{{ t('basicWan.ipv4Mode') }}</span>
                <span class="detail-value" :data-testid="qa('basic-wan-detail-ipv4-mode')">{{ modeLabel(detailItem.IPv4Mode) }}</span>
              </div>
              <!-- DHCP4 details -->
              <template v-if="detailItem.IPv4Mode === 'dhcp4'">
                <div class="detail-row">
                  <span class="detail-label">{{ t('basicWan.option60') }}</span>
                  <span class="detail-value">{{ detailItem.Option60 ? 'Enabled' : 'Disabled' }}</span>
                </div>
                <div v-if="detailItem.Option60" class="detail-row">
                  <span class="detail-label">{{ t('basicWan.vendorClassId') }}</span>
                  <span class="detail-value">{{ detailItem.VendorClassID || '-' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">{{ t('basicWan.option61') }}</span>
                  <span class="detail-value">{{ detailItem.Option61 ? 'Enabled' : 'Disabled' }}</span>
                </div>
                <div v-if="detailItem.Option61" class="detail-row">
                  <span class="detail-label">{{ t('basicWan.clientId') }}</span>
                  <span class="detail-value">{{ detailItem.ClientID || '-' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">{{ t('basicWan.option12') }}</span>
                  <span class="detail-value">{{ detailItem.Option12 ? 'Enabled' : 'Disabled' }}</span>
                </div>
                <div v-if="detailItem.Option12" class="detail-row">
                  <span class="detail-label">{{ t('basicWan.hostName') }}</span>
                  <span class="detail-value">{{ detailItem.HostName || '-' }}</span>
                </div>
              </template>
              <!-- PPP4 details -->
              <template v-if="detailItem.IPv4Mode === 'ppp4'">
                <div class="detail-row">
                  <span class="detail-label">{{ t('basicWan.userName') }}</span>
                  <span class="detail-value">{{ detailItem.UserName || '-' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">{{ t('basicWan.serviceName') }}</span>
                  <span class="detail-value">{{ detailItem.ServiceName || '-' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">{{ t('basicWan.connectionTrigger') }}</span>
                  <span class="detail-value">{{ detailItem.Contrigger || '-' }}</span>
                </div>
                <div v-if="detailItem.Contrigger === 'OnDemand'" class="detail-row">
                  <span class="detail-label">{{ t('basicWan.idleTime') }}</span>
                  <span class="detail-value">{{ detailItem.IdleTime }}</span>
                </div>
              </template>
              <!-- Static IPv4 details -->
              <template v-if="detailItem.IPv4Mode === 'static'">
                <div class="detail-row">
                  <span class="detail-label">{{ t('basicWan.ipv4Address') }}</span>
                  <span class="detail-value">{{ detailItem.IPv4Address || '-' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">{{ t('basicWan.subnetMask') }}</span>
                  <span class="detail-value">{{ detailItem.IPv4SubnetMask || '-' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">{{ t('basicWan.defaultRouter') }}</span>
                  <span class="detail-value">{{ detailItem.IPv4DefaultRouter || '-' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">{{ t('basicWan.dnsServers') }}</span>
                  <span class="detail-value">{{ detailItem.IPv4DNSServers || '-' }}</span>
                </div>
              </template>
            </template>

            <!-- IPv6 -->
            <div class="detail-section-title" :data-testid="qa('basic-wan-detail-ipv6-title')">{{ t('basicWan.ipv6Settings') }}</div>
            <div class="detail-row">
              <span class="detail-label">{{ t('basicWan.ipv6Enable') }}</span>
              <span class="detail-value" :data-testid="qa('basic-wan-detail-ipv6-enable')">{{ detailItem.IPv6Enable ? 'Enabled' : 'Disabled' }}</span>
            </div>
            <template v-if="detailItem.IPv6Enable">
              <div class="detail-row">
                <span class="detail-label">{{ t('basicWan.ipv6Mode') }}</span>
                <span class="detail-value" :data-testid="qa('basic-wan-detail-ipv6-mode')">{{ modeLabel(detailItem.IPv6Mode) }}</span>
              </div>
              <!-- DHCPv6 details -->
              <template v-if="detailItem.IPv6Mode === 'dhcp6'">
                <div class="detail-row">
                  <span class="detail-label">{{ t('basicWan.slaac') }}</span>
                  <span class="detail-value">{{ detailItem.SLAAC ? 'Enabled' : 'Disabled' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">{{ t('basicWan.iana') }}</span>
                  <span class="detail-value">{{ detailItem.IANA ? 'Enabled' : 'Disabled' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">{{ t('basicWan.iapd') }}</span>
                  <span class="detail-value">{{ detailItem.IAPD ? 'Enabled' : 'Disabled' }}</span>
                </div>
              </template>
              <!-- PPPoEv6 details -->
              <template v-if="detailItem.IPv6Mode === 'ppp6'">
                <div class="detail-row detail-hint">
                  <span class="material-icons">info</span>
                  <span>{{ t('basicWan.pppv6SharesCredentials') }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">{{ t('basicWan.slaac') }}</span>
                  <span class="detail-value">{{ detailItem.SLAAC ? 'Enabled' : 'Disabled' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">{{ t('basicWan.iana') }}</span>
                  <span class="detail-value">{{ detailItem.IANA ? 'Enabled' : 'Disabled' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">{{ t('basicWan.iapd') }}</span>
                  <span class="detail-value">{{ detailItem.IAPD ? 'Enabled' : 'Disabled' }}</span>
                </div>
              </template>
              <!-- Static IPv6 details -->
              <template v-if="detailItem.IPv6Mode === 'static'">
                <div class="detail-row">
                  <span class="detail-label">{{ t('basicWan.ipv6Address') }}</span>
                  <span class="detail-value">{{ detailItem.IPv6Address || '-' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">{{ t('basicWan.prefixLength') }}</span>
                  <span class="detail-value">{{ detailItem.IPv6PrefixLength }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">{{ t('basicWan.ipv6DefaultRouter') }}</span>
                  <span class="detail-value">{{ detailItem.IPv6DefaultRouter || '-' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">{{ t('basicWan.ipv6DnsServers') }}</span>
                  <span class="detail-value">{{ detailItem.IPv6DNSServers || '-' }}</span>
                </div>
              </template>
            </template>

            <!-- Common Settings -->
            <div class="detail-section-title" :data-testid="qa('basic-wan-detail-common-title')">{{ t('basicWan.commonSettings') }}</div>
            <div class="detail-row">
              <span class="detail-label">{{ t('basicWan.vlanType') }}</span>
              <span class="detail-value" :data-testid="qa('basic-wan-detail-vlan-type')">{{ detailItem.VLANType }}</span>
            </div>
            <div v-if="detailItem.VLANType === 'tagged'" class="detail-row">
              <span class="detail-label">{{ t('basicWan.vlanId') }}</span>
              <span class="detail-value" :data-testid="qa('basic-wan-detail-vlan-id')">{{ detailItem.VLANID }}</span>
            </div>
            <div v-if="detailItem.VLANType === 'tagged'" class="detail-row">
              <span class="detail-label">{{ t('basicWan.vlanPriority') }}</span>
              <span class="detail-value" :data-testid="qa('basic-wan-detail-vlan-priority')">{{ detailItem.VLANPriority }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ t('basicWan.mtu') }}</span>
              <span class="detail-value" :data-testid="qa('basic-wan-detail-mtu')">{{ detailItem.MTU }}</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-primary" @click="detailIndex = null" :data-testid="qa('basic-wan-detail-close-btn')">
            {{ t('mesh.back') }}
          </button>
        </div>
      </div>
    </div>

    <BaseToast v-model="showSuccessToast" :message="successMessage" type="success" :data-testid="qa('basic-wan-success-toast')" />
    <BaseToast v-model="showErrorToast" :message="errorToastMessage" type="error" :data-testid="qa('basic-wan-error-toast')" />
  </div>
</template>

<style scoped>
/* Modal overlay */
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
  position: relative;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  flex: 1;
  text-align: center;
}

.back-btn,
.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0.25rem;
  display: flex;
  align-items: center;
}

.back-btn {
  position: absolute;
  left: 1.5rem;
}

.close-btn {
  position: absolute;
  right: 1.5rem;
}

.modal-body {
  padding: 1.5rem;
}

.compact-modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.compact-modal-form .form-group {
  margin-bottom: 0;
}

.compact-modal-form .switch-label {
  margin-bottom: 0;
}

.form-divider {
  border-top: 1px solid var(--border-color);
  margin: 0.5rem 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
}

input,
select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
  background: white;
}

input.error,
select.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
}

input:focus,
select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0, 120, 212, 0.1);
}

.switch-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

/* Custom switch size */
:deep(.switch) {
  width: 60px;
  height: 34px;
  flex-shrink: 0;
}

:deep(.slider:before) {
  height: 26px;
  width: 26px;
}

:deep(input:checked + .slider:before) {
  transform: translateX(26px);
}

.info-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background-color: #e3f2fd;
  border-left: 4px solid var(--primary-color);
  border-radius: 4px;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.info-banner .material-icons {
  font-size: 1.25rem;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-action {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-action:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--primary-color);
}

.btn-action-danger:hover {
  color: #dc3545;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
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
  background-color: white;
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
}

/* Detail modal card rows */
.detail-card {
  display: flex;
  flex-direction: column;
}

.detail-section-title {
  padding: 0.75rem 0;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.95rem;
  border-bottom: 2px solid var(--primary-color);
  margin-bottom: 0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.detail-value {
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.9rem;
  text-align: right;
  word-break: break-all;
  max-width: 60%;
}

.detail-hint {
  gap: 0.5rem;
  padding: 0.75rem 0.5rem;
  color: var(--primary-color);
  font-size: 0.85rem;
}

.detail-hint .material-icons {
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .button-group {
    flex-direction: column;
  }

  .button-group .btn {
    width: 100%;
  }

  .modal-content {
    width: 95%;
    max-height: 95vh;
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-footer :deep(.btn) {
    width: 100%;
  }

  :deep(.header-row) {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;
  }

  :deep(.header-actions) {
    width: auto !important;
    flex-shrink: 0;
    display: flex !important;
    justify-content: flex-end !important;
    align-items: center !important;
  }
}
</style>
