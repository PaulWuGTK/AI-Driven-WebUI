<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getWlanBasic, updateWlanBasic } from '../../../services/api/wireless';
import type { WlanBasicResponse } from '../../../types/wireless';
import WirelessBandConfig from './basic/WirelessBandConfig.vue';

const { t } = useI18n();
const wlanBasicData = ref<WlanBasicResponse | null>(null);
const loading = ref(false);

const fetchBasicConfig = async () => {
  loading.value = true;
  try {
    wlanBasicData.value = await getWlanBasic();
  } catch (error) {
    console.error('Error fetching wireless basic config:', error);
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  if (!wlanBasicData.value) return;
  
  try {
    await updateWlanBasic(wlanBasicData.value);
  } catch (error) {
    console.error('Error updating wireless basic config:', error);
  }
};

onMounted(fetchBasicConfig);
</script>

<template>
  <div class="wireless-basic-config">
    <form @submit.prevent="handleSubmit">
      <div v-if="wlanBasicData" class="band-sections">
        <WirelessBandConfig
          title="2.4GHz"
          v-model="wlanBasicData.WlanBasic.wifi2g"
        />
        <WirelessBandConfig
          title="5GHz"
          v-model="wlanBasicData.WlanBasic.wifi5g"
        />
        <WirelessBandConfig
          title="6GHz"
          v-model="wlanBasicData.WlanBasic.wifi6g"
        />
      </div>

      <div class="button-group">
        <button type="button" class="btn btn-secondary" @click="fetchBasicConfig">
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
.wireless-basic-config {
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