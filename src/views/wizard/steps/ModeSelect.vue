<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WizardConfig } from '../../../types/wizard';
import routerModeImage from '../../../assets/icons/wizard/pict_router_mode.svg';
import agentModeImage from '../../../assets/icons/wizard/pict_agent_mode.svg';

interface Props {
  config: WizardConfig;
  currentStep: number;
  maxSteps: number;
}

const props = defineProps<Props>();
const emit = defineEmits(['next', 'prev', 'mode-change']);
const { t } = useI18n();

const selectedMode = ref<'router' | 'agent'>(props.config.mode);

const selectMode = (mode: 'router' | 'agent') => {
  selectedMode.value = mode;
};

const handleNext = () => {
  emit('mode-change', selectedMode.value);
  emit('next');
};
</script>

<template>
  <div class="step-container">
    <div class="step-card">
      <h1 class="step-title">{{ t('wizard.modeSelectTitle') }}</h1>
      <p class="step-subtitle">{{ t('wizard.modeSelectSubtitle') }}</p>

      <div class="progress-bar">
        <div class="progress-step" :class="{ active: currentStep >= 1 }"></div>
        <div class="progress-step" :class="{ active: currentStep >= 2 }"></div>
        <div class="progress-step"></div>
        <div class="progress-step"></div>
        <div class="progress-step"></div>
        <div class="progress-step"></div>
        <div class="progress-step"></div>
      </div>

      <div class="mode-selection">
        <div
          class="mode-card"
          :class="{ selected: selectedMode === 'router' }"
          @click="selectMode('router')"
        >
          <div class="mode-diagram">
            <img :src="routerModeImage" alt="Router Mode Diagram" class="mode-image" />
          </div>
          <h3>{{ t('wizard.routerModeTitle') }}</h3>
          <p>{{ t('wizard.routerModeDescription') }}</p>
        </div>

        <div
          class="mode-card"
          :class="{ selected: selectedMode === 'agent' }"
          @click="selectMode('agent')"
        >
          <div class="mode-diagram">
            <img :src="agentModeImage" alt="Agent Mode Diagram" class="mode-image" />
          </div>
          <h3>{{ t('wizard.agentModeTitle') }}</h3>
          <p>{{ t('wizard.agentModeDescription') }}</p>
        </div>
      </div>

    </div>

    <div class="button-container">
      <button class="btn-secondary" @click="$emit('prev')">{{ t('common.back') }}</button>
      <button class="btn-primary" @click="handleNext">{{ t('common.next') }}</button>
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

.mode-selection {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
}

.mode-card {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.mode-card:hover {
  border-color: #0078d4;
  box-shadow: 0 4px 12px rgba(0, 120, 212, 0.15);
}

.mode-card.selected {
  border-color: #0078d4;
  background: #f0f8ff;
}

.mode-diagram {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  min-height: 100px;
  position: relative;
}

.mode-image {
  max-width: 100%;
  height: auto;
  display: block;
}

.mode-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #333;
}

.mode-card p {
  color: #666;
  font-size: 0.9rem;
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
