<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WizardConfig } from '../../../types/wizard';

interface Props {
  config: WizardConfig;
}

const props = defineProps<Props>();
defineEmits(['next', 'prev']);
const { t } = useI18n();

const confirmPassword = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const passwordsMatch = computed(() => {
  return confirmPassword.value === '' || confirmPassword.value === props.config.admin.password;
});

const passwordPattern = /^[0-9a-zA-Z]+$/;

const isPasswordValid = computed(() => {
  if (!props.config.admin.password) return false;
  return passwordPattern.test(props.config.admin.password);
});

const isValid = computed(() => {
  return props.config.admin.username &&
         props.config.admin.password &&
         isPasswordValid.value &&
         props.config.admin.password === confirmPassword.value;
});
</script>

<template>
  <div class="step-container">
    <div class="step-card">
      <h1 class="step-title">{{ t('wizard.adminPasswordTitle') }}</h1>
      <p class="step-subtitle">{{ t('wizard.adminPasswordSubtitle') }}</p>

      <div class="progress-bar">
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step"></div>
      </div>

      <div class="form-container">
        <div class="form-group">
          <label for="username">{{ t('wizard.username') }} <span class="required">*</span></label>
          <input
            id="username"
            type="text"
            v-model="config.admin.username"
            :placeholder="t('wizard.usernamePlaceholder')"
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <label for="new-password">{{ t('wizard.password') }} <span class="required">*</span></label>
          <div class="password-input">
            <input
              id="new-password"
              :type="showPassword ? 'text' : 'password'"
              v-model="config.admin.password"
              :placeholder="t('wizard.passwordPlaceholder')"
              class="form-input"
              :class="{ 'input-error': config.admin.password && !isPasswordValid }"
              required
            />
            <button type="button" class="password-toggle" @click="showPassword = !showPassword">
              <span class="material-icons">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
            </button>
          </div>
          <p v-if="config.admin.password && !isPasswordValid" class="error-text">Password can only contain letters (a-z, A-Z) and numbers (0-9)</p>
        </div>

        <div class="form-group">
          <label for="confirm-password">{{ t('wizard.confirmPassword') }} <span class="required">*</span></label>
          <div class="password-input">
            <input
              id="confirm-password"
              :type="showConfirmPassword ? 'text' : 'password'"
              v-model="confirmPassword"
              :placeholder="t('wizard.confirmPasswordPlaceholder')"
              class="form-input"
              :class="{ 'input-error': !passwordsMatch }"
              required
            />
            <button type="button" class="password-toggle" @click="showConfirmPassword = !showConfirmPassword">
              <span class="material-icons">{{ showConfirmPassword ? 'visibility_off' : 'visibility' }}</span>
            </button>
          </div>
          <p v-if="!passwordsMatch" class="error-text">{{ t('wizard.passwordMismatch') }}</p>
        </div>
      </div>

      <div v-if="0" class="info-box">
        <h4>{{ t('wizard.requirementsTitle') }}</h4>
        <ul>
          <li>Password must not be empty</li>
          <li>Only letters (a-z, A-Z) and numbers (0-9) allowed</li>
          <li>Use a mix of uppercase and lowercase letters</li>
          <li>Make it strong and memorable</li>
        </ul>
      </div>

      <div class="button-container">
        <button class="btn-secondary" @click="$emit('prev')">{{ t('common.back') }}</button>
        <button class="btn-primary" @click="$emit('next')" :disabled="!isValid">{{ t('common.next') }}</button>
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

.input-error {
  border-color: #dc3545;
}

.input-error:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
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

.error-text {
  color: #dc3545;
  font-size: 0.85rem;
  margin: 0;
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
  padding-left: 1.5rem;
  position: relative;
}

.info-box li::before {
  content: '•';
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

.btn-primary:hover:not(:disabled) {
  background: #006abd;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
