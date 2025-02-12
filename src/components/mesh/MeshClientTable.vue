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
    
    <div class="table-container">
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
              <button class="btn-action" @click="$emit('action', client)">
                <span class="material-icons">settings</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mobile-cards">
      <div class="table-card" v-for="client in clients" :key="client.MACAddress">
        <div class="card-row">
          <span class="card-label">{{ t('mesh.name') }}</span>
          <span class="card-value">{{ client.Name }}</span>
        </div>
        <div class="card-row">
          <span class="card-label">{{ t('mesh.ipAddress') }}</span>
          <span class="card-value">{{ client.ipv4 }}</span>
        </div>
        <div class="card-row">
          <span class="card-label">{{ t('mesh.macAddress') }}</span>
          <span class="card-value">{{ client.MACAddress }}</span>
        </div>
        <div class="card-row">
          <span class="card-label">{{ t('mesh.mediaType') }}</span>
          <span class="card-value">{{ client.MediaType }}</span>
        </div>
        <div class="card-row">
          <span class="card-label">{{ t('mesh.upstream') }}</span>
          <span class="card-value">{{ client.Upstream }}</span>
        </div>
        <div class="card-actions">
          <button class="btn btn-primary" @click="$emit('action', client)">
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