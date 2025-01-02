<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';
import type { MeshNode } from '../../types/mesh';

const { t } = useI18n();

defineProps<{
  nodes: MeshNode[];
}>();

defineEmits<{
  (e: 'action', node: MeshNode): void;
}>();
</script>

<template>
  <div class="mesh-node-list">
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
          <th v-if="nodes.some(node => node.Mode === 'Client')">{{ t('mesh.action') }}</th>
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
          <td v-if="node.Mode === 'Client'">
            <button class="action-button" @click="$emit('action', node)">
              {{ t('mesh.action') }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.mesh-node-list {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
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
  font-weight: normal;
  color: #666;
}

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