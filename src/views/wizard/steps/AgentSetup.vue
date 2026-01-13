<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQA } from '../../../utils/qa';
import type { AgentSetupMode } from '../../../types/wizard';

import agentModeWpsImage from '../../../assets/icons/wizard/pict_agent_mode_wps_client_wireless.svg';
import agentModeEthernetImage from '../../../assets/icons/wizard/pict_agent_mode_ethernet_client_wireless.svg';

interface Props {
  agentSetupMode: AgentSetupMode;
}

const props = defineProps<Props>();
const emit = defineEmits(['next', 'prev', 'agent-mode-change']);
const { t } = useI18n();
const { qa } = useQA();

const selectedMode = ref<AgentSetupMode>(props.agentSetupMode);

const selectMode = (mode: AgentSetupMode) => {
  selectedMode.value = mode;
  emit('agent-mode-change', mode);
};
</script>

<template>
  <div class="step-container">
    <div class="step-card">
      <h1 class="step-title">{{ t('wizard.agentSetupTitle') }}</h1>
      <p class="step-subtitle">{{ t('wizard.agentSetupSubtitle') }}</p>

      <div class="progress-bar">
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step"></div>
      </div>

      <div class="setup-diagram">
        <img v-if="selectedMode == 'wps'" :src="agentModeWpsImage" alt="Agent Mode WPS Diagram" class="mode-image" />
        <img v-if="selectedMode == 'ethernet'" :src="agentModeEthernetImage" alt="Agent Mode WPS Diagram" class="mode-image" />
      </div>

      <div class="mode-selection">
        <button
          class="mode-btn"
          :class="{ active: selectedMode === 'wps' }"
          :data-testid="qa('wizard-agent-setup-wps-button')"
          @click="selectMode('wps')"
        >
          {{ t('wizard.agentSetupViaWps') }}
        </button>
        <button
          class="mode-btn"
          :class="{ active: selectedMode === 'ethernet' }"
          :data-testid="qa('wizard-agent-setup-ethernet-button')"
          @click="selectMode('ethernet')"
        >
          {{ t('wizard.agentSetupViaEthernet') }}
        </button>
      </div>

      <div class="instructions">
        <div class="instruction-item">
          <div class="instruction-number">1</div>
          <div class="instruction-content">
            <h4>{{ t('wizard.agentStep1Title') }}</h4>
            <p>{{ t('wizard.agentStep1Description') }}</p>
          </div>
        </div>
        <div class="instruction-item">
          <div class="instruction-number">2</div>
          <div class="instruction-content">
            <h4 v-if="selectedMode === 'wps'">{{ t('wizard.agentStep2Title') }}</h4>
            <p v-if="selectedMode === 'wps'">{{ t('wizard.agentStep2Description') }}</p>
            <h4 v-if="selectedMode === 'ethernet'">{{ t('wizard.agentStep2EthernetTitle') }}</h4>
            <p v-if="selectedMode === 'ethernet'">{{ t('wizard.agentStep2EthernetDescription') }}</p>
          </div>
        </div>
        <div class="instruction-item">
          <div class="instruction-number">3</div>
          <div class="instruction-content">
            <h4>{{ t('wizard.agentStep3Title') }}</h4>
            <p>{{ t('wizard.agentStep3Description') }}</p>
          </div>
        </div>
      </div>

    </div>

    <div class="button-container">
      <button class="btn-secondary" :data-testid="qa('wizard-agent-setup-back-button')" @click="$emit('prev')">{{ t('common.back') }}</button>
      <button class="btn-primary" :data-testid="qa('wizard-agent-setup-next-button')" @click="$emit('next')">{{ t('common.next') }}</button>
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
  max-width: 400px;
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

.setup-diagram {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
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
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #666;
  text-align: center;
}

.diagram-line {
  width: 40px;
  height: 2px;
  background: #999;
  margin: 0 0.75rem;
}

.diagram-wifi {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  margin: 0 0.5rem;
}

.wifi-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #e0e0e0;
  position: relative;
}

.wifi-icon::before {
  content: '��';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.wps-label {
  font-size: 0.7rem;
  color: #0078d4;
  font-weight: 600;
}

.icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-globe::before {
  content: '��';
  font-size: 1.8rem;
}

.icon-router {
  border-radius: 8px;
  background: #d0d0d0;
}

.icon-router::before {
  content: '��';
  font-size: 1.5rem;
}

.icon-agent {
  border-radius: 8px;
  background: #c0c0c0;
}

.icon-agent::before {
  content: '��';
  font-size: 1.5rem;
}

.icon-client::before {
  content: '��';
  font-size: 1.5rem;
}

.mode-selection {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.mode-btn {
  flex: 1;
  max-width: 300px;
  padding: 0.75rem 1.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 24px;
  background: white;
  color: #666;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn:hover {
  border-color: #0078d4;
}

.mode-btn.active {
  background: #0078d4;
  border-color: #0078d4;
  color: white;
}

.instructions {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.instruction-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.instruction-number {
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

.instruction-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.instruction-content p {
  font-size: 0.9rem;
  color: #666;
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
