<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DdnsService, DdnsResponse } from '../../types/ddns';
import { getDdns, updateDdns } from '../../services/api';
import DdnsForm from '../../components/ddns/DdnsForm.vue';
import { ActionButtons, BaseModal, BaseToast } from '../../components/common';
import { useAutoDismiss } from '../../composables/useAutoDismiss';
import { extractNokMessage } from '../../utils/apiUtils';
import { useQA } from '../../utils/qa';

const { qa } = useQA();
const { t } = useI18n();

const ddnsData = ref<DdnsResponse | null>(null);
const showModal = ref(false);
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
  showModal.value = true;
};

const handleDelete = async (serviceId: string) => {
  if (!ddnsData.value) return;

  if (!confirm(t('ddns.confirmDelete'))) return;

  try {
    const updatedServices = ddnsData.value.Ddns.Service.filter((service) => service.ID !== serviceId);
    const response = await updateDdns({
      Ddns: {
        Service: updatedServices,
      },
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
    HostEnable: 1,
  };
  showModal.value = true;
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
    const existingIndex = ddnsData.value.Ddns.Service.findIndex((item) => item.ID === service.ID);
    let updatedServices: DdnsService[];

    if (existingIndex >= 0) {
      updatedServices = [...ddnsData.value.Ddns.Service];
      updatedServices[existingIndex] = service;
    } else {
      updatedServices = [...ddnsData.value.Ddns.Service, service];
    }

    const response = await updateDdns({
      Ddns: {
        Service: updatedServices,
      },
    });
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      showErrorMessage(nokMessage);
      return;
    }

    showSuccessMessage();
    closeModal();
    await fetchDdns();
  } catch (err) {
    console.error('Error saving DDNS service:', err);
    showErrorMessage('Failed to save DDNS service');
  }
};

const closeModal = () => {
  showModal.value = false;
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
          <div class="management-view" :data-testid="qa('ddns-management-view')">
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
                  <div class="card-actions" :data-testid="qa(`ddns-card-actions-row-${index}`)">
                    <span class="card-label" :data-testid="qa(`ddns-card-actions-label-${index}`)">{{ t('common.action') }}</span>
                    <div class="action-buttons" :data-testid="qa(`ddns-card-actions-${index}`)">
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
          </div>
        </div>

        <BaseModal
          v-model="showModal"
          size="md"
          :close-button-data-testid="qa('ddns-edit-close-button')"
          @close="closeModal"
        >
          <template #header>
            <h3 class="modal-title" :data-testid="qa('ddns-edit-title')">
              {{ editingService?.ID ? t('ddns.editService') : t('ddns.addService') }}
            </h3>
          </template>

          <div v-if="editingService && ddnsData" :data-testid="qa('ddns-edit-view')">
            <DdnsForm
              :service="editingService"
              :supported-providers="ddnsData.Ddns.SupServProv"
              :interfaces="ddnsData.Ddns.Interfaces"
              :show-title="false"
              :embedded="true"
              test-id-prefix="ddns-edit"
              @update:service="(service) => editingService = service"
              @save="handleSave(editingService)"
              @cancel="closeModal"
            />
          </div>
        </BaseModal>
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
  padding: 0.5rem 0;
  background-color: white;
}

.actions {
  display: flex;
  gap: 1rem;
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

.card-actions,
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  min-width: 4.5rem;
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

  .btn-danger {
    background-color: #dc3545;
    color: white;
  }

  .card-actions {
    align-items: center;
    justify-content: space-between;
  }

  .card-actions .action-buttons {
    display: inline-flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-end;
    min-width: 0;
  }

  .btn-action {
    padding: 0.5rem;
  }
}
</style>
