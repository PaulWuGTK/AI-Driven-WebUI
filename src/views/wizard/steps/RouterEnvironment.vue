<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ActionButtons } from '../../../components/common';
import { useQA } from '../../../utils/qa';
import routerModeWireImage from '../../../assets/icons/wizard/pict_router_mode_client_wired.svg';

defineEmits(['next', 'prev']);
const { t } = useI18n();
const { qa } = useQA();
</script>

<template>
  <div class="step-container" :data-testid="qa('wizard-router-env-container')">
    <div class="step-card" :data-testid="qa('wizard-router-env-card')">
      <h1 class="step-title" :data-testid="qa('wizard-router-env-title')">{{ t('wizard.routerEnvironmentTitle') }}</h1>
      <p class="step-subtitle" :data-testid="qa('wizard-router-env-subtitle')">{{ t('wizard.routerEnvironmentSubtitle') }}</p>

      <div class="progress-bar" :data-testid="qa('wizard-router-env-progress')">
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step"></div>
        <div class="progress-step"></div>
        <div class="progress-step"></div>
        <div class="progress-step"></div>
        <div class="progress-step"></div>
      </div>

      <div class="environment-diagram" :data-testid="qa('wizard-router-env-diagram')">
        <img :src="routerModeWireImage" alt="Router Mode Wire Diagram" class="mode-image" :data-testid="qa('wizard-router-env-image')" />
      </div>

      <div class="info-container" :data-testid="qa('wizard-router-env-info')">
        <div class="info-step" :data-testid="qa('wizard-router-env-step-1')">
          <div class="step-number" :data-testid="qa('wizard-router-env-step-1-number')">1</div>
          <div class="step-content" :data-testid="qa('wizard-router-env-step-1-content')">
            <h4 :data-testid="qa('wizard-router-env-step-1-title')">{{ t('wizard.step1Title') }}</h4>
            <p :data-testid="qa('wizard-router-env-step-1-description')">{{ t('wizard.step1Description') }}</p>
          </div>
        </div>
        <div class="info-step" :data-testid="qa('wizard-router-env-step-2')">
          <div class="step-number" :data-testid="qa('wizard-router-env-step-2-number')">2</div>
          <div class="step-content" :data-testid="qa('wizard-router-env-step-2-content')">
            <h4 :data-testid="qa('wizard-router-env-step-2-title')">{{ t('wizard.step2Title') }}</h4>
            <p :data-testid="qa('wizard-router-env-step-2-description')">{{ t('wizard.step2Description') }}</p>
          </div>
        </div>
      </div>

    </div>

    <div class="button-container">
      <ActionButtons
        class="wizard-actions"
        :cancel-text="t('common.back')"
        :apply-text="t('common.next')"
        cancel-variant="outline"
        :cancel-data-testid="qa('wizard-router-env-back-button')"
        :apply-data-testid="qa('wizard-router-env-next-button')"
        @cancel="$emit('prev')"
        @apply="$emit('next')"
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

.environment-diagram {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  position: relative;
}

.mode-image {
  max-width: 100%;
  height: auto;
  display: block;
}

.diagram-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
}

.diagram-item.highlight {
  padding: 0.5rem;
}

.diagram-connection {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  margin: 0 0.5rem;
}

.connection-line {
  width: 80px;
  height: 2px;
  background: #0098DA;
}

.connection-labels {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  margin-top: 0.25rem;
}

.label-top,
.label-bottom {
  font-size: 0.65rem;
  color: #0098DA;
  font-weight: 600;
}

.label-text {
  font-size: 0.7rem;
  color: #333;
  font-weight: 500;
}

.icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ccc;
}

.icon-globe::before {
  content: '��';
  font-size: 2rem;
}

.icon-modem {
  border-radius: 8px;
  background: #f0f0f0;
}

.icon-modem::before {
  content: '��';
  font-size: 1.8rem;
}

.icon-router {
  border-radius: 8px;
  background: #f0f0f0;
  border: 2px solid #666;
}

.icon-router::before {
  content: '��';
  font-size: 1.8rem;
}

.icon-device::before {
  content: '��';
  font-size: 1.8rem;
}

.wifi-signal-left,
.wifi-signal-right {
  width: 40px;
  height: 2px;
  background: #0098DA;
  position: relative;
}

.wifi-signal-left::before,
.wifi-signal-right::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid #0098DA;
  border-radius: 50%;
  top: 50%;
  transform: translateY(-50%);
}

.wifi-signal-left::before {
  left: -10px;
  border-right: none;
}

.wifi-signal-right::before {
  right: -10px;
  border-left: none;
}

.info-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.info-step {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #666;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content h4 {
  color: #333;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.step-content p {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
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
