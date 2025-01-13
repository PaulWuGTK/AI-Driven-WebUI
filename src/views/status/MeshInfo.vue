<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { MeshNode } from '../../types/mesh';
import { getMeshMap, applySteeringControl } from '../../services/api/mesh'; 
import MeshNodeTable from '../../components/mesh/MeshNodeTable.vue';
import MeshClientTable from '../../components/mesh/MeshClientTable.vue';
import MeshSteeringModal from '../../components/mesh/MeshSteeringModal.vue';
import MeshTopologyMap from '../../components/mesh/MeshTopologyMap.vue';

const { t } = useI18n();
const meshData = ref<MeshNode[]>([]);
const showMap = ref(false);
const selectedClient = ref<MeshNode | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const refreshInterval = ref<number | null>(null);

const nodes = computed(() => 
  meshData.value.filter(node => node.Mode !== 'Client')
);

const clients = computed(() => 
  meshData.value.filter(node => node.Mode === 'Client')
);

// Function to check if mesh data has changed
const hasMeshDataChanged = (newData: MeshNode[], oldData: MeshNode[]): boolean => {
  if (newData.length !== oldData.length) return true;
  
  // Create maps for faster lookup
  const oldDataMap = new Map(oldData.map(node => [node.MACAddress, node]));
  
  // Check if any nodes are different
  return newData.some(newNode => {
    const oldNode = oldDataMap.get(newNode.MACAddress);
    if (!oldNode) return true;
    
    // Compare relevant properties
    return (
      newNode.Mode !== oldNode.Mode ||
      newNode.ipv4 !== oldNode.ipv4 ||
      newNode.MediaType !== oldNode.MediaType ||
      newNode.Upstream !== oldNode.Upstream ||
      newNode.SupportedBand !== oldNode.SupportedBand
    );
  });
};

const fetchMeshData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getMeshMap();
    if ('NOK' in response) {
      error.value = 'Mesh is disabled';
      meshData.value = [];
    } else {
      // Only update if data has changed
      if (hasMeshDataChanged(response.MeshMap, meshData.value)) {
        meshData.value = response.MeshMap;
      }
    }
  } catch (err: unknown) {
    console.error('Error fetching mesh data:', err);
    error.value = 'Failed to fetch mesh data';
    meshData.value = [];
  } finally {
    loading.value = false;
  }
};

const handleAction = (client: MeshNode) => {
  selectedClient.value = client;
};

const handleSteeringApply = async (data: { destination: string; band: string }) => {
  if (!selectedClient.value) return;
  
  try {
    await applySteeringControl({
      stationMac: selectedClient.value.MACAddress,
      targetBssid: data.destination,
      band: data.band
    });
    
    // Refresh mesh data after successful steering
    await fetchMeshData();
    selectedClient.value = null;
  } catch (err) {
    console.error('Error applying steering control:', err);
    error.value = 'Failed to apply steering control';
  }
};

const getPossibleDestinations = () => {
  return nodes.value.filter(node => 
    node.Mode === 'Agent' && node.MACAddress !== selectedClient.value?.Upstream
  );
};

onMounted(() => {
  fetchMeshData();
  // Set up auto-refresh every 5 seconds
  refreshInterval.value = window.setInterval(fetchMeshData, 5000);
});

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
});
</script>

<template>
  <div class="mesh-info">
    <h1 class="page-title">{{ t('mesh.title') }}</h1>

    <div class="mesh-content">
      <!-- Loading State -->
      <div v-if="loading" class="status-message loading">
        <div class="loading-spinner"></div>
        Loading...
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="status-message error">
        {{ error }}
      </div>

      <!-- Content State -->
      <template v-else>
        <div class="header">
          <div class="mesh-title">{{ t('mesh.networkInformation') }}</div>
          <button 
            class="btn btn-primary"
            @click="showMap = !showMap"
          >
            {{ showMap ? t('mesh.list') : t('mesh.map') }}
          </button>
        </div>

        <template v-if="!showMap">
          <MeshNodeTable :nodes="nodes" />
          <MeshClientTable 
            :clients="clients"
            @action="handleAction"
          />
        </template>
        <template v-else>
          <MeshTopologyMap :nodes="meshData" />
        </template>

        <div class="actions">
          <button 
            v-if="showMap"
            class="btn btn-secondary" 
            @click="showMap = false"
          >
            {{ t('mesh.back') }}
          </button>
          <button 
            class="btn btn-secondary" 
            @click="fetchMeshData"
            :disabled="loading"
          >
            {{ t('common.refresh') }}
          </button>
        </div>
      </template>
    </div>

    <MeshSteeringModal
      v-if="selectedClient"
      :node="selectedClient"
      :destinations="getPossibleDestinations()"
      @close="selectedClient = null"
      @apply="handleSteeringApply"
    />
  </div>
</template>

<style scoped>
.mesh-info {
  flex: 1;
  background-color: #f5f5f5;
  min-height: 100%;
}

.mesh-content {
  padding: 1.5rem;
}

.status-message {
  background-color: white;
  padding: 2rem;
  text-align: center;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.status-message.error {
  color: #dc3545;
}

.status-message.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: #666;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #0070BB;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.header {
  background-color: #FFF;
  padding: 0.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.mesh-title {
  font-size: 1rem;
  color: #333;
}

.actions {
  margin-top: 1rem;
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

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 響應式設計 */
@media (max-width: 767px) {
  .mesh-content {
    padding: 1rem;
  }

  .header {
    padding: 0.5rem 1rem;
    margin-bottom: 1rem;
  }

  .actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn {
    width: 100%;
  }
}
</style>