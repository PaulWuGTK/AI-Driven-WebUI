<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useQA } from '../utils/qa';
const { isQAMode, qa, slug } = useQA();

const props = withDefaults(defineProps<{
  isVisible: boolean;
  message?: string;
  description1?: string;
  description2?: string;
  duration?: number; // in seconds
  autoComplete?: boolean;
  showCountdown?: boolean;
  showProgress?: boolean;
}>(), {
  autoComplete: true,
  showCountdown: true,
  showProgress: true
});

const emit = defineEmits<{
  (e: 'complete'): void;
}>();

const effectiveDuration = computed(() => {
  if (typeof props.duration !== 'number') return null;
  if (!Number.isFinite(props.duration) || props.duration <= 0) return null;
  return Math.floor(props.duration);
});
const shouldAutoComplete = computed(() => Boolean(props.autoComplete && effectiveDuration.value));
const shouldShowCountdown = computed(() => Boolean(shouldAutoComplete.value && props.showCountdown));
const shouldShowProgress = computed(() => Boolean(shouldAutoComplete.value && props.showProgress));
const countdown = ref(effectiveDuration.value ?? 0);
const timer = ref<number | null>(null);
const resolvedDescription1 = computed(() =>
  props.description1 || 'Please wait while the WiFi configuration is being applied.'
);
const resolvedDescription2 = computed(() => {
  if (props.description2 !== undefined) return props.description2;
  if (!effectiveDuration.value) return '';
  return `This process may take up to ${effectiveDuration.value} seconds.`;
});
const progressPercent = computed(() => {
  if (!effectiveDuration.value) return 0;
  return ((effectiveDuration.value - countdown.value) / effectiveDuration.value) * 100;
});

const startCountdown = () => {
  if (!effectiveDuration.value) return;
  countdown.value = effectiveDuration.value;
  
  timer.value = window.setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      if (timer.value) {
        clearInterval(timer.value);
        timer.value = null;
      }
      emit('complete');
    }
  }, 1000);
};

const stopCountdown = () => {
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
};

// Watch for visibility changes
watch([() => props.isVisible, shouldAutoComplete], ([isVisible, autoComplete]) => {
  if (isVisible && autoComplete) {
    startCountdown();
  } else {
    stopCountdown();
  }
});

onMounted(() => {
  if (props.isVisible && shouldAutoComplete.value) {
    startCountdown();
  }
});

onUnmounted(() => {
  stopCountdown();
});
</script>

<template>
  <div v-if="isVisible" class="blocking-overlay" :data-testid="qa('blocking-overlay')">
    <div class="blocking-content" :data-testid="qa('blocking-overlay-content')">
      <div class="spinner" :data-testid="qa('blocking-overlay-spinner')"></div>
      <h2 :data-testid="qa('blocking-overlay-title')">{{ message || 'Applying WiFi Settings...' }}</h2>
      <p v-if="resolvedDescription1" :data-testid="qa('blocking-overlay-description-1')">{{ resolvedDescription1 }}</p>
      <p v-if="resolvedDescription2" :data-testid="qa('blocking-overlay-description-2')">{{ resolvedDescription2 }}</p>
      <div v-if="shouldShowCountdown" class="countdown" :data-testid="qa('blocking-overlay-countdown')">{{ countdown }}s</div>
      <div v-if="shouldShowProgress" class="progress-bar" :data-testid="qa('blocking-overlay-progress-bar')">
        <div 
          class="progress-fill" 
          :data-testid="qa('blocking-overlay-progress-fill')"
          :style="{ width: `${progressPercent}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.blocking-overlay {
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

.blocking-content {
  background-color: white;
  padding: 3rem 2rem;
  border-radius: 12px;
  text-align: center;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.spinner {
  width: 60px;
  height: 60px;
  border: 6px solid #f3f3f3;
  border-top: 6px solid var(--primary-color);
  border-radius: 50%;
  margin: 0 auto 2rem;
  animation: spin 1s linear infinite;
}

h2 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1.5rem;
}

p {
  margin: 0.5rem 0;
  color: var(--text-secondary);
  line-height: 1.5;
}

.countdown {
  font-size: 3rem;
  font-weight: bold;
  color: var(--primary-color);
  margin: 2rem 0 1rem 0;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 1rem;
}

.progress-fill {
  height: 100%;
  background-color: var(--primary-color);
  transition: width 1s linear;
  border-radius: 4px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .blocking-content {
    padding: 2rem 1.5rem;
  }

  h2 {
    font-size: 1.3rem;
  }

  .countdown {
    font-size: 2.5rem;
  }
}
</style>
