<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { NetworkTopologyResponse, NetworkTopologyNode } from '../../types/networkTopology';
import { getNetworkTopology } from '../../services/api';
import { BaseTable } from '../../components/common';
import { useQA } from '../../utils/qa';
import TopologyGraph from './TopologyGraph.vue';

const { qa } = useQA();
const { t } = useI18n();

const data = ref<NetworkTopologyResponse | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const viewMode = ref<'tree' | 'table' | 'text'>('tree');

// Auto-refresh
const REFRESH_MS = 15000;
let refreshTimer: ReturnType<typeof setInterval> | null = null;

const allNodes = computed(() => data.value?.NetworkTopology.nodes ?? []);
const textView = computed(() => data.value?.NetworkTopology.textView ?? '');

const deviceNodes = computed(() =>
  allNodes.value.filter(n => n.NodeType === 'device')
);

// Build tree structure
interface TreeNode {
  node: NetworkTopologyNode;
  children: TreeNode[];
}

const treeRoot = computed<TreeNode | null>(() => {
  const nodes = allNodes.value;
  if (nodes.length === 0) return null;

  const aliasMap = new Map<string, TreeNode>();
  for (const n of nodes) {
    aliasMap.set(n.Alias, { node: n, children: [] });
  }

  let root: TreeNode | null = null;
  for (const n of nodes) {
    const treeNode = aliasMap.get(n.Alias)!;
    if (n.Parent === '' || !aliasMap.has(n.Parent)) {
      root = treeNode;
    } else {
      aliasMap.get(n.Parent)!.children.push(treeNode);
    }
  }
  return root;
});

const deviceColumns = computed(() => [
  { key: 'Name', label: t('networkTopology.name'), sortable: true, headerDataTestid: qa('topology-header-name') },
  { key: 'IPAddress', label: t('networkTopology.ipAddress'), sortable: true, headerDataTestid: qa('topology-header-ip') },
  { key: 'PhysAddress', label: t('networkTopology.macAddress'), sortable: true, headerDataTestid: qa('topology-header-mac') },
  { key: 'MediaType', label: t('networkTopology.mediaType'), sortable: true, headerDataTestid: qa('topology-header-media') },
  { key: 'Active', label: t('networkTopology.status'), sortable: true, headerDataTestid: qa('topology-header-status') },
  { key: 'Parent', label: t('networkTopology.connectedVia'), sortable: true, headerDataTestid: qa('topology-header-parent') },
]);

const getRowTestId = (_row: unknown, index: number, mobile: boolean) =>
  qa(mobile ? `topology-card-${index}` : `topology-row-${index}`) ?? '';

