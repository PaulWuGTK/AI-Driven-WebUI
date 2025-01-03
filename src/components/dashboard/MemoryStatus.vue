<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getMemoryInfo } from '../../services/api/dashboard';

const { t } = useI18n();
const memoryData = ref({
  total: 0,
  free: 0
});
const pollingInterval = ref<number | null>(null);

const usedMemory = computed(() => {
  return memoryData.value.total - memoryData.value.free;
});

const usedPercentage = computed(() => {
  return memoryData.value.total
    ? ((usedMemory.value / memoryData.value.total) * 100).toFixed(1)
    : '0.0';
});

const formatBytes = (bytes: number) => {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
};

// 調整 fetchMemoryData，處理回傳陣列
const fetchMemoryData = async () => {
  try {
    const response = await getMemoryInfo();
    
    // 檢查是否為陣列，並篩選出 path 符合的項目
    const memoryInfo = Array.isArray(response)
      ? response.find(item => item.path === "Device.DeviceInfo.MemoryStatus.")
      : null;

    if (memoryInfo && memoryInfo.parameters) {
      const { Total = 0, Free = 0 } = memoryInfo.parameters;
      memoryData.value = { total: Total, free: Free };
    }
  } catch (error) {
    console.error('Error fetching memory data:', error);
  }
};

// 啟動後自動輪詢，每 5 秒獲取資料
onMounted(() => {
  fetchMemoryData();
  pollingInterval.value = window.setInterval(fetchMemoryData, 5000);
});

// 組件卸載時清除輪詢
onUnmounted(() => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
  }
});
</script>

<template>
  <div class="memory-status">
    <h2 class="card-title">{{ t('dashboard.memory') }}</h2>
    <div class="memory-container">
      <div class="donut-chart">
        <svg viewBox="0 0 36 36" class="donut">
          <circle
            class="donut-ring"
            cx="18"
            cy="18"
            r="15.91549430918954"
            fill="transparent"
            stroke="#e6e6e6"
            stroke-width="3"
          />
          <circle
            class="donut-segment"
            cx="18"
            cy="18"
            r="15.91549430918954"
            fill="transparent"
            stroke="#0070BB"
            stroke-width="3"
            :stroke-dasharray="`${usedPercentage} ${100 - Number(usedPercentage)}`"
            stroke-dashoffset="25"
          />
        </svg>
        <div class="donut-text">
          <div class="percentage">{{ usedPercentage }}%</div>
          <div class="label">{{ t('dashboard.used') }}</div>
        </div>
      </div>
      <div class="memory-details">
        <div class="detail-item">
          <span class="label">{{ t('dashboard.total') }}</span>
          <span class="value">{{ formatBytes(memoryData.total) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">{{ t('dashboard.free') }}</span>
          <span class="value">{{ formatBytes(memoryData.free) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.memory-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.donut-chart {
  position: relative;
  width: 150px;
  height: 150px;
}

.donut {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.donut-ring {
  stroke: #ebebeb;
}

.donut-segment {
  transition: stroke-dasharray 0.3s ease;
}

.donut-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.percentage {
  font-size: 1.5rem;
  font-weight: bold;
  color: #0070BB;
}

.label {
  font-size: 0.8rem;
  color: #666;
}

.memory-details {
  width: 100%;
  display: grid;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-item .label {
  color: #666;
}

.detail-item .value {
  color: #333;
  font-weight: 500;
}

.card-title {
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 1rem 0;
}
</style>