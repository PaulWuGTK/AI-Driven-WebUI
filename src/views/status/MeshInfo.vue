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
  // refreshInterval.value = window.setInterval(fetchMeshData, 5000);
});

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
});
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">{{ t('mesh.title') }}</h1>

    <div class="status-content">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        Loading...
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        {{ error }}
      </div>

      <!-- Content State -->
      <template v-else>
        <!-- Network Information Section -->
        <div class="panel-section">
          <div class="header-row">
            <div class="section-title">{{ t('mesh.networkInformation') }}</div>
            <button 
              class="btn btn-map"
              @click="showMap = !showMap"
            >
              <span class="material-icons">{{ showMap ? 'list' : 'map' }}</span>
              {{ showMap ? t('mesh.list') : t('mesh.map') }}
            </button>
          </div>

          <div class="card-content">
            <template v-if="!showMap">
              <!-- Node List Section -->
              <div class="list-section">
                <div class="list-title">{{ t('mesh.nodeList') }}</div>
                <div class="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>{{ t('mesh.name') }}</th>
                        <th>{{ t('mesh.mode') }}</th>
                        <th>{{ t('mesh.ipAddress') }}</th>
                        <th>{{ t('mesh.macAddress') }}</th>
                        <th>{{ t('mesh.mediaType') }}</th>
                        <th>{{ t('mesh.supportedBand') }}</th>
                        <th>{{ t('mesh.upstream') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="node in nodes" :key="node.MACAddress">
                        <td>{{ node.Name }}</td>
                        <td>{{ node.Mode }}</td>
                        <td>{{ node.ipv4 }}</td>
                        <td>{{ node.MACAddress }}</td>
                        <td>{{ node.MediaType }}</td>
                        <td>{{ node.SupportedBand || '-' }}</td>
                        <td>{{ node.Upstream === '-' ? '-' : node.Upstream }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Client List Section -->
              <div class="list-section">
                <div class="list-title">{{ t('mesh.clientList') }}</div>
                <div class="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>{{ t('mesh.name') }}</th>
                        <th>{{ t('mesh.ipAddress') }}</th>
                        <th>{{ t('mesh.macAddress') }}</th>
                        <th>{{ t('mesh.mediaType') }}</th>
                        <th>{{ t('mesh.upstream') }}</th>
                        <th>{{ t('mesh.action') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="client in clients" :key="client.MACAddress">
                        <td>{{ client.Name }}</td>
                        <td>{{ client.ipv4 }}</td>
                        <td>{{ client.MACAddress }}</td>
                        <td>{{ client.MediaType }}</td>
                        <td>{{ client.Upstream }}</td>
                        <td>
                          <button class="btn-action" @click="handleAction(client)">
                            <span class="material-icons">settings</span>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </template>
            <template v-else>
              <MeshTopologyMap :nodes="meshData" />
            </template>

            <div class="button-group">
              <button 
                class="btn btn-refresh" 
                @click="fetchMeshData"
                :disabled="loading"
              >
                <span class="material-icons">refresh</span>
                {{ t('common.refresh') }}
              </button>
            </div>
          </div>
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
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background-color: #f8f8f8;
  border-bottom: 1px solid #e0e0e0;
}

.btn-map {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #0070BB;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-map:hover {
  background-color: #005a96;
}

.list-section {
  margin-bottom: 2rem;
}

.list-section:last-child {
  margin-bottom: 0;
}

.list-title {
  padding: 0.75rem 0;
  font-size: 1rem;
  color: #333;
  font-weight: 500;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

th {
  background-color: #f8f8f8;
  font-weight: 500;
  color: #333;
}

td {
  color: #666;
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
}

.btn-action:hover {
  color: #333;
}

.button-group {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.5rem;
  background-color: #0070BB;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-refresh:hover:not(:disabled) {
  background-color: #005a96;
}

.btn-refresh:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  color: #666;
}

.error-state {
  padding: 2rem;
  text-align: center;
  color: #dc3545;
}

@media (max-width: 768px) {
  .header-row {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .btn-map {
    width: 100%;
    justify-content: center;
  }

  .list-title {
    padding: 0.75rem 1rem;
  }

  .table-wrapper {
    border: none;
    background: none;
  }

  .button-group {
    padding: 0 1rem;
  }

  .btn-refresh {
    width: 100%;
    justify-content: center;
  }
}
</style>