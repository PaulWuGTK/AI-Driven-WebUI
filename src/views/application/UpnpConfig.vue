<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getUpnpSettings, updateUpnpSettings } from '../../services/api/upnp';
import type { UpnpResponse, UpnpUpdateRequest } from '../../types/upnp';
import BlockingOverlay from '../../components/BlockingOverlay.vue';
import { useQA } from '../../utils/qa';

const { isQAMode, qa } = useQA();
const { t } = useI18n();

const loading = ref(false);
const saving = ref(false);
const error = ref<string | null>(null);
const upnpEnable = ref(false);
const selectedInterface = ref('');
const interfaceOptions = ref<Array<{ value: string; label: string }>>([]);

const loadUpnpSettings = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response: UpnpResponse = await getUpnpSettings();
    upnpEnable.value = response.ApplicationUpnp.Enable;
    selectedInterface.value = response.ApplicationUpnp.Interface;

    if (response.ApplicationUpnp.InterfaceOptions) {
      interfaceOptions.value = response.ApplicationUpnp.InterfaceOptions;
    }
  } catch (err) {
    console.error('Failed to load UPnP settings:', err);
    error.value = t('upnp.loadError');
  } finally {
    loading.value = false;
  }
};

const handleApply = async () => {
  saving.value = true;
  error.value = null;

  try {
    const updateData: UpnpUpdateRequest = {
      ApplicationUpnp: {
        Enable: upnpEnable.value,
        Interface: selectedInterface.value
      }
    };

    const response = await updateUpnpSettings(updateData);

    if (response.ApplicationUpnp.status === 'success') {
      await loadUpnpSettings();
    } else {
      error.value = t('upnp.updateError');
    }
  } catch (err) {
    console.error('Failed to update UPnP settings:', err);
    error.value = t('upnp.updateError');
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadUpnpSettings();
});
</script>

<template>
  <div class="page-container">
    <BlockingOverlay :isVisible="saving" :message="t('common.loading')" />

    <h1 class="page-title" :data-testid="qa('upnp-title')">{{ t('upnp.title') }}</h1>

    <div v-if="error" class="error-message" :data-testid="qa('upnp-error')">
      {{ error }}
    </div>

    <div v-if="loading" class="loading-container" :data-testid="qa('upnp-loading')">
      {{ t('common.loading') }}
    </div>

    <div v-else class="status-content">
      <div class="panel-section" :data-testid="qa('upnp-panel')">
        <div class="section-title" :data-testid="qa('upnp-section-title')">{{ t('upnp.title') }}</div>

        <div class="card-content">
          <div class="form-row" :data-testid="qa('upnp-enable-row')">
            <label class="form-label" :data-testid="qa('upnp-enable-label')">{{ t('upnp.enable') }}</label>
            <div class="form-control">
              <label class="switch" :data-testid="qa('upnp-enable-switch')">
                <input
                  type="checkbox"
                  v-model="upnpEnable"
                  :data-testid="qa('upnp-enable-input')"
                />
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <div v-if="upnpEnable" class="form-row" :data-testid="qa('upnp-interface-row')">
            <label class="form-label" :data-testid="qa('upnp-interface-label')">{{ t('upnp.interfaceSelection') }}</label>
            <div class="form-control">
              <select
                v-model="selectedInterface"
                class="form-select"
                :data-testid="qa('upnp-interface-select')"
              >
                <option
                  v-for="option in interfaceOptions"
                  :key="option.value"
                  :value="option.value"
                  :data-testid="qa(`upnp-interface-option-${option.label}`)"
                >
                  {{ option.label.toUpperCase() }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-actions" :data-testid="qa('upnp-actions')">
            <button
              class="btn btn-primary"
              @click="handleApply"
              :disabled="saving"
              :data-testid="qa('upnp-apply-button')"
            >
              {{ t('upnp.apply') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading-container {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.error-message {
  padding: 1rem;
  background-color: #fee;
  color: #dc3545;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 1rem;
  align-items: center;
  padding: 1rem 0;
}

.form-label {
  font-weight: 500;
  color: var(--text-primary);
}

.form-control {
  display: flex;
  align-items: center;
}

.form-select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
  min-width: 200px;
}

.form-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
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
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  min-width: 120px;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .form-label {
    margin-bottom: 0.5rem;
  }
}
</style>
