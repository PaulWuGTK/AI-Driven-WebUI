<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { restartDevice, factoryResetDevice } from '../../../services/api/reset';

const { t } = useI18n();
const router = useRouter();
const loading = ref({
  restart: false,
  factory: false
});
const showCountdown = ref(false);
const countdown = ref(100);
const countdownTimer = ref<number | null>(null);
const showSuccess = ref(false);

const handleRestart = async () => {
  if (!confirm(t('reset.restartConfirm'))) return;
  
  loading.value.restart = true;
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
    loading.value.restart = false;
  }
};

const handleFactoryReset = async () => {
  if (!confirm(t('reset.factoryConfirm'))) return;
  
  loading.value.factory = true;
  try {
    await factoryResetDevice();
    showSuccess.value = true;
    setTimeout(() => {
      showSuccess.value = false;
    }, 3000);
    startCountdown();
  } catch (error) {
    console.error('Error factory resetting device:', error);
  } finally {
    loading.value.factory = false;
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
    <h1 class="page-title">{{ t('reset.title') }}</h1>

    <div class="status-content">
      <!-- Restart Section -->
      <div class="panel-section">
        <div class="section-title">{{ t('reset.restartTitle') }}</div>
        
        <div class="card-content">
          <div class="reset-section">
            <div class="description">
              {{ t('reset.restartDescription') }}
            </div>
            <button 
              class="btn btn-primary" 
              @click="handleRestart"
              :disabled="loading.restart || loading.factory || showCountdown"
            >
              <span class="material-icons" v-if="loading.restart">sync</span>
              {{ loading.restart ? t('diagnostics.processing') : t('reset.restartButton') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Factory Reset Section -->
      <div class="panel-section">
        <div class="section-title">{{ t('reset.factoryTitle') }}</div>
        
        <div class="card-content">
          <div class="reset-section">
            <div class="description">
              {{ t('reset.factoryDescription') }}
            </div>
            <button 
              class="btn btn-danger" 
              @click="handleFactoryReset"
              :disabled="loading.restart || loading.factory || showCountdown"
            >
              <span class="material-icons" v-if="loading.factory">sync</span>
              {{ loading.factory ? t('diagnostics.processing') : t('reset.factoryButton') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Countdown Overlay -->
    <div v-if="showCountdown" class="countdown-overlay">
      <div class="countdown-content">
        <div class="spinner"></div>
        <p>{{ t('reset.countdown', { seconds: countdown }) }}</p>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="showSuccess" class="success-message">
      {{ t('reset.success') }}
    </div>
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
  .reset-section {
    flex-direction: column;
    gap: 1rem;
  }

  .btn {
    width: 100%;
  }
}
</style>