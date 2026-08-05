<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ActionButtons } from '../../../components/common';
import { useQA } from '../../../utils/qa';
import type { WizardConfig, WizardData } from '../../../types/wizard';

interface Props {
  config: WizardConfig;
  wizardData: WizardData | null;
}

const props = defineProps<Props>();
defineEmits(['next', 'prev']);
const { t } = useI18n();
const { qa } = useQA();

const timezoneList = computed(() => {
  return props.wizardData?.TimeZone?.Timezonelist || [];
});

const selectedLabel = computed(() => {
  const idx = Number(props.config.timezone.currentTimezone);
  if (!isNaN(idx) && timezoneList.value[idx]) {
    return timezoneList.value[idx];
  }
  return '';
});
</script>

<template>
  <div class="step-container">
    <div class="step-card">
      <h1 class="step-title">{{ t('wizard.timezoneTitle') }}</h1>
      <p class="step-subtitle">{{ t('wizard.timezoneSubtitle') }}</p>

      <div class="progress-bar">
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step"></div>
      </div>

      <div class="form-group">
        <label for="timezone-select">{{ t('wizard.timezoneLabel') }} <span class="required">*</span></label>
        <select
          id="timezone-select"
          v-model="config.timezone.currentTimezone"
          class="form-select"
          :data-testid="qa('wizard-timezone-select')"
        >
          <option
            v-for="(tz, index) in timezoneList"
            :key="index"
            :value="String(index)"
          >
            {{ tz }}
          </option>
        </select>
        <p class="help-text">{{ t('wizard.timezoneHelp') }}</p>
      </div>

      <div class="info-box">
        <p>
          <span class="material-icons info-icon">info</span>
          {{ t('wizard.timezoneInfo') }}
        </p>
      </div>
    </div>

    <div class="button-container">
      <ActionButtons
        class="wizard-actions"
        :cancel-text="t('common.back')"
        :apply-text="t('common.next')"
        cancel-variant="outline"
        :cancel-data-testid="qa('wizard-timezone-back-button')"
        :apply-data-testid="qa('wizard-timezone-next-button')"
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

.form-group {
  margin-bottom: 2rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.form-select:focus {
  outline: none;
  border-color: #0078d4;
  box-shadow: 0 0 0 3px rgba(0, 120, 212, 0.1);
}

.help-text {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #666;
}

.required {
  color: #ff0000;
  margin-left: 2px;
}

.info-box {
  background: #f0f8ff;
  border: 1px solid #b3d9ff;
  border-radius: 8px;
  padding: 1rem 1.5rem;
}

.info-box p {
  color: #0078d4;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.info-icon {
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 1px;
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
