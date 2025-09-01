<script setup lang="ts">
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import type { MeshNode } from '../../types/mesh';
import { useQA } from '../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();

defineProps<{
  nodes: MeshNode[];
}>();
</script>

<template>
  <div class="mesh-node-table" :data-testid="qa('mesh-node-table-container')">
    <div class="section-title" :data-testid="qa('mesh-node-table-title')">{{ t('mesh.nodeList') }}</div>
    
    <div class="table-container" :data-testid="qa('mesh-node-table-wrapper')">
      <table :data-testid="qa('mesh-node-table')">
        <thead>
          <tr>
            <th :data-testid="qa('mesh-node-table-header-name')">{{ t('mesh.name') }}</th>
            <th :data-testid="qa('mesh-node-table-header-mode')">{{ t('mesh.mode') }}</th>
            <th :data-testid="qa('mesh-node-table-header-ip')">{{ t('mesh.ipAddress') }}</th>
            <th :data-testid="qa('mesh-node-table-header-mac')">{{ t('mesh.macAddress') }}</th>
            <th :data-testid="qa('mesh-node-table-header-media-type')">{{ t('mesh.mediaType') }}</th>
            <th :data-testid="qa('mesh-node-table-header-supported-band')">{{ t('mesh.supportedBand') }}</th>
            <th :data-testid="qa('mesh-node-table-header-upstream')">{{ t('mesh.upstream') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(node, index) in nodes" :key="node.MACAddress" :data-testid="qa(`mesh-node-table-row-${index}`)">
            <td :data-testid="qa(`mesh-node-table-name-${index}`)">{{ node.Name }}</td>
            <td :data-testid="qa(`mesh-node-table-mode-${index}`)">{{ node.Mode }}</td>
            <td :data-testid="qa(`mesh-node-table-ip-${index}`)">{{ node.ipv4 }}</td>
            <td :data-testid="qa(`mesh-node-table-mac-${index}`)">{{ node.MACAddress }}</td>
            <td :data-testid="qa(`mesh-node-table-media-type-${index}`)">{{ node.MediaType }}</td>
            <td :data-testid="qa(`mesh-node-table-supported-band-${index}`)">{{ node.SupportedBand || '-' }}</td>
            <td :data-testid="qa(`mesh-node-table-upstream-${index}`)">{{ node.Upstream === '-' ? '-' : node.Upstream }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mobile-cards" :data-testid="qa('mesh-node-table-mobile')">
      <div class="table-card" v-for="(node, index) in nodes" :key="node.MACAddress" :data-testid="qa(`mesh-node-table-card-${index}`)">
        <div class="card-row">
          <span class="card-label" :data-testid="qa(`mesh-node-table-card-name-label-${index}`)">{{ t('mesh.name') }}</span>
          <span class="card-value" :data-testid="qa(`mesh-node-table-card-name-value-${index}`)">{{ node.Name }}</span>
        </div>
        <div class="card-row">
          <span class="card-label" :data-testid="qa(`mesh-node-table-card-mode-label-${index}`)">{{ t('mesh.mode') }}</span>
          <span class="card-value" :data-testid="qa(`mesh-node-table-card-mode-value-${index}`)">{{ node.Mode }}</span>
        </div>
        <div class="card-row">
          <span class="card-label" :data-testid="qa(`mesh-node-table-card-ip-label-${index}`)">{{ t('mesh.ipAddress') }}</span>
          <span class="card-value" :data-testid="qa(`mesh-node-table-card-ip-value-${index}`)">{{ node.ipv4 }}</span>
        </div>
        <div class="card-row">
          <span class="card-label" :data-testid="qa(`mesh-node-table-card-mac-label-${index}`)">{{ t('mesh.macAddress') }}</span>
          <span class="card-value" :data-testid="qa(`mesh-node-table-card-mac-value-${index}`)">{{ node.MACAddress }}</span>
        </div>
        <div class="card-row">
          <span class="card-label" :data-testid="qa(`mesh-node-table-card-media-type-label-${index}`)">{{ t('mesh.mediaType') }}</span>
          <span class="card-value" :data-testid="qa(`mesh-node-table-card-media-type-value-${index}`)">{{ node.MediaType }}</span>
        </div>
        <div class="card-row">
          <span class="card-label" :data-testid="qa(`mesh-node-table-card-supported-band-label-${index}`)">{{ t('mesh.supportedBand') }}</span>
          <span class="card-value" :data-testid="qa(`mesh-node-table-card-supported-band-value-${index}`)">{{ node.SupportedBand || '-' }}</span>
        </div>
        <div class="card-row">
          <span class="card-label" :data-testid="qa(`mesh-node-table-card-upstream-label-${index}`)">{{ t('mesh.upstream') }}</span>
          <span class="card-value" :data-testid="qa(`mesh-node-table-card-upstream-value-${index}`)">{{ node.Upstream === '-' ? '-' : node.Upstream }}</span>
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