<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ActionButtons, BaseSecretInput, BaseSwitch } from '../../../components/common';
import BaseInput from '../../../components/common/BaseInput.vue';
import { useQA } from '../../../utils/qa';
import { validateSsid, getByteLength, normalizeSsid, truncateToByteLength, SSID_MAX_BYTES } from '../../../utils/ssidValidation';
import type { WizardConfig } from '../../../types/wizard';

interface Props {
  config: WizardConfig;
}

const props = defineProps<Props>();
const emit = defineEmits(['next', 'prev']);

const { t } = useI18n();
const { qa } = useQA();

const savedBandPasswords = ref({
  '2g': '',
  '5g': '',
  '6g': ''
});

const SECURITY_FALLBACK_PRIORITY = [
  'WPA3-Personal',
  'WPA2-WPA3-Personal',
  'WPA2/WPA3-Personal',
  'WPA2-Personal',
  'OWE',
  'None'
];

const pickValidSecurityMode = (requested: string, options: string[]): string => {
  if (!options || options.length === 0) {
    return requested;
  }

  if (options.includes(requested)) {
    return requested;
  }

  const priorityMatch = SECURITY_FALLBACK_PRIORITY.find((mode) => options.includes(mode));
  return priorityMatch ?? options[0];
};

const syncBandSecurityFromCommon = (commonSecurity: string) => {
  props.config.wifi.bands['2g'].security = pickValidSecurityMode(commonSecurity, props.config.wifi.bands['2g'].securityOptions);
  props.config.wifi.bands['5g'].security = pickValidSecurityMode(commonSecurity, props.config.wifi.bands['5g'].securityOptions);
  props.config.wifi.bands['6g'].security = pickValidSecurityMode(commonSecurity, props.config.wifi.bands['6g'].securityOptions);
};

const commonSecurityOptions = computed(() => {
  if (props.config.wifi.common.securityOptions.length > 0) {
    return props.config.wifi.common.securityOptions.map(opt => ({ value: opt, label: opt }));
  }
  return [
    { value: 'WPA3-Personal', label: 'WPA3-Personal' },
    { value: 'WPA2-Personal', label: 'WPA2-Personal' },
    { value: 'WPA2-WPA3-Personal', label: 'WPA2-WPA3-Personal' }
  ];
});

const band2gSecurityOptions = computed(() => {
  if (props.config.wifi.bands['2g'].securityOptions.length > 0) {
    return props.config.wifi.bands['2g'].securityOptions.map(opt => ({ value: opt, label: opt }));
  }
  return commonSecurityOptions.value;
});

const band5gSecurityOptions = computed(() => {
  if (props.config.wifi.bands['5g'].securityOptions.length > 0) {
    return props.config.wifi.bands['5g'].securityOptions.map(opt => ({ value: opt, label: opt }));
  }
  return commonSecurityOptions.value;
});

const band6gSecurityOptions = computed(() => {
  if (props.config.wifi.bands['6g'].securityOptions.length > 0) {
    return props.config.wifi.bands['6g'].securityOptions.map(opt => ({ value: opt, label: opt }));
  }
  return commonSecurityOptions.value;
});

// When Mesh is enabled, enforce Smart Connect (Common SSID) on
watch(() => props.config.mesh.enable, (meshEnabled) => {
  if (meshEnabled) {
    props.config.wifi.smartConnect = true;
  }
}, { immediate: true });

