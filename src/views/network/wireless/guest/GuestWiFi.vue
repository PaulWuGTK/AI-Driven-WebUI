<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import type { GuestWiFiResponse } from '../../../../types/guest';
import { getGuestWiFi, updateGuestWiFi } from '../../../../services/api/guestAccess';
import BlockingOverlay from '../../../../components/BlockingOverlay.vue';
import { ActionButtons, BaseSwitch, BaseToast } from '../../../../components/common';
import { useAutoDismiss } from '../../../../composables/useAutoDismiss';
import { extractNokMessage } from '../../../../utils/apiUtils';
import { useQA } from '../../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const router = useRouter();
const guestWiFiData = ref<GuestWiFiResponse | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const successMessage = ref('');
const errorToastMessage = ref('');
const { visible: showSuccessToast, show: triggerSuccessToast } = useAutoDismiss();
const { visible: showErrorToast, show: triggerErrorToast } = useAutoDismiss();
const showPassword = ref(false);
const showBlockingOverlay = ref(false);

// Computed property to check if MLO is disabled by Mesh
const isMLODisabledByMesh = computed(() => {
  return guestWiFiData.value?.GuestWiFi.MeshEnable === 1;
});

const fetchGuestWiFi = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getGuestWiFi();
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      error.value = nokMessage;
      guestWiFiData.value = null;
      return;
    }
    guestWiFiData.value = response;
  } catch (err) {
    console.error('Error fetching Guest WiFi settings:', err);
    error.value = 'Failed to fetch Guest WiFi settings';
  } finally {
    loading.value = false;
  }
};

const securityModes = computed(() => {
  if (!guestWiFiData.value) return [];
  return guestWiFiData.value.GuestWiFi.SecurityModeAvailable.split(',');
});

const showSuccessMessage = (message = `${t('common.apply')} successful`) => {
  successMessage.value = message;
  triggerSuccessToast();
};

const showErrorMessage = (message: string) => {
  errorToastMessage.value = message;
  triggerErrorToast();
};

const handleBlockingComplete = () => {
  showBlockingOverlay.value = false;
  // Redirect back to the current page to refresh data
  router.go(0);
};

const handleSubmit = async () => {
  if (!guestWiFiData.value) return;
  
  loading.value = true;
  error.value = null;
  try {
    const response = await updateGuestWiFi({
      GuestWiFi: {
        Enable: guestWiFiData.value.GuestWiFi.Enable,
        MLOEnable: guestWiFiData.value.GuestWiFi.MLOEnable,
        Password: guestWiFiData.value.GuestWiFi.Password,
        SecurityMode: guestWiFiData.value.GuestWiFi.SecurityMode,
        SSID: guestWiFiData.value.GuestWiFi.SSID
      }
    });
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      showErrorMessage(nokMessage);
      return;
    }
    showSuccessMessage();
    
    // Show blocking overlay instead of immediate refresh
    showBlockingOverlay.value = true;
  } catch (err) {
    console.error('Error updating Guest WiFi settings:', err);
    showErrorMessage('Failed to update Guest WiFi settings');
  } finally {
    loading.value = false;
  }
};

onMounted(fetchGuestWiFi);
</script>

