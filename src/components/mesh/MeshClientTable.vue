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
    
    <!-- PC版表格 -->
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
              <button class="action-button" @click="$emit('action', client)">
                {{ t('mesh.action') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 手機版卡片 -->
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
          <button class="action-button" @click="$emit('action', client)">
            {{ t('mesh.action') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mesh-client-table {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  padding: 1rem 1.5rem;
  font-size: 1rem;
  color: #333;
  background-color: #f8f8f8;
  border-bottom: 1px solid #e0e0e0;
}

.table-wrapper {
  padding: 1.5rem;
  overflow-x: auto;
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

/* 手機版卡片樣式 */
.mobile-cards {
  display: none;
  padding: 1rem;
  gap: 1rem;
}

.table-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.card-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.card-row:last-child {
  border-bottom: none;
}

.card-label {
  color: #666;
  font-size: 0.9rem;
}

.card-value {
  color: #333;
  font-weight: 500;
  word-break: break-all;
}

.card-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
}

/* 響應式設計 */
@media (min-width: 768px) {
  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
    white-space: nowrap;
  }

  th {
    background-color: #f8f8f8;
    font-weight: 500;
    color: #333;
  }

  td {
    color: #666;
  }

  .mobile-cards {
    display: none;
  }
}

@media (max-width: 767px) {
  .table-wrapper {
    display: none;
  }

  .mobile-cards {
    display: block;
  }
}
</style>