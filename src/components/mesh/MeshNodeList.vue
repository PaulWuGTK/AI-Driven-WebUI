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
  <div class="table-list">
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