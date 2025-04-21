<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getWlanWps, updateWlanWps } from '../../../services/api/wireless';
import type { WlanWpsResponse } from '../../../types/wireless';
import WpsVapInfo from './wps/WpsVapInfo.vue';
import WpsActions from './wps/WpsActions.vue';

const { t } = useI18n();
const wpsData = ref<WlanWpsResponse | null>(null);
const loading = ref(false);
const pairingInProgress = ref(false);
const pairingResult = ref<"Success" | "NotSuccess" | null>(null);
const pollingInterval = ref<number | null>(null);

const fetchWpsConfig = async () => {
  loading.value = true;
  try {
    const data = await getWlanWps();
    wpsData.value = data;
    
    // Check pairing result status
    if (data.WlanWps.PairingResult === "PairingInprogress") {
      pairingInProgress.value = true;
      startPolling();
    } else if (data.WlanWps.PairingResult === "Success" || data.WlanWps.PairingResult === "NotSuccess") {
      pairingInProgress.value = false;
      pairingResult.value = data.WlanWps.PairingResult;
    } else {
      pairingInProgress.value = false;
      pairingResult.value = null;
    }
  } catch (error) {
    console.error('Error fetching WPS config:', error);
  } finally {
    loading.value = false;
  }
};

const startPolling = () => {
  // Clear any existing interval
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
  }
  
  // Start polling every 3 seconds
  pollingInterval.value = window.setInterval(async () => {
    try {
      const data = await getWlanWps();
      wpsData.value = data;
      
      if (data.WlanWps.PairingResult !== "PairingInprogress") {
        // Stop polling when pairing is no longer in progress
        pairingInProgress.value = false;
        
        if (data.WlanWps.PairingResult === "Success" || data.WlanWps.PairingResult === "NotSuccess") {
        pairingResult.value = data.WlanWps.PairingResult;
        } else {
          pairingResult.value = null;
        }
        
        if (pollingInterval.value) {
          clearInterval(pollingInterval.value);
          pollingInterval.value = null;
        }
      }
    } catch (error) {
      console.error('Error polling WPS status:', error);
      // Stop polling on error
      if (pollingInterval.value) {
        clearInterval(pollingInterval.value);
        pollingInterval.value = null;
      }
      pairingInProgress.value = false;
    }
  }, 3000);
};

const handleEnableToggle = async (enabled: boolean) => {
  try {
    await updateWlanWps({
      WlanWps: {
        Enable: enabled ? 1 : 0
      }
    });
    await fetchWpsConfig();
  } catch (error) {
    console.error('Error updating WPS enable state:', error);
  }
};

const handlePairingComplete = () => {
  pairingResult.value = null;
};

// Clean up interval when component is unmounted
onUnmounted(() => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
    pollingInterval.value = null;
  }
});

onMounted(fetchWpsConfig);
</script>

<template>
  <div class="wireless-wps-config">
    <div class="wps-enable">
      <div class="switch-label">
        <span>{{ t('wireless.wpsConfiguration') }}</span>
        <label class="switch">
          <input
            type="checkbox"
            :checked="wpsData?.WlanWps.Enable === 1"
            @change="handleEnableToggle(($event.target as HTMLInputElement).checked)"
          >
          <span class="slider"></span>
        </label>
      </div>
    </div>

    <template v-if="wpsData?.WlanWps.Enable === 1">
      <WpsActions 
        :pin-code="wpsData.WlanWps.PINCode"
        @refresh="fetchWpsConfig"
      />
      <WpsVapInfo 
        :bands="wpsData.WlanWps.Band"
      />
    </template>

    <!-- Pairing In Progress Overlay -->
    <div v-if="pairingInProgress" class="pairing-overlay">
      <div class="pairing-content">
        <div class="spinner"></div>
        <h3>{{ t('wireless.wpsStatus') }}</h3>
        <p>{{ t('diagnostics.processing') }}</p>
      </div>
    </div>

    <!-- Pairing Result Modal -->
    <div v-if="pairingResult" class="pairing-overlay">
      <div class="pairing-content result">
        <div v-if="pairingResult === 'Success'" class="success-icon">
          <span class="material-icons">check_circle</span>
        </div>
        <div v-else class="error-icon">
          <span class="material-icons">error</span>
        </div>
        
        <h3>{{ t('wireless.wpsStatus') }}</h3>
        <p>{{ pairingResult === 'Success' ? 'Connection successful' : 'Connection failed' }}</p>
        
        <button class="btn btn-primary" @click="handlePairingComplete">
          {{ t('common.close') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wireless-wps-config {
  padding: 1.5rem;
  position: relative;
}

.wps-enable {
  margin-bottom: 1.5rem;
}

.switch-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-primary);
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  flex-shrink: 0;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary-color);
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.pairing-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.pairing-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  max-width: 400px;
  width: 90%;
}

.pairing-content.result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

.success-icon, .error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.success-icon {
  color: #4caf50;
}

.error-icon {
  color: #dc3545;
}

.success-icon .material-icons, .error-icon .material-icons {
  font-size: 3rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .wireless-wps-config {
    padding: 1rem;
  }
}
</style>