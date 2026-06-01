<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQA } from '../../../utils/qa';
import { wizardApi } from '../../../services/api/wizard';
import type { AgentSetupMode } from '../../../types/wizard';
import BlockingOverlay from '../../../components/BlockingOverlay.vue';

interface Props {
  agentSetupMode: AgentSetupMode;
}

const props = defineProps<Props>();
const emit = defineEmits(['back-to-agent-setup', 'agent-success']);
const { t } = useI18n();
const { qa } = useQA();

const countdown = ref(120);
const TOTAL_SECONDS = 120;
const linkStatus = ref<'Down' | 'Up' | undefined>(undefined);
const onboardingStatus = ref('Inprogress');
const statusMessage = ref('');
const setupFailed = ref(false);

let countdownTimer: number | null = null;
let statusPollTimer: number | null = null;
const progressPercent = computed(() =>
  Math.min(100, Math.max(0, ((TOTAL_SECONDS - countdown.value) / TOTAL_SECONDS) * 100))
);
const statusDescription = computed(() => {
  if (setupFailed.value) return '';
  const link = linkStatus.value ?? '-';
  return `Link: ${link} | Status: ${displayOnboardingStatus()}`;
});

const overlayMessage = computed(() =>
  setupFailed.value ? t('wizard.onboardingFailedTitle') : t('wizard.processingTitle')
);

const handleBackToSetup = () => {
  emit('back-to-agent-setup');
};

const startOnboarding = async () => {
  try {
    await wizardApi.startAgentOnboarding(props.agentSetupMode);
    startPolling();
  } catch (error) {
    console.error('Failed to start agent onboarding:', error);
    setupFailed.value = true;
    statusMessage.value = t('wizard.onboardingStartFailed');
  }
};

const isFailedStatus = (status: string): boolean => {
  const normalized = status.toLowerCase().replace(/[\s_-]/g, '');
  return normalized === 'failed' || normalized === 'fail' || normalized === 'error' || normalized === 'nok';
};

const pollStatus = async () => {
  try {
    const response = await wizardApi.getAgentStatus();
    linkStatus.value = response.WizardAgent.LinkStatus;
    onboardingStatus.value = response.WizardAgent.OnboardingStatus;

    if (onboardingStatus.value === 'Success') {
      stopPolling();
      emit('agent-success');
    } else if (isFailedStatus(onboardingStatus.value)) {
      stopPolling();
      setupFailed.value = true;
      statusMessage.value = t('wizard.onboardingFailed');
    } else if (props.agentSetupMode === 'ethernet' && linkStatus.value === 'Down') {
      stopPolling();
      setupFailed.value = true;
      statusMessage.value = t('wizard.ethernetConnectionFailed');
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
      setupFailed.value = true;
      statusMessage.value = t('wizard.onboardingTimeout');
    }
  }, 1000);

  startOnboarding();
});

onUnmounted(() => {
  stopPolling();
});

const displayOnboardingStatus = () => {
  const raw = onboardingStatus.value;
  const normalized = raw.toLowerCase().replace(/[\s_-]/g, '');

  if (normalized === 'inprogress' || normalized === 'inprogres') {
    return t('wizard.statusInProgress');
  }
  if (normalized === 'success' || normalized === 'done' || normalized === 'complete' || normalized === 'completed' || normalized === 'ok') {
    return t('wizard.statusSuccess');
  }
  if (normalized === 'failed' || normalized === 'fail' || normalized === 'error' || normalized === 'nok') {
    return t('wizard.statusFailed');
  }

  return raw;
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

      <div class="info-box" :data-testid="qa('wizard-agent-processing-timeout-message')">
        <p>{{ t('wizard.timeoutMessage') }}</p>
      </div>
    </div>

    <BlockingOverlay
      :is-visible="true"
      :message="overlayMessage"
      :description1="statusMessage"
      :description2="statusDescription"
      :auto-complete="false"
      :show-countdown="false"
      :show-progress="!setupFailed"
      :countdown-value="countdown"
      :progress-value="progressPercent"
      :icon-type="'spinner'"
      :data-testid="qa('wizard-agent-processing-overlay')"
    >
      <template v-if="setupFailed" #actions>
        <button
          class="back-to-setup-btn"
          :data-testid="qa('wizard-agent-processing-back-button')"
          @click="handleBackToSetup"
        >
          {{ t('wizard.backToSetup') }}
        </button>
      </template>
    </BlockingOverlay>
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

.back-to-setup-btn {
  margin-top: 1rem;
  padding: 0.75rem 2rem;
  background: #0078d4;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.back-to-setup-btn:hover {
  background: #006abd;
}
</style>