watch(() => props.config.wifi.smartConnect, (isEnabled) => {
  if (isEnabled) {
    savedBandPasswords.value['2g'] = props.config.wifi.bands['2g'].password;
    savedBandPasswords.value['5g'] = props.config.wifi.bands['5g'].password;
    savedBandPasswords.value['6g'] = props.config.wifi.bands['6g'].password;

    props.config.wifi.bands['2g'].ssid = props.config.wifi.common.ssid;
    props.config.wifi.bands['5g'].ssid = props.config.wifi.common.ssid;
    props.config.wifi.bands['6g'].ssid = props.config.wifi.common.ssid;
    syncBandSecurityFromCommon(props.config.wifi.common.security);
    props.config.wifi.bands['2g'].password = savedBandPasswords.value['2g'];
    props.config.wifi.bands['5g'].password = savedBandPasswords.value['5g'];
    props.config.wifi.bands['6g'].password = savedBandPasswords.value['6g'];
  } else {
    props.config.wifi.mloEnable = false;

    if (savedBandPasswords.value['2g']) {
      props.config.wifi.bands['2g'].password = savedBandPasswords.value['2g'];
    }
    if (savedBandPasswords.value['5g']) {
      props.config.wifi.bands['5g'].password = savedBandPasswords.value['5g'];
    }
    if (savedBandPasswords.value['6g']) {
      props.config.wifi.bands['6g'].password = savedBandPasswords.value['6g'];
    }
  }
});

watch(() => props.config.wifi.common.ssid, (newSsid) => {
  if (props.config.wifi.smartConnect) {
    props.config.wifi.bands['2g'].ssid = newSsid;
    props.config.wifi.bands['5g'].ssid = newSsid;
    props.config.wifi.bands['6g'].ssid = newSsid;
  }
});

watch(() => props.config.wifi.common.security, (newSecurity) => {
  if (props.config.wifi.smartConnect) {
    syncBandSecurityFromCommon(newSecurity);
  }
});

watch(() => props.config.wifi.bands['2g'].enabled, (enabled) => {
  if (!enabled && props.config.wifi.bands['2g'].password) {
    savedBandPasswords.value['2g'] = props.config.wifi.bands['2g'].password;
  } else if (enabled && savedBandPasswords.value['2g']) {
    props.config.wifi.bands['2g'].password = savedBandPasswords.value['2g'];
  }
});

watch(() => props.config.wifi.bands['5g'].enabled, (enabled) => {
  if (!enabled && props.config.wifi.bands['5g'].password) {
    savedBandPasswords.value['5g'] = props.config.wifi.bands['5g'].password;
  } else if (enabled && savedBandPasswords.value['5g']) {
    props.config.wifi.bands['5g'].password = savedBandPasswords.value['5g'];
  }
});

watch(() => props.config.wifi.bands['6g'].enabled, (enabled) => {
  if (!enabled && props.config.wifi.bands['6g'].password) {
    savedBandPasswords.value['6g'] = props.config.wifi.bands['6g'].password;
  } else if (enabled && savedBandPasswords.value['6g']) {
    props.config.wifi.bands['6g'].password = savedBandPasswords.value['6g'];
  }
});

const showWpa3Warning = computed(() => {
  return props.config.wifi.smartConnect &&
         props.config.wifi.common.security &&
         (props.config.wifi.common.security.indexOf('WPA2') !== -1);
});

const securityRequiresPassword = (securityMode?: string): boolean => {
  const normalized = String(securityMode || '').trim().toLowerCase();
  return normalized !== 'none' && normalized !== 'open' && normalized !== 'owe';
};

const isWpa3OnlyPersonal = (securityMode?: string): boolean => {
  const mode = String(securityMode ?? '').toUpperCase();
  return mode.includes('WPA3') && !mode.includes('WPA2') && !mode.includes('TRANSITION');
};

const isPrintableAscii = (value: string): boolean => /^[\x20-\x7E]*$/.test(value);
const isHex64 = (value: string): boolean => /^[0-9a-fA-F]{64}$/.test(value);

const ssidErrors = reactive<Record<string, string>>({});
const ssidByteLengths = reactive<Record<string, number>>({});

const validateSsidField = (ssid: string, key: string): boolean => {
  const validation = validateSsid(ssid, t);
  ssidByteLengths[key] = validation.byteLength;
  if (!validation.isValid) {
    ssidErrors[key] = validation.errorMessage || '';
  } else {
    delete ssidErrors[key];
  }
  return validation.isValid;
};

