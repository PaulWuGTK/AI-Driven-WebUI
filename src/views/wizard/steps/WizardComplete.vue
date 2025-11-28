<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import iconResultSucceedImage from '../../../assets/icons/wizard/ico-result-succeed.svg';

interface Props {
  ssid?: string;
  deviceModel?: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['finish']);
const { t } = useI18n();

const displaySsid = computed(() => props.ssid || 'WNRFQQ-9d93-WPA3');
const displayModel = computed(() => props.deviceModel || '');
</script>

<template>
  <div class="complete-container">
    <div class="complete-card">
      <div class="success-icon">
        <img :src="iconResultSucceedImage" alt="Updating" class="mode-image" />
      </div>

      <h1 v-if="displayModel" class="device-name">{{ displayModel }}</h1>

      <h2>{{ t('wizard.completeTitle') }}</h2>

      <p class="message">
        {{ t('wizard.message', { ssid: displaySsid }) }}
      </p>

      <button class="btn-finish" @click="$emit('finish')">
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
  width: 160px;
  height: 160px;
  margin: 0 auto 2rem;
}

.mode-image {
  max-width: 100%;
  height: auto;
  display: block;
}

.device-name {
  color: #333;
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

h2 {
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
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
