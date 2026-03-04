<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WlanBasicConfig } from '../../../../types/wireless';
import { BaseSecretInput, BaseSwitch } from '../../../../components/common';
import { useQA } from '../../../../utils/qa';
import { validateSsid, getByteLength, normalizeSsid, SSID_MAX_BYTES } from '../../../../utils/ssidValidation';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const props = defineProps<{
  title: string;
  modelValue: WlanBasicConfig;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: WlanBasicConfig): void;
}>();

const ssidError = ref('');
const ssidByteLength = ref(0);

const securityModes = computed(() => 
  (props.modelValue.SecurityModeAvailable ?? '').split(',')
);

const updateConfig = (field: keyof WlanBasicConfig, value: string | number) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value
  });
};

const validateSsidField = (ssid: string) => {
  const validation = validateSsid(ssid, t);
  ssidByteLength.value = validation.byteLength;

  if (!validation.isValid) {
    ssidError.value = validation.errorMessage || '';
  } else {
    ssidError.value = '';
  }

  return validation.isValid;
};

const handleSsidInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const normalizedValue = normalizeSsid(target.value);
  const byteLength = getByteLength(normalizedValue);

  if (byteLength <= SSID_MAX_BYTES) {
    target.value = normalizedValue;
    updateConfig('SSID', normalizedValue);
    validateSsidField(normalizedValue);
  } else {
    // Show error message when exceeding max bytes
    ssidByteLength.value = byteLength;
    ssidError.value = t('wireless.ssidTooLong', { current: byteLength, max: SSID_MAX_BYTES });
    // Revert to previous value
    target.value = props.modelValue.SSID || '';
  }
};

watch(() => props.modelValue.SSID, (newSsid) => {
  validateSsidField(newSsid || '');
}, { immediate: true });
</script>

<template>
  <div class="band-config" :data-testid="qa(`wireless-band-config-${slug(title)}`)">
    <div class="band-header">
      <div class="section-title-sp" :data-testid="qa(`wireless-band-config-title-${slug(title)}`)">{{ title }} {{ t('wireless.settings') }}</div>
    </div>

    <div class="band-content" :data-testid="qa(`wireless-band-config-content-${slug(title)}`)">
      <!-- Only show Enable toggle for individual bands, not for MLO -->
      <div class="form-group" v-if="title !== 'MLO'">
        <div class="switch-label">
          <span :data-testid="qa(`wireless-band-config-enable-label-${slug(title)}`)">{{ t('common.enable') }}</span>
          <BaseSwitch
            :model-value="modelValue.Enable"
            :true-value="1"
            :false-value="0"
            :data-testid="qa(`wireless-band-config-enable-toggle-${slug(title)}`)"
            :slider-data-testid="qa(`wireless-band-config-enable-toggle-slider-${slug(title)}`)"
            @update:model-value="(value) => updateConfig('Enable', Number(value))"
          />
        </div>
      </div>

      <div class="form-group">
        <label :data-testid="qa(`wireless-band-config-ssid-label-${slug(title)}`)">{{ t('wireless.ssid') }}</label>
        <input
          type="text"
          :data-testid="qa(`wireless-band-config-ssid-input-${slug(title)}`)"
          :value="modelValue.SSID"
          :class="{ 'is-invalid': ssidError }"
          @input="handleSsidInput"
          :disabled="title !== 'MLO' && modelValue.Enable === 0"
        />
        <span v-if="ssidError" class="error-message" :data-testid="qa(`wireless-band-config-ssid-error-${slug(title)}`)">
          {{ ssidError }}
        </span>
        <span v-else-if="ssidByteLength > 0" class="help-text" :data-testid="qa(`wireless-band-config-ssid-bytes-${slug(title)}`)">
          {{ t('wireless.ssidBytesInfo', { bytes: ssidByteLength }) }}
        </span>
      </div>

      <div class="form-group">
        <label :data-testid="qa(`wireless-band-config-authentication-label-${slug(title)}`)">{{ t('wireless.authentication') }}</label>
        <select
          :data-testid="qa(`wireless-band-config-authentication-select-${slug(title)}`)"
          :value="modelValue.SecurityMode"
          @change="updateConfig('SecurityMode', ($event.target as HTMLSelectElement).value)"
          :disabled="title !== 'MLO' && modelValue.Enable === 0"
        >
          <option v-for="mode in securityModes" :key="mode" :value="mode" :data-testid="qa(`wireless-band-config-authentication-option-${slug(title)}-${slug(mode)}`)">
            {{ mode }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label :data-testid="qa(`wireless-band-config-password-label-${slug(title)}`)">{{ t('wireless.password') }}</label>
        <BaseSecretInput
          :model-value="modelValue.Password"
          :container-data-testid="qa(`wireless-band-config-password-container-${slug(title)}`)"
          :input-data-testid="qa(`wireless-band-config-password-input-${slug(title)}`)"
          :toggle-data-testid="qa(`wireless-band-config-password-toggle-${slug(title)}`)"
          :disabled="title !== 'MLO' && modelValue.Enable === 0"
          @update:model-value="(value) => updateConfig('Password', value)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.band-config {
  background-color: white;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.2);
}

.band-config:last-child {
  margin-bottom: 0;
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

input.is-invalid {
  border-color: #dc3545;
}

input.is-invalid:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

.error-message {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #dc3545;
}

.help-text {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}


/* Custom switch size (60px ? 34px) for larger prominence */
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

@media (max-width: 768px) {
  .band-header {
    padding: 1rem;
  }

  .band-content {
    padding: 1rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }
}
</style>
