<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TR069Config } from '../../../types/device';
import {
  getTR069Config,
  updateTR069Config,
  sendInformToACS,
  sendBootstrapToACS
} from '../../../services/api/device';
import { ActionButtons, BaseSecretInput, BaseSwitch } from '../../../components/common';
import { useQA } from '../../../utils/qa';

const { qa } = useQA();
const { t } = useI18n();
const config = ref<TR069Config | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

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

const handleSendBootstrap = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await sendBootstrapToACS();
    if (!response.ManagementServer?.OK) {
      throw new Error('Failed to send bootstrap message');
    }
  } catch (err) {
    console.error('Error sending bootstrap:', err);
    error.value = 'Failed to send bootstrap to ACS server';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchConfig);
</script>

<template>
  <div class="tr069-config" :data-testid="qa('tr069-config-content')">
    <div v-if="loading" class="loading-state" :data-testid="qa('tr069-config-loading')">
      <div class="loading-spinner"></div>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="error" class="error-state" :data-testid="qa('tr069-config-error')">
      {{ error }}
    </div>

    <form v-else-if="config" @submit.prevent="handleApply" :data-testid="qa('tr069-config-form')">
      <div class="form-group">
        <div class="switch-label">
          <span :data-testid="qa('tr069-config-enable-cwmp-label')">{{ t('device.enableCWMP') }}</span>
          <BaseSwitch
            v-model="config.EnableCWMP"
            :true-value="1"
            :false-value="0"
            :data-testid="qa('tr069-config-enable-cwmp-toggle')"
            :slider-data-testid="qa('tr069-config-enable-cwmp-slider')"
          />
        </div>
      </div>

      <div class="readonly-section">
        <div class="readonly-row">
          <span class="readonly-label">{{ t('device.sessionStatus') }}</span>
          <span class="readonly-value">{{ config.SessionStatus || '-' }}</span>
        </div>
        <div class="readonly-row">
          <span class="readonly-label">{{ t('device.activeAcsUrl') }}</span>
          <span class="readonly-value">{{ config.URL || '-' }}</span>
        </div>
        <div class="readonly-row">
          <span class="readonly-label">{{ t('device.connectionRequestUrl') }}</span>
          <span class="readonly-value">{{ config.ConnectionRequestURL || '-' }}</span>
        </div>
      </div>

      <div class="credentials-section">
        <h3>{{ t('device.connectionRequestCredentials') }}</h3>
        <div class="readonly-row">
          <span class="readonly-label">{{ t('device.username') }}</span>
          <span class="readonly-value">{{ config.ConnectionRequestUsername || '-' }}</span>
        </div>
        <div class="readonly-row">
          <span class="readonly-label">{{ t('device.password') }}</span>
          <span class="readonly-value">{{ config.ConnectionRequestPassword || '-' }}</span>
        </div>
      </div>

      <div class="profile-grid">
        <div class="credentials-section">
          <h3>{{ t('device.primaryProfile') }}</h3>
          <div class="form-group">
            <label>{{ t('device.acsUrl') }}</label>
            <input v-model="config.PrimaryURL" type="text" required />
          </div>
          <div class="form-group">
            <label>{{ t('device.username') }}</label>
            <input v-model="config.PrimaryUsername" type="text" required />
          </div>
          <div class="form-group">
            <label>{{ t('device.password') }}</label>
            <BaseSecretInput v-model="config.PrimaryPassword" />
          </div>
        </div>

        <div class="credentials-section">
          <h3>{{ t('device.backupProfile') }}</h3>
          <div class="form-group">
            <label>{{ t('device.acsUrl') }}</label>
            <input v-model="config.BackupURL" type="text" required />
          </div>
          <div class="form-group">
            <label>{{ t('device.username') }}</label>
            <input v-model="config.BackupUsername" type="text" required />
          </div>
          <div class="form-group">
            <label>{{ t('device.password') }}</label>
            <BaseSecretInput v-model="config.BackupPassword" />
          </div>
        </div>
      </div>

      <div class="form-group">
        <div class="switch-label">
          <span :data-testid="qa('tr069-config-periodic-inform-enable-label')">{{ t('device.enablePeriodicInform') }}</span>
          <BaseSwitch
            v-model="config.PeriodicInformEnable"
            :true-value="1"
            :false-value="0"
            :data-testid="qa('tr069-config-periodic-inform-enable-toggle')"
            :slider-data-testid="qa('tr069-config-periodic-inform-enable-slider')"
          />
        </div>
      </div>

      <div class="form-group" v-if="config.PeriodicInformEnable">
        <label :data-testid="qa('tr069-config-periodic-inform-interval-label')">{{ t('device.periodicInformInterval') }}</label>
        <input
          type="number"
          :data-testid="qa('tr069-config-periodic-inform-interval-input')"
          v-model="config.PeriodicInformInterval"
          required
          min="1"
        />
      </div>

      <div class="button-group">
        <ActionButtons
          :cancel-data-testid="qa('tr069-config-cancel-button')"
          :apply-data-testid="qa('tr069-config-apply-button')"
          apply-type="submit"
          :cancel-disabled="loading"
          :apply-disabled="loading"
          @cancel="fetchConfig"
        />
        <button
          type="button"
          class="btn btn-primary"
          :data-testid="qa('tr069-config-send-inform-button')"
          @click="handleSendInform"
          :disabled="loading || !config.EnableCWMP"
        >
          {{ t('device.sendInform') }}
        </button>
        <button
          type="button"
          class="btn btn-primary"
          :data-testid="qa('tr069-config-send-bootstrap-button')"
          @click="handleSendBootstrap"
          :disabled="loading || !config.EnableCWMP"
        >
          {{ t('device.sendBootstrap') }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.tr069-config {
  padding: 1.5rem;
}

.readonly-section {
  margin: 1rem 0 1.5rem 0;
}

.readonly-row {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 1rem;
  padding: 0.35rem 0;
}

.readonly-label {
  color: var(--text-primary);
}

.readonly-value {
  color: var(--text-secondary);
  word-break: break-all;
}

.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.credentials-section {
  margin: 1rem 0;
  padding: 1rem;
  background-color: var(--bg-secondary);
  border-radius: 4px;
}

.credentials-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: var(--text-primary);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
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

  .profile-grid {
    grid-template-columns: 1fr;
  }

  .readonly-row {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
}
</style>
