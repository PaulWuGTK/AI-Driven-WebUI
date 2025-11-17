<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { restartDevice } from '../../../services/api/reset';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const router = useRouter();
const loading = ref(false);
const showCountdown = ref(false);
const countdown = ref(100);
const countdownTimer = ref<number | null>(null);
const showSuccess = ref(false);

const handleRestart = async () => {
  if (!confirm(t('reset.restartConfirm'))) return;

  loading.value = true;
  try {
    await restartDevice();
    showSuccess.value = true;
    setTimeout(() => {
      showSuccess.value = false;
    }, 3000);
    startCountdown();
  } catch (error) {
    console.error('Error restarting device:', error);
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
      router.push('/login');
    }
  }, 1000);
};
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

    <div v-if="showSuccess" class="success-message" :data-testid="qa('device-reboot-success-message')">
      {{ t('reset.success') }}
    </div>
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

.success-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #4caf50;
  color: white;
  padding: 1rem 2rem;
  border-radius: 4px;
  animation: fadeInOut 3s ease-in-out;
  z-index: 100;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
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
