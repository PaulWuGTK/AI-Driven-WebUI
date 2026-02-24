<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DdnsService, DdnsResponse } from '../../types/ddns';
import { getDdns, updateDdns } from '../../services/api';
import { ActionButtons, BaseSwitch, BaseToast } from '../../components/common';
import { useAutoDismiss } from '../../composables/useAutoDismiss';
import { extractNokMessage } from '../../utils/apiUtils';
import { useQA } from '../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const ddnsData = ref<DdnsResponse | null>(null);
const isEditing = ref(false);
const editingService = ref<DdnsService | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const successMessage = ref('');
const errorToastMessage = ref('');
const { visible: showSuccessToast, show: triggerSuccessToast } = useAutoDismiss();
const { visible: showErrorToast, show: triggerErrorToast } = useAutoDismiss();

const fetchDdns = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getDdns();
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      error.value = nokMessage;
      ddnsData.value = null;
      return;
    }
    ddnsData.value = response;
  } catch (err) {
    console.error('Error fetching DDNS settings:', err);
    error.value = 'Failed to fetch DDNS settings';
  } finally {
    loading.value = false;
  }
};

const handleEdit = (service: DdnsService) => {
  editingService.value = { ...service };
  isEditing.value = true;
};

const handleDelete = async (serviceId: string) => {
  if (!ddnsData.value) return;
  
  if (!confirm(t('ddns.confirmDelete'))) return;

  try {
    const updatedServices = ddnsData.value.Ddns.Service.filter(s => s.ID !== serviceId);
    const response = await updateDdns({
      Ddns: {
        Service: updatedServices
      }
    });
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      showErrorMessage(nokMessage);
      return;
    }
    await fetchDdns();
  } catch (err) {
    console.error('Error deleting DDNS service:', err);
    showErrorMessage('Failed to delete DDNS service');
  }
};

const handleAdd = () => {
  if (!ddnsData.value) return;
  
  const newId = `no-${ddnsData.value.Ddns.ServNum + 1}`;
  editingService.value = {
    ID: newId,
    ServProv: ddnsData.value.Ddns.SupServProv[0],
    ServUsername: '',
    ServPassword: '',
    DomainName: '',
    UpdatedIP: ddnsData.value.Ddns.Interfaces[0],
    HostEnable: 1
  };
  isEditing.value = true;
};

const showSuccessMessage = (message = `${t('common.apply')} successful`) => {
  successMessage.value = message;
  triggerSuccessToast();
};

const showErrorMessage = (message: string) => {
  errorToastMessage.value = message;
  triggerErrorToast();
};

const handleSave = async (service: DdnsService) => {
  if (!ddnsData.value) return;

  try {
    const existingIndex = ddnsData.value.Ddns.Service.findIndex(s => s.ID === service.ID);
    let updatedServices: DdnsService[];
    
    if (existingIndex >= 0) {
      updatedServices = [...ddnsData.value.Ddns.Service];
      updatedServices[existingIndex] = service;
    } else {
      updatedServices = [...ddnsData.value.Ddns.Service, service];
    }

    const response = await updateDdns({
      Ddns: {
        Service: updatedServices
      }
    });
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      showErrorMessage(nokMessage);
      return;
    }
    
    showSuccessMessage();
    isEditing.value = false;
    editingService.value = null;
    await fetchDdns();
  } catch (err) {
    console.error('Error saving DDNS service:', err);
    showErrorMessage('Failed to save DDNS service');
  }
};

const handleCancel = () => {
  isEditing.value = false;
  editingService.value = null;
};

