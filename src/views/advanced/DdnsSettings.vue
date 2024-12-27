<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { DdnsService, DdnsResponse } from '../../types/ddns';
import { getDdns, updateDdns } from '../../services/api';
import DdnsTable from '../../components/ddns/DdnsTable.vue';
import DdnsForm from '../../components/ddns/DdnsForm.vue';

const ddnsData = ref<DdnsResponse | null>(null);
const isEditing = ref(false);
const editingService = ref<DdnsService | null>(null);

const services = computed(() => ddnsData.value?.Ddns.Service || []);
const supportedProviders = computed(() => ddnsData.value?.Ddns.SupServProv || []);
const interfaces = computed(() => ddnsData.value?.Ddns.Interfaces || []);

const fetchDdns = async () => {
  try {
    const response = await getDdns();
    ddnsData.value = response;
  } catch (error) {
    console.error('Error fetching DDNS settings:', error);
  }
};

const handleEdit = (service: DdnsService) => {
  editingService.value = { ...service };
  isEditing.value = true;
};

const handleDelete = async (serviceId: string) => {
  if (!ddnsData.value) return;
  
  try {
    const updatedServices = services.value.filter(s => s.ID !== serviceId);
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

const handleCancel = () => {
  isEditing.value = false;
  editingService.value = null;
};

const handleSave = async () => {
  if (!ddnsData.value || !editingService.value) return;

  try {
    const updatedServices = services.value.map(service => 
      service.ID === editingService.value?.ID ? editingService.value : service
    );

    await updateDdns({
      Ddns: {
        Service: updatedServices
      }
    });
    
    isEditing.value = false;
    editingService.value = null;
    await fetchDdns();
  } catch (error) {
    console.error('Error updating DDNS service:', error);
  }
};

const handleAddService = () => {
  if (!ddnsData.value || !supportedProviders.value.length || !interfaces.value.length) return;
  
  const newId = `no-${ddnsData.value.Ddns.ServNum + 1}`;
  editingService.value = {
    ID: newId,
    ServProv: supportedProviders.value[0],
    ServUsername: '',
    ServPassword: '',
    DomainName: '',
    UpdatedIP: interfaces.value[0],
    HostEnable: 1
  };
  isEditing.value = true;
};

onMounted(fetchDdns);
</script>

<template>
  <div class="ddns-settings">
    <h1 class="page-title">DDNS</h1>

    <div class="settings-content">
      <div class="settings-header">
        <h2>DDNS Management</h2>
        <div class="header-actions">
          <button 
            class="btn btn-primary" 
            @click="handleAddService"
            :disabled="!supportedProviders.length || !interfaces.length"
          >
            Add Service
          </button>
          <button class="btn btn-secondary" @click="fetchDdns">Refresh</button>
        </div>
      </div>

      <template v-if="!isEditing">
        <DdnsTable 
          :services="services"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </template>
      <template v-else-if="editingService">
        <DdnsForm
          :service="editingService"
          :supported-providers="supportedProviders"
          :interfaces="interfaces"
          @update:service="editingService = $event"
          @save="handleSave"
          @cancel="handleCancel"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
.ddns-settings {
  flex: 1;
  background-color: #f5f5f5;
  min-height: 100%;
}

.page-title {
  color: #0070BB;
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0;
  padding: 1rem 2rem;
  text-align: left;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.settings-content {
  padding: 1.5rem;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #0070BB;
  color: white;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #666;
}

.btn:not(:disabled):hover {
  opacity: 0.9;
}
</style>