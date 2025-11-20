<script setup lang="ts">
import { ref } from 'vue';
import type { WizardConfig } from '../../../types/wizard';

interface Props {
  config: WizardConfig;
  currentStep: number;
  maxSteps: number;
}

const props = defineProps<Props>();
const emit = defineEmits(['next', 'prev', 'mode-change']);

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
      <h1 class="step-title">Let's Get Started</h1>
      <p class="step-subtitle">How would you like to set up your device?</p>

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
            <div class="diagram-item">
              <div class="icon icon-globe"></div>
              <span>INTERNET</span>
            </div>
            <div class="diagram-line"></div>
            <div class="diagram-item">
              <div class="icon icon-modem"></div>
              <span>MODEM</span>
            </div>
            <div class="diagram-line"></div>
            <div class="diagram-item">
              <div class="icon icon-router"></div>
              <span>MAIN ROUTER</span>
            </div>
            <div class="icon icon-wifi"></div>
          </div>
          <h3>Router Mode</h3>
          <p>I don't have a main router, and I'm going to set up a new wireless network with a modem.</p>
        </div>

        <div
          class="mode-card"
          :class="{ selected: selectedMode === 'agent' }"
          @click="selectMode('agent')"
        >
          <div class="mode-diagram">
            <div class="diagram-item">
              <div class="icon icon-globe"></div>
              <span>INTERNET</span>
            </div>
            <div class="diagram-line"></div>
            <div class="diagram-item">
              <div class="icon icon-router"></div>
              <span>MAIN ROUTER<br>(MESH CONTROLLER)</span>
            </div>
            <div class="diagram-mesh">
              <div class="diagram-line-mesh"></div>
              <div class="diagram-agent">
                <div class="icon icon-agent"></div>
                <span>AGENT</span>
              </div>
              <div class="diagram-line-mesh"></div>
              <div class="diagram-agent">
                <div class="icon icon-agent"></div>
                <span>AGENT</span>
              </div>
            </div>
          </div>
          <h3>Agent Mode</h3>
          <p>I'm adding an Agent device to the existing Smart Mesh Network.</p>
        </div>
      </div>

      <div class="button-container">
        <button class="btn-secondary" @click="$emit('prev')">Back</button>
        <button class="btn-primary" @click="handleNext">Next</button>
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

.diagram-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.7rem;
  color: #666;
}

.diagram-line {
  width: 40px;
  height: 2px;
  background: #999;
  margin: 0 0.5rem;
}

.diagram-mesh {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-left: 1rem;
}

.diagram-line-mesh {
  width: 30px;
  height: 1px;
  background: #999;
  margin-left: -15px;
}

.diagram-agent {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.7rem;
  color: #666;
}

.icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.icon-globe::before {
  content: '🌐';
  font-size: 1.5rem;
}

.icon-modem {
  border-radius: 4px;
  background: #f0f0f0;
}

.icon-modem::before {
  content: '📡';
  font-size: 1.2rem;
}

.icon-router {
  border-radius: 4px;
  background: #d0d0d0;
}

.icon-router::before {
  content: '📶';
  font-size: 1.2rem;
}

.icon-agent {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  background: #e0e0e0;
}

.icon-agent::before {
  content: '📡';
  font-size: 1rem;
}

.icon-wifi {
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
}

.icon-wifi::before {
  content: '📶';
  font-size: 1.2rem;
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
