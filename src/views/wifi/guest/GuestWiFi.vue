<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { GuestWiFiResponse } from '../../../types/guest';
import { getGuestWiFi, updateGuestWiFi } from '../../../services/api/guestAccess';

const { t } = useI18n();
const guestWiFiData = ref<GuestWiFiResponse | null>(null);
const loading = ref(false);
const showSuccess = ref(false);
const error = ref<string | null>(null);
const showPassword = ref(false);

const fetchGuestWiFi = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getGuestWiFi();
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

const showSuccessMessage = () => {
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
  }, 3000);
};

const handleSubmit = async () => {
  if (!guestWiFiData.value) return;
  
  loading.value = true;
  error.value = null;
  try {
    await updateGuestWiFi({
      GuestWiFi: {
        Enable: guestWiFiData.value.GuestWiFi.Enable,
        MLOEnable: guestWiFiData.value.GuestWiFi.MLOEnable,
        Password: guestWiFiData.value.GuestWiFi.Password,
        SecurityMode: guestWiFiData.value.GuestWiFi.SecurityMode,
        SSID: guestWiFiData.value.GuestWiFi.SSID
      }
    });
    showSuccessMessage();
    await fetchGuestWiFi();
  } catch (err) {
    console.error('Error updating Guest WiFi settings:', err);
    error.value = 'Failed to update Guest WiFi settings';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchGuestWiFi);
</script>

<template>
  <div class="guest-wifi">
    <div v-if="loading && !guestWiFiData" class="loading-state">
      <div class="loading-spinner"></div>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>

    <form v-else-if="guestWiFiData" @submit.prevent="handleSubmit">
      <div class="form-group">
        <div class="switch-label">
          <span>{{ t('guest.enable') }}</span>
          <label class="switch">
            <input
              type="checkbox"
              v-model="guestWiFiData.GuestWiFi.Enable"
              :true-value="1"
              :false-value="0"
            >
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <div class="switch-label">
          <span>MLO {{ t('guest.enable') }}</span>
          <label class="switch">
            <input
              type="checkbox"
              v-model="guestWiFiData.GuestWiFi.MLOEnable"
              :true-value="1"
              :false-value="0"
              :disabled="guestWiFiData.GuestWiFi.Enable === 0"
            >
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label>{{ t('guest.ssid') }}</label>
        <input
          type="text"
          v-model="guestWiFiData.GuestWiFi.SSID"
          :disabled="guestWiFiData.GuestWiFi.Enable === 0"
          required
        />
      </div>

      <div class="form-group">
        <label>{{ t('guest.authentication') }}</label>
        <select
          v-model="guestWiFiData.GuestWiFi.SecurityMode"
          :disabled="guestWiFiData.GuestWiFi.Enable === 0"
        >
          <option v-for="mode in securityModes" :key="mode" :value="mode">
            {{ mode }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>{{ t('guest.password') }}</label>
        <div class="password-input">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="guestWiFiData.GuestWiFi.Password"
            :disabled="guestWiFiData.GuestWiFi.Enable === 0"
            required
          />
          <button 
            type="button" 
            class="toggle-password"
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
        <button type="button" class="btn btn-secondary" @click="fetchGuestWiFi" :disabled="loading">
          {{ t('common.cancel') }}
        </button>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ t('common.apply') }}
        </button>
      </div>
    </form>

    <div v-if="showSuccess" class="success-message">
      {{ t('common.apply') }} successful
    </div>
  </div>
</template>

<style scoped>
.guest-wifi {
  padding: 1.5rem;
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

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
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

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
}

@media (max-width: 768px) {
  .guest-wifi {
    padding: 1rem;
  }

  .button-group {
    flex-direction: column;
  }

  .button-group .btn {
    width: 100%;
  }
}
</style>