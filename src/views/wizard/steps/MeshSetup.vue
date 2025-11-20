<script setup lang="ts">
import type { WizardConfig } from '../../../types/wizard';

interface Props {
  config: WizardConfig;
}

defineProps<Props>();
defineEmits(['next', 'prev']);
</script>

<template>
  <div class="step-container">
    <div class="step-card">
      <h1 class="step-title">Smart Mesh</h1>
      <p class="step-subtitle">Create a Smart Mesh network for seamless Wi-Fi coverage across your home with simple central management.</p>

      <div class="progress-bar">
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step"></div>
        <div class="progress-step"></div>
      </div>

      <div class="mesh-info">
        <div class="mesh-icon">🔗</div>
        <h3>What is Smart Mesh?</h3>
        <p>Smart Mesh allows multiple routers to work together as a single network, providing seamless coverage throughout your home or office. Devices automatically connect to the strongest signal.</p>
      </div>

      <div class="toggle-group">
        <div class="toggle-label">
          <span>Smart Mesh</span>
          <label class="toggle-switch">
            <input type="checkbox" v-model="config.mesh.enable" />
            <span class="slider"></span>
          </label>
          <span class="info-icon" title="Enable mesh networking">ℹ️</span>
        </div>
      </div>

      <div v-if="config.mesh.enable" class="mesh-benefits">
        <h4>Benefits:</h4>
        <ul>
          <li>Seamless roaming between access points</li>
          <li>Extended wireless coverage</li>
          <li>Automatic device steering to optimal access point</li>
          <li>Centralized management</li>
        </ul>
      </div>

      <div class="button-container">
        <button class="btn-secondary" @click="$emit('prev')">Back</button>
        <button class="btn-primary" @click="$emit('next')">Next</button>
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

.mesh-info {
  text-align: center;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.mesh-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.mesh-info h3 {
  color: #333;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.mesh-info p {
  color: #666;
  line-height: 1.6;
}

.toggle-group {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.toggle-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.toggle-label span {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
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

.mesh-benefits {
  background: #f0f8ff;
  border-left: 4px solid #0078d4;
  padding: 1.5rem;
  border-radius: 4px;
  margin-bottom: 2rem;
}

.mesh-benefits h4 {
  color: #0078d4;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.mesh-benefits ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.mesh-benefits li {
  color: #333;
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
}

.mesh-benefits li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #0078d4;
  font-weight: bold;
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
