<script setup lang="ts">
import type { WlanBand } from '../../types/wlan';

defineProps<{
  band: WlanBand;
}>();
</script>

<template>
  <div class="band-info">
    <div class="info-grid">
      <div class="info-row">
        <span class="label">Channel</span>
        <span class="value">{{ band.Channel }}{{ band.AutoChannel ? ' (auto)' : '' }}</span>
      </div>
      <div class="info-row">
        <span class="label">Bandwidth</span>
        <span class="value">{{ band.Bandwidth }}</span>
      </div>
      <div class="info-row">
        <span class="label">MAC Address</span>
        <span class="value">{{ band.MACAddress }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.band-info {
  padding: 1.5rem;
}

.info-grid {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.info-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  align-items: center;
}

.label {
  color: #666;
}

.value {
  color: #333;
}
</style>