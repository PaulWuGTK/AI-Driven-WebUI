<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DdnsService, DdnsResponse } from '../../types/ddns';
import { getDdns, updateDdns } from '../../services/api';

const { t } = useI18n();
const ddnsData = ref<DdnsResponse | null>(null);
const isEditing = ref(false);
const editingService = ref<DdnsService | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const showSuccess = ref(false);

const fetchDdns = async () => {
  loading.value = true;
  error.value = null;
  try {
    ddnsData.value = await getDdns();
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
    await updateDdns({
      Ddns: {
        Service: updatedServices
      }
    });
    await fetchDdns();
  } catch (error) {
    console.error('Error deleting DDNS service:', error);
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

const showSuccessMessage = () => {
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
  }, 3000);
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

    await updateDdns({
      Ddns: {
        Service: updatedServices
      }
    });
    
    showSuccessMessage();
    isEditing.value = false;
    editingService.value = null;
    await fetchDdns();
  } catch (error) {
    console.error('Error saving DDNS service:', error);
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
    <h1 class="page-title">{{ t('ddns.title') }}</h1>

    <div class="status-content">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>Loading...</span>
      </div>

      <div v-else-if="error" class="error-state">
        {{ error }}
      </div>

      <template v-else>
        <div class="panel-section">
          <div v-if="!isEditing" class="management-view">
            <div class="header-row">
              <div class="section-title-sp">{{ t('ddns.management') }}</div>
              <div class="actions">
                <button class="btn btn-primary" @click="handleAdd">
                  {{ t('ddns.addService') }}
                </button>
                <button class="btn btn-secondary" @click="fetchDdns">
                  {{ t('ddns.refresh') }}
                </button>
              </div>
            </div>

            <div class="card-content">
              <div class="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>{{ t('ddns.no') }}</th>
                      <th>{{ t('ddns.provider') }}</th>
                      <th>{{ t('ddns.domain') }}</th>
                      <th>{{ t('ddns.status') }}</th>
                      <th>{{ t('ddns.lastUpdate') }}</th>
                      <th>{{ t('ddns.action') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(service, index) in ddnsData?.Ddns.Service" :key="service.ID">
                      <td>{{ index + 1 }}</td>
                      <td>{{ service.ServProv }}</td>
                      <td>{{ service.DomainName }}</td>
                      <td>{{ service.Status }}</td>
                      <td>{{ service.LastUpdate }}</td>
                      <td>
                        <div class="action-buttons">
                          <button class="btn-action" @click="handleEdit(service)" title="Edit">
                            <span class="material-icons">edit</span>
                          </button>
                          <button class="btn-action" @click="handleDelete(service.ID)" title="Delete">
                            <span class="material-icons">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="mobile-cards">
                <div class="table-card" v-for="(service, index) in ddnsData?.Ddns.Service" :key="service.ID">
                  <div class="card-row">
                    <span class="card-label">{{ t('ddns.no') }}</span>
                    <span class="card-value">{{ index + 1 }}</span>
                  </div>
                  <div class="card-row">
                    <span class="card-label">{{ t('ddns.provider') }}</span>
                    <span class="card-value">{{ service.ServProv }}</span>
                  </div>
                  <div class="card-row">
                    <span class="card-label">{{ t('ddns.domain') }}</span>
                    <span class="card-value">{{ service.DomainName }}</span>
                  </div>
                  <div class="card-row">
                    <span class="card-label">{{ t('ddns.status') }}</span>
                    <span class="card-value">{{ service.Status }}</span>
                  </div>
                  <div class="card-row">
                    <span class="card-label">{{ t('ddns.lastUpdate') }}</span>
                    <span class="card-value">{{ service.LastUpdate }}</span>
                  </div>
                  <div class="card-actions">
                    <button class="btn-action" @click="handleEdit(service)" title="Edit">
                      <span class="material-icons">edit</span>
                    </button>
                    <button class="btn-action" @click="handleDelete(service.ID)" title="Delete">
                      <span class="material-icons">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="edit-view">
            <h2>{{ editingService?.ID ? t('ddns.editService') : t('ddns.addService') }}</h2>
            <form @submit.prevent="handleSave(editingService!)" v-if="editingService && ddnsData">
              <div class="form-group">
                <label>{{ t('ddns.provider') }}</label>
                <select v-model="editingService.ServProv">
                  <option v-for="provider in ddnsData.Ddns.SupServProv" :key="provider" :value="provider">
                    {{ provider }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>{{ t('ddns.domain') }}</label>
                <input 
                  type="text" 
                  v-model="editingService.DomainName"
                  required
                >
              </div>

              <div class="form-group">
                <label>{{ t('ddns.username') }}</label>
                <input 
                  type="text" 
                  v-model="editingService.ServUsername"
                  required
                >
              </div>

              <div class="form-group">
                <label>{{ t('ddns.password') }}</label>
                <input 
                  type="password" 
                  v-model="editingService.ServPassword"
                  required
                >
              </div>

              <div class="form-group">
                <label>{{ t('ddns.wanInterface') }}</label>
                <select v-model="editingService.UpdatedIP">
                  <option v-for="iface in ddnsData.Ddns.Interfaces" :key="iface" :value="iface">
                    {{ iface }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <div class="switch-label">
                  {{ t('common.enable') }}
                  <label class="switch">
                    <input
                      type="checkbox"
                      v-model="editingService.HostEnable"
                      :true-value="1"
                      :false-value="0"
                    >
                    <span class="slider"></span>
                  </label>
                </div>
              </div>

              <div class="button-group">
                <button type="button" class="btn btn-secondary" @click="handleCancel">
                  {{ t('ddns.cancel') }}
                </button>
                <button type="submit" class="btn btn-primary">
                  {{ t('ddns.save') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </template>

      <div v-if="showSuccess" class="success-message">
        {{ t('common.apply') }} successful
      </div>
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

.switch-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  margin-left: 1rem;
  flex-shrink: 0;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary-color);
}

input:checked + .slider:before {
  transform: translateX(26px);
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

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
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

  .actions .btn {
    width: 100%;
  }

  .edit-view {
    padding: 1rem;
  }

  .button-group {
    flex-direction: column;
  }

  .button-group .btn {
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