<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { restartDevice } from '../../../services/api/reset';
import { BaseToast, SectionCard } from '../../../components/common';
import BlockingOverlay from '../../../components/BlockingOverlay.vue';
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
const progressPercent = computed(() => Math.min(100, Math.max(0, ((100 - countdown.value) / 100) * 100)));
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
      <SectionCard
        :data-testid="qa('device-reboot-section')"
        :title="t('reset.restartTitle')"
        :title-data-testid="qa('device-reboot-section-title')"
      >
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
      </SectionCard>
    </div>

    <BlockingOverlay
      :is-visible="showCountdown"
      :message="t('reset.restartTitle')"
      :description1="t('diagnostics.processing')"
      :description2="t('reset.restartDescription')"
      :auto-complete="false"
      :show-countdown="false"
      :show-progress="true"
      :progress-value="progressPercent"
      :data-testid="qa('device-reboot-countdown-overlay')"
    />

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
