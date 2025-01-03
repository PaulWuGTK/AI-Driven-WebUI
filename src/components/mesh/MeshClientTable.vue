```vue
<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';
import type { MeshNode } from '../../types/mesh';

const { t } = useI18n();

defineProps<{
  clients: MeshNode[];
}>();

defineEmits<{
  (e: 'action', client: MeshNode): void;
}>();
</script>

<template>
  <div class="mesh-client-table">
    <div class="section-title">{{ t('mesh.clientList') }}</div>
    <div class="table-list">
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
            <button class="action-button" @click="$emit('action', client)">
              {{ t('mesh.action') }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    </div>
  </div>
</template>

<style scoped>
.mesh-client-table {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
```