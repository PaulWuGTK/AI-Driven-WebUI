<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TR369Controller } from '../../../types/tr369';
import { getTR369Config, updateTR369Config } from '../../../services/api/tr369';
import TR369ControllerEdit from './TR369ControllerEdit.vue';
import TR369ControllerDetail from './TR369ControllerDetail.vue';

const { t } = useI18n();
const agentEndpointID = ref('');
const controllers = ref<TR369Controller[]>([]);
const tempControllers = ref<TR369Controller[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const isEditing = ref(false);
const editingController = ref<TR369Controller | null>(null);
const viewingController = ref<TR369Controller | null>(null);
const showSuccess = ref(false);

const canAddController = computed(() => tempControllers.value.length < 5);

const fetchConfig = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getTR369Config();
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

const handleAdd = () => {
  if (!canAddController.value) {
    alert(t('device.maxControllersReached'));
    return;
  }

  editingController.value = {
    Enable: 1,
    Alias: '',
    ControllerEndpointID: '',
    ControllerTopic: '',
    AgentTopic: '',
    BrokerAddress: '',
    BrokerPort: '',
    Username: '',
    Password: '',
    ClientID: '',
    PeriodicNotify: 30,
    KeepAliveTime: 60,
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

const handleSave = async (controller: TR369Controller) => {
  const updatedControllers = editingController.value?.Alias
    ? tempControllers.value.map(c => c.Alias === editingController.value?.Alias ? controller : c)
    : [...tempControllers.value, controller];
  
  tempControllers.value = updatedControllers;
  isEditing.value = false;
  editingController.value = null;
};

const handleDelete = async (alias: string) => {
  if (!confirm(t('device.confirmDelete'))) return;
  tempControllers.value = tempControllers.value.filter(c => c.Alias !== alias);
};

const showSuccessMessage = () => {
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
  }, 3000);
};

const handleApply = async () => {
  loading.value = true;
  try {
    await updateTR369Config({
      TR369: {
        AgentEndpointID: agentEndpointID.value,
        Controller: tempControllers.value
      }
    });
    controllers.value = [...tempControllers.value];
    showSuccessMessage();
  } catch (err) {
    console.error('Error updating TR-369 config:', err);
    error.value = 'Failed to update TR-369 configuration';
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
  <div class="tr369-config">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <span>Loading...</span>
    </div>

    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>

    <template v-else>
      <!-- Agent EndpointID Section - Only show when not editing/viewing -->
      <div v-if="!isEditing && !viewingController" class="agent-id-section">
        <label>{{ t('device.agentEndpointId') }}</label>
        <input 
          type="text" 
          :value="agentEndpointID"
          disabled
          class="agent-id-input"
        />
      </div>

      <div v-if="!isEditing && !viewingController" class="panel-section">
        <div class="header-row">
          <div class="section-title-sp">{{ t('device.controller') }}</div>
          <button 
            class="btn btn-primary" 
            @click="handleAdd"
            :disabled="!canAddController"
            :title="!canAddController ? t('device.maxControllersReached') : ''"
          >
            <span class="material-icons">add</span>
            {{ t('device.addController') }}
          </button>
        </div>

        <div class="card-content">
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>{{ t('device.alias') }}</th>
                  <th>{{ t('device.endpointId') }}</th>
                  <th>{{ t('device.controllerTopic') }}</th>
                  <th>{{ t('device.status') }}</th>
                  <th>{{ t('device.action') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="controller in tempControllers" :key="controller.Alias">
                  <td>{{ controller.Alias }}</td>
                  <td>{{ controller.ControllerEndpointID }}</td>
                  <td>{{ controller.ControllerTopic }}</td>
                  <td>{{ controller.Status }}</td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn-action" @click="handleEdit(controller)" title="Edit">
                        <span class="material-icons">edit</span>
                      </button>
                      <button class="btn-action" @click="handleDelete(controller.Alias)" title="Delete">
                        <span class="material-icons">delete</span>
                      </button>
                      <button class="btn-action" @click="handleDetail(controller)" title="Detail">
                        <span class="material-icons">info</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mobile-cards">
            <div class="table-card" v-for="controller in tempControllers" :key="controller.Alias">
              <div class="card-row">
                <span class="card-label">{{ t('device.alias') }}</span>
                <span class="card-value">{{ controller.Alias }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('device.endpointId') }}</span>
                <span class="card-value">{{ controller.ControllerEndpointID }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('device.controllerTopic') }}</span>
                <span class="card-value">{{ controller.ControllerTopic }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('device.status') }}</span>
                <span class="card-value">{{ controller.Status }}</span>
              </div>
              <div class="card-actions">
                <button class="btn-action" @click="handleEdit(controller)" title="Edit">
                  <span class="material-icons">edit</span>
                </button>
                <button class="btn-action" @click="handleDelete(controller.Alias)" title="Delete">
                  <span class="material-icons">delete</span>
                </button>
                <button class="btn-action" @click="handleDetail(controller)" title="Detail">
                  <span class="material-icons">info</span>
                </button>
              </div>
            </div>
          </div>

          <div class="button-group">
            <button class="btn btn-secondary" @click="handleCancel">
              {{ t('common.cancel') }}
            </button>
            <button class="btn btn-primary" @click="handleApply">
              {{ t('common.apply') }}
            </button>
          </div>
        </div>
      </div>

      <TR369ControllerEdit
        v-else-if="isEditing && editingController"
        :controller="editingController"
        @save="handleSave"
        @cancel="isEditing = false"
      />

      <TR369ControllerDetail
        v-else-if="viewingController"
        :controller="viewingController"
        @back="viewingController = null"
      />
    </template>

    <div v-if="showSuccess" class="success-message">
      {{ t('common.apply') }} successful
    </div>
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
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
  }

  .button-group {
    flex-direction: column;
  }

  .button-group .btn {
    width: 100%;
  }
}
</style>