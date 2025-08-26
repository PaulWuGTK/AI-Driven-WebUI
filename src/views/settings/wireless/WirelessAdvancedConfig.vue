<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { getWlanAdvanced, updateWlanAdvanced } from '../../../services/api/wireless';
import type { WlanAdvancedResponse } from '../../../types/wireless';
import WirelessAdvancedBandConfig from './advanced/WirelessAdvancedBandConfig.vue';
import BlockingOverlay from '../../../components/BlockingOverlay.vue';

const { t } = useI18n();
const router = useRouter();
const advancedData = ref<WlanAdvancedResponse | null>(null);
const loading = ref(false);
const showSuccess = ref(false);
const showBlockingOverlay = ref(false);

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

const showSuccessMessage = () => {
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
  }, 3000);
};

const handleBlockingComplete = () => {
  showBlockingOverlay.value = false;
  // Redirect back to the current page to refresh data
  router.go(0);
};

const handleSubmit = async () => {
  if (!advancedData.value) return;
  loading.value = true;
  try {
    const postData: WlanAdvancedResponse = {
      WlanAdvanced: {
        wifi2g: {
          RadioEnable: advancedData.value.WlanAdvanced.wifi2g.RadioEnable,
          Mode: advancedData.value.WlanAdvanced.wifi2g.Mode,
          Channel: advancedData.value.WlanAdvanced.wifi2g.Channel.toString(),
          ChannelBandwidth: advancedData.value.WlanAdvanced.wifi2g.ChannelBandwidth,
          AutoChannelEnable: Number(advancedData.value.WlanAdvanced.wifi2g.AutoChannelEnable)
        },
        wifi5g: {
          RadioEnable: advancedData.value.WlanAdvanced.wifi5g.RadioEnable,
          Mode: advancedData.value.WlanAdvanced.wifi5g.Mode,
          Channel: advancedData.value.WlanAdvanced.wifi5g.Channel.toString(),
          ChannelBandwidth: advancedData.value.WlanAdvanced.wifi5g.ChannelBandwidth,
          AutoChannelEnable: Number(advancedData.value.WlanAdvanced.wifi5g.AutoChannelEnable)
        },
        wifi6g: {
          RadioEnable: advancedData.value.WlanAdvanced.wifi6g.RadioEnable,
          Mode: advancedData.value.WlanAdvanced.wifi6g.Mode,
          Channel: advancedData.value.WlanAdvanced.wifi6g.Channel.toString(),
          ChannelBandwidth: advancedData.value.WlanAdvanced.wifi6g.ChannelBandwidth,
          AutoChannelEnable: Number(advancedData.value.WlanAdvanced.wifi6g.AutoChannelEnable)
        }
      }
    };

    await updateWlanAdvanced(postData);
    showSuccessMessage();
    
    // Show blocking overlay instead of immediate refresh
    showBlockingOverlay.value = true;
  } catch (error) {
    console.error('Error updating wireless advanced config:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchAdvancedConfig);
</script>

<template>
  <div class="wireless-advanced-config">
    <form @submit.prevent="handleSubmit" :class="{ 'loading': loading }">
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>

      <div v-if="showSuccess" class="success-message">
        {{ t('common.apply') }} successful
      </div>

      <div v-if="advancedData" class="band-sections">
        <!-- MLO Enable Status Information -->
        <div class="mlo-status" v-if="advancedData.WlanAdvanced.MLOEnable === 1">
          <div class="info-banner">
            <span class="material-icons">info</span>
            <span>{{ t('wireless.mloModeDisabled') }}</span>
          </div>
        </div>

        <WirelessAdvancedBandConfig
          title="2.4GHz"
          v-model="advancedData.WlanAdvanced.wifi2g"
          :mloEnabled="advancedData.WlanAdvanced.MLOEnable === 1"
        />
        <WirelessAdvancedBandConfig
          title="5GHz"
          v-model="advancedData.WlanAdvanced.wifi5g"
          :mloEnabled="advancedData.WlanAdvanced.MLOEnable === 1"
        />
        <WirelessAdvancedBandConfig
          title="6GHz"
          v-model="advancedData.WlanAdvanced.wifi6g"
          :mloEnabled="advancedData.WlanAdvanced.MLOEnable === 1"
        />
      </div>

      <div class="button-group">
        <button type="button" class="btn btn-secondary" @click="fetchAdvancedConfig" :disabled="loading">
          {{ t('common.cancel') }}
        </button>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ t('common.apply') }}
        </button>
      </div>
    </form>

    <!-- Blocking Overlay -->
    <BlockingOverlay
      :is-visible="showBlockingOverlay"
      message="Applying WiFi Advanced Settings..."
      :duration="30"
      @complete="handleBlockingComplete"
    />
  </div>
</template>

<style scoped>
.wireless-advanced-config {
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

.mlo-status {
  margin-bottom: 1.5rem;
}

.info-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background-color: #e3f2fd;
  border-left: 4px solid #0070BB;
  border-radius: 4px;
  color: #0070BB;
}

.info-banner .material-icons {
  font-size: 1.25rem;
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

.btn-secondary {
  background-color: #f0f0f0;
  color: #666;
}

.btn:not(:disabled):hover {
  opacity: 0.9;
}
</style>