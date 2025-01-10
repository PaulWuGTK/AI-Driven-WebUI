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

const fetchDdns = async () => {
  loading.value = true;
  try {
    ddnsData.value = await getDdns();
  } catch (error) {
    console.error('Error fetching DDNS settings:', error);
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
  <div class="ddns-settings">
    <h1 class="page-title">{{ t('ddns.title') }}</h1>

    <div class="settings-content">
      <div v-if="!isEditing" class="management-view">
        <div class="panel-section">
          <div class="header_btn">
            <div>{{ t('ddns.management') }}</div>
            <div class="actions">
              <button class="btn btn-primary" @click="handleAdd">
                {{ t('ddns.addService') }}
              </button>
              <button class="btn btn-secondary" @click="fetchDdns">
                {{ t('ddns.refresh') }}
              </button>
            </div>
          </div>

          <!-- PC版表格 -->
          <div class="table-wrapper">
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
                      <button class="icon-btn" @click="handleEdit(service)" title="Edit">
                        <span class="material-icons">edit</span>
                      </button>
                      <button class="icon-btn" @click="handleDelete(service.ID)" title="Delete">
                        <span class="material-icons">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 手機版卡片 -->
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
                <button class="btn btn-primary" @click="handleEdit(service)">
                  {{ t('common.edit') }}
                </button>
                <button class="btn btn-danger" @click="handleDelete(service.ID)">
                  {{ t('common.delete') }}
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
            <label class="switch-label">
              <span>{{ t('common.enable') }}</span>
              <label class="switch">
                <input
                  type="checkbox"
                  v-model="editingService.HostEnable"
                  :true-value="1"
                  :false-value="0"
                >
                <span class="slider"></span>
              </label>
            </label>
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
  </div>
</template>

<style scoped>
.ddns-settings {
  flex: 1;
  background-color: #f5f5f5;
  min-height: 100%;
}

.settings-content {
  padding: 1.5rem;
}

.panel-section {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header_btn {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f8f8;
  border-bottom: 1px solid #e0e0e0;
}

.actions {
  display: flex;
  gap: 1rem;
}

.table-wrapper {
  padding: 1.5rem;
  overflow-x: auto;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: #666;
}

.icon-btn:hover {
  color: #333;
}

/* 手機版卡片樣式 */
.mobile-cards {
  display: none;
  padding: 1rem;
  gap: 1rem;
}

.table-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.card-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.card-row:last-child {
  border-bottom: none;
}

.card-label {
  color: #666;
  font-size: 0.9rem;
}

.card-value {
  color: #333;
  font-weight: 500;
  word-break: break-all;
}

.card-actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
}

.edit-view {
  background-color: white;
  border-radius: 4px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
}

input, select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
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
  background-color: #0070BB;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-primary {
  background-color: #0070BB;
  color: white;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #666;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

/* 響應式設計 */
@media (min-width: 768px) {
  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
    white-space: nowrap;
  }

  th {
    background-color: #f8f8f8;
    font-weight: 500;
    color: #333;
  }

  td {
    color: #666;
  }

  .mobile-cards {
    display: none;
  }
}

@media (max-width: 767px) {
  .settings-content {
    padding: 1rem;
  }

  .header_btn {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .actions {
    flex-direction: column;
  }

  .table-wrapper {
    display: none;
  }

  .mobile-cards {
    display: block;
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
}
</style>