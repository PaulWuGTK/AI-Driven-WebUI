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
    props.config.wifi.bands['2g'].ssid = props.config.wifi.common.ssid;
    props.config.wifi.bands['5g'].ssid = props.config.wifi.common.ssid;
    props.config.wifi.bands['6g'].ssid = props.config.wifi.common.ssid;
    props.config.wifi.bands['2g'].security = props.config.wifi.common.security;
    props.config.wifi.bands['5g'].security = props.config.wifi.common.security;
    props.config.wifi.bands['6g'].security = props.config.wifi.common.security;
    props.config.wifi.bands['2g'].password = '';
    props.config.wifi.bands['5g'].password = '';
    props.config.wifi.bands['6g'].password = '';
  } else {
    props.config.wifi.mloEnable = false;
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
        <div class="progress-step"></div>
        <div class="progress-step"></div>
        <div class="progress-step"></div>
      </div>

      <div class="settings-section">
        <div class="toggle-row">
          <label class="toggle-label">
            <span>{{ t('wizard.smartConnect') }}</span>
            <span class="info-icon" :title="t('wizard.smartConnectTooltip')">ℹ️</span>
          </label>
          <label class="toggle-switch">
            <input type="checkbox" v-model="config.wifi.smartConnect" />
            <span class="slider"></span>
          </label>
        </div>

        <div class="toggle-row">
          <label class="toggle-label">
            <span>{{ t('wizard.mloNetwork') }}</span>
            <span class="info-icon" :title="t('wizard.mloTooltip')">ℹ️</span>
          </label>
          <label class="toggle-switch">
            <input type="checkbox" v-model="config.wifi.mloEnable" :disabled="!config.wifi.smartConnect" />
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div v-if="config.wifi.smartConnect" class="form-container">
        <div class="form-group">
          <label>SSID <span class="required">*</span></label>
          <input
            type="text"
            v-model="config.wifi.common.ssid"
            placeholder="Enter network name"
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <label>Security Type <span class="required">*</span></label>
          <select v-model="config.wifi.common.security" class="form-select">
            <option v-for="option in commonSecurityOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Password <span class="required">*</span></label>
          <div class="password-input">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="config.wifi.common.password"
              placeholder="8–63 chars, letters & numbers, no repeats"
              class="form-input"
              minlength="8"
              maxlength="63"
              required
            />
            <button type="button" class="password-toggle" @click="showPassword = !showPassword">
              <span class="material-icons">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
            </button>
          </div>
          <p class="help-text">8–63 characters, letters & numbers, no repeats</p>
        </div>
      </div>

      <div v-else class="bands-container">
        <div class="band-section">
          <h3>2.4GHz Wireless Network</h3>
          <div class="band-toggle">
            <label>Enable 2.4GHz Wi-Fi</label>
            <label class="toggle-switch">
              <input type="checkbox" v-model="config.wifi.bands['2g'].enabled" />
              <span class="slider"></span>
            </label>
          </div>
          <div v-if="config.wifi.bands['2g'].enabled" class="band-fields">
            <div class="form-group">
              <label>SSID</label>
              <input type="text" v-model="config.wifi.bands['2g'].ssid" class="form-input" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Security Type</label>
                <select v-model="config.wifi.bands['2g'].security" class="form-select">
                  <option v-for="option in band2gSecurityOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Password</label>
                <input
                  type="password"
                  v-model="config.wifi.bands['2g'].password"
                  class="form-input"
                  placeholder="8–63 chars"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="band-section">
          <h3>5GHz Wireless Network</h3>
          <div class="band-toggle">
            <label>Enable 5GHz Wi-Fi</label>
            <label class="toggle-switch">
              <input type="checkbox" v-model="config.wifi.bands['5g'].enabled" />
              <span class="slider"></span>
            </label>
          </div>
          <div v-if="config.wifi.bands['5g'].enabled" class="band-fields">
            <div class="form-group">
              <label>SSID</label>
              <input type="text" v-model="config.wifi.bands['5g'].ssid" class="form-input" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Security Type</label>
                <select v-model="config.wifi.bands['5g'].security" class="form-select">
                  <option v-for="option in band5gSecurityOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Password</label>
                <input
                  type="password"
                  v-model="config.wifi.bands['5g'].password"
                  class="form-input"
                  placeholder="8–63 chars"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="band-section">
          <h3>6GHz Wireless Network</h3>
          <div class="band-toggle">
            <label>Enable 6GHz Wi-Fi</label>
            <label class="toggle-switch">
              <input type="checkbox" v-model="config.wifi.bands['6g'].enabled" />
              <span class="slider"></span>
            </label>
          </div>
          <div v-if="config.wifi.bands['6g'].enabled" class="band-fields">
            <div class="form-group">
              <label>SSID</label>
              <input type="text" v-model="config.wifi.bands['6g'].ssid" class="form-input" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Security Type</label>
                <select v-model="config.wifi.bands['6g'].security" class="form-select">
                  <option v-for="option in band6gSecurityOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Password</label>
                <input
                  type="password"
                  v-model="config.wifi.bands['6g'].password"
                  class="form-input"
                  placeholder="8–63 chars"
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
            <span class="info-icon" :title="t('wizard.pscTooltip')">ℹ️</span>
          </label>
          <label class="toggle-switch">
            <input type="checkbox" v-model="config.wifi.psc" />
            <span class="slider"></span>
          </label>
        </div>

        <div class="toggle-row">
          <label class="toggle-label">
            <span>{{ t('wizard.pmf') }}</span>
            <span class="info-icon" :title="t('wizard.pmfTooltip')">ℹ️</span>
          </label>
          <label class="toggle-switch">
            <input type="checkbox" v-model="config.wifi.pmf" />
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="button-container">
        <button class="btn-secondary" @click="$emit('prev')">{{ t('common.back') }}</button>
        <button class="btn-primary" @click="$emit('next')">{{ t('common.next') }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step-container {
  width: 100%;
  max-width: 900px;
}

.step-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
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

.info-icon {
  cursor: help;
  font-size: 1rem;
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