<template>
  <div class="guest-wifi" :data-testid="qa('guest-wifi-content')">
    <div v-if="loading && !guestWiFiData" class="loading-state" :data-testid="qa('guest-wifi-loading')">
      <div class="loading-spinner"></div>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="error" class="error-state" :data-testid="qa('guest-wifi-error')">
      {{ error }}
    </div>

    <form v-else-if="guestWiFiData" @submit.prevent="handleSubmit" :data-testid="qa('guest-wifi-form')">
      <!-- Show info banner when MLO is disabled by Mesh -->
      <div v-if="isMLODisabledByMesh" class="mesh-status" :data-testid="qa('guest-wifi-mesh-status')">
        <div class="info-banner" :data-testid="qa('guest-wifi-mesh-info-banner')">
          <span class="material-icons">info</span>
          <span>{{ t('wireless.meshMloDisabled') }}</span>
        </div>
      </div>

      <div class="form-group">
        <div class="switch-label">
          <span :data-testid="qa('guest-wifi-enable-label')">{{ t('guest.enable') }}</span>
          <BaseSwitch
            v-model="guestWiFiData.GuestWiFi.Enable"
            :true-value="1"
            :false-value="0"
            :data-testid="qa('guest-wifi-enable-toggle')"
            :slider-data-testid="qa('guest-wifi-enable-toggle-slider')"
          />
        </div>
      </div>

      <div class="form-group">
        <div class="switch-label">
          <span :data-testid="qa('guest-wifi-mlo-enable-label')">MLO {{ t('guest.enable') }}</span>
          <BaseSwitch
            v-model="guestWiFiData.GuestWiFi.MLOEnable"
            :true-value="1"
            :false-value="0"
            :disabled="guestWiFiData.GuestWiFi.Enable === 0 || isMLODisabledByMesh"
            :data-testid="qa('guest-wifi-mlo-enable-toggle')"
            :slider-data-testid="qa('guest-wifi-mlo-enable-toggle-slider')"
          />
        </div>
      </div>

      <div class="form-group">
        <label :data-testid="qa('guest-wifi-ssid-label')">{{ t('guest.ssid') }}</label>
        <input
          type="text"
          :data-testid="qa('guest-wifi-ssid-input')"
          v-model="guestWiFiData.GuestWiFi.SSID"
          :disabled="guestWiFiData.GuestWiFi.Enable === 0"
          required
        />
      </div>

      <div class="form-group">
        <label :data-testid="qa('guest-wifi-authentication-label')">{{ t('guest.authentication') }}</label>
        <select
          :data-testid="qa('guest-wifi-authentication-select')"
          v-model="guestWiFiData.GuestWiFi.SecurityMode"
          :disabled="guestWiFiData.GuestWiFi.Enable === 0"
        >
          <option v-for="mode in securityModes" :key="mode" :value="mode" :data-testid="qa(`guest-wifi-authentication-option-${slug(mode)}`)">
            {{ mode }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label :data-testid="qa('guest-wifi-password-label')">{{ t('guest.password') }}</label>
        <div class="password-input" :data-testid="qa('guest-wifi-password-container')">
          <input
            :type="showPassword ? 'text' : 'password'"
            :data-testid="qa('guest-wifi-password-input')"
            v-model="guestWiFiData.GuestWiFi.Password"
            :disabled="guestWiFiData.GuestWiFi.Enable === 0"
            required
          />
          <button 
            type="button" 
            class="toggle-password"
            :data-testid="qa('guest-wifi-password-toggle')"
            @click="showPassword = !showPassword"
            :disabled="guestWiFiData.GuestWiFi.Enable === 0"
          >
            <span class="material-icons">
              {{ showPassword ? 'visibility_off' : 'visibility' }}
            </span>
          </button>
        </div>
      </div>

      <div class="button-group">
        <ActionButtons
          :cancel-data-testid="qa('guest-wifi-cancel-button')"
          :apply-data-testid="qa('guest-wifi-apply-button')"
          :cancel-disabled="loading"
          :apply-disabled="loading"
          apply-type="submit"
          @cancel="fetchGuestWiFi"
        />
      </div>
    </form>

    <BaseToast
      v-model="showSuccessToast"
      :message="successMessage"
      type="success"
      :data-testid="qa('guest-wifi-success-message')"
    />
    <BaseToast
      v-model="showErrorToast"
      :message="errorToastMessage"
      type="error"
      :data-testid="qa('guest-wifi-error-toast')"
    />

    <!-- Blocking Overlay -->
    <BlockingOverlay
      :data-testid="qa('guest-wifi-blocking-overlay')"
      :is-visible="showBlockingOverlay"
      message="Applying Guest WiFi Settings..."
      :duration="30"
      @complete="handleBlockingComplete"
    />
  </div>
</template>

<style scoped>
.guest-wifi {
  padding: 1.5rem;
}

.mesh-status {
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

.form-group {
  margin-bottom: 1.5rem;
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

/* Custom switch size (60px × 34px) for larger prominence */
:deep(.switch) {
  width: 60px;
  height: 34px;
  flex-shrink: 0;
}

:deep(.slider:before) {
  height: 26px;
  width: 26px;
}

:deep(input:checked + .slider:before) {
  transform: translateX(26px);
}

:deep(input:disabled + .slider) {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
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
  .guest-wifi {
    padding: 1rem;
  }

  .button-group {
    flex-direction: column;
  }

  .button-group :deep(.btn) {
    width: 100%;
  }
}
</style>
