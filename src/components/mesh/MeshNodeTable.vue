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
    
    <!-- PC版表格 -->
    <div class="table-wrapper">
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

    <!-- 手機版卡片 -->
    <div class="mobile-cards">
      <div class="table-card" v-for="node in nodes" :key="node.MACAddress">
        <div class="card-row">
          <span class="card-label">{{ t('mesh.name') }}</span>
          <span class="card-value">{{ node.Name }}</span>
        </div>
        <div class="card-row">
          <span class="card-label">{{ t('mesh.mode') }}</span>
          <span class="card-value">{{ node.Mode }}</span>
        </div>
        <div class="card-row">
          <span class="card-label">{{ t('mesh.ipAddress') }}</span>
          <span class="card-value">{{ node.ipv4 }}</span>
        </div>
        <div class="card-row">
          <span class="card-label">{{ t('mesh.macAddress') }}</span>
          <span class="card-value">{{ node.MACAddress }}</span>
        </div>
        <div class="card-row">
          <span class="card-label">{{ t('mesh.mediaType') }}</span>
          <span class="card-value">{{ node.MediaType }}</span>
        </div>
        <div class="card-row">
          <span class="card-label">{{ t('mesh.supportedBand') }}</span>
          <span class="card-value">{{ node.SupportedBand || '-' }}</span>
        </div>
        <div class="card-row">
          <span class="card-label">{{ t('mesh.upstream') }}</span>
          <span class="card-value">{{ node.Upstream === '-' ? '-' : node.Upstream }}</span>
        </div>
      </div>
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