<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const systemInfo = ref({
  model: '',
  serialNumber: ''
});

const fetchSystemInfo = async () => {
  try {
    const response = await fetch('/serviceElements/Device.DeviceInfo.');
    const data = await response.json();
    const info = data.find((item: any) => item.path === 'DeviceInfo.')?.parameters;
    if (info) {
      systemInfo.value = {
        model: info.ModelName,
        serialNumber: info.SerialNumber
      };
    }
  } catch (error) {
    console.error('Error fetching system info:', error);
  }
};

onMounted(fetchSystemInfo);
</script>

<template>
  <div class="system-info">
    <h2 class="card-title">{{ t('dashboard.system') }}</h2>
    <div class="info-grid">
      <div class="info-item">
        <span class="label">{{ t('dashboard.model') }}</span>
        <span class="value">{{ systemInfo.model }}</span>
      </div>
      <div class="info-item">
        <span class="label">{{ t('dashboard.serialNumber') }}</span>
        <span class="value">{{ systemInfo.serialNumber }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.system-info {
  height: 100%;
}

.card-title {
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 1rem 0;
}

.info-grid {
  display: grid;
  gap: 1rem;
}

.info-item {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.25rem;
}

.label {
  color: #666;
  font-size: 0.9rem;
}

.value {
  color: #333;
  font-weight: 500;
}
</style>