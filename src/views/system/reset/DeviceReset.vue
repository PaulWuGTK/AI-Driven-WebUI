<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { restartDevice, factoryResetDevice } from '../../../services/api/reset';
import { BaseToast, SectionCard } from '../../../components/common';
import BlockingOverlay from '../../../components/BlockingOverlay.vue';
import { useAutoDismiss } from '../../../composables/useAutoDismiss';
import { extractNokMessage } from '../../../utils/apiUtils';
import { useQA } from '../../../utils/qa';
import { AuthService } from '../../../services/auth';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const router = useRouter();
const loading = ref({
  restart: false,
  factory: false
});
const showCountdown = ref(false);
const countdown = ref(100);
const countdownTimer = ref<number | null>(null);
const countdownAction = ref<'restart' | 'factory'>('restart');
const progressPercent = computed(() => Math.min(100, Math.max(0, ((100 - countdown.value) / 100) * 100)));
const countdownHint = computed(() => (
  countdownAction.value === 'factory'
    ? t('reset.factoryDescription')
    : t('reset.restartDescription')
));
const successMessage = ref('');
const errorToastMessage = ref('');
const { visible: showSuccessToast, show: triggerSuccessToast } = useAutoDismiss();
const { visible: showErrorToast, show: triggerErrorToast } = useAutoDismiss();

const showSuccessMessage = (message: string) => {
  successMessage.value = message;
  triggerSuccessToast();
};

const showErrorMessage = (message: string) => {
  errorToastMessage.value = message;
  triggerErrorToast();
};

const handleRestart = async () => {
  if (!confirm(t('reset.restartConfirm'))) return;
  
  loading.value.restart = true;
  try {
    const response = await restartDevice();
    const nokMessage = extractNokMessage(response);
    const resetStatus = typeof response?.ManagementDeviceReset === 'string' ? response.ManagementDeviceReset : '';
    if (nokMessage || (resetStatus && resetStatus.toUpperCase().includes('NOK'))) {
      showErrorMessage(nokMessage || resetStatus);
      return;
    }
    showSuccessMessage(t('reset.success'));
    startCountdown('restart');
  } catch (error) {
    console.error('Error restarting device:', error);
    showErrorMessage('Failed to restart device');
  } finally {
    loading.value.restart = false;
  }
};

const handleFactoryReset = async () => {
  if (!confirm(t('reset.factoryConfirm'))) return;
  
  loading.value.factory = true;
  try {
    const response = await factoryResetDevice();
    const nokMessage = extractNokMessage(response);
    const resetStatus = typeof response?.ManagementDeviceReset === 'string' ? response.ManagementDeviceReset : '';
    if (nokMessage || (resetStatus && resetStatus.toUpperCase().includes('NOK'))) {
      showErrorMessage(nokMessage || resetStatus);
      return;
    }
    showSuccessMessage(t('reset.success'));
    startCountdown('factory');
  } catch (error) {
    console.error('Error factory resetting device:', error);
    showErrorMessage('Failed to factory reset device');
  } finally {
    loading.value.factory = false;
  }
};

const startCountdown = (action: 'restart' | 'factory') => {
  showCountdown.value = true;
  countdownAction.value = action;
  countdown.value = 100;

  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
  }

  countdownTimer.value = window.setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      if (countdownTimer.value) {
        clearInterval(countdownTimer.value);
      }
      // Clear session after reset/restart to force login
      const auth = AuthService.getInstance();
      auth.clearSession();
      router.push(`/login?t=${Date.now()}`);
    }
  }, 1000);
};

onUnmounted(() => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
  }
});
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('device-reset-title')">{{ t('reset.title') }}</h1>

    <div class="status-content" :data-testid="qa('device-reset-content')">
      <!-- Restart Section -->
      <SectionCard
        :data-testid="qa('device-restart-section')"
        :title="t('reset.restartTitle')"
        :title-data-testid="qa('device-restart-title')"
      >
        <div class="reset-section">
          <div class="description" :data-testid="qa('device-restart-description')">
            {{ t('reset.restartDescription') }}
          </div>
          <button 
            class="btn btn-primary" 
            :data-testid="qa('device-restart-button')"
            @click="handleRestart"
            :disabled="loading.restart || loading.factory || showCountdown"
          >
            <span class="material-icons" v-if="loading.restart">sync</span>
            {{ loading.restart ? t('diagnostics.processing') : t('reset.restartButton') }}
          </button>
        </div>
      </SectionCard>

      <!-- Factory Reset Section -->
      <SectionCard
        :data-testid="qa('device-factory-reset-section')"
        :title="t('reset.factoryTitle')"
        :title-data-testid="qa('device-factory-reset-title')"
      >
        <div class="reset-section">
          <div class="description" :data-testid="qa('device-factory-reset-description')">
            {{ t('reset.factoryDescription') }}
          </div>
          <button 
            class="btn btn-danger" 
            :data-testid="qa('device-factory-reset-button')"
            @click="handleFactoryReset"
            :disabled="loading.restart || loading.factory || showCountdown"
          >
            <span class="material-icons" v-if="loading.factory">sync</span>
            {{ loading.factory ? t('diagnostics.processing') : t('reset.factoryButton') }}
          </button>
        </div>
      </SectionCard>
    </div>

    <!-- Countdown Overlay -->
    <BlockingOverlay
      :is-visible="showCountdown"
      :message="countdownAction === 'factory' ? t('reset.factoryTitle') : t('reset.restartTitle')"
      :description1="t('diagnostics.processing')"
      :description2="countdownHint"
      :auto-complete="false"
      :show-countdown="false"
      :show-progress="true"
      :progress-value="progressPercent"
      :data-testid="qa('device-reset-countdown-overlay')"
    />

    <BaseToast
      v-model="showSuccessToast"
      :message="successMessage"
      type="success"
      :data-testid="qa('device-reset-success-message')"
    />
    <BaseToast
      v-model="showErrorToast"
      :message="errorToastMessage"
      type="error"
      :data-testid="qa('device-reset-error-message')"
    />
  </div>
</template>

<style scoped>
.reset-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.description {
  flex: 1;
  color: var(--text-secondary);
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 150px;
  justify-content: center;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c82333;
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .reset-section {
    flex-direction: column;
    gap: 1rem;
  }

  .btn {
    width: 100%;
  }
}
</style>
