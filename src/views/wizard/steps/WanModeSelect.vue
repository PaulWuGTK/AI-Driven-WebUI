<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { WizardConfig, WizardData } from '../../../types/wizard';

interface Props {
  config: WizardConfig;
  wizardData: WizardData | null;
}

defineProps<Props>();
defineEmits(['next', 'prev']);
const { t } = useI18n();
</script>

<template>
  <div class="step-container">
    <div class="step-card">
      <h1 class="step-title">{{ t('wizard.wanModeTitle') }}</h1>
      <p class="step-subtitle">{{ t('wizard.wanModeSubtitle') }}</p>

      <div class="progress-bar">
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step"></div>
        <div class="progress-step"></div>
        <div class="progress-step"></div>
      </div>

      <div class="form-group">
        <label for="wan-mode">{{ t('wizard.wanModeLabel') }} <span class="required">*</span></label>
        <select id="wan-mode" v-model="config.wan.wanMode" class="form-select">
          <option v-for="mode in wizardData?.Wan.WANModeList" :key="mode" :value="mode">
            {{ mode.replace(/_/g, ' ') }}
          </option>
        </select>
        <p class="help-text">{{ t('wizard.wanModeHelp') }}</p>
      </div>

      <div class="info-box" v-if="0">
        <h4>{{ t('wizard.wanModeInfoTitle') }}</h4>
        <ul>
          <li><strong>DHCP:</strong> {{ t('wizard.wanModeDhcp') }}</li>
          <li><strong>PPP:</strong> {{ t('wizard.wanModePpp') }}</li>
          <li><strong>Bridged:</strong> {{ t('wizard.wanModeBridged') }}</li>
          <li><strong>Cellular:</strong> {{ t('wizard.wanModeCellular') }}</li>
        </ul>
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

.form-group {
  margin-bottom: 2rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.form-select:focus {
  outline: none;
  border-color: #0078d4;
  box-shadow: 0 0 0 3px rgba(0, 120, 212, 0.1);
}

.help-text {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #666;
}

.required {
  color: #ff0000;
  margin-left: 2px;
}

.info-box {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.info-box h4 {
  color: #333;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.info-box ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-box li {
  color: #666;
  padding: 0.5rem 0;
  line-height: 1.5;
}

.info-box strong {
  color: #333;
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
