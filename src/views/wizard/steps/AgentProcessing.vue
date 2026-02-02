<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQA } from '../../../utils/qa';
import { wizardApi } from '../../../services/api/wizard';
import type { AgentSetupMode } from '../../../types/wizard';

interface Props {
  agentSetupMode: AgentSetupMode;
}

const props = defineProps<Props>();
const emit = defineEmits(['back-to-agent-setup', 'agent-success']);
const { t } = useI18n();
const { qa } = useQA();

const countdown = ref(120);
const linkStatus = ref<'Down' | 'Up' | undefined>(undefined);
const onboardingStatus = ref<'Success' | 'Inprogress'>('Inprogress');
const statusMessage = ref('');

let countdownTimer: number | null = null;
let statusPollTimer: number | null = null;

const startOnboarding = async () => {
  try {
    await wizardApi.startAgentOnboarding(props.agentSetupMode);
    startPolling();
  } catch (error) {
    console.error('Failed to start agent onboarding:', error);
    statusMessage.value = 'Failed to start setup. Please try again.';
  }
};

const pollStatus = async () => {
  try {
    const response = await wizardApi.getAgentStatus();
    linkStatus.value = response.WizardAgent.LinkStatus;
    onboardingStatus.value = response.WizardAgent.OnboardingStatus;

    if (onboardingStatus.value === 'Success') {
      stopPolling();
      emit('agent-success');
    } else if (props.agentSetupMode === 'ethernet' && linkStatus.value === 'Down') {
      stopPolling();
      statusMessage.value = 'Connection failed. Returning to setup.';
      setTimeout(() => {
        emit('back-to-agent-setup');
      }, 2000);
    } else {
      updateStatusMessage();
    }
  } catch (error) {
    console.error('Failed to poll agent status:', error);
  }
};

const updateStatusMessage = () => {
  if (linkStatus.value === undefined) {
    statusMessage.value = t('wizard.connectingMessage');
  } else if (linkStatus.value === 'Up') {
    statusMessage.value = t('wizard.connectionEstablished');
  } else if (linkStatus.value === 'Down') {
    statusMessage.value = t('wizard.connectionFailed');
  }
};

const startPolling = () => {
  statusPollTimer = window.setInterval(() => {
    pollStatus();
  }, 2000);
};

const stopPolling = () => {
  if (statusPollTimer) {
    clearInterval(statusPollTimer);
    statusPollTimer = null;
  }
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
};

onMounted(() => {
  statusMessage.value = t('wizard.connectingMessage');
  countdownTimer = window.setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      stopPolling();
      statusMessage.value = 'Setup timed out. Returning to setup.';
      setTimeout(() => {
        emit('back-to-agent-setup');
      }, 2000);
    }
  }, 1000);

  startOnboarding();
});

onUnmounted(() => {
  stopPolling();
});

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
</script>

<template>
  <div class="step-container" :data-testid="qa('wizard-agent-processing-container')">
    <div class="step-card" :data-testid="qa('wizard-agent-processing-card')">
      <h1 class="step-title" :data-testid="qa('wizard-agent-processing-title')">{{ t('wizard.processingTitle') }}</h1>
      <p class="step-subtitle" :data-testid="qa('wizard-agent-processing-subtitle')">{{ t('wizard.processingSubtitle') }}</p>

      <div class="progress-bar" :data-testid="qa('wizard-agent-processing-progress')">
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
      </div>

      <div class="processing-container" :data-testid="qa('wizard-agent-processing-status')">
        <div class="spinner" :data-testid="qa('wizard-agent-processing-spinner')"></div>
        <h3 :data-testid="qa('wizard-agent-processing-message')">{{ statusMessage }}</h3>
        <p class="status-info" :data-testid="qa('wizard-agent-processing-info')">
          Link: <strong :data-testid="qa('wizard-agent-processing-link-status')">{{ linkStatus }}</strong> |
          Status: <strong :data-testid="qa('wizard-agent-processing-onboarding-status')">{{ onboardingStatus }}</strong>
        </p>
        <div class="countdown" :data-testid="qa('wizard-agent-processing-countdown')">
          <p>{{ t('wizard.timeoutIn') }} <strong :data-testid="qa('wizard-agent-processing-countdown-value')">{{ formatTime(countdown) }}</strong></p>
        </div>
      </div>

      <div class="info-box" :data-testid="qa('wizard-agent-processing-timeout-message')">
        <p>{{ t('wizard.timeoutMessage') }}</p>
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
  max-width: 400px;
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

.processing-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 0;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #e0e0e0;
  border-top-color: #0078d4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.processing-container h3 {
  color: #333;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.processing-container p {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.countdown {
  margin-top: 1rem;
  padding: 1rem 2rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.countdown p {
  color: #333;
  font-size: 1rem;
  margin: 0;
}

.countdown strong {
  color: #0078d4;
  font-size: 1.25rem;
}

.status-info {
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 0.9rem;
}

.status-info strong {
  color: #0078d4;
  font-weight: 600;
}

.info-box {
  margin-top: 2rem;
  padding: 1rem;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 4px;
  text-align: center;
}

.info-box p {
  color: #856404;
  font-size: 0.9rem;
  margin: 0;
}
</style>
