<template>
  <div v-if="isVisible" class="redirect-overlay">
    <div class="redirect-dialog">
      <div class="icon-container">
        <span class="material-icons success-icon">check_circle</span>
      </div>

      <h2 class="dialog-title">{{ $t('lanBasic.ipChangeSuccess') }}</h2>

      <div class="dialog-content">
        <p class="message">{{ $t('lanBasic.ipChangeMessage', { newIP }) }}</p>
        <p class="redirect-info">{{ $t('lanBasic.redirectingIn') }}</p>

        <div class="countdown-circle">
          <svg class="countdown-svg" viewBox="0 0 120 120">
            <circle
              class="countdown-bg"
              cx="60"
              cy="60"
              r="54"
            />
            <circle
              class="countdown-progress"
              cx="60"
              cy="60"
              r="54"
              :style="{ strokeDashoffset: progressOffset }"
            />
          </svg>
          <div class="countdown-number">{{ countdown }}</div>
        </div>

        <button class="btn btn-primary redirect-now-btn" :data-testid="qa('ip-change-redirect-now-button')" @click="redirectNow">
          {{ $t('lanBasic.redirectNow') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { useQA } from '../utils/qa';

interface Props {
  isVisible: boolean;
  newIP: string;
  duration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  duration: 15
});
const { qa } = useQA();

const emit = defineEmits<{
  redirect: [];
}>();

const countdown = ref(props.duration);
const circumference = 2 * Math.PI * 54;
let intervalId: number | null = null;

const progressOffset = computed(() => {
  const progress = countdown.value / props.duration;
  return circumference * (1 - progress);
});

const startCountdown = () => {
  countdown.value = props.duration;

  if (intervalId) {
    clearInterval(intervalId);
  }

  intervalId = window.setInterval(() => {
    countdown.value--;

    if (countdown.value <= 0) {
      if (intervalId) {
        clearInterval(intervalId);
      }
      emit('redirect');
    }
  }, 1000);
};

const redirectNow = () => {
  if (intervalId) {
    clearInterval(intervalId);
  }
  emit('redirect');
};

watch(() => props.isVisible, (visible) => {
  if (visible) {
    startCountdown();
  } else {
    if (intervalId) {
      clearInterval(intervalId);
    }
  }
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>

<style scoped>
.redirect-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-in-out;
}

.redirect-dialog {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

.icon-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.success-icon {
  font-size: 4rem;
  color: #4caf50;
}

.dialog-title {
  text-align: center;
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.dialog-content {
  text-align: center;
}

.message {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.redirect-info {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.countdown-circle {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 2rem auto;
}

.countdown-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.countdown-bg {
  fill: none;
  stroke: #e0e0e0;
  stroke-width: 8;
}

.countdown-progress {
  fill: none;
  stroke: var(--color-primary);
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 339.292;
  transition: stroke-dashoffset 1s linear;
}

.countdown-number {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-primary);
}

.redirect-now-btn {
  margin-top: 1.5rem;
  width: 100%;
  padding: 0.75rem 2rem;
  font-size: 1rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .redirect-dialog {
    padding: 1.5rem;
  }

  .dialog-title {
    font-size: 1.25rem;
  }

  .countdown-circle {
    width: 100px;
    height: 100px;
  }

  .countdown-number {
    font-size: 2rem;
  }
}
</style>
