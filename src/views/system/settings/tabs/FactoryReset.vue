<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { factoryResetDevice } from '../../../../services/api/reset';
import { BaseToast } from '../../../../components/common';
import BlockingOverlay from '../../../../components/BlockingOverlay.vue';
import { useAutoDismiss } from '../../../../composables/useAutoDismiss';
import { extractNokMessage } from '../../../../utils/apiUtils';
import { useQA } from '../../../../utils/qa';
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

const handleFactoryReset = async () => {
  if (!confirm(t('reset.factoryConfirm'))) return;

  loading.value = true;
  try {
    const response = await factoryResetDevice();
    const nokMessage = extractNokMessage(response);
    const resetStatus = typeof response?.ManagementDeviceReset === 'string' ? response.ManagementDeviceReset : '';
    if (nokMessage || (resetStatus && resetStatus.toUpperCase().includes('NOK'))) {
      showErrorMessage(nokMessage || resetStatus);
      return;
    }
    showSuccessMessage(t('reset.success'));
    startCountdown();
  } catch (error) {
    console.error('Error factory resetting device:', error);
    showErrorMessage('Failed to factory reset device');
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
  <div class="status-content" :data-testid="qa('factory-reset-content')">
    <div class="panel-section" :data-testid="qa('factory-reset-section')">
      <div class="section-title" :data-testid="qa('factory-reset-title')">{{ t('reset.factoryTitle') }}</div>

      <div class="card-content">
        <div class="reset-section">
          <div class="description" :data-testid="qa('factory-reset-description')">
            {{ t('reset.factoryDescription') }}
          </div>
          <button
            class="btn btn-danger"
            :data-testid="qa('factory-reset-button')"
            @click="handleFactoryReset"
            :disabled="loading || showCountdown"
          >
            <span class="material-icons" v-if="loading">sync</span>
            {{ loading ? t('diagnostics.processing') : t('reset.factoryButton') }}
          </button>
        </div>
      </div>
    </div>

    <BlockingOverlay
      :is-visible="showCountdown"
      :message="t('reset.factoryTitle')"
      :description1="t('diagnostics.processing')"
      :description2="t('reset.factoryDescription')"
      :auto-complete="false"
      :show-countdown="false"
      :show-progress="true"
      :progress-value="progressPercent"
      :data-testid="qa('factory-reset-countdown-overlay')"
    />

    <BaseToast
      v-model="showSuccessToast"
      :message="successMessage"
      type="success"
      :data-testid="qa('factory-reset-success-message')"
    />
    <BaseToast
      v-model="showErrorToast"
      :message="errorToastMessage"
      type="error"
      :data-testid="qa('factory-reset-error-message')"
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
