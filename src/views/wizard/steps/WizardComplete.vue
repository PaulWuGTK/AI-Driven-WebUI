<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQA } from '../../../utils/qa';
import iconResultSucceedImage from '../../../assets/icons/wizard/ico-result-succeed.svg';

interface Props {
  ssid?: string;
  deviceModel?: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['finish']);
const { t } = useI18n();
const { qa } = useQA();

const displaySsid = computed(() => props.ssid || 'WNRFQQ-9d93-WPA3');
const displayModel = computed(() => props.deviceModel || '');
</script>

<template>
  <div class="complete-container" :data-testid="qa('wizard-complete-container')">
    <div class="complete-card" :data-testid="qa('wizard-complete-card')">
      <div class="success-icon" :data-testid="qa('wizard-complete-icon')">
        <img :src="iconResultSucceedImage" alt="Updating" class="mode-image" :data-testid="qa('wizard-complete-image')" />
      </div>

      <h1 v-if="displayModel" class="device-name" :data-testid="qa('wizard-complete-model')">{{ displayModel }}</h1>

      <h2 :data-testid="qa('wizard-complete-title')">{{ t('wizard.completeTitle') }}</h2>

      <p class="message" :data-testid="qa('wizard-complete-message')">
        {{ t('wizard.message', { ssid: displaySsid }) }}
      </p>

      <button class="btn-finish" :data-testid="qa('wizard-complete-finish-button')" @click="$emit('finish')">
        {{ t('wizard.goToDashboard') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.complete-container {
  width: 100%;
  max-width: 900px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
}

.complete-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 4rem 3rem;
  text-align: center;
  width: 100%;
}

.success-icon {
  position: relative;
  width: 142px;
  height: 142px;
  margin: 4rem auto 2rem;
}

.mode-image {
  max-width: 100%;
  height: auto;
  display: block;
}

.device-name {
  color: #666;
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

h2 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #666;
  margin: 1rem 0 1rem 0;
}

.message {
  color: #666;
  font-size: 1rem;
  line-height: 1.8;
  margin-bottom: 2.5rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.message strong {
  color: #0098DA;
  font-weight: 600;
}

.btn-finish {
  background: #0078d4;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.875rem 3rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  box-shadow: 0 2px 8px rgba(0, 120, 212, 0.3);
}

.btn-finish:hover {
  background: #006abd;
  box-shadow: 0 4px 12px rgba(0, 120, 212, 0.4);
}

.btn-finish:active {
  transform: translateY(1px);
}
</style>
