<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { wizardApi } from '../../../services/api/wizard';
import iconResultSucceedImage from '../../../assets/icons/wizard/ico-result-succeed.svg';

interface Props {
  wizardData: any;
}

const props = defineProps<Props>();

const { t } = useI18n();
const isRedirecting = ref(false);

const handleFinish = async () => {
  if (isRedirecting.value) return;

  try {
    isRedirecting.value = true;
    await wizardApi.completeAgentSetup();

    // Redirect to 192.168.101.1
    window.location.href = 'http://192.168.101.1';
  } catch (error) {
    console.error('Failed to complete agent setup:', error);
    isRedirecting.value = false;
  }
};

const deviceModel = props.wizardData?.ModelName || '';
</script>

<template>
  <div class="step-container">
    <div class="step-card">
      <div class="success-content">
        <div class="device-icon">
          <img :src="iconResultSucceedImage" alt="Updating" class="mode-image" />
        </div>

        <h1 v-if="deviceModel" class="device-model">{{ deviceModel }}</h1>

        <h2 class="finish-title">{{ t('wizard.agentCompleteTitle') }}</h2>

        <div class="instructions">
          <p>{{ t('wizard.instruction1') }}</p>
          <p>{{ t('wizard.instruction2') }}</p>
        </div>

        <button
          class="finish-button"
          @click="handleFinish"
          :disabled="isRedirecting"
        >
          {{ isRedirecting ? t('wizard.redirecting') : t('wizard.finishButton') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step-container {
  width: 100%;
  max-width: 900px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.step-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  min-width: 900px;
  min-height: 600px;
}

.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.device-icon {
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

.device-model {
  font-size: 1.5rem;
  font-weight: 600;
  color: #666;
  margin: 0 0 1rem 0;
}

.finish-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #666;
  margin: 1rem 0 1rem 0;
}

.instructions {
  max-width: 500px;
  margin-bottom: 2.5rem;
}

.instructions p {
  color: #666;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0.5rem 0 0.5rem 0;
}

.finish-button {
  background: #0078d4;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 3rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 120, 212, 0.3);
}

.finish-button:hover:not(:disabled) {
  background: #006abd;
  box-shadow: 0 4px 12px rgba(0, 120, 212, 0.4);
  transform: translateY(-1px);
}

.finish-button:disabled {
  background: #999;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

@media (max-width: 768px) {
  .step-card {
    padding: 2rem 1.5rem;
  }

  .device-icon {
    width: 150px;
    height: 150px;
  }

  .device-model {
    font-size: 1.25rem;
  }

  .finish-title {
    font-size: 1.75rem;
  }

  .instructions p {
    font-size: 0.95rem;
  }

  .finish-button {
    padding: 0.875rem 2.5rem;
    font-size: 1rem;
  }
}
</style>
