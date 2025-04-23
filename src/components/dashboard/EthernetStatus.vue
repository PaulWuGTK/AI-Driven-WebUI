<script setup lang="ts">
import { defineProps,computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DashboardEthernetPort } from '../../types/dashboard';

const { t } = useI18n();

const props = defineProps<{
  ethernetInfo?: DashboardEthernetPort[];
}>();

const sortedEthernet = computed(() => {
  return props.ethernetInfo
    ? [...props.ethernetInfo].sort((a, b) => a.Port.localeCompare(b.Port)) // 依照 Port 名稱排序
    : [];
});
</script>

<template>
  <div class="ethernet-status" v-if="sortedEthernet.length">
    <h2 class="card-title">{{ t('dashboard.ethernet') }}</h2>
    <div class="ports-grid">
      <div 
        v-for="port in sortedEthernet" 
        :key="port.Port"
        class="port-item"
      >
        <div class="port-icon" :class="{ active: port.Status === 'Up' }">
          <span class="material-icons">settings_ethernet</span>
        </div>
        <div class="port-info">
          <span class="port-name">{{ port.Port }}</span>
          <span class="port-role">{{ port.Role.toUpperCase() }}</span>
          <span class="port-speed">{{ port.Speed }} Mbps</span>
        </div>
      </div>
    </div>
</div>
</template>

<style scoped>
.ports-grid {
  display: grid;
  grid-template-columns: 1fr; /* 強制單列排列 */
  gap: 1rem;
  justify-items: center; /* 讓項目置中對齊 */
}

.port-item {
  display: flex;
  flex-direction: row; /* 改為水平排列 */
  align-items: center;
  gap: 1rem; /* 元素間距稍微拉開 */
  padding: 0.5rem 1rem;
  border-radius: 8px;
  width: 100%;
  background-color: #f8f8f8;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.port-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.port-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.port-icon.active {
  background-color: #4caf50;
  color: white;
}

.port-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
}

.port-name {
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
}

.port-role {
  color: #0070BB;
  font-weight: 500;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  padding: 0.15rem 0.5rem;
  background-color: rgba(0, 112, 187, 0.1);
  border-radius: 4px;
}

.port-speed {
  color: #666;
  font-size: 0.85rem;
  background-color: #f0f0f0;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
}

.card-title {
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 1rem 0;
}
</style>