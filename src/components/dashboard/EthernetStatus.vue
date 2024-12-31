<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const ports = ref<any[]>([]);

const fetchEthernetStatus = async () => {
  try {
    const response = await fetch('/API/info?list=EthernetStatus');
    const data = await response.json();
    ports.value = data.EthernetStatus;
  } catch (error) {
    console.error('Error fetching Ethernet status:', error);
  }
};

onMounted(() => {
  fetchEthernetStatus();
  setInterval(fetchEthernetStatus, 10000);
});
</script>

<template>
  <div class="ethernet-status">
    <h2 class="card-title">{{ t('dashboard.ethernet') }}</h2>
    <div class="ports-grid">
      <div 
        v-for="port in ports" 
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
.ethernet-status {
  height: 100%;
}

.card-title {
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 1rem 0;
}

.ports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
}

.port-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
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
  text-align: center;
}

.port-name {
  font-weight: 500;
  color: #333;
}

.port-speed {
  font-size: 0.8rem;
  color: #666;
}
</style>