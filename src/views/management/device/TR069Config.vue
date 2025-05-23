<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TR069Config } from '../../../types/device';
import { getTR069Config, updateTR069Config, sendInformToACS } from '../../../services/api/device';

const { t } = useI18n();
const config = ref<TR069Config | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const showPassword = ref({
  acs: false,
  connection: false
});

const fetchConfig = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getTR069Config();
    config.value = response.ManagementServer;
  } catch (err) {
    console.error('Error fetching TR-069 config:', err);
    error.value = 'Failed to fetch TR-069 configuration';
  } finally {
    loading.value = false;
  }
};

const handleApply = async () => {
  if (!config.value) return;
  
  loading.value = true;
  error.value = null;
  try {
    const response = await updateTR069Config(config.value);
    if (response.ManagementServer === 'OK') {
      await fetchConfig();
    } else {
      throw new Error('Failed to update configuration');
    }
  } catch (err) {
    console.error('Error updating TR-069 config:', err);
    error.value = 'Failed to update TR-069 configuration';
  } finally {
    loading.value = false;
  }
};

const handleSendInform = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await sendInformToACS();
    if (!response.ManagementServer?.OK) {
      throw new Error('Failed to send inform message');
    }
  } catch (err) {
    console.error('Error sending inform:', err);
    error.value = 'Failed to send inform to ACS server';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchConfig);
</script>

<template>
  <div class="tr069-config">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>

    <form v-else-if="config" @submit.prevent="handleApply">
      <div class="form-group">
        <div class="switch-label">
          <span>{{ t('device.enableCWMP') }}</span>
          <label class="switch">
            <input
              type="checkbox"
              v-model="config.EnableCWMP"
              :true-value="1"
              :false-value="0"
            >
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label>{{ t('device.acsUrl') }}</label>
        <input
          type="text"
          v-model="config.URL"
          required
        />
      </div>

      <div class="form-group">
        <label>{{ t('device.connectionRequestUrl') }}</label>
        <input
          type="text"
          v-model="config.ConnectionRequestURL"
          disabled
        />
      </div>

      <div class="credentials-section">
        <h3>{{ t('device.acsCredentials') }}</h3>
        <div class="form-group">
          <label>{{ t('device.username') }}</label>
          <input
            type="text"
            v-model="config.Username"
            required
          />
        </div>
        <div class="form-group">
          <label>{{ t('device.password') }}</label>
          <div class="password-input">
            <input
              :type="showPassword.acs ? 'text' : 'password'"
              v-model="config.Password"
              required
            />
            <button 
              type="button"
              class="toggle-password"
              @click="showPassword.acs = !showPassword.acs"
            >
              <span class="material-icons">
                {{ showPassword.acs ? 'visibility_off' : 'visibility' }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div class="credentials-section">
        <h3>{{ t('device.connectionRequestCredentials') }}</h3>
        <div class="form-group">
          <label>{{ t('device.username') }}</label>
          <input
            type="text"
            v-model="config.ConnectionRequestUsername"
            required
          />
        </div>
        <div class="form-group">
          <label>{{ t('device.password') }}</label>
          <div class="password-input">
            <input
              :type="showPassword.connection ? 'text' : 'password'"
              v-model="config.ConnectionRequestPassword"
              required
            />
            <button 
              type="button"
              class="toggle-password"
              @click="showPassword.connection = !showPassword.connection"
            >
              <span class="material-icons">
                {{ showPassword.connection ? 'visibility_off' : 'visibility' }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div class="form-group">
        <div class="switch-label">
          <span>{{ t('device.enablePeriodicInform') }}</span>
          <label class="switch">
            <input
              type="checkbox"
              v-model="config.PeriodicInformEnable"
              :true-value="1"
              :false-value="0"
            >
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="form-group" v-if="config.PeriodicInformEnable">
        <label>{{ t('device.periodicInformInterval') }}</label>
        <input
          type="number"
          v-model="config.PeriodicInformInterval"
          required
          min="1"
        />
      </div>

      <div class="button-group">
        <button type="button" class="btn btn-secondary" @click="fetchConfig">
          {{ t('common.cancel') }}
        </button>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ t('common.apply') }}
        </button>
        <button 
          type="button" 
          class="btn btn-primary"
          @click="handleSendInform"
          :disabled="loading || !config.EnableCWMP"
        >
          {{ t('device.sendInform') }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.tr069-config {
  padding: 1.5rem;
}

.credentials-section {
  margin: 2rem 0;
  padding: 1.5rem;
  background-color: var(--bg-secondary);
  border-radius: 4px;
}

.credentials-section h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
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

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}

input:disabled {
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

.toggle-password:hover {
  color: var(--text-primary);
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
  color: var(--text-secondary);
}

.error-state {
  padding: 2rem;
  text-align: center;
  color: #dc3545;
}

@media (max-width: 768px) {
  .tr069-config {
    padding: 1rem;
  }

  .credentials-section {
    padding: 1rem;
    margin: 1.5rem 0;
  }

  .button-group {
    flex-direction: column;
  }

  .button-group .btn {
    width: 100%;
  }
}
</style>