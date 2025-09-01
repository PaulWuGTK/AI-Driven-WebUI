<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { getWlanBasic, updateWlanBasic } from '../../../services/api/wireless';
import type { WlanBasicResponse } from '../../../types/wireless';
import WirelessBandConfig from './basic/WirelessBandConfig.vue';
import BlockingOverlay from '../../../components/BlockingOverlay.vue';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const router = useRouter();
const wlanBasicData = ref<WlanBasicResponse | null>(null);
const loading = ref(false);
const showSuccess = ref(false);
const showPassword = ref(false);
const showBlockingOverlay = ref(false);

// Computed property to check if MLO is disabled by Mesh
const isMloDisabledByMesh = computed(() => {
  return wlanBasicData.value?.WlanBasic.MeshEnable === 1;
});

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

const handleBlockingComplete = () => {
  showBlockingOverlay.value = false;
  // Redirect back to the current page to refresh data
  router.go(0);
};

const handleSubmit = async () => {
  if (!wlanBasicData.value) return;
  
  loading.value = true;
  try {
    // Create a new object without MeshEnable and SecurityModeAvailable for the POST request
    const postData = {
      WlanBasic: {
        MLOEnable: wlanBasicData.value.WlanBasic.MLOEnable,
        wifi2g: {
          Enable: wlanBasicData.value.WlanBasic.wifi2g.Enable,
          SSID: wlanBasicData.value.WlanBasic.wifi2g.SSID,
          SecurityMode: wlanBasicData.value.WlanBasic.wifi2g.SecurityMode,
          Password: wlanBasicData.value.WlanBasic.wifi2g.Password
        },
        wifi5g: {
          Enable: wlanBasicData.value.WlanBasic.wifi5g.Enable,
          SSID: wlanBasicData.value.WlanBasic.wifi5g.SSID,
          SecurityMode: wlanBasicData.value.WlanBasic.wifi5g.SecurityMode,
          Password: wlanBasicData.value.WlanBasic.wifi5g.Password
        },
        wifi6g: {
          Enable: wlanBasicData.value.WlanBasic.wifi6g.Enable,
          SSID: wlanBasicData.value.WlanBasic.wifi6g.SSID,
          SecurityMode: wlanBasicData.value.WlanBasic.wifi6g.SecurityMode,
          Password: wlanBasicData.value.WlanBasic.wifi6g.Password
        },
        wifimlo: {
          Enable: wlanBasicData.value.WlanBasic.wifimlo.Enable,
          SSID: wlanBasicData.value.WlanBasic.wifimlo.SSID,
          SecurityMode: wlanBasicData.value.WlanBasic.wifimlo.SecurityMode,
          Password: wlanBasicData.value.WlanBasic.wifimlo.Password
        }
      }
    };
    
    await updateWlanBasic(postData);
    showSuccessMessage();
    
    // Show blocking overlay instead of immediate refresh
    showBlockingOverlay.value = true;
  } catch (error) {
    console.error('Error updating wireless basic config:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchBasicConfig);
</script>

<template>
  <div class="wireless-basic-config" :data-testid="qa('wireless-basic-config-content')">
    <form @submit.prevent="handleSubmit" :class="{ 'loading': loading }" :data-testid="qa('wireless-basic-config-form')">
      <div v-if="loading" class="loading-overlay" :data-testid="qa('wireless-basic-config-loading-overlay')">
        <div class="loading-spinner"></div>
      </div>

      <div v-if="showSuccess" class="success-message" :data-testid="qa('wireless-basic-config-success-message')">
        {{ t('common.apply') }} successful
      </div>

      <div v-if="wlanBasicData" class="band-sections" :data-testid="qa('wireless-basic-config-band-sections')">
        <!-- Show info banner when MLO is disabled by Mesh -->
        <div class="mesh-status" v-if="isMloDisabledByMesh" :data-testid="qa('wireless-basic-config-mesh-status')">
          <div class="info-banner" :data-testid="qa('wireless-basic-config-mesh-info-banner')">
            <span class="material-icons">info</span>
            <span>{{ t('wireless.meshMloDisabled') }}</span>
          </div>
        </div>
        
        <!-- MLO Settings Section -->
        <div class="panel-section" :data-testid="qa('wireless-basic-config-mlo-section')">
          <div class="section-title" :data-testid="qa('wireless-basic-config-mlo-title')">{{ t('wireless.mloSettings') }}</div>
          <div class="card-content" :data-testid="qa('wireless-basic-config-mlo-content')">
            <!-- MLO Enable Toggle -->
            <div class="form-group">
              <div class="switch-label">
                <span :data-testid="qa('wireless-basic-config-mlo-enable-label')">{{ t('wireless.mloEnable') }}</span>
                <label class="switch">
                  <input
                    type="checkbox"
                    :data-testid="qa('wireless-basic-config-mlo-enable-toggle')"
                    v-model="wlanBasicData.WlanBasic.MLOEnable"
                    :true-value="1"
                    :false-value="0"
                    :disabled="isMloDisabledByMesh"
                  >
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- MLO Settings Section -->
        <div v-if="wlanBasicData.WlanBasic.MLOEnable === 1" class="panel-section" :data-testid="qa('wireless-basic-config-mlo-band-section')">
          <div class="band-header">
            <div class="section-title-sp" :data-testid="qa('wireless-basic-config-mlo-band-title')">2.4GHz / 5GHz / 6GHz {{ t('wireless.settings') }}</div>
          </div>
          
          <div class="band-content" :data-testid="qa('wireless-basic-config-mlo-band-content')">
            <div class="form-group">
              <div class="switch-label">
                <span :data-testid="qa('wireless-basic-config-mlo-band-enable-label')">{{ t('common.enable') }}</span>
                <label class="switch">
                  <input
                    type="checkbox"
                    :data-testid="qa('wireless-basic-config-mlo-band-enable-toggle')"
                    v-model="wlanBasicData.WlanBasic.wifimlo.Enable"
                    :true-value="1"
                    :false-value="0"
                  >
                  <span class="slider"></span>
                </label>
              </div>
            </div>
            
            <div class="form-group">
              <label :data-testid="qa('wireless-basic-config-mlo-band-ssid-label')">{{ t('wireless.ssid') }}</label>
              <input
                type="text"
                :data-testid="qa('wireless-basic-config-mlo-band-ssid-input')"
                v-model="wlanBasicData.WlanBasic.wifimlo.SSID"
                :disabled="!wlanBasicData.WlanBasic.wifimlo.Enable"
              />
            </div>

            <div class="form-group">
              <label :data-testid="qa('wireless-basic-config-mlo-band-authentication-label')">{{ t('wireless.authentication') }}</label>
              <select
                :data-testid="qa('wireless-basic-config-mlo-band-authentication-select')"
                v-model="wlanBasicData.WlanBasic.wifimlo.SecurityMode"
                :disabled="!wlanBasicData.WlanBasic.wifimlo.Enable"
              >
                <option 
                  v-for="mode in (wlanBasicData.WlanBasic.wifimlo.SecurityModeAvailable ?? '').split(',')"
                  :key="mode"
                  :data-testid="qa(`wireless-basic-config-mlo-band-authentication-option-${slug(mode)}`)"
                  :value="mode"
                >
                  {{ mode }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label :data-testid="qa('wireless-basic-config-mlo-band-password-label')">{{ t('wireless.password') }}</label>
              <div class="password-input" :data-testid="qa('wireless-basic-config-mlo-band-password-container')">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  :data-testid="qa('wireless-basic-config-mlo-band-password-input')"
                  v-model="wlanBasicData.WlanBasic.wifimlo.Password"
                  :disabled="!wlanBasicData.WlanBasic.wifimlo.Enable"
                />
                <button 
                  type="button" 
                  class="toggle-password"
                  :data-testid="qa('wireless-basic-config-mlo-band-password-toggle')"
                  @click="showPassword = !showPassword"
                  :disabled="!wlanBasicData.WlanBasic.wifimlo.Enable"
                >
                  <span class="material-icons">
                    {{ showPassword ? 'visibility_off' : 'visibility' }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Individual Band Configurations (only shown when MLO is disabled) -->
        <template v-if="wlanBasicData.WlanBasic.MLOEnable === 0">
          <WirelessBandConfig
            :data-testid="qa('wireless-basic-config-2g-band')"
            title="2.4GHz"
            v-model="wlanBasicData.WlanBasic.wifi2g"
          />
          <WirelessBandConfig
            :data-testid="qa('wireless-basic-config-5g-band')"
            title="5GHz"
            v-model="wlanBasicData.WlanBasic.wifi5g"
          />
          <WirelessBandConfig
            :data-testid="qa('wireless-basic-config-6g-band')"
            title="6GHz"
            v-model="wlanBasicData.WlanBasic.wifi6g"
          />
        </template>
      </div>

      <div class="button-group" :data-testid="qa('wireless-basic-config-button-group')">
        <button type="button" class="btn btn-secondary" :data-testid="qa('wireless-basic-config-cancel-button')" @click="fetchBasicConfig" :disabled="loading">
          {{ t('common.cancel') }}
        </button>
        <button type="submit" class="btn btn-primary" :data-testid="qa('wireless-basic-config-apply-button')" :disabled="loading">
          {{ t('common.apply') }}
        </button>
      </div>
    </form>

    <!-- Blocking Overlay -->
    <BlockingOverlay
      :data-testid="qa('wireless-basic-config-blocking-overlay')"
      :is-visible="showBlockingOverlay"
      message="Applying WiFi Basic Settings..."
      :duration="30"
      @complete="handleBlockingComplete"
    />
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

.mesh-status {
  margin-top: 1.5rem;
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

.panel-section {
  background-color: white;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.2);
}

.band-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 1.5rem;
  background-color: white;
  border-bottom: 1px solid var(--border-color);
}

.section-title-sp {
  font-size: 1rem;
  color: var(--text-primary);
  padding: 0.5rem 0rem;
  background-color: white;
}

.band-content {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

input, select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}

input:disabled, select:disabled {
  background-color: var(--bg-secondary);
  cursor: not-allowed;
}

input:disabled + .slider {
  opacity: 0.6;
  cursor: not-allowed;
}

.password-input {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input input {
  padding-right: 2.5rem;
}

.toggle-password {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0.25rem;
}

.toggle-password:hover:not(:disabled) {
  color: var(--text-primary);
}

.toggle-password:disabled {
  cursor: not-allowed;
  opacity: 0.5;
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

.section-title {
  padding: 1rem 1.5rem;
  font-size: 1rem;
  color: var(--text-primary);
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.card-content {
  padding: 1.5rem;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
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

@media (max-width: 768px) {
  .band-sections {
    padding: 1rem;
  }
  
  .card-content {
    padding: 1rem;
  }

  .button-group {
    flex-direction: column;
    padding: 1rem;
  }

  .button-group .btn {
    width: 100%;
  }
}
</style>