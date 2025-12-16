<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WizardConfig } from '../../../types/wizard';

interface Props {
  config: WizardConfig;
}

const props = defineProps<Props>();
defineEmits(['next', 'prev']);

const { t } = useI18n();
const showPassword = ref(false);

const savedBandPasswords = ref({
  '2g': '',
  '5g': '',
  '6g': ''
});

const commonSecurityOptions = computed(() => {
  if (props.config.wifi.common.securityOptions.length > 0) {
    return props.config.wifi.common.securityOptions.map(opt => ({ value: opt, label: opt }));
  }
  return [
    { value: 'WPA3-Personal', label: 'WPA3-Personal' },
    { value: 'WPA2-Personal', label: 'WPA2-Personal' },
    { value: 'WPA2/WPA3-Personal', label: 'WPA2/WPA3-Personal' }
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

watch(() => props.config.wifi.smartConnect, (isEnabled) => {
  if (isEnabled) {
    savedBandPasswords.value['2g'] = props.config.wifi.bands['2g'].password;
    savedBandPasswords.value['5g'] = props.config.wifi.bands['5g'].password;
    savedBandPasswords.value['6g'] = props.config.wifi.bands['6g'].password;

    props.config.wifi.bands['2g'].ssid = props.config.wifi.common.ssid;
    props.config.wifi.bands['5g'].ssid = props.config.wifi.common.ssid;
    props.config.wifi.bands['6g'].ssid = props.config.wifi.common.ssid;
    props.config.wifi.bands['2g'].security = props.config.wifi.common.security;
    props.config.wifi.bands['5g'].security = props.config.wifi.common.security;
    props.config.wifi.bands['6g'].security = props.config.wifi.common.security;
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
    props.config.wifi.bands['2g'].security = newSecurity;
    props.config.wifi.bands['5g'].security = newSecurity;
    props.config.wifi.bands['6g'].security = newSecurity;
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
          <label class="toggle-switch">
            <input type="checkbox" v-model="config.wifi.smartConnect" />
            <span class="slider"></span>
          </label>
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
          <label class="toggle-switch">
            <input type="checkbox" v-model="config.wifi.mloEnable" :disabled="!config.wifi.smartConnect" />
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div v-if="config.wifi.smartConnect" class="form-container">
        <div class="form-group">
          <label>{{ t('wizard.ssid') }} <span class="required">*</span></label>
          <input
            type="text"
            v-model="config.wifi.common.ssid"
            :placeholder="t('wizard.ssidPlaceholder')"
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <label>{{ t('wizard.securityType') }} <span class="required">*</span></label>
          <select v-model="config.wifi.common.security" class="form-select">
            <option v-for="option in commonSecurityOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <p v-if="showWpa3Warning" class="warning-text">{{ t('wizard.wpa3Warning') }}</p>
        </div>

        <div class="form-group">
          <label>{{ t('wizard.passwordLabel') }} <span class="required">*</span></label>
          <div class="password-input">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="config.wifi.common.password"
              :placeholder="t('wizard.passwordPlaceholderWifi')"
              class="form-input"
              minlength="8"
              maxlength="63"
              required
            />
            <button type="button" class="password-toggle" @click="showPassword = !showPassword">
              <span class="material-icons">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
            </button>
          </div>
          <p class="help-text">{{ t('wizard.passwordHelpText') }}</p>
        </div>
      </div>

      <div v-else class="bands-container">
        <div class="band-section">
          <h3>{{ t('wizard.band24ghz') }}</h3>
          <div class="band-toggle">
            <label>{{ t('wizard.enable24ghz') }}</label>
            <label class="toggle-switch">
              <input type="checkbox" v-model="config.wifi.bands['2g'].enabled" />
              <span class="slider"></span>
            </label>
          </div>
          <div v-if="config.wifi.bands['2g'].enabled" class="band-fields">
            <div class="form-group">
              <label>{{ t('wizard.ssid') }}</label>
              <input type="text" v-model="config.wifi.bands['2g'].ssid" class="form-input" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('wizard.securityType') }}</label>
                <select v-model="config.wifi.bands['2g'].security" class="form-select">
                  <option v-for="option in band2gSecurityOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>{{ t('wizard.passwordLabel') }}</label>
                <input
                  type="password"
                  v-model="config.wifi.bands['2g'].password"
                  class="form-input"
                  :placeholder="t('wizard.passwordPlaceholderShort')"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="band-section">
          <h3>{{ t('wizard.band5ghz') }}</h3>
          <div class="band-toggle">
            <label>{{ t('wizard.enable5ghz') }}</label>
            <label class="toggle-switch">
              <input type="checkbox" v-model="config.wifi.bands['5g'].enabled" />
              <span class="slider"></span>
            </label>
          </div>
          <div v-if="config.wifi.bands['5g'].enabled" class="band-fields">
            <div class="form-group">
              <label>{{ t('wizard.ssid') }}</label>
              <input type="text" v-model="config.wifi.bands['5g'].ssid" class="form-input" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('wizard.securityType') }}</label>
                <select v-model="config.wifi.bands['5g'].security" class="form-select">
                  <option v-for="option in band5gSecurityOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>{{ t('wizard.passwordLabel') }}</label>
                <input
                  type="password"
                  v-model="config.wifi.bands['5g'].password"
                  class="form-input"
                  :placeholder="t('wizard.passwordPlaceholderShort')"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="band-section">
          <h3>{{ t('wizard.band6ghz') }}</h3>
          <div class="band-toggle">
            <label>{{ t('wizard.enable6ghz') }}</label>
            <label class="toggle-switch">
              <input type="checkbox" v-model="config.wifi.bands['6g'].enabled" />
              <span class="slider"></span>
            </label>
          </div>
          <div v-if="config.wifi.bands['6g'].enabled" class="band-fields">
            <div class="form-group">
              <label>{{ t('wizard.ssid') }}</label>
              <input type="text" v-model="config.wifi.bands['6g'].ssid" class="form-input" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('wizard.securityType') }}</label>
                <select v-model="config.wifi.bands['6g'].security" class="form-select">
                  <option v-for="option in band6gSecurityOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>{{ t('wizard.passwordLabel') }}</label>
                <input
                  type="password"
                  v-model="config.wifi.bands['6g'].password"
                  class="form-input"
                  :placeholder="t('wizard.passwordPlaceholderShort')"
                />
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
          <label class="toggle-switch">
            <input type="checkbox" v-model="config.wifi.psc" />
            <span class="slider"></span>
          </label>
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
          <label class="toggle-switch">
            <input type="checkbox" v-model="config.wifi.pmf" />
            <span class="slider"></span>
          </label>
        </div>
      </div>

    </div>

    <div class="button-container">
      <button class="btn-secondary" @click="$emit('prev')">{{ t('common.back') }}</button>
      <button class="btn-primary" @click="$emit('next')">{{ t('common.next') }}</button>
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

.toggle-switch {
  position: relative;
  width: 60px;
  height: 32px;
}

.toggle-switch input {
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
  transition: 0.4s;
  border-radius: 32px;
}

.slider:before {
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

input:checked + .slider {
  background-color: #0078d4;
}

input:checked + .slider:before {
  transform: translateX(28px);
}

input:disabled + .slider {
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

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
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

.btn-secondary {
  background: white;
  color: #0078d4;
  border: 1px solid #0078d4;
  border-radius: 4px;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f0f8ff;
}

.btn-primary {
  background: #0078d4;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background: #006abd;
}
</style>
