<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';
import type { MeshNode } from '../../types/mesh';
import { useQA } from '../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();

defineProps<{
  clients: MeshNode[];
}>();

defineEmits<{
  (e: 'action', client: MeshNode): void;
}>();
</script>

<template>
  <div class="mesh-client-table" :data-testid="qa('mesh-client-table-container')">
    <div class="section-title" :data-testid="qa('mesh-client-table-title')">{{ t('mesh.clientList') }}</div>
    
    <div class="table-container" :data-testid="qa('mesh-client-table-wrapper')">
      <table :data-testid="qa('mesh-client-table')">
        <thead>
          <tr>
            <th :data-testid="qa('mesh-client-table-header-name')">{{ t('mesh.name') }}</th>
            <th :data-testid="qa('mesh-client-table-header-ip')">{{ t('mesh.ipAddress') }}</th>
            <th :data-testid="qa('mesh-client-table-header-mac')">{{ t('mesh.macAddress') }}</th>
            <th :data-testid="qa('mesh-client-table-header-media-type')">{{ t('mesh.mediaType') }}</th>
            <th :data-testid="qa('mesh-client-table-header-upstream')">{{ t('mesh.upstream') }}</th>
            <th :data-testid="qa('mesh-client-table-header-action')">{{ t('mesh.action') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(client, index) in clients" :key="client.MACAddress" :data-testid="qa(`mesh-client-table-row-${index}`)">
            <td :data-testid="qa(`mesh-client-table-name-${index}`)">{{ client.Name }}</td>
            <td :data-testid="qa(`mesh-client-table-ip-${index}`)">{{ client.ipv4 }}</td>
            <td :data-testid="qa(`mesh-client-table-mac-${index}`)">{{ client.MACAddress }}</td>
            <td :data-testid="qa(`mesh-client-table-media-type-${index}`)">{{ client.MediaType }}</td>
            <td :data-testid="qa(`mesh-client-table-upstream-${index}`)">{{ client.Upstream }}</td>
            <td>
              <button class="btn-action" :data-testid="qa(`mesh-client-table-action-${index}`)" @click="$emit('action', client)">
                <span class="material-icons">settings</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mobile-cards" :data-testid="qa('mesh-client-table-mobile')">
      <div class="table-card" v-for="(client, index) in clients" :key="client.MACAddress" :data-testid="qa(`mesh-client-table-card-${index}`)">
        <div class="card-row">
          <span class="card-label" :data-testid="qa(`mesh-client-table-card-name-label-${index}`)">{{ t('mesh.name') }}</span>
          <span class="card-value" :data-testid="qa(`mesh-client-table-card-name-value-${index}`)">{{ client.Name }}</span>
        </div>
        <div class="card-row">
          <span class="card-label" :data-testid="qa(`mesh-client-table-card-ip-label-${index}`)">{{ t('mesh.ipAddress') }}</span>
          <span class="card-value" :data-testid="qa(`mesh-client-table-card-ip-value-${index}`)">{{ client.ipv4 }}</span>
        </div>
        <div class="card-row">
          <span class="card-label" :data-testid="qa(`mesh-client-table-card-mac-label-${index}`)">{{ t('mesh.macAddress') }}</span>
          <span class="card-value" :data-testid="qa(`mesh-client-table-card-mac-value-${index}`)">{{ client.MACAddress }}</span>
        </div>
        <div class="card-row">
          <span class="card-label" :data-testid="qa(`mesh-client-table-card-media-type-label-${index}`)">{{ t('mesh.mediaType') }}</span>
          <span class="card-value" :data-testid="qa(`mesh-client-table-card-media-type-value-${index}`)">{{ client.MediaType }}</span>
        </div>
        <div class="card-row">
          <span class="card-label" :data-testid="qa(`mesh-client-table-card-upstream-label-${index}`)">{{ t('mesh.upstream') }}</span>
          <span class="card-value" :data-testid="qa(`mesh-client-table-card-upstream-value-${index}`)">{{ client.Upstream }}</span>
        </div>
        <div class="card-actions">
          <button class="btn btn-primary" :data-testid="qa(`mesh-client-table-card-action-${index}`)" @click="$emit('action', client)">
            {{ t('mesh.action') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mesh-client-table {
  margin-bottom: 1.5rem;
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
}

.btn-action:hover {
  color: var(--text-primary);
}

@media (max-width: 767px) {
  .table-container {
    display: none;
  }

  .mobile-cards {
    display: block;
  }

  .card-actions {
    justify-content: stretch;
  }

  .btn {
    width: 100%;
  }
}
</style>