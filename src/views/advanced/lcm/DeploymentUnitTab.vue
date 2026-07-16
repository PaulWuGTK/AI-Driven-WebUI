<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type {
  DeploymentUnitItem,
  PortForwarding,
  HostObject,
  ExecEnvOption
} from '../../../types/lcmDeploymentUnit';
import {
  getLcmDeploymentUnitConfig,
  updateLcmDeploymentUnit
} from '../../../services/api/lcmDeploymentUnit';
import { ActionButtons, BaseSecretInput, SectionCard } from '../../../components/common';
import { extractNokMessage } from '../../../utils/apiUtils';
import { useQA } from '../../../utils/qa';

type NetworkMode = '' | 'ShareParentNetwork' | 'PortForwarding';

const { qa } = useQA();
const { t } = useI18n();

const loading = ref(false);
const error = ref<string | null>(null);
const duList = ref<DeploymentUnitItem[]>([]);
const execEnvList = ref<ExecEnvOption[]>([]);
const interfaceList = ref<string[]>([]);
const protocolList = ref<string[]>([]);
const hostObjectMountType = ref<string[]>([]);
const showModal = ref(false);
const editingItem = ref<DeploymentUnitItem | null>(null);
const showSuccess = ref(false);

const formData = ref({
  URL: '',
  UUID: '',
  Username: '',
  Password: '',
  InstalledEE: '',
  Privileged: true,
  NetworkMode: 'ShareParentNetwork' as NetworkMode,
  PortForwarding: [] as PortForwarding[],
  HostObject: [] as HostObject[],
  AutoRestartEnable: true,
  MaxRetryCount: 10
});

const formErrors = ref({
  URL: '',
  UUID: '',
  Username: '',
  Password: '',
  InstalledEE: ''
});

const isEditMode = computed(() => editingItem.value !== null);
const modalTitle = computed(() =>
  isEditMode.value ? t('lcm.updateDU') : t('lcm.addDU')
);

const fetchConfig = async (silent = false) => {
  if (!silent) loading.value = true;
  error.value = null;
  try {
    const response = await getLcmDeploymentUnitConfig();
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      error.value = nokMessage;
      duList.value = [];
      execEnvList.value = [];
      interfaceList.value = [];
      protocolList.value = [];
      hostObjectMountType.value = [];
      return;
    }
    duList.value = response.AdvancedLcmDeploymentUnit.DUList;
    execEnvList.value = response.AdvancedLcmDeploymentUnit.ExecEnvList;
    interfaceList.value = response.AdvancedLcmDeploymentUnit.InterfaceList;
    protocolList.value = response.AdvancedLcmDeploymentUnit.ProtocolList;
    hostObjectMountType.value = response.AdvancedLcmDeploymentUnit.HostObjectMountType;
  } catch (err) {
    console.error('Error fetching LCM DeploymentUnit config:', err);
    error.value = 'Failed to fetch LCM DeploymentUnit configuration';
  } finally {
    if (!silent) loading.value = false;
  }
};

const validateForm = (): boolean => {
  formErrors.value = {
    URL: '',
    UUID: '',
    Username: '',
    Password: '',
    InstalledEE: ''
  };

  let isValid = true;

  if (!formData.value.URL.trim()) {
    formErrors.value.URL = t('lcm.urlRequired');
    isValid = false;
  } else if (!formData.value.URL.startsWith('docker://')) {
    formErrors.value.URL = t('lcm.urlFormatError');
    isValid = false;
  }

  if (!formData.value.UUID.trim()) {
    formErrors.value.UUID = t('lcm.uuidRequired');
    isValid = false;
  } else if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(formData.value.UUID)) {
    formErrors.value.UUID = t('lcm.uuidFormatError');
    isValid = false;
  }

  const username = formData.value.Username.trim();
  const password = formData.value.Password.trim();

  // Username/Password are optional, but if one is provided, require the other.
  if ((username && !password) || (!username && password)) {
    if (!username) formErrors.value.Username = t('lcm.usernameRequired');
    if (!password) formErrors.value.Password = t('lcm.passwordRequired');
    isValid = false;
  }

  if (!formData.value.InstalledEE) {
    formErrors.value.InstalledEE = t('lcm.installedEERequired');
    isValid = false;
  }

  return isValid;
};

