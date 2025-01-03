```vue
<script setup lang="ts">
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import type { MeshNode } from '../../types/mesh';

const { t } = useI18n();

defineProps<{
  nodes: MeshNode[];
}>();
</script>

<template>
  <div class="mesh-node-table">
    <div class="section-title">{{ t('mesh.nodeList') }}</div>
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
</template>

<style scoped>
.mesh-node-table {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

</style>
```