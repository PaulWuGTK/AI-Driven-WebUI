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
    
    <div class="table-container">
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
  margin-bottom: 1.5rem;
}

@media (max-width: 767px) {
  .table-container {
    display: none;
  }

  .mobile-cards {
    display: block;
  }
}
</style>