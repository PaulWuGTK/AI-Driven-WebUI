<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';
import type { MeshNode } from '../../types/mesh';
import { useQA } from '../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();

defineProps<{
  nodes: MeshNode[];
}>();

defineEmits<{
  (e: 'action', node: MeshNode): void;
}>();
</script>

<template>
  <div class="table-list" :data-testid="qa('mesh-node-list-container')">
    <table :data-testid="qa('mesh-node-list-table')">
      <thead>
        <tr>
          <th :data-testid="qa('mesh-node-list-header-name')">{{ t('mesh.name') }}</th>
          <th :data-testid="qa('mesh-node-list-header-mode')">{{ t('mesh.mode') }}</th>
          <th :data-testid="qa('mesh-node-list-header-ip')">{{ t('mesh.ipAddress') }}</th>
          <th :data-testid="qa('mesh-node-list-header-mac')">{{ t('mesh.macAddress') }}</th>
          <th :data-testid="qa('mesh-node-list-header-media-type')">{{ t('mesh.mediaType') }}</th>
          <th :data-testid="qa('mesh-node-list-header-supported-band')">{{ t('mesh.supportedBand') }}</th>
          <th :data-testid="qa('mesh-node-list-header-upstream')">{{ t('mesh.upstream') }}</th>
          <th v-if="nodes.some(node => node.Mode === 'Client')" :data-testid="qa('mesh-node-list-header-action')">{{ t('mesh.action') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(node, index) in nodes" :key="node.MACAddress" :data-testid="qa(`mesh-node-list-row-${index}`)">
          <td :data-testid="qa(`mesh-node-list-name-${index}`)">{{ node.Name }}</td>
          <td :data-testid="qa(`mesh-node-list-mode-${index}`)">{{ node.Mode }}</td>
          <td :data-testid="qa(`mesh-node-list-ip-${index}`)">{{ node.ipv4 }}</td>
          <td :data-testid="qa(`mesh-node-list-mac-${index}`)">{{ node.MACAddress }}</td>
          <td :data-testid="qa(`mesh-node-list-media-type-${index}`)">{{ node.MediaType }}</td>
          <td :data-testid="qa(`mesh-node-list-supported-band-${index}`)">{{ node.SupportedBand || '-' }}</td>
          <td :data-testid="qa(`mesh-node-list-upstream-${index}`)">{{ node.Upstream === '-' ? '-' : node.Upstream }}</td>
          <td v-if="node.Mode === 'Client'">
            <button class="action-button" :data-testid="qa(`mesh-node-list-action-${index}`)" @click="$emit('action', node)">
              {{ t('mesh.action') }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>

.action-button {
  background-color: #0070BB;
  color: white;
  padding: 0.25rem 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.action-button:hover {
  opacity: 0.9;
}
</style>