const handleSsidInput = (value: string, key: string, callback: (val: string) => void) => {
  const normalizedValue = normalizeSsid(value);
  const byteLength = getByteLength(normalizedValue);
  if (byteLength <= SSID_MAX_BYTES) {
    callback(normalizedValue);
    validateSsidField(normalizedValue, key);
  } else {
    const truncated = truncateToByteLength(normalizedValue, SSID_MAX_BYTES);
    callback(truncated);
    validateSsidField(truncated, key);
  }
};

const passwordErrors = reactive<Record<string, string>>({});

const validatePassword = (password: string, key: string, securityMode?: string): boolean => {
  if (!securityRequiresPassword(securityMode)) {
    delete passwordErrors[key];
    return true;
  }

  const value = String(password ?? '');

  if (value.length > 0 && value.charAt(0) === ' ') {
    passwordErrors[key] = t('wireless.passwordLeadingSpace');
    return false;
  }

  const wpa3Only = isWpa3OnlyPersonal(securityMode);
  const valid = wpa3Only
    ? isPrintableAscii(value) && value.length >= 1 && value.length <= 64
    : isPrintableAscii(value) && ((value.length >= 8 && value.length <= 63) || (value.length === 64 && isHex64(value)));

  if (!valid) {
    passwordErrors[key] = t(
      wpa3Only ? 'wireless.passwordInvalidFormatWpa3' : 'wireless.passwordInvalidFormat'
    );
    return false;
  }

  delete passwordErrors[key];
  return true;
};

const handleNext = () => {
  Object.keys(passwordErrors).forEach((key) => delete passwordErrors[key]);
  Object.keys(ssidErrors).forEach((key) => delete ssidErrors[key]);
  let valid = true;

  if (props.config.wifi.smartConnect) {
    valid = validateSsidField(props.config.wifi.common.ssid, 'common') && valid;
    if (securityRequiresPassword(props.config.wifi.common.security)) {
      valid = validatePassword(props.config.wifi.common.password, 'common', props.config.wifi.common.security) && valid;
    }
  } else {
    const bands = ['2g', '5g', '6g'] as const;
    for (const band of bands) {
      const bandConfig = props.config.wifi.bands[band];
      if (bandConfig.enabled) {
        valid = validateSsidField(bandConfig.ssid, band) && valid;
        if (securityRequiresPassword(bandConfig.security)) {
          valid = validatePassword(bandConfig.password, band, bandConfig.security) && valid;
        }
      }
    }
  }

  if (valid) {
    emit('next');
  }
};
</script>

<template>
  <div class="step-container">
    <div class="step-card">
      <h1 class="step-title">{{ t('wizard.wifiTitle') }}</h1>
      <p class="step-subtitle">{{ t('wizard.wifiSubtitle') }}</p>

      <div class="progress-bar">
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step"></div>
        <div class="progress-step"></div>
      </div>

      <div class="settings-section">
        <div class="toggle-row">
          <label class="toggle-label">
            <span>{{ t('wizard.smartConnect') }}</span>
            <span class="tooltip-wrapper">
              <span class="info-icon">
              </span>
              <span class="tooltip-box">{{ t('wizard.smartConnectTooltip') }}</span>
            </span>
          </label>
          <BaseSwitch
            v-model="config.wifi.smartConnect"
            class="toggle-switch"
            :disabled="config.mesh.enable"
            :data-testid="qa('wizard-wifi-smart-connect-toggle')"
            :slider-data-testid="qa('wizard-wifi-smart-connect-toggle-slider')"
          />
        </div>

        <div class="toggle-row">
          <label class="toggle-label">
            <span>{{ t('wizard.mloNetwork') }}</span>
            <span class="tooltip-wrapper">
              <span class="info-icon">
              </span>
              <span class="tooltip-box">{{ t('wizard.mloTooltip') }}</span>
            </span>
          </label>
          <BaseSwitch
            v-model="config.wifi.mloEnable"
            class="toggle-switch"
            :disabled="!config.wifi.smartConnect"
            :data-testid="qa('wizard-wifi-mlo-toggle')"
            :slider-data-testid="qa('wizard-wifi-mlo-toggle-slider')"
          />
        </div>

        <div v-if="config.mesh.enable" class="enforce-hint" :data-testid="qa('wizard-wifi-mesh-enforce-hint')">
          <span class="material-icons enforce-hint-icon">info</span>
          <span>{{ t('wizard.meshEnforcesCommonSsid') }}</span>
        </div>
      </div>

      <div v-if="config.wifi.smartConnect" class="form-container">
        <div class="form-group">
          <BaseInput
            :modelValue="config.wifi.common.ssid"
            :label="t('wizard.ssid')"
            :placeholder="t('wizard.ssidPlaceholder')"
            :error="!!ssidErrors['common']"
            :errorMessage="ssidErrors['common']"
            :helpText="ssidByteLengths['common'] !== undefined ? t('wireless.ssidBytesInfo', { bytes: ssidByteLengths['common'] }) : ''"
            :data-testid="qa('wizard-wifi-common-ssid-input')"
            required
            @update:modelValue="(v) => handleSsidInput(String(v), 'common', (val) => { config.wifi.common.ssid = val; })"
          />
        </div>

        <div class="form-group">
          <label>{{ t('wizard.securityType') }} <span class="required">*</span></label>
          <select v-model="config.wifi.common.security" class="form-select" :data-testid="qa('wizard-wifi-common-security-select')">
            <option v-for="option in commonSecurityOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <p v-if="showWpa3Warning" class="warning-text">{{ t('wizard.wpa3Warning') }}</p>
        </div>

        <div
          v-if="securityRequiresPassword(config.wifi.common.security)"
          class="form-group"
        >
          <label>{{ t('wizard.passwordLabel') }} <span class="required">*</span></label>
          <BaseSecretInput
            v-model="config.wifi.common.password"
            :placeholder="t('wizard.passwordPlaceholderWifi')"
            :input-data-testid="qa('wizard-wifi-common-password-input')"
            :toggle-data-testid="qa('wizard-wifi-common-password-toggle')"
            :max-length="63"
          />
          <p v-if="passwordErrors['common']" class="error-text" :data-testid="qa('wizard-wifi-common-password-error')">{{ passwordErrors['common'] }}</p>
          <p class="help-text">{{ t('wizard.passwordHelpText') }}</p>
        </div>
      </div>

      <div v-else class="bands-container">
        <div class="band-section">
          <h3>{{ t('wizard.band24ghz') }}</h3>
          <div class="band-toggle">
            <label>{{ t('wizard.enable24ghz') }}</label>
            <BaseSwitch
              v-model="config.wifi.bands['2g'].enabled"
              class="toggle-switch"
              :data-testid="qa('wizard-wifi-band-2g-enable-toggle')"
              :slider-data-testid="qa('wizard-wifi-band-2g-enable-toggle-slider')"
            />
          </div>
          <div v-if="config.wifi.bands['2g'].enabled" class="band-fields">
            <div class="form-group">
              <BaseInput
                :modelValue="config.wifi.bands['2g'].ssid"
                :label="t('wizard.ssid')"
                :error="!!ssidErrors['2g']"
                :errorMessage="ssidErrors['2g']"
                :helpText="ssidByteLengths['2g'] !== undefined ? t('wireless.ssidBytesInfo', { bytes: ssidByteLengths['2g'] }) : ''"
                :data-testid="qa('wizard-wifi-band-2g-ssid-input')"
                @update:modelValue="(v) => handleSsidInput(String(v), '2g', (val) => { config.wifi.bands['2g'].ssid = val; })"
              />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('wizard.securityType') }}</label>
                <select v-model="config.wifi.bands['2g'].security" class="form-select" :data-testid="qa('wizard-wifi-band-2g-security-select')">
                  <option v-for="option in band2gSecurityOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
              <div
                v-if="securityRequiresPassword(config.wifi.bands['2g'].security)"
                class="form-group"
              >
                <label>{{ t('wizard.passwordLabel') }}</label>
                <BaseSecretInput
                  v-model="config.wifi.bands['2g'].password"
                  :placeholder="t('wizard.passwordPlaceholderShort')"
                  :input-data-testid="qa('wizard-wifi-band-2g-password-input')"
                  :toggle-data-testid="qa('wizard-wifi-band-2g-password-toggle')"
                />
                <p v-if="passwordErrors['2g']" class="error-text" :data-testid="qa('wizard-wifi-band-2g-password-error')">{{ passwordErrors['2g'] }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="band-section">
          <h3>{{ t('wizard.band5ghz') }}</h3>
          <div class="band-toggle">
            <label>{{ t('wizard.enable5ghz') }}</label>
            <BaseSwitch
              v-model="config.wifi.bands['5g'].enabled"
              class="toggle-switch"
              :data-testid="qa('wizard-wifi-band-5g-enable-toggle')"
              :slider-data-testid="qa('wizard-wifi-band-5g-enable-toggle-slider')"
            />
          </div>
          <div v-if="config.wifi.bands['5g'].enabled" class="band-fields">
            <div class="form-group">
              <BaseInput
                :modelValue="config.wifi.bands['5g'].ssid"
                :label="t('wizard.ssid')"
                :error="!!ssidErrors['5g']"
                :errorMessage="ssidErrors['5g']"
                :helpText="ssidByteLengths['5g'] !== undefined ? t('wireless.ssidBytesInfo', { bytes: ssidByteLengths['5g'] }) : ''"
                :data-testid="qa('wizard-wifi-band-5g-ssid-input')"
                @update:modelValue="(v) => handleSsidInput(String(v), '5g', (val) => { config.wifi.bands['5g'].ssid = val; })"
              />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('wizard.securityType') }}</label>
                <select v-model="config.wifi.bands['5g'].security" class="form-select" :data-testid="qa('wizard-wifi-band-5g-security-select')">
                  <option v-for="option in band5gSecurityOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
              <div
                v-if="securityRequiresPassword(config.wifi.bands['5g'].security)"
                class="form-group"
              >
                <label>{{ t('wizard.passwordLabel') }}</label>
                <BaseSecretInput
                  v-model="config.wifi.bands['5g'].password"
                  :placeholder="t('wizard.passwordPlaceholderShort')"
                  :input-data-testid="qa('wizard-wifi-band-5g-password-input')"
                  :toggle-data-testid="qa('wizard-wifi-band-5g-password-toggle')"
                />
                <p v-if="passwordErrors['5g']" class="error-text" :data-testid="qa('wizard-wifi-band-5g-password-error')">{{ passwordErrors['5g'] }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="band-section">
          <h3>{{ t('wizard.band6ghz') }}</h3>
          <div class="band-toggle">
            <label>{{ t('wizard.enable6ghz') }}</label>
            <BaseSwitch
              v-model="config.wifi.bands['6g'].enabled"
              class="toggle-switch"
              :data-testid="qa('wizard-wifi-band-6g-enable-toggle')"
              :slider-data-testid="qa('wizard-wifi-band-6g-enable-toggle-slider')"
            />
          </div>
          <div v-if="config.wifi.bands['6g'].enabled" class="band-fields">
            <div class="form-group">
              <BaseInput
                :modelValue="config.wifi.bands['6g'].ssid"
                :label="t('wizard.ssid')"
                :error="!!ssidErrors['6g']"
                :errorMessage="ssidErrors['6g']"
                :helpText="ssidByteLengths['6g'] !== undefined ? t('wireless.ssidBytesInfo', { bytes: ssidByteLengths['6g'] }) : ''"
                :data-testid="qa('wizard-wifi-band-6g-ssid-input')"
                @update:modelValue="(v) => handleSsidInput(String(v), '6g', (val) => { config.wifi.bands['6g'].ssid = val; })"
              />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('wizard.securityType') }}</label>
                <select v-model="config.wifi.bands['6g'].security" class="form-select" :data-testid="qa('wizard-wifi-band-6g-security-select')">
                  <option v-for="option in band6gSecurityOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
              <div
                v-if="securityRequiresPassword(config.wifi.bands['6g'].security)"
                class="form-group"
              >
                <label>{{ t('wizard.passwordLabel') }}</label>
                <BaseSecretInput
                  v-model="config.wifi.bands['6g'].password"
                  :placeholder="t('wizard.passwordPlaceholderShort')"
                  :input-data-testid="qa('wizard-wifi-band-6g-password-input')"
                  :toggle-data-testid="qa('wizard-wifi-band-6g-password-toggle')"
                />
                <p v-if="passwordErrors['6g']" class="error-text" :data-testid="qa('wizard-wifi-band-6g-password-error')">{{ passwordErrors['6g'] }}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div v-if="!config.wifi.smartConnect" class="settings-section" style="margin-top: 1.5rem;">
        <div class="toggle-row">
          <label class="toggle-label">
            <span>{{ t('wizard.psc') }}</span>
            <span class="tooltip-wrapper">
              <span class="info-icon">
              </span>
              <span class="tooltip-box">{{ t('wizard.pscTooltip') }}</span>
            </span>
          </label>
          <BaseSwitch
            v-model="config.wifi.psc"
            class="toggle-switch"
            :data-testid="qa('wizard-wifi-psc-toggle')"
            :slider-data-testid="qa('wizard-wifi-psc-toggle-slider')"
          />
        </div>

        <div class="toggle-row">
          <label class="toggle-label">
            <span>{{ t('wizard.pmf') }}</span>
            <span class="tooltip-wrapper">
              <span class="info-icon">
              </span>
              <span class="tooltip-box">{{ t('wizard.pmfTooltip') }}</span>
            </span>
          </label>
          <BaseSwitch
            v-model="config.wifi.pmf"
            class="toggle-switch"
            :data-testid="qa('wizard-wifi-pmf-toggle')"
            :slider-data-testid="qa('wizard-wifi-pmf-toggle-slider')"
          />
        </div>
      </div>

    </div>

    <div class="button-container">
      <ActionButtons
        class="wizard-actions"
        :cancel-text="t('common.back')"
        :apply-text="t('common.next')"
        cancel-variant="outline"
        :cancel-data-testid="qa('wizard-wifi-back-button')"
        :apply-data-testid="qa('wizard-wifi-next-button')"
        @cancel="$emit('prev')"
        @apply="handleNext"
      />
    </div>
  </div>
