<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getWlanAdvanced, updateWlanAdvanced } from '../../../services/api/wireless';
import type { WlanAdvancedResponse } from '../../../types/wireless';
import WirelessAdvancedBandConfig from './advanced/WirelessAdvancedBandConfig.vue';

const { t } = useI18n();
const advancedData = ref<WlanAdvancedResponse | null>(null);
const loading = ref(false);

const fetchAdvancedConfig = async () => {
  loading.value = true;
  try {
    advancedData.value = await getWlanAdvanced();
  } catch (error) {
    console.error('Error fetching wireless advanced config:', error);
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  if (!advancedData.value) return;
  
  try {
    await updateWlanAdvanced(advancedData.value);
  } catch (error) {
    console.error('Error updating wireless advanced config:', error);
  }
};

onMounted(fetchAdvancedConfig);
</script>

<template>
  <div class="wireless-advanced-config">
    <form @submit.prevent="handleSubmit">
      <div v-if="advancedData" class="band-sections">
        <WirelessAdvancedBandConfig
          v-model="advancedData.WlanAdvanced.wifi2g"
        />
        <WirelessAdvancedBandConfig
          v-model="advancedData.WlanAdvanced.wifi5g"
        />
        <WirelessAdvancedBandConfig
          v-model="advancedData.WlanAdvanced.wifi6g"
        />
      </div>

      <div class="button-group">
        <button type="button" class="btn btn-secondary" @click="fetchAdvancedConfig">
          {{ t('common.cancel') }}
        </button>
        <button type="submit" class="btn btn-primary">
          {{ t('common.apply') }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.wireless-advanced-config {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.band-sections {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e0e0e0;
}

.btn {
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-primary {
  background-color: #0070BB;
  color: white;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #666;
}

.btn:hover {
  opacity: 0.9;
}
</style>