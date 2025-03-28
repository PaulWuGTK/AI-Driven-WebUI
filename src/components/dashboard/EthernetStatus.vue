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
          <div class="port-name">{{ port.Port }}</div>
          <div class="port-speed">{{ port.Speed }} Mbps</div>
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
}

.port-icon.active {
  background-color: #4caf50;
  color: white;
}

.port-info {
  display: flex;
  flex-direction: row; /* 橫向排列名稱與速度 */
  align-items: center;
  gap: 0.5rem;
  min-width: 150px;
}

.port-name {
  font-weight: 500;
  color: #333;
}

.port-speed {
  font-size: 0.8rem;
  color: #666;
}

.card-title {
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 1rem 0;
}
</style>