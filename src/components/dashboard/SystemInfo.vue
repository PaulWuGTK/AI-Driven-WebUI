<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getSystemInfo } from '../../services/api/dashboard';

const { t } = useI18n();

interface SystemInfo {
  ModelName: string;
  SerialNumber: string;
  SoftwareVersion: string;
  Description: string;
}

// 定義 SystemInfoItem，表示回傳的 API 資料結構
interface SystemInfoItem {
  parameters: Partial<SystemInfo>;
  path: string;
}

// 使用 Partial 確保部分屬性是可選的
const systemData = ref<Partial<SystemInfo>>({});

const fetchSystemInfo = async () => {
  try {
    const response: SystemInfoItem[] = await getSystemInfo();
    
    // 尋找 path 為 "DeviceInfo." 的資料
    const systemInfo = response.find((item) => item.path === "Device.DeviceInfo.");
    
    if (systemInfo && systemInfo.parameters) {
      systemData.value = {
        ...systemData.value,
        ...systemInfo.parameters
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
        <span class="value">{{ systemData.ModelName || '-' }}</span>
      </div>
      <div class="info-item">
        <span class="label">{{ t('dashboard.serialNumber') }}</span>
        <span class="value">{{ systemData.SerialNumber || '-' }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.info-grid {
  display: grid;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  color: #666;
}

.value {
  color: #333;
  font-weight: 500;
}

.card-title {
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 1rem 0;
}
</style>