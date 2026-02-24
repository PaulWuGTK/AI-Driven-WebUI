<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { restartDevice } from '../../../services/api/reset';
import { BaseToast } from '../../../components/common';
import { useAutoDismiss } from '../../../composables/useAutoDismiss';
import { extractNokMessage } from '../../../utils/apiUtils';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const router = useRouter();
const loading = ref(false);
const showCountdown = ref(false);
const countdown = ref(100);
const countdownTimer = ref<number | null>(null);
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

  loading.value = true;
  try {
    const response = await restartDevice();
    const nokMessage = extractNokMessage(response);
    const resetStatus = typeof response?.ManagementDeviceReset === 'string' ? response.ManagementDeviceReset : '';
    if (nokMessage || (resetStatus && resetStatus.toUpperCase().includes('NOK'))) {
      showErrorMessage(nokMessage || resetStatus);
      return;
    }
    showSuccessMessage(t('reset.success'));
    startCountdown();
  } catch (error) {
    console.error('Error restarting device:', error);
    showErrorMessage('Failed to restart device');
  } finally {
    loading.value = false;
  }
};

const startCountdown = () => {
  showCountdown.value = true;
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
    <h1 class="page-title" :data-testid="qa('device-reboot-title')">{{ t('reset.restartTitle') }}</h1>

    <div class="status-content" :data-testid="qa('device-reboot-content')">
      <div class="panel-section" :data-testid="qa('device-reboot-section')">
        <div class="card-content">
          <div class="reboot-section">
            <div class="description" :data-testid="qa('device-reboot-description')">
              {{ t('reset.restartDescription') }}
            </div>
            <button
              class="btn btn-primary"
              :data-testid="qa('device-reboot-button')"
              @click="handleRestart"
              :disabled="loading || showCountdown"
            >
              <span class="material-icons" v-if="loading">sync</span>
              {{ loading ? t('diagnostics.processing') : t('reset.restartButton') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showCountdown" class="countdown-overlay" :data-testid="qa('device-reboot-countdown-overlay')">
      <div class="countdown-content" :data-testid="qa('device-reboot-countdown-content')">
        <div class="spinner"></div>
        <p :data-testid="qa('device-reboot-countdown-text')">{{ t('reset.countdown', { seconds: countdown }) }}</p>
      </div>
    </div>

    <BaseToast
      v-model="showSuccessToast"
      :message="successMessage"
      type="success"
      :data-testid="qa('device-reboot-success-message')"
    />
    <BaseToast
      v-model="showErrorToast"
      :message="errorToastMessage"
      type="error"
      :data-testid="qa('device-reboot-error-message')"
    />
  </div>
</template>

<style scoped>
.reboot-section {
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

.countdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.countdown-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  max-width: 400px;
  width: 90%;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .reboot-section {
    flex-direction: column;
    gap: 1rem;
  }

  .btn {
    width: 100%;
  }
}
</style>
