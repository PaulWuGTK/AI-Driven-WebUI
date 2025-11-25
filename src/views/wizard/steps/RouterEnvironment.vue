<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineEmits(['next', 'prev']);
const { t } = useI18n();
</script>

<template>
  <div class="step-container">
    <div class="step-card">
      <h1 class="step-title">{{ t('wizard.routerEnvironmentTitle') }}</h1>
      <p class="step-subtitle">{{ t('wizard.routerEnvironmentSubtitle') }}</p>

      <div class="progress-bar">
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step"></div>
        <div class="progress-step"></div>
        <div class="progress-step"></div>
        <div class="progress-step"></div>
      </div>

      <div class="environment-diagram">
        <div class="diagram-item">
          <div class="icon icon-globe"></div>
          <span>{{ t('wizard.internet') }}</span>
        </div>
        <div class="diagram-connection">
          <div class="connection-line"></div>
        </div>
        <div class="diagram-item">
          <div class="icon icon-modem"></div>
          <span>{{ t('wizard.modem') }}</span>
        </div>
        <div class="diagram-connection">
          <div class="connection-line"></div>
          <div class="connection-labels">
            <span class="label-top">{{ t('wizard.ethernetPort') }}</span>
            <span class="label-text">{{ t('wizard.ethernetCable') }}</span>
            <span class="label-bottom">{{ t('wizard.wanPort') }}</span>
          </div>
        </div>
        <div class="diagram-item highlight">
          <div class="icon icon-router"></div>
          <span>{{ t('wizard.router') }}</span>
        </div>
        <div class="diagram-connection">
          <div class="wifi-signal-left"></div>
          <div class="wifi-signal-right"></div>
        </div>
        <div class="diagram-item">
          <div class="icon icon-device"></div>
          <span>{{ t('wizard.clientDevice') }}</span>
        </div>
      </div>

      <div class="info-container">
        <div class="info-step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h4>{{ t('wizard.step1Title') }}</h4>
            <p>{{ t('wizard.step1Description') }}</p>
          </div>
        </div>
        <div class="info-step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h4>{{ t('wizard.step2Title') }}</h4>
            <p>{{ t('wizard.step2Description') }}</p>
          </div>
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
  content: '🌐';
  font-size: 2rem;
}

.icon-modem {
  border-radius: 8px;
  background: #f0f0f0;
}

.icon-modem::before {
  content: '📡';
  font-size: 1.8rem;
}

.icon-router {
  border-radius: 8px;
  background: #f0f0f0;
  border: 2px solid #666;
}

.icon-router::before {
  content: '📶';
  font-size: 1.8rem;
}

.icon-device::before {
  content: '💻';
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