onMounted(fetchDdns);
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('ddns-title')">{{ t('ddns.title') }}</h1>

    <div class="status-content" :data-testid="qa('ddns-content')">
      <div v-if="loading" class="loading-state" :data-testid="qa('ddns-loading')">
        <div class="loading-spinner"></div>
        <span>{{ t('common.loading') }}</span>
      </div>

      <div v-else-if="error" class="error-state" :data-testid="qa('ddns-error')">
        {{ error }}
      </div>

      <template v-else>
        <div class="panel-section" :data-testid="qa('ddns-panel')">
          <div v-if="!isEditing" class="management-view" :data-testid="qa('ddns-management-view')">
            <div class="header-row">
              <div class="section-title-sp" :data-testid="qa('ddns-management-title')">{{ t('ddns.management') }}</div>
              <div class="actions">
                <ActionButtons
                  :cancel-text="t('ddns.addService')"
                  cancel-variant="primary"
                  :apply-text="t('ddns.refresh')"
                  apply-variant="secondary"
                  :cancel-data-testid="qa('ddns-add-service-button')"
                  :apply-data-testid="qa('ddns-refresh-button')"
                  @cancel="handleAdd"
                  @apply="fetchDdns"
                />
              </div>
            </div>

            <div class="card-content">
              <div class="table-container" :data-testid="qa('ddns-table')">
                <table>
                  <thead>
                    <tr>
                      <th :data-testid="qa('ddns-header-no')">{{ t('ddns.no') }}</th>
                      <th :data-testid="qa('ddns-header-provider')">{{ t('ddns.provider') }}</th>
                      <th :data-testid="qa('ddns-header-domain')">{{ t('ddns.domain') }}</th>
                      <th :data-testid="qa('ddns-header-status')">{{ t('ddns.status') }}</th>
                      <th :data-testid="qa('ddns-header-last-update')">{{ t('ddns.lastUpdate') }}</th>
                      <th :data-testid="qa('ddns-header-action')">{{ t('ddns.action') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(service, index) in ddnsData?.Ddns.Service" :key="service.ID" :data-testid="qa(`ddns-row-${index}`)">
                      <td :data-testid="qa(`ddns-no-${index}`)">{{ index + 1 }}</td>
                      <td :data-testid="qa(`ddns-provider-${index}`)">{{ service.ServProv }}</td>
                      <td :data-testid="qa(`ddns-domain-${index}`)">{{ service.DomainName }}</td>
                      <td :data-testid="qa(`ddns-status-${index}`)">{{ service.Status }}</td>
                      <td :data-testid="qa(`ddns-last-update-${index}`)">{{ service.LastUpdate }}</td>
                      <td>
                        <div class="action-buttons">
                          <button class="btn-action" :data-testid="qa(`ddns-edit-button-${index}`)" @click="handleEdit(service)" title="Edit">
                            <span class="material-icons">edit</span>
                          </button>
                          <button class="btn-action" :data-testid="qa(`ddns-delete-button-${index}`)" @click="handleDelete(service.ID)" title="Delete">
                            <span class="material-icons">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="mobile-cards" :data-testid="qa('ddns-mobile')">
                <div class="table-card" v-for="(service, index) in ddnsData?.Ddns.Service" :key="service.ID" :data-testid="qa(`ddns-card-${index}`)">
                  <div class="card-row">
                    <span class="card-label" :data-testid="qa(`ddns-card-no-label-${index}`)">{{ t('ddns.no') }}</span>
                    <span class="card-value" :data-testid="qa(`ddns-card-no-value-${index}`)">{{ index + 1 }}</span>
                  </div>
                  <div class="card-row">
                    <span class="card-label" :data-testid="qa(`ddns-card-provider-label-${index}`)">{{ t('ddns.provider') }}</span>
                    <span class="card-value" :data-testid="qa(`ddns-card-provider-value-${index}`)">{{ service.ServProv }}</span>
                  </div>
                  <div class="card-row">
                    <span class="card-label" :data-testid="qa(`ddns-card-domain-label-${index}`)">{{ t('ddns.domain') }}</span>
                    <span class="card-value" :data-testid="qa(`ddns-card-domain-value-${index}`)">{{ service.DomainName }}</span>
                  </div>
                  <div class="card-row">
                    <span class="card-label" :data-testid="qa(`ddns-card-status-label-${index}`)">{{ t('ddns.status') }}</span>
                    <span class="card-value" :data-testid="qa(`ddns-card-status-value-${index}`)">{{ service.Status }}</span>
                  </div>
                  <div class="card-row">
                    <span class="card-label" :data-testid="qa(`ddns-card-last-update-label-${index}`)">{{ t('ddns.lastUpdate') }}</span>
                    <span class="card-value" :data-testid="qa(`ddns-card-last-update-value-${index}`)">{{ service.LastUpdate }}</span>
                  </div>
                  <div class="card-actions">
                    <button class="btn-action" :data-testid="qa(`ddns-card-edit-button-${index}`)" @click="handleEdit(service)" title="Edit">
                      <span class="material-icons">edit</span>
                    </button>
                    <button class="btn-action" :data-testid="qa(`ddns-card-delete-button-${index}`)" @click="handleDelete(service.ID)" title="Delete">
                      <span class="material-icons">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="edit-view" :data-testid="qa('ddns-edit-view')">
            <h2 :data-testid="qa('ddns-edit-title')">{{ editingService?.ID ? t('ddns.editService') : t('ddns.addService') }}</h2>
            <form @submit.prevent="handleSave(editingService!)" v-if="editingService && ddnsData" :data-testid="qa('ddns-edit-form')">
              <div class="form-group">
                <label :data-testid="qa('ddns-edit-provider-label')">{{ t('ddns.provider') }}</label>
                <select v-model="editingService.ServProv" :data-testid="qa('ddns-edit-provider-select')">
                  <option v-for="provider in ddnsData.Ddns.SupServProv" :key="provider" :value="provider">
                    {{ provider }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label :data-testid="qa('ddns-edit-domain-label')">{{ t('ddns.domain') }}</label>
                <input 
                  type="text" 
                  :data-testid="qa('ddns-edit-domain-input')"
                  v-model="editingService.DomainName"
                  required
                >
              </div>

              <div class="form-group">
                <label :data-testid="qa('ddns-edit-username-label')">{{ t('ddns.username') }}</label>
                <input 
                  type="text" 
                  :data-testid="qa('ddns-edit-username-input')"
                  v-model="editingService.ServUsername"
                  required
                >
              </div>

              <div class="form-group">
                <label :data-testid="qa('ddns-edit-password-label')">{{ t('ddns.password') }}</label>
                <input 
                  type="password" 
                  :data-testid="qa('ddns-edit-password-input')"
                  v-model="editingService.ServPassword"
                  required
                >
              </div>

              <div class="form-group">
                <label :data-testid="qa('ddns-edit-interface-label')">{{ t('ddns.wanInterface') }}</label>
                <select v-model="editingService.UpdatedIP" :data-testid="qa('ddns-edit-interface-select')">
                  <option v-for="iface in ddnsData.Ddns.Interfaces" :key="iface" :value="iface">
                    {{ iface }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <div class="switch-label">
                  <span :data-testid="qa('ddns-edit-enable-label')">{{ t('common.enable') }}</span>
                  <BaseSwitch
                    v-model="editingService.HostEnable"
                    :true-value="1"
                    :false-value="0"
                    :data-testid="qa('ddns-edit-enable-toggle')"
                    :slider-data-testid="qa('ddns-edit-enable-slider')"
                  />
                </div>
              </div>

              <div class="button-group">
                <ActionButtons
                  :cancel-text="t('ddns.cancel')"
                  :apply-text="t('ddns.save')"
                  apply-type="submit"
                  :cancel-data-testid="qa('ddns-edit-cancel-button')"
                  :apply-data-testid="qa('ddns-edit-save-button')"
                  @cancel="handleCancel"
                />
              </div>
            </form>
          </div>
        </div>
      </template>

      <BaseToast
        v-model="showSuccessToast"
        :message="successMessage"
        type="success"
        :data-testid="qa('ddns-success-message')"
      />
      <BaseToast
        v-model="showErrorToast"
        :message="errorToastMessage"
        type="error"
        :data-testid="qa('ddns-error-toast')"
      />
    </div>
  </div>
</template>

<style scoped>

.section-title-sp {
  font-size: 1rem;
  color: var(--text-primary);
  padding: 0.5rem 0rem;
  background-color: white;
}

.actions {
  display: flex;
  gap: 1rem;
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
}

.btn-action:hover {
  color: var(--text-primary);
}

.edit-view {
  padding: 1.5rem;
}

.edit-view h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

input, select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}

/* Custom switch size (60px × 34px) with left margin for layout */
:deep(.switch) {
  width: 60px;
  height: 34px;
  margin-left: 1rem;
  flex-shrink: 0;
}

:deep(.slider:before) {
  height: 26px;
  width: 26px;
}

:deep(input:checked + .slider:before) {
  transform: translateX(26px);
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
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

.error-state {
  padding: 2rem;
  text-align: center;
  color: #dc3545;
  background-color: white;
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
}

.card-actions {
  display: flex;
  justify-content: flex-end;
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
}

.btn-action:hover {
  color: var(--text-primary);
}

.btn-action .material-icons {
  font-size: 1.25rem;
}

@media (max-width: 768px) {
  .header-row {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .actions {
    flex-direction: column;
    width: 100%;
  }

  .actions :deep(.btn) {
    width: 100%;
  }

  .edit-view {
    padding: 1rem;
  }

  .button-group {
    flex-direction: column;
  }

  .button-group :deep(.btn) {
    width: 100%;
  }

  .btn-danger {
    background-color: #dc3545;
    color: white;
  }

  .card-actions {
    justify-content: flex-end;
  }

  .btn-action {
    padding: 0.5rem;
  }
}
</style>
