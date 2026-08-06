<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
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

// List options from API
const listIPv4Mode = computed(() => originalData.value?.BasicWan.ListIPv4Mode ?? []);
const listIPv6Mode = computed(() => originalData.value?.BasicWan.ListIPv6Mode ?? []);
const listVLANType = computed(() => originalData.value?.BasicWan.ListVLANType ?? []);
const listConnectionTrigger = computed(() => originalData.value?.BasicWan.ListConnectionTrigger ?? []);

const isTableView = computed(() => editIndex.value === null);

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
  editIndex.value = index;
  draft.value = JSON.parse(JSON.stringify(interfaces.value[index]));
  isNew.value = false;
};

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
};

const handleApply = async () => {
  if (loading.value) return;
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
      <template v-else-if="isTableView && originalData">
        <SectionCard
          :title="t('basicWan.interfaceManagement')"
          :title-data-testid="qa('basic-wan-management-title')"
        >
          <template #actions>
            <button
              class="btn btn-primary btn-sm"
              :data-testid="qa('basic-wan-add-button')"
              @click="handleAdd"
              :disabled="loading"
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
                  <th :data-testid="qa('basic-wan-header-vlan-type')">{{ t('basicWan.vlanType') }}</th>
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
                  <td :data-testid="qa(`basic-wan-vlan-type-${idx}`)">{{ iface.VLANType }}</td>
                  <td :data-testid="qa(`basic-wan-vlan-id-${idx}`)">{{ iface.VLANID }}</td>
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
                <span class="card-label">{{ t('basicWan.vlanType') }}</span>
                <span class="card-value">{{ iface.VLANType }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('basicWan.vlanId') }}</span>
                <span class="card-value">{{ iface.VLANID }}</span>
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

      <!-- EDIT VIEW -->
      <template v-else-if="draft">
        <div class="edit-header" :data-testid="qa('basic-wan-edit-header')">
          <button class="btn btn-secondary btn-sm" @click="handleEditCancel" :data-testid="qa('basic-wan-edit-back')">
            <span class="material-icons">arrow_back</span>
            {{ t('common.back') }}
          </button>
          <h2 class="edit-title" :data-testid="qa('basic-wan-edit-title')">
            {{ isNew ? t('basicWan.addInterface') : t('basicWan.editInterface') }} - {{ draft.Interface }}
          </h2>
        </div>

        <!-- Common Settings -->
        <SectionCard
          :title="t('basicWan.commonSettings')"
          :title-data-testid="qa('basic-wan-common-title')"
        >
          <div class="form-grid">
            <div class="form-group">
              <label :data-testid="qa('basic-wan-vlan-type-label')">{{ t('basicWan.vlanType') }}</label>
              <select v-model="draft.VLANType" :data-testid="qa('basic-wan-vlan-type-select')">
                <option v-for="vt in listVLANType" :key="vt" :value="vt">{{ vt }}</option>
              </select>
            </div>
            <div v-if="draft.VLANType === 'tagged'" class="form-group">
              <label :data-testid="qa('basic-wan-vlan-id-label')">{{ t('basicWan.vlanId') }}</label>
              <input type="number" v-model.number="draft.VLANID" min="1" max="4094" :data-testid="qa('basic-wan-vlan-id-input')" />
            </div>
            <div class="form-group">
              <label :data-testid="qa('basic-wan-vlan-priority-label')">{{ t('basicWan.vlanPriority') }}</label>
              <input type="number" v-model.number="draft.VLANPriority" min="0" max="7" :data-testid="qa('basic-wan-vlan-priority-input')" />
            </div>
            <div class="form-group">
              <label :data-testid="qa('basic-wan-mtu-label')">{{ t('basicWan.mtu') }}</label>
              <input type="number" v-model.number="draft.MTU" min="576" max="1500" :data-testid="qa('basic-wan-mtu-input')" />
            </div>
          </div>
        </SectionCard>

        <!-- IPv4 Settings -->
        <SectionCard
          :title="t('basicWan.ipv4Settings')"
          :title-data-testid="qa('basic-wan-ipv4-title')"
        >
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
              <div class="form-group">
                <label :data-testid="qa('basic-wan-hostname-label')">{{ t('basicWan.hostName') }}</label>
                <input type="text" v-model="draft.HostName" :data-testid="qa('basic-wan-hostname-input')" />
              </div>
              <div class="switch-label">
                <span :data-testid="qa('basic-wan-option60-label')">{{ t('basicWan.option60') }}</span>
                <BaseSwitch v-model="draft.Option60" :true-value="1" :false-value="0"
                  :data-testid="qa('basic-wan-option60-toggle')" :slider-data-testid="qa('basic-wan-option60-slider')" />
              </div>
              <div v-if="draft.Option60" class="form-group">
                <label :data-testid="qa('basic-wan-vendor-class-label')">{{ t('basicWan.vendorClassId') }}</label>
                <input type="text" v-model="draft.VendorClassID" :data-testid="qa('basic-wan-vendor-class-input')" />
              </div>
              <div class="switch-label">
                <span :data-testid="qa('basic-wan-option61-label')">{{ t('basicWan.option61') }}</span>
                <BaseSwitch v-model="draft.Option61" :true-value="1" :false-value="0"
                  :data-testid="qa('basic-wan-option61-toggle')" :slider-data-testid="qa('basic-wan-option61-slider')" />
              </div>
              <div v-if="draft.Option61" class="form-group">
                <label :data-testid="qa('basic-wan-client-id-label')">{{ t('basicWan.clientId') }}</label>
                <input type="text" v-model="draft.ClientID" :data-testid="qa('basic-wan-client-id-input')" />
              </div>
              <div class="switch-label">
                <span :data-testid="qa('basic-wan-option12-label')">{{ t('basicWan.option12') }}</span>
                <BaseSwitch v-model="draft.Option12" :true-value="1" :false-value="0"
                  :data-testid="qa('basic-wan-option12-toggle')" :slider-data-testid="qa('basic-wan-option12-slider')" />
              </div>
            </template>

            <!-- PPP4 -->
            <template v-if="draft.IPv4Mode === 'ppp4'">
              <div class="form-group">
                <label :data-testid="qa('basic-wan-username-label')">{{ t('basicWan.userName') }}</label>
                <input type="text" v-model="draft.UserName" :data-testid="qa('basic-wan-username-input')" />
              </div>
              <div class="form-group">
                <label :data-testid="qa('basic-wan-password-label')">{{ t('basicWan.password') }}</label>
                <BaseSecretInput v-model="draft.Password" :input-data-testid="qa('basic-wan-password-input')" />
              </div>
              <div class="form-group">
                <label :data-testid="qa('basic-wan-service-name-label')">{{ t('basicWan.serviceName') }}</label>
                <input type="text" v-model="draft.ServiceName" :data-testid="qa('basic-wan-service-name-input')" />
              </div>
              <div class="form-group">
                <label :data-testid="qa('basic-wan-trigger-label')">{{ t('basicWan.connectionTrigger') }}</label>
                <select v-model="draft.Contrigger" :data-testid="qa('basic-wan-trigger-select')">
                  <option v-for="ct in listConnectionTrigger" :key="ct" :value="ct">{{ ct }}</option>
                </select>
              </div>
              <div v-if="draft.Contrigger === 'OnDemand'" class="form-group">
                <label :data-testid="qa('basic-wan-idle-time-label')">{{ t('basicWan.idleTime') }}</label>
                <input type="number" v-model.number="draft.IdleTime" min="0" :data-testid="qa('basic-wan-idle-time-input')" />
              </div>
            </template>

            <!-- Static IPv4 -->
            <template v-if="draft.IPv4Mode === 'static'">
              <div class="form-group">
                <label :data-testid="qa('basic-wan-ipv4-address-label')">{{ t('basicWan.ipv4Address') }}</label>
                <input type="text" v-model="draft.IPv4Address" :data-testid="qa('basic-wan-ipv4-address-input')" />
              </div>
              <div class="form-group">
                <label :data-testid="qa('basic-wan-subnet-mask-label')">{{ t('basicWan.subnetMask') }}</label>
                <input type="text" v-model="draft.IPv4SubnetMask" :data-testid="qa('basic-wan-subnet-mask-input')" />
              </div>
              <div class="form-group">
                <label :data-testid="qa('basic-wan-default-router-label')">{{ t('basicWan.defaultRouter') }}</label>
                <input type="text" v-model="draft.IPv4DefaultRouter" :data-testid="qa('basic-wan-default-router-input')" />
              </div>
              <div class="form-group">
                <label :data-testid="qa('basic-wan-dns-label')">{{ t('basicWan.dnsServers') }}</label>
                <input type="text" v-model="draft.IPv4DNSServers" :data-testid="qa('basic-wan-dns-input')" />
              </div>
            </template>
          </template>
        </SectionCard>

        <!-- IPv6 Settings -->
        <SectionCard
          :title="t('basicWan.ipv6Settings')"
          :title-data-testid="qa('basic-wan-ipv6-title')"
        >
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
              <div class="info-banner" :data-testid="qa('basic-wan-pppv6-hint')">
                <span class="material-icons">info</span>
                <span>{{ t('basicWan.pppv6SharesCredentials') }}</span>
              </div>
            </template>

            <!-- Static IPv6 -->
            <template v-if="draft.IPv6Mode === 'static'">
              <div class="form-group">
                <label :data-testid="qa('basic-wan-ipv6-address-label')">{{ t('basicWan.ipv6Address') }}</label>
                <input type="text" v-model="draft.IPv6Address" :data-testid="qa('basic-wan-ipv6-address-input')" />
              </div>
              <div class="form-group">
                <label :data-testid="qa('basic-wan-prefix-length-label')">{{ t('basicWan.prefixLength') }}</label>
                <input type="number" v-model.number="draft.IPv6PrefixLength" min="1" max="128" :data-testid="qa('basic-wan-prefix-length-input')" />
              </div>
              <div class="form-group">
                <label :data-testid="qa('basic-wan-ipv6-router-label')">{{ t('basicWan.ipv6DefaultRouter') }}</label>
                <input type="text" v-model="draft.IPv6DefaultRouter" :data-testid="qa('basic-wan-ipv6-router-input')" />
              </div>
              <div class="form-group">
                <label :data-testid="qa('basic-wan-ipv6-dns-label')">{{ t('basicWan.ipv6DnsServers') }}</label>
                <input type="text" v-model="draft.IPv6DNSServers" :data-testid="qa('basic-wan-ipv6-dns-input')" />
              </div>
            </template>
          </template>
        </SectionCard>

        <!-- Edit buttons -->
        <div class="button-group" :data-testid="qa('basic-wan-edit-buttons')">
          <button class="btn btn-secondary" @click="handleEditCancel" :data-testid="qa('basic-wan-edit-cancel')">
            {{ t('common.cancel') }}
          </button>
          <button class="btn btn-primary" @click="handleSave" :data-testid="qa('basic-wan-edit-save')">
            {{ t('basicWan.save') }}
          </button>
        </div>
      </template>
    </div>

    <BaseToast v-model="showSuccessToast" :message="successMessage" type="success" :data-testid="qa('basic-wan-success-toast')" />
    <BaseToast v-model="showErrorToast" :message="errorToastMessage" type="error" :data-testid="qa('basic-wan-error-toast')" />
  </div>
</template>

<style scoped>
.edit-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.edit-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
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

.btn-sm {
  font-size: 0.85rem;
  padding: 0.35rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-sm .material-icons {
  font-size: 1.1rem;
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

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .edit-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .button-group {
    flex-direction: column;
  }

  .button-group .btn {
    width: 100%;
  }
}
</style>
