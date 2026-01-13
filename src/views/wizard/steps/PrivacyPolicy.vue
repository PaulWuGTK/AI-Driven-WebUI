<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQA } from '../../../utils/qa';

const { t } = useI18n();
const { qa } = useQA();
const emit = defineEmits(['next', 'skip']);

const isAccepted = ref(false);
</script>

<template>
  <div class="step-container" :data-testid="qa('wizard-privacy-policy-container')">
    <div class="step-card">
      <h1 class="step-title" :data-testid="qa('wizard-privacy-policy-title')">{{ t('wizard.privacyPolicyTitle') }}</h1>

      <div class="privacy-content" :data-testid="qa('wizard-privacy-policy-content')">
        <p>Gemtek Privacy Policy (the "Policy") governs and applies to personal information collected by Gemtek Technology Co., Ltd. ("Gemtek") from you through Gemtek websites (the "Websites"), products supplied by Gemtek (the "Products"), or services provided by Gemtek (the "Services"). The Policy also describes Gemtek's practices regarding how such information is collected and used. By visiting the Websites or using the Products or Services, you accept the terms and conditions set forth in this Policy.</p>

        <h3>1. Collection of Information</h3>
        <p>Gemtek may ask you to provide personal information when you:</p>
        <ul>
          <li>Use the Website;</li>
          <li>Request quotes, Services, support or any information associated therewith;</li>
          <li>Place orders for Products or Services;</li>
          <li>Apply for payment with credit card or other financing manner;</li>
          <li>Participate in surveys, or other promotional activities;</li>
          <li>Subscribe to newsletters, promotional emails or other materials; or Contact us.</li>
        </ul>

        <h3>2. Information Usage</h3>
        <p>a. Gemtek uses your personal information to:</p>
        <ul>
          <li>Deliver the Services and support, or carry out, the transactions you have requested;</li>
        </ul>
      </div>

      <div class="checkbox-container">
        <label class="checkbox-label">
          <input type="checkbox" v-model="isAccepted" class="checkbox-input" :data-testid="qa('wizard-privacy-policy-accept-checkbox')" />
          <span class="checkbox-text">{{ t('wizard.acceptTermsCheckbox') }}</span>
        </label>
      </div>

    </div>

    <div class="button-container">
      <button
        class="btn-secondary"
        :data-testid="qa('wizard-privacy-policy-skip-button')"
        @click="emit('skip')"
        :disabled="!isAccepted"
      >
        {{ t('wizard.manualConfiguration') }}
      </button>
      <button
        class="btn-primary"
        :data-testid="qa('wizard-privacy-policy-next-button')"
        @click="emit('next')"
        :disabled="!isAccepted"
      >
        {{ t('wizard.nextButton') }}
      </button>
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
  margin-bottom: 1.5rem;
}

.privacy-content {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 1.5rem;
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.privacy-content h3 {
  color: #333;
  font-size: 1rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.privacy-content p {
  color: #666;
  margin-bottom: 1rem;
  text-align: justify;
}

.privacy-content ul {
  color: #666;
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.privacy-content li {
  margin-bottom: 0.5rem;
}

.checkbox-container {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 4px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  gap: 0.75rem;
}

.checkbox-input {
  width: 20px;
  height: 20px;
  cursor: pointer;
  margin-top: 2px;
  flex-shrink: 0;
}

.checkbox-text {
  color: #333;
  font-size: 0.95rem;
  line-height: 1.5;
  user-select: none;
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn-primary,
.btn-secondary {
  border: none;
  border-radius: 4px;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #0078d4;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #006abd;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
}

.btn-secondary:hover:not(:disabled) {
  background: #e0e0e0;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