const openAddModal = () => {
  editingItem.value = null;
  formData.value = {
    URL: '',
    UUID: '',
    Username: '',
    Password: '',
    InstalledEE: execEnvList.value[0]?.Name || '',
    Privileged: true,
    NetworkMode: '',
    PortForwarding: [],
    HostObject: [],
    AutoRestartEnable: true,
    MaxRetryCount: 10
  };
  formErrors.value = {
    URL: '',
    UUID: '',
    Username: '',
    Password: '',
    InstalledEE: ''
  };
  showModal.value = true;
};

const openEditModal = (item: DeploymentUnitItem) => {
  editingItem.value = { ...item };
  formData.value = {
    URL: item.URL,
    UUID: item.UUID,
    Username: '',
    Password: '',
    InstalledEE: item.InstalledEE,
    Privileged: item.Privileged === 1,
    NetworkMode: item.NetworkConfig?.ShareParentNetwork
      ? 'ShareParentNetwork'
      : ((item.NetworkConfig?.PortForwarding?.length || 0) > 0 ? 'PortForwarding' : ''),
    PortForwarding: [...(item.NetworkConfig?.PortForwarding || [])],
    HostObject: [...item.HostObject],
    AutoRestartEnable: item.AutoRestart.Enable === 1,
    MaxRetryCount: item.AutoRestart.MaxRetryCount
  };
  formErrors.value = {
    URL: '',
    UUID: '',
    Username: '',
    Password: '',
    InstalledEE: ''
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingItem.value = null;
};

const addPortForwarding = () => {
  formData.value.PortForwarding.push({
    Protocol: protocolList.value[0] || 'TCP',
    ExternalPort: 8000,
    Interface: interfaceList.value[0] || 'Lan',
    InternalPort: 8000
  });
};

const removePortForwarding = (index: number) => {
  formData.value.PortForwarding.splice(index, 1);
};

const addHostObject = () => {
  formData.value.HostObject.push({
    Source: '',
    Destination: '',
    Type: hostObjectMountType.value[0] || 'mount'
  });
};

const removeHostObject = (index: number) => {
  formData.value.HostObject.splice(index, 1);
};

const handleSave = async () => {
  if (!validateForm()) {
    return;
  }
  try {
    const username = formData.value.Username.trim();
    const password = formData.value.Password.trim();

    const networkConfig = {
      ShareParentNetwork: formData.value.NetworkMode === 'ShareParentNetwork',
      AccessInterfaces: [] as string[],
      PortForwarding:
        formData.value.NetworkMode === 'PortForwarding'
          ? formData.value.PortForwarding
          : []
    };

    const payload: any = {
      Action: isEditMode.value ? 'Update' : 'Install',
      URL: formData.value.URL,
      UUID: formData.value.UUID,
      ...(isEditMode.value ? { DUID: editingItem.value!.DUID } : {}),
      Username: username,
      Password: password,
      InstalledEE: formData.value.InstalledEE,
      Privileged: formData.value.Privileged,
      NetworkConfig: networkConfig,
      HostObject: formData.value.HostObject,
      AutoRestart: {
        Enable: formData.value.AutoRestartEnable,
        MaxRetryCount: formData.value.MaxRetryCount
      }
    };

    const res = await updateLcmDeploymentUnit({ AdvancedLcmDeploymentUnit: payload });

    const nokMessage = extractNokMessage(res);
    if (nokMessage) {
      throw new Error(nokMessage);
    }

    await fetchConfig();
    showSuccessMessage();
    closeModal();
  } catch (err) {
    console.error('Error saving DeploymentUnit:', err);
    error.value = err instanceof Error ? err.message : 'Failed to save DeploymentUnit';
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (duid: string) => {
  if (!confirm(t('lcm.confirmDeleteDeployment'))) return;

  loading.value = true;
  try {
    const res = await updateLcmDeploymentUnit({
      AdvancedLcmDeploymentUnit: {
        Action: 'Uninstall',
        DUID: duid
      }
    });

    const nokMessage = extractNokMessage(res);
    if (nokMessage) {
      throw new Error(nokMessage);
    }

    await fetchConfig();
    showSuccessMessage();
  } catch (err) {
    console.error('Error deleting DeploymentUnit:', err);
    error.value = err instanceof Error ? err.message : 'Failed to delete DeploymentUnit';
  } finally {
    loading.value = false;
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
  <div class="deployment-unit-tab" :data-testid="qa('lcm-deployment-unit-tab')">
    <div v-if="loading" class="loading-state" :data-testid="qa('lcm-deployment-unit-loading')">
      <div class="loading-spinner"></div>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="error" class="error-state" :data-testid="qa('lcm-deployment-unit-error')">
      {{ error }}
    </div>

    <template v-else>
      <SectionCard
        :data-testid="qa('lcm-deployment-unit-section')"
        header-mode="row"
        :title="t('lcm.deploymentUnit')"
        :title-data-testid="qa('lcm-deployment-unit-title')"
      >
        <template #actions>
          <button
            class="btn btn-primary"
            :data-testid="qa('lcm-deployment-unit-add-button')"
            @click="openAddModal"
          >
            <span class="material-icons">add</span>
            {{ t('lcm.addDU') }}
          </button>
        </template>

          <div class="table-container" :data-testid="qa('lcm-deployment-unit-table')">
            <table>
              <thead>
                <tr>
                  <th :data-testid="qa('lcm-deployment-unit-header-no')">{{ t('lcm.no') }}</th>
                  <th :data-testid="qa('lcm-deployment-unit-header-name')">{{ t('lcm.name') }}</th>
                  <th :data-testid="qa('lcm-deployment-unit-header-uuid')">{{ t('lcm.uuid') }}</th>
                  <th :data-testid="qa('lcm-deployment-unit-header-version')">
                    {{ t('lcm.version') }}
                  </th>
                  <th :data-testid="qa('lcm-deployment-unit-header-status')">
                    {{ t('lcm.status') }}
                  </th>
                  <th :data-testid="qa('lcm-deployment-unit-header-description')">
                    {{ t('lcm.description') }}
                  </th>
                  <th :data-testid="qa('lcm-deployment-unit-header-installedEE')">
                    {{ t('lcm.installedEE') }}
                  </th>
                  <th :data-testid="qa('lcm-deployment-unit-header-action')">
                    {{ t('lcm.action') }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in duList"
                  :key="item.DUID"
                  :data-testid="qa(`lcm-deployment-unit-row-${index}`)"
                >
                  <td :data-testid="qa(`lcm-deployment-unit-no-${index}`)">{{ index + 1 }}</td>
                  <td :data-testid="qa(`lcm-deployment-unit-name-${index}`)">{{ item.Name }}</td>
                  <td :data-testid="qa(`lcm-deployment-unit-uuid-${index}`)">{{ item.UUID }}</td>
                  <td :data-testid="qa(`lcm-deployment-unit-version-${index}`)">
                    {{ item.Version }}
                  </td>
                  <td :data-testid="qa(`lcm-deployment-unit-status-${index}`)">
                    {{ item.Status }}
                  </td>
                  <td :data-testid="qa(`lcm-deployment-unit-description-${index}`)">
                    {{ item.Description }}
                  </td>
                  <td :data-testid="qa(`lcm-deployment-unit-installedEE-${index}`)">
                    {{ item.InstalledEE }}
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button
                        class="btn-action"
                        :data-testid="qa(`lcm-deployment-unit-edit-${index}`)"
                        @click="openEditModal(item)"
                        title="Edit"
                      >
                        <span class="material-icons">edit</span>
                      </button>
                      <button
                        class="btn-action"
                        :data-testid="qa(`lcm-deployment-unit-delete-${index}`)"
                        @click="handleDelete(item.DUID)"
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

          <div class="mobile-cards" :data-testid="qa('lcm-deployment-unit-mobile')">
            <div
              class="table-card"
              v-for="(item, index) in duList"
              :key="item.DUID"
              :data-testid="qa(`lcm-deployment-unit-card-${index}`)"
            >
              <div class="card-row">
                <span class="card-label">{{ t('lcm.name') }}</span>
                <span class="card-value">{{ item.Name }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('lcm.uuid') }}</span>
                <span class="card-value">{{ item.UUID }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('lcm.version') }}</span>
                <span class="card-value">{{ item.Version }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('lcm.status') }}</span>
                <span class="card-value">{{ item.Status }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('lcm.installedEE') }}</span>
                <span class="card-value">{{ item.InstalledEE }}</span>
              </div>
              <div class="card-actions">
                <span class="card-label">{{ t('lcm.action') }}</span>
                <div class="action-buttons">
                <button class="btn-action" @click="openEditModal(item)" title="Edit" :data-testid="qa(`lcm-deployment-unit-card-edit-${index}`)">
                  <span class="material-icons">edit</span>
                </button>
                <button class="btn-action" @click="handleDelete(item.DUID)" title="Delete" :data-testid="qa(`lcm-deployment-unit-card-delete-${index}`)">
                  <span class="material-icons">delete</span>
                </button>
                </div>
              </div>
            </div>
          </div>
      </SectionCard>
    </template>

    <div v-if="showModal" class="modal-overlay" @mousedown.self="closeModal">
      <div class="modal-content large-modal" :data-testid="qa('lcm-deployment-unit-modal')">
        <div class="modal-header">
          <h2>{{ modalTitle }}</h2>
          <button class="close-btn" @click="closeModal" :data-testid="qa('lcm-deployment-unit-modal-close')">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="modal-body compact-modal-form">
          <div class="form-section">
            <div class="section-header">{{ t('lcm.appRegistry') }}</div>

            <div class="form-row">
              <div class="form-group">
                <label>
                  {{ t('lcm.url') }}
                  <span class="required">*</span>
                </label>
                <input
                  type="text"
                  v-model="formData.URL"
                  :placeholder="t('lcm.urlPlaceholder')"
                  :class="{ error: formErrors.URL }"
                  :data-testid="qa('lcm-deployment-unit-modal-url')"
                />
                <span v-if="formErrors.URL" class="error-message">{{ formErrors.URL }}</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group half">
                <label>
                  {{ t('lcm.uuid') }}
                  <span class="required">*</span>
                  <span v-if="isEditMode" class="readonly-label">({{ t('lcm.readonly') }})</span>
                </label>
                <input
                  type="text"
                  v-model="formData.UUID"
                  :disabled="isEditMode"
                  :placeholder="t('lcm.uuidPlaceholder')"
                  :class="{ error: formErrors.UUID }"
                  :data-testid="qa('lcm-deployment-unit-modal-uuid')"
                />
                <span v-if="formErrors.UUID" class="error-message">{{ formErrors.UUID }}</span>
              </div>
            </div>

            <div class="form-row two-cols">
              <div class="form-group">
                <label>
                  {{ t('lcm.username') }}
                </label>
                <input
                  type="text"
                  v-model="formData.Username"
                  :class="{ error: formErrors.Username }"
                  :data-testid="qa('lcm-deployment-unit-modal-username')"
                />
                <span v-if="formErrors.Username" class="error-message">{{
                  formErrors.Username
                }}</span>
              </div>

              <div class="form-group">
                <label>
                  {{ t('lcm.password') }}
                </label>
                <BaseSecretInput
                  v-model="formData.Password"
                  class="password-field"
                  :class="{ error: formErrors.Password }"
                  :input-data-testid="qa('lcm-deployment-unit-modal-password')"
                  :toggle-data-testid="qa('lcm-deployment-unit-modal-password-toggle')"
                />
                <span v-if="formErrors.Password" class="error-message">{{
                  formErrors.Password
                }}</span>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="section-header">{{ t('lcm.resourceConfiguration') }}</div>

            <div class="form-group">
              <label>
                {{ t('lcm.eeToInstalled') }}
                <span class="required">*</span>
                <span v-if="isEditMode" class="readonly-label">({{ t('lcm.readonly') }})</span>
              </label>
              <select
                v-model="formData.InstalledEE"
                :disabled="isEditMode"
                :class="{ error: formErrors.InstalledEE }"
                :data-testid="qa('lcm-deployment-unit-modal-installed-ee')"
              >
                <option v-for="env in execEnvList" :key="env.Name" :value="env.Name">
                  {{ env.Name }}
                </option>
              </select>
              <span v-if="formErrors.InstalledEE" class="error-message">{{
                formErrors.InstalledEE
              }}</span>
            </div>
          </div>

          <div class="form-section">
            <div class="section-header">{{ t('lcm.runtimeConfiguration') }}</div>

            <div class="form-group">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="formData.Privileged"
                  :data-testid="qa('lcm-deployment-unit-modal-privileged')"
                />
                {{ t('lcm.privileged') }}
              </label>
            </div>

            <div class="form-group">
              <label>{{ t('lcm.network') }}</label>
              <select
                v-model="formData.NetworkMode"
                :data-testid="qa('lcm-deployment-unit-modal-network-mode')"
              >
                <option value="">--</option>
                <option value="ShareParentNetwork">{{ t('lcm.shareParentNetwork') }}</option>
                <option value="PortForwarding">{{ t('lcm.portForwarding') }}</option>
              </select>
            </div>

            <div v-if="formData.NetworkMode === 'PortForwarding'" class="port-forwarding-section">
              <div class="subsection-header">
                <span>{{ t('lcm.portForwardingRules') }}</span>
                <button
                  type="button"
                  class="btn-icon"
                  @click="addPortForwarding"
                  :data-testid="qa('lcm-deployment-unit-add-port-forwarding')"
                >
                  <span class="material-icons">add_circle</span>
                </button>
              </div>

              <div
                v-for="(pf, index) in formData.PortForwarding"
                :key="index"
                class="port-forwarding-row"
              >
                <div class="form-group">
                  <label>{{ t('lcm.interface') }}</label>
                  <select v-model="pf.Interface" :data-testid="qa(`lcm-deployment-unit-port-forwarding-interface-${index}`)">
                    <option v-for="iface in interfaceList" :key="iface" :value="iface">
                      {{ iface }}
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label>{{ t('lcm.protocol') }}</label>
                  <select v-model="pf.Protocol" :data-testid="qa(`lcm-deployment-unit-port-forwarding-protocol-${index}`)">
                    <option v-for="proto in protocolList" :key="proto" :value="proto">
                      {{ proto }}
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label>{{ t('lcm.externalPort') }}</label>
                  <input type="number" v-model.number="pf.ExternalPort" min="1" max="65535" :data-testid="qa(`lcm-deployment-unit-port-forwarding-external-port-${index}`)" />
                </div>

                <div class="form-group">
                  <label>{{ t('lcm.internalPort') }}</label>
                  <input type="number" v-model.number="pf.InternalPort" min="1" max="65535" :data-testid="qa(`lcm-deployment-unit-port-forwarding-internal-port-${index}`)" />
                </div>

                <button
                  type="button"
                  class="btn-icon-small delete"
                  @click="removePortForwarding(index)"
                  :data-testid="qa(`lcm-deployment-unit-remove-port-forwarding-${index}`)"
                >
                  <span class="material-icons">remove_circle</span>
                </button>
              </div>
            </div>

            <div class="host-object-section">
              <div class="subsection-header">
                <span>{{ t('lcm.hostObject') }}</span>
                <button
                  type="button"
                  class="btn-icon"
                  @click="addHostObject"
                  :data-testid="qa('lcm-deployment-unit-add-host-object')"
                >
                  <span class="material-icons">add_circle</span>
                </button>
              </div>

              <div
                v-for="(ho, index) in formData.HostObject"
                :key="index"
                class="host-object-row"
              >
                <div class="form-group">
                  <label>{{ t('lcm.source') }}</label>
                  <input type="text" v-model="ho.Source" :data-testid="qa(`lcm-deployment-unit-host-object-source-${index}`)" />
                </div>

                <div class="form-group">
                  <label>{{ t('lcm.destination') }}</label>
                  <input type="text" v-model="ho.Destination" :data-testid="qa(`lcm-deployment-unit-host-object-destination-${index}`)" />
                </div>

                <div class="form-group">
                  <label>{{ t('lcm.type') }}</label>
                  <select v-model="ho.Type" :data-testid="qa(`lcm-deployment-unit-host-object-type-${index}`)">
                    <option v-for="type in hostObjectMountType" :key="type" :value="type">
                      {{ type }}
                    </option>
                  </select>
                </div>

                <button
                  type="button"
                  class="btn-icon-small delete"
                  @click="removeHostObject(index)"
                  :data-testid="qa(`lcm-deployment-unit-remove-host-object-${index}`)"
                >
                  <span class="material-icons">remove_circle</span>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>{{ t('lcm.autoRestart') }}</label>
              <select
                v-model="formData.AutoRestartEnable"
                :data-testid="qa('lcm-deployment-unit-modal-auto-restart')"
              >
                <option :value="true">{{ t('lcm.enable') }}</option>
                <option :value="false">{{ t('lcm.disable') }}</option>
              </select>
            </div>

            <div v-if="formData.AutoRestartEnable" class="form-group">
              <label>
                {{ t('lcm.maximumRetryCount') }}
                <span v-if="!formData.AutoRestartEnable" class="readonly-label"
                  >({{ t('lcm.readonly') }})</span
                >
              </label>
              <input
                type="number"
                v-model.number="formData.MaxRetryCount"
                :disabled="!formData.AutoRestartEnable"
                min="1"
                :data-testid="qa('lcm-deployment-unit-modal-max-retry-count')"
              />
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <ActionButtons
            :apply-text="isEditMode ? t('common.update') : t('common.add')"
            :cancel-data-testid="qa('lcm-deployment-unit-modal-cancel')"
            :apply-data-testid="qa('lcm-deployment-unit-modal-save')"
            @cancel="closeModal"
            @apply="handleSave"
          />
        </div>
      </div>
    </div>

    <div
      v-if="showSuccess"
      class="success-message"
      :data-testid="qa('lcm-deployment-unit-success-message')"
    >
      {{ t('common.operationSuccessful') }}
    </div>
  </div>
</template>

<style scoped>
.deployment-unit-tab {
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
  max-width: 800px;
  max-height: 90vh;
  overflow: auto;
}

.large-modal {
  max-width: 900px;
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

.form-section {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 0;
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

.subsection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  font-weight: 500;
  color: var(--text-primary);
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 0;
}

.form-row.two-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 0;
  flex: 1;
}

.form-group.half {
  max-width: 50%;
}

.form-group label {
  display: block;
  margin-bottom: 0.375rem;
  color: var(--text-primary);
  font-weight: 500;
}

.required {
  color: #dc3545;
}

.readonly-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: normal;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type='checkbox'] {
  width: auto;
  cursor: pointer;
}

.form-group input[type='text'],
.form-group input[type='password'],
.form-group input[type='number'],
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.form-group :deep(.secret-field) {
  width: 100%;
  padding: 0.75rem;
  padding-right: 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.form-group input.error,
.form-group select.error {
  border-color: #dc3545;
}

.password-field.error :deep(.secret-field) {
  border-color: #dc3545;
}

.form-group input:disabled,
.form-group select:disabled {
  background-color: var(--bg-primary);
  cursor: not-allowed;
  opacity: 0.6;
}

.form-group :deep(.secret-field:disabled) {
  background-color: var(--bg-primary);
  cursor: not-allowed;
  opacity: 0.6;
}

.error-message {
  display: block;
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.port-forwarding-section,
.host-object-section {
  margin-top: 0;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.port-forwarding-row,
.host-object-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr auto;
  gap: 0.75rem;
  align-items: end;
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: var(--bg-primary);
  border-radius: 4px;
}

.host-object-row {
  grid-template-columns: 1.5fr 1.5fr 1fr auto;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--primary-color);
  padding: 0.25rem;
  display: flex;
  align-items: center;
}

.btn-icon:hover {
  opacity: 0.8;
}

.btn-icon-small {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  color: var(--text-secondary);
}

.btn-icon-small.delete {
  color: #dc3545;
}

.btn-icon-small:hover {
  opacity: 0.8;
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

@media (max-width: 1024px) {
  .port-forwarding-row {
    grid-template-columns: 1fr 1fr;
  }

  .host-object-row {
    grid-template-columns: 1fr;
  }

  .btn-icon-small {
    grid-column: 1 / -1;
    justify-self: end;
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

  .modal-content {
    width: 95%;
    max-height: 95vh;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }

  .form-row.two-cols {
    grid-template-columns: 1fr;
  }

  .form-group.half {
    max-width: 100%;
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-footer :deep(.btn) {
    width: 100%;
  }

  .port-forwarding-row,
  .host-object-row {
    grid-template-columns: 1fr;
  }

  .card-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-actions .action-buttons {
    display: inline-flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-end;
  }
}
</style>
