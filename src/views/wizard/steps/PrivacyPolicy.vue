<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
defineEmits(['next']);
</script>

<template>
  <div class="step-container">
    <div class="step-card">
      <h1 class="step-title">{{ t('wizard.privacyPolicyTitle') }}</h1>

      <div class="privacy-content">
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

    </div>

    <div class="button-container">
      <button class="btn-primary" @click="$emit('next')">{{ t('wizard.agreeButton') }}</button>
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

.button-container {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn-primary {
  background: #0078d4;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 3rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background: #006abd;
}
</style>
