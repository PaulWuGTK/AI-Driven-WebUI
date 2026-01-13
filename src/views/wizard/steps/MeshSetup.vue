<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useQA } from '../../../utils/qa';
import type { WizardConfig } from '../../../types/wizard';

interface Props {
  config: WizardConfig;
}

defineProps<Props>();
defineEmits(['next', 'prev']);
const { t } = useI18n();
const { qa } = useQA();
</script>

<template>
  <div class="step-container">
    <div class="step-card">
      <h1 class="step-title">{{ t('wizard.meshTitle') }}</h1>
      <p class="step-subtitle">{{ t('wizard.meshSubtitle') }}</p>

      <div class="progress-bar">
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step"></div>
        <div class="progress-step"></div>
        <div class="progress-step"></div>
      </div>

      <div class="toggle-group">
        <div class="toggle-label">
          <span>Smart Mesh</span>
          <span class="tooltip-wrapper">
            <span class="info-icon">
            </span>
            <span class="tooltip-box">
              When Smart Mesh is enabled, your router will be the Mesh Controller. After setup, you can add compatible Mesh Agents anytime for whole-home coverage.
            </span>
          </span>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" v-model="config.mesh.enable" :data-testid="qa('wizard-mesh-enable-toggle')" />
          <span class="slider"></span>
        </label>
      </div>
    </div>

    <div class="button-container">
      <button class="btn-secondary" :data-testid="qa('wizard-mesh-back-button')" @click="$emit('prev')">{{ t('common.back') }}</button>
      <button class="btn-primary" :data-testid="qa('wizard-mesh-next-button')" @click="$emit('next')">{{ t('common.next') }}</button>
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

.toggle-group {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.toggle-label > span:first-child {
  font-size: 1.1rem;
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
  transition: background-color 0.2s, border-color 0.2s, color 0.2s;
  color: #636969;
}

.info-icon:hover {
  background-color: #004F83;
  border-color: #999;
  color: #fff;
}

.info-icon::before {
  content: '!';
  font-size: 13px;
  font-weight: bold;
  line-height: 1;
}

.tooltip-box {
  position: absolute;
  left: calc(100% + 10px);
  top: 50%;
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

.tooltip-box::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  transform: translate(-100%, -50%);
  border-width: 8px 8px 8px 0;
  border-style: solid;
  border-color: transparent #004F83 transparent transparent;
}

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
