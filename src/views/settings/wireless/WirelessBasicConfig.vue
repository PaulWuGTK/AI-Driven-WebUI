<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getWlanBasic, updateWlanBasic } from '../../../services/api/wireless';
import type { WlanBasicResponse } from '../../../types/wireless';
import WirelessBandConfig from './basic/WirelessBandConfig.vue';

const { t } = useI18n();
const wlanBasicData = ref<WlanBasicResponse | null>(null);
const loading = ref(false);
const showSuccess = ref(false);

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

const showSuccessMessage = () => {
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
  }, 3000);
};

const handleSubmit = async () => {
  if (!wlanBasicData.value) return;
  
  loading.value = true;
  try {
    await updateWlanBasic(wlanBasicData.value);
    showSuccessMessage();
    await fetchBasicConfig();
  } catch (error) {
    console.error('Error updating wireless basic config:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchBasicConfig);
</script>

<template>
  <div class="wireless-basic-config">
    <form @submit.prevent="handleSubmit" :class="{ 'loading': loading }">
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>

      <div v-if="showSuccess" class="success-message">
        {{ t('common.apply') }} successful
      </div>

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
        <button type="button" class="btn btn-secondary" @click="fetchBasicConfig" :disabled="loading">
          {{ t('common.cancel') }}
        </button>
        <button type="submit" class="btn btn-primary" :disabled="loading">
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
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0070BB;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.success-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #4caf50;
  color: white;
  padding: 1rem 2rem;
  border-radius: 4px;
  animation: fadeInOut 3s ease-in-out;
  z-index: 100;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
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
  transition: opacity 0.2s;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-primary {
  background-color: #0070BB;
  color: white;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #666;
}

.btn:not(:disabled):hover {
  opacity: 0.9;
}
</style>