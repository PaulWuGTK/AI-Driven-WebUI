<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { MeshNode } from '../../types/mesh';
import { getMeshMap } from '../../services/api/mesh';
import MeshNodeTable from '../../components/mesh/MeshNodeTable.vue';
import MeshClientTable from '../../components/mesh/MeshClientTable.vue';
import MeshSteeringModal from '../../components/mesh/MeshSteeringModal.vue';
import MeshTopologyMap from '../../components/mesh/MeshTopologyMap.vue';

const { t } = useI18n();
const meshData = ref<MeshNode[]>([]);
const showMap = ref(false);
const selectedClient = ref<MeshNode | null>(null);
const loading = ref(false);

const nodes = computed(() => 
  meshData.value.filter(node => node.Mode !== 'Client')
);

const clients = computed(() => 
  meshData.value.filter(node => node.Mode === 'Client')
);

const fetchMeshData = async () => {
  loading.value = true;
  try {
    const response = await getMeshMap();
    meshData.value = response.MeshMap;
  } catch (error) {
    console.error('Error fetching mesh data:', error);
  } finally {
    loading.value = false;
  }
};

const handleAction = (client: MeshNode) => {
  selectedClient.value = client;
};

const handleSteeringApply = (data: { destination: string; band: string }) => {
  console.log('Steering control applied:', data);
  selectedClient.value = null;
};

const getPossibleDestinations = () => {
  return nodes.value.filter(node => 
    node.Mode === 'Agent' && node.MACAddress !== selectedClient.value?.Upstream
  );
};

onMounted(fetchMeshData);
</script>

<template>
  <div class="mesh-info">
    <h1 class="page-title">{{ t('mesh.title') }}</h1>

    <div class="mesh-content">
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

      <!-- Actions區塊 - 加入Back按鈕 -->
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

.table-section {
  composes: table-section;
  margin-bottom: 1.5rem;
}

.header {
  background-color: #FFF;
  padding: 0.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h2 {
  font-size: 1rem;
  color: #333;
  margin: 0;
}

.actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;  /* 加入間距 */
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
</style>