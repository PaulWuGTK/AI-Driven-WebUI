<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TR369Controller } from '../../../types/tr369';
import { getTR369Config, updateTR369Config } from '../../../services/api/tr369';
import TR369ControllerEdit from './TR369ControllerEdit.vue';
import TR369ControllerDetail from './TR369ControllerDetail.vue';
import { ActionButtons, BaseToast } from '../../../components/common';
import { useAutoDismiss } from '../../../composables/useAutoDismiss';
import { extractNokMessage } from '../../../utils/apiUtils';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const agentEndpointID = ref('');
const controllers = ref<TR369Controller[]>([]);
const tempControllers = ref<TR369Controller[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const isEditing = ref(false);
const editingController = ref<TR369Controller | null>(null);
const viewingController = ref<TR369Controller | null>(null);
const successMessage = ref('');
const errorToastMessage = ref('');
const { visible: showSuccessToast, show: triggerSuccessToast } = useAutoDismiss();
const { visible: showErrorToast, show: triggerErrorToast } = useAutoDismiss();

const canAddController = computed(() => tempControllers.value.length < 5);

const fetchConfig = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getTR369Config();
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      error.value = nokMessage;
      controllers.value = [];
      tempControllers.value = [];
      return;
    }
    agentEndpointID.value = response.TR369.AgentEndpointID;
    controllers.value = response.TR369.Controller;
    tempControllers.value = [...response.TR369.Controller];
  } catch (err) {
    console.error('Error fetching TR-369 config:', err);
    error.value = 'Failed to fetch TR-369 configuration';
  } finally {
    loading.value = false;
  }
};

const generateNextAlias = () => {
  const existingAliases = tempControllers.value
    .map(c => c.Alias)
    .filter(alias => alias.startsWith('custom-'))
    .map(alias => parseInt(alias.replace('custom-', '')))
    .filter(num => !isNaN(num));

  const nextNum = existingAliases.length > 0
    ? Math.max(...existingAliases) + 1
    : 1;

  return `custom-${nextNum}`;
};

const handleAdd = () => {
  if (!canAddController.value) {
    alert(t('device.maxControllersReached'));
    return;
  }

  editingController.value = {
    Enable: 1,
    Alias: generateNextAlias(),
    ControllerEndpointID: '',
    ControllerTopic: '',
    AgentTopic: '',
    BrokerAddress: '',
    BrokerPort: 0,
    Username: '',
    Password: '',
    ClientID: '',
    PeriodicNotify: 30,
    KeepAliveTime: 60,
    ConnectRetryTime: 5,
    ConnectRetryMaxInterval: 60,
    ProtocolVersion: '3.1.1',
    TransportProtocol: 'TCP/IP'
  };
  isEditing.value = true;
};

const handleEdit = (controller: TR369Controller) => {
  editingController.value = { ...controller };
  isEditing.value = true;
};

const handleDetail = (controller: TR369Controller) => {
  viewingController.value = controller;
};

const handleSave = (controller: TR369Controller) => {
  const idx = tempControllers.value.findIndex(c => c.Alias === controller.Alias);

  if (idx >= 0) {
    // edit
    tempControllers.value.splice(idx, 1, controller);
  } else {
    // add
    tempControllers.value.push(controller);
  }

  isEditing.value = false;
  editingController.value = null;
};

const handleDelete = async (alias: string) => {
  if (!confirm(t('device.confirmDelete'))) return;
  tempControllers.value = tempControllers.value.filter(c => c.Alias !== alias);
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
    const sanitizedControllers = tempControllers.value.map((c) => ({
      ...c,
      Enable: c.Enable ? 1 : 0, // 預設為啟用
      BrokerPort: Number(c.BrokerPort),
      ProtocolVersion: String(c.ProtocolVersion),
      Password: c.Password ?? "", // 防止 undefined
      ClientID: c.ClientID ?? "", // 防止 undefined
    }));

    const response = await updateTR369Config({
      TR369: {
        AgentEndpointID: agentEndpointID.value,
        Controller: sanitizedControllers
      }
    });
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      showErrorMessage(nokMessage);
      return;
    }
//    controllers.value = [...sanitizedControllers];
    await fetchConfig();
    showSuccessMessage();
  } catch (err) {
    console.error('Error updating TR-369 config:', err);
    showErrorMessage('Failed to update TR-369 configuration');
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  tempControllers.value = [...controllers.value];
};

onMounted(fetchConfig);
</script>