const fetchData = async (silent = false) => {
  if (!silent) loading.value = true;
  error.value = null;
  try {
    data.value = await getNetworkTopology();
  } catch (err) {
    console.error('Error fetching network topology:', err);
    error.value = t('networkTopology.fetchError');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
  refreshTimer = setInterval(() => fetchData(true), REFRESH_MS);
});

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
});
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('topology-title')">{{ t('networkTopology.title') }}</h1>

    <div class="page-content" :data-testid="qa('topology-content')">
      <div v-if="loading" class="loading-state" :data-testid="qa('topology-loading')">
        <div class="loading-spinner"></div>
        <span>{{ t('common.loading') }}</span>
      </div>

      <div v-else-if="error" class="error-state" :data-testid="qa('topology-error')">
        {{ error }}
        <button class="btn btn-primary retry-btn" @click="fetchData()">{{ t('common.refresh') }}</button>
      </div>

      <template v-else-if="data">
        <!-- View mode tabs -->
        <div class="panel-section" :data-testid="qa('topology-panel')">
          <div class="view-tabs" :data-testid="qa('topology-view-tabs')">
            <button
              class="tab-button" :class="{ active: viewMode === 'tree' }"
              :data-testid="qa('topology-tab-tree')"
              @click="viewMode = 'tree'"
            >{{ t('networkTopology.treeView') }}</button>
            <button
              class="tab-button" :class="{ active: viewMode === 'table' }"
              :data-testid="qa('topology-tab-table')"
              @click="viewMode = 'table'"
            >{{ t('networkTopology.deviceList') }}</button>
            <button
              class="tab-button" :class="{ active: viewMode === 'text' }"
              :data-testid="qa('topology-tab-text')"
              @click="viewMode = 'text'"
            >{{ t('networkTopology.textView') }}</button>
          </div>

          <!-- Topology Graph View -->
          <div v-if="viewMode === 'tree'" class="card-content tree-view-content" :data-testid="qa('topology-graph')">
            <div class="topology-summary">
              <span class="summary-item">
                <span class="summary-label">{{ t('networkTopology.totalNodes') }}:</span>
                <span class="summary-value">{{ allNodes.length }}</span>
              </span>
              <span class="summary-item">
                <span class="summary-label">{{ t('networkTopology.connectedDevices') }}:</span>
                <span class="summary-value">{{ deviceNodes.filter(d => d.Active).length }}</span>
              </span>
              <span class="refresh-indicator" :data-testid="qa('topology-refresh')">
                <span class="refresh-dot"></span>
                Auto-refresh
              </span>
            </div>
            <TopologyGraph v-if="treeRoot" :root="treeRoot" />
          </div>

          <!-- Device Table View -->
          <div v-if="viewMode === 'table'" class="card-content" :data-testid="qa('topology-table-view')">
            <BaseTable
              :columns="deviceColumns"
              :data="deviceNodes"
              row-key="Alias"
              :table-data-testid="qa('topology-table')"
              :mobile-data-testid="qa('topology-mobile')"
              initial-sort-key="Name"
              initial-sort-order="asc"
              :row-data-testid="getRowTestId"
              :empty-text="t('networkTopology.noDevices')"
              hover
              striped
            >
              <template #cell-Active="{ row }">
                <span :class="row.Active ? 'status-active' : 'status-inactive'">
                  {{ row.Active ? t('common.connected') : t('common.disconnected') }}
                </span>
              </template>
              <template #cell-PhysAddress="{ row }">
                <span class="mono-text">{{ row.PhysAddress || '-' }}</span>
              </template>
              <template #cell-IPAddress="{ row }">
                <span class="mono-text">{{ row.IPAddress || '-' }}</span>
              </template>
            </BaseTable>
          </div>

          <!-- Text View -->
          <div v-if="viewMode === 'text'" class="card-content" :data-testid="qa('topology-text-view')">
            <pre class="text-topology">{{ textView }}</pre>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
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
  color: var(--color-error);
  background-color: white;
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
}

.retry-btn {
  margin-top: 1rem;
}

/* View tabs */
.view-tabs {
  display: flex;
  gap: 0;
  border-bottom: 2px solid var(--border-color);
  padding: 0 1.5rem;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: color var(--transition-base), border-color var(--transition-base);
}

.tab-button:hover {
  color: var(--color-primary);
}

.tab-button.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

/* Summary bar */
.topology-summary {
  display: flex;
  gap: 2rem;
  padding: 0.75rem 0;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border-color-light);
}

.summary-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.summary-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.summary-value {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

/* Graph view */
.tree-view-content {
  padding: 1.5rem;
}

.refresh-indicator {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: #94a3b8;
}

.refresh-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4caf50;
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* Status badges in table */
.status-active {
  color: var(--color-success);
  font-weight: 500;
}

.status-inactive {
  color: var(--color-gray-400);
}

.mono-text {
  font-family: var(--font-family-mono);
  font-size: 0.85rem;
}

/* Text view */
.text-topology {
  font-family: var(--font-family-mono);
  font-size: 0.8rem;
  line-height: 1.6;
  background: var(--bg-tertiary);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  overflow-x: auto;
  white-space: pre;
  margin: 0;
  color: var(--text-primary);
}

/* Card content padding for table/text */
.card-content {
  padding: 1rem 1.5rem 1.5rem;
}

@media (max-width: 768px) {
  .topology-summary {
    flex-direction: column;
    gap: 0.5rem;
  }

  .view-tabs {
    padding: 0 1rem;
  }

  .tab-button {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
}
</style>