</template>

<style scoped>
.step-container {
  width: 100%;
  max-width: 900px;
  min-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.step-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  min-height: 600px;
}

.step-title {
  color: #0078d4;
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.step-subtitle {
  color: #666;
  font-size: 1rem;
  margin-bottom: 2rem;
}

.progress-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 3rem;
}

.progress-step {
  flex: 1;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
}

.progress-step.active {
  background: #0078d4;
}

.settings-section {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #333;
}

.tooltip-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid #636969;
  background-color: transparent;
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s, border-color 0.2s;
}

.info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid #636969;
  background-color: transparent;
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s, border-color 0.2s, color 0.2s;
  color: #636969;   /* 文字顏色（會被 ::before 繼承） */
}

.info-icon:hover {
  background-color: #004F83;
  border-color: #999;
  color: #fff;      /* hover 時變白 */
}

.info-icon::before {
  content: '!';
  font-size: 13px;
  font-weight: bold;
  line-height: 1;
}

.tooltip-box {
  position: absolute;
  left: calc(100% + 10px);  /* 在 icon 右邊 10px */
  top: 50%;                 /* 垂直置中 */
  transform: translateY(-50%);
  width: 260px;
  padding: 12px;
  background-color: #f9f9f9;
  border: 1px solid #004F83;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  font-size: 13px;
  color: #333;
  opacity: 0;
  visibility: hidden;
  z-index: 1000;
  transition: opacity 0.2s, visibility 0.2s;
}