<template>
  <div class="tr369-config" :data-testid="qa('tr369-config-content')">
    <div v-if="loading" class="loading-state" :data-testid="qa('tr369-config-loading')">
      <div class="loading-spinner"></div>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="error" class="error-state" :data-testid="qa('tr369-config-error')">
      {{ error }}
    </div>

    <template v-else>
      <!-- Agent EndpointID Section - Only show when not editing/viewing -->
      <div v-if="!isEditing && !viewingController" class="agent-id-section" :data-testid="qa('tr369-config-agent-endpoint-section')">
        <label :data-testid="qa('tr369-config-agent-endpoint-label')">{{ t('device.agentEndpointId') }}</label>
        <input 
          type="text" 
          :data-testid="qa('tr369-config-agent-endpoint-input')"
          :value="agentEndpointID"
          disabled
          class="agent-id-input"
        />
      </div>

      <div v-if="!isEditing && !viewingController" class="panel-section" :data-testid="qa('tr369-config-controllers-section')">
        <div class="header-row">
          <div class="section-title-sp" :data-testid="qa('tr369-config-controllers-title')">{{ t('device.controller') }}</div>
          <button 
            class="btn btn-primary" 
            :data-testid="qa('tr369-config-add-controller-button')"
            @click="handleAdd"
            :disabled="!canAddController"
            :title="!canAddController ? t('device.maxControllersReached') : ''"
          >
            <span class="material-icons">add</span>
            {{ t('device.addController') }}
          </button>
        </div>

        <div class="card-content">
          <div class="table-container" :data-testid="qa('tr369-config-controllers-table')">
            <table>
              <thead>
                <tr>
                  <th :data-testid="qa('tr369-config-controllers-header-endpoint-id')">{{ t('device.endpointId') }}</th>
                  <th :data-testid="qa('tr369-config-controllers-header-controller-topic')">{{ t('device.controllerTopic') }}</th>
                  <th :data-testid="qa('tr369-config-controllers-header-status')">{{ t('device.status') }}</th>
                  <th :data-testid="qa('tr369-config-controllers-header-action')">{{ t('device.action') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(controller, index) in tempControllers" :key="controller.Alias" :data-testid="qa(`tr369-config-controllers-row-${index}`)">
                  <td :data-testid="qa(`tr369-config-controllers-endpoint-id-${index}`)">{{ controller.ControllerEndpointID }}</td>
                  <td :data-testid="qa(`tr369-config-controllers-controller-topic-${index}`)">{{ controller.ControllerTopic }}</td>
                  <td :data-testid="qa(`tr369-config-controllers-status-${index}`)">{{ controller.Status }}</td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn-action" :data-testid="qa(`tr369-config-controllers-edit-${index}`)" @click="handleEdit(controller)" title="Edit">
                        <span class="material-icons">edit</span>
                      </button>
                      <button class="btn-action" :data-testid="qa(`tr369-config-controllers-delete-${index}`)" @click="handleDelete(controller.Alias)" title="Delete">
                        <span class="material-icons">delete</span>
                      </button>
                      <button class="btn-action" :data-testid="qa(`tr369-config-controllers-detail-${index}`)" @click="handleDetail(controller)" title="Detail">
                        <span class="material-icons">info</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mobile-cards" :data-testid="qa('tr369-config-controllers-mobile')">
            <div class="table-card" v-for="(controller, index) in tempControllers" :key="controller.Alias" :data-testid="qa(`tr369-config-controllers-card-${index}`)">
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`tr369-config-controllers-card-endpoint-id-label-${index}`)">{{ t('device.endpointId') }}</span>
                <span class="card-value" :data-testid="qa(`tr369-config-controllers-card-endpoint-id-value-${index}`)">{{ controller.ControllerEndpointID }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`tr369-config-controllers-card-controller-topic-label-${index}`)">{{ t('device.controllerTopic') }}</span>
                <span class="card-value" :data-testid="qa(`tr369-config-controllers-card-controller-topic-value-${index}`)">{{ controller.ControllerTopic }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`tr369-config-controllers-card-status-label-${index}`)">{{ t('device.status') }}</span>
                <span class="card-value" :data-testid="qa(`tr369-config-controllers-card-status-value-${index}`)">{{ controller.Status }}</span>
              </div>
              <div class="card-actions">
                <button class="btn-action" :data-testid="qa(`tr369-config-controllers-card-edit-${index}`)" @click="handleEdit(controller)" title="Edit">
                  <span class="material-icons">edit</span>
                </button>
                <button class="btn-action" :data-testid="qa(`tr369-config-controllers-card-delete-${index}`)" @click="handleDelete(controller.Alias)" title="Delete">
                  <span class="material-icons">delete</span>
                </button>
                <button class="btn-action" :data-testid="qa(`tr369-config-controllers-card-detail-${index}`)" @click="handleDetail(controller)" title="Detail">
                  <span class="material-icons">info</span>
                </button>
              </div>
            </div>
          </div>

          <div class="button-group">
            <ActionButtons
              :cancel-data-testid="qa('tr369-config-controllers-cancel-button')"
              :apply-data-testid="qa('tr369-config-controllers-apply-button')"
              @cancel="handleCancel"
              @apply="handleApply"
            />
          </div>
        </div>
      </div>

      <TR369ControllerEdit
        v-else-if="isEditing && editingController"
        :data-testid="qa('tr369-config-controller-edit')"
        :controller="editingController"
        :existing-controllers="tempControllers"
        @save="handleSave"
        @cancel="isEditing = false"
      />

      <TR369ControllerDetail
        v-else-if="viewingController"
        :data-testid="qa('tr369-config-controller-detail')"
        :controller="viewingController"
        @back="viewingController = null"
      />
    </template>

    <BaseToast
      v-model="showSuccessToast"
      :message="successMessage"
      type="success"
      :data-testid="qa('tr369-config-success-message')"
    />
    <BaseToast
      v-model="showErrorToast"
      :message="errorToastMessage"
      type="error"
      :data-testid="qa('tr369-config-error-toast')"
    />
  </div>
</template>

<style scoped>
.tr369-config {
  padding: 1.5rem;
}

.agent-id-section {
  margin-bottom: 1.5rem;
}

.agent-id-section label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.agent-id-input {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-family: monospace;
  color: var(--text-primary);
  cursor: not-allowed;
}

.section-title-sp {
  font-size: 1rem;
  color: var(--text-primary);
  padding: 0.5rem 0;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
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

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .tr369-config {
    padding: 1rem;
  }

  .header-row {
    flex-direction: column;
    gap: 1rem;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .table-container {
    display: none;
  }

  .mobile-cards {
    display: block;
  }

  .card-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .button-group {
    flex-direction: column;
  }

  .button-group :deep(.btn) {
    width: 100%;
  }
}
</style>
