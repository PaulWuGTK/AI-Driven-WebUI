<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DualImageResponse } from '../../types/dualImage';
import { getDualImageStatus } from '../../services/api';
import { useQA } from '../../utils/qa';

const { isQAMode, qa, slug } = useQA();
const { t } = useI18n();

const dualImageData = ref<DualImageResponse | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const fetchDualImageStatus = async () => {
  loading.value = true;
  error.value = null;
  try {
    dualImageData.value = await getDualImageStatus();
  } catch (err) {
    console.error('Error fetching Dual Image status:', err);
    error.value = 'Failed to fetch Dual Image status';
  } finally {
    loading.value = false;
  }
};

const partitionData = computed(() => {
  if (!dualImageData.value) return [];

  const data = dualImageData.value.StatusDualImage;
  return [
    {
      partition: '1',
      version: data.p1_version
    },
    {
      partition: '2',
      version: data.p2_version
    }
  ];
});

onMounted(() => {
  fetchDualImageStatus();
});
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('dual-image-title')">{{ t('dualImage.title') }}</h1>

    <div class="status-content">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>{{ t('common.loading') }}</span>
      </div>

      <div v-else-if="error" class="error-state">
        {{ error }}
      </div>

      <template v-else-if="dualImageData">
        <div class="panel-section">
          <div class="card-content">
            <div class="boot-partition-info" :data-testid="qa('dual-image-boot-partition')">
              <span class="boot-label">{{ t('dualImage.currentBootPartition') }}:</span>
              <span class="boot-value">{{ dualImageData.StatusDualImage.boot_partition }}</span>
            </div>

            <div class="section-title partition-section-title" :data-testid="qa('dual-image-partition-info-title')">
              {{ t('dualImage.partitionInformation') }}
            </div>

            <div class="table-container" :data-testid="qa('dual-image-table')">
              <table>
                <thead>
                  <tr>
                    <th :data-testid="qa('dual-image-header-partition')">{{ t('dualImage.bootPartition') }}</th>
                    <th :data-testid="qa('dual-image-header-version')">{{ t('dualImage.version') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in partitionData"
                    :key="item.partition"
                    :data-testid="qa(`dual-image-row-${item.partition}`)"
                  >
                    <td :data-testid="qa(`dual-image-partition-${item.partition}`)">{{ item.partition }}</td>
                    <td :data-testid="qa(`dual-image-version-${item.partition}`)">{{ item.version }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="mobile-cards" :data-testid="qa('dual-image-mobile-cards')">
              <div
                class="table-card"
                v-for="item in partitionData"
                :key="item.partition"
                :data-testid="qa(`dual-image-card-${item.partition}`)"
              >
                <div class="card-row">
                  <span class="card-label" :data-testid="qa(`dual-image-card-partition-label-${item.partition}`)">{{ t('dualImage.bootPartition') }}</span>
                  <span class="card-value" :data-testid="qa(`dual-image-card-partition-value-${item.partition}`)">{{ item.partition }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label" :data-testid="qa(`dual-image-card-version-label-${item.partition}`)">{{ t('dualImage.version') }}</span>
                  <span class="card-value" :data-testid="qa(`dual-image-card-version-value-${item.partition}`)">{{ item.version }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.boot-partition-info {
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.boot-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.boot-value {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 1.1rem;
}

.partition-section-title {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  background-color: white;
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
}

.error-state {
  padding: 2rem;
  text-align: center;
  color: #dc3545;
  background-color: white;
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
}

@media (max-width: 768px) {
  .boot-partition-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