/* 外層：藍色邊的左向三角形 */
.tooltip-box::before {
  content: "";
  position: absolute;
  top: 50%;                        /* 垂直置中 */
  left: 0;                         /* 貼左邊 */
  transform: translate(-100%, -50%);
  border-width: 8px 8px 8px 0;     /* 左向三角形 */
  border-style: solid;
  border-color: transparent #004F83 transparent transparent;
}

/* 內層：白底三角形，做出只有邊框效果 */
.tooltip-box::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  transform: translate(calc(-100% + 1px), -50%);
  border-width: 7px 7px 7px 0;
  border-style: solid;
  border-color: transparent #fff transparent transparent;
}

.tooltip-wrapper:hover .tooltip-box {
  opacity: 1;
  visibility: visible;
}

.enforce-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-basis: 100%;
  margin-top: -1rem;
  padding: 0.5rem 0.75rem;
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 6px;
  color: #856404;
  font-size: 0.85rem;
}

.enforce-hint-icon {
  font-size: 18px;
  color: #856404;
}

.toggle-switch {
  display: inline-flex;
}

.toggle-switch :deep(.switch) {
  position: relative;
  width: 60px;
  height: 32px;
}

.toggle-switch :deep(.switch input) {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-switch :deep(.slider) {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 32px;
}

.toggle-switch :deep(.slider:before) {
  position: absolute;
  content: "";
  height: 24px;
  width: 24px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

.toggle-switch :deep(.switch input:checked + .slider) {
  background-color: #0078d4;
}

.toggle-switch :deep(.switch input:checked + .slider:before) {
  transform: translateX(28px);
}

.toggle-switch :deep(.switch input:disabled + .slider) {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #333;
}

.required {
  color: #dc3545;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: #0078d4;
  box-shadow: 0 0 0 3px rgba(0, 120, 212, 0.1);
}

.form-group :deep(.secret-field) {
  padding: 0.75rem;
  padding-right: 2.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group :deep(.secret-field:focus) {
  outline: none;
  border-color: #0078d4;
  box-shadow: 0 0 0 3px rgba(0, 120, 212, 0.1);
}

.form-select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
}

.form-select:focus {
  outline: none;
  border-color: #0078d4;
  box-shadow: 0 0 0 3px rgba(0, 120, 212, 0.1);
}

.help-text {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
}

.warning-text {
  font-size: 0.85rem;
  color: red;
  margin: 0.5rem 0 0 0;
  font-weight: 500;
}

.error-text {
  font-size: 0.85rem;
  color: #dc3545;
  margin: 0.25rem 0 0 0;
  font-weight: 500;
}

.bands-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.band-section {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  background: #f8f9fa;
}

.band-section h3 {
  color: #333;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.band-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.band-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.advanced-settings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.wizard-actions :deep(.action-buttons) {
  display: flex;
  gap: 1rem;
}

.wizard-actions :deep(.btn) {
  border-radius: 4px;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 500;
}

.wizard-actions :deep(.btn-outline) {
  background: white;
  color: #0078d4;
  border-color: #0078d4;
}

.wizard-actions :deep(.btn-outline:hover:not(:disabled)) {
  background: #f0f8ff;
}

.wizard-actions :deep(.btn-primary) {
  background: #0078d4;
  border-color: #0078d4;
  color: white;
}

.wizard-actions :deep(.btn-primary:hover:not(:disabled)) {
  background: #006abd;
  border-color: #006abd;
}
</style>
