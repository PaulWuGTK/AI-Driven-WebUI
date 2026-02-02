<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQA } from '../../../utils/qa';
import iconUpdatingImage from '../../../assets/icons/wizard/ico_updating.svg';

interface Props {
  etaSeconds: number;
}

const props = defineProps<Props>();
const emit = defineEmits(['complete']);
const { t } = useI18n();
const { qa } = useQA();

const remainingTime = ref(props.etaSeconds);

let timer: number | null = null;

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

onMounted(() => {
  timer = window.setInterval(() => {
    remainingTime.value--;
    if (remainingTime.value <= 0) {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      emit('complete');
    }
  }, 1000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});
</script>

<template>
  <div class="applying-container" :data-testid="qa('wizard-applying-container')">
    <div class="applying-card" :data-testid="qa('wizard-applying-card')">
      <div class="loading-icon" :data-testid="qa('wizard-applying-icon')">
        <object
          :data="iconUpdatingImage"
          type="image/svg+xml"
          class="mode-image"
          :data-testid="qa('wizard-applying-image')"
        ></object>
      </div>

      <div class="countdown" :data-testid="qa('wizard-applying-countdown')">{{ formatTime(remainingTime) }}</div>

      <h2 :data-testid="qa('wizard-applying-title')">{{ t('wizard.applyingTitle') }}</h2>

      <p class="message" :data-testid="qa('wizard-applying-message')">{{ t('wizard.applyingMessage') }}</p>
      <p class="warning" :data-testid="qa('wizard-applying-warning')">{{ t('wizard.applyingWarning') }}</p>
    </div>
  </div>
</template>

<style scoped>
.applying-container {
  width: 100%;
  max-width: 900px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
}

.applying-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 4rem 3rem;
  text-align: center;
  width: 100%;
}

.loading-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.mode-image {
  width: 160px;
  height: 160px;
  display: block;
}
.gear {
  position: absolute;
  border: 4px solid #0078d4;
  border-radius: 50%;
}

.gear::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background:
    radial-gradient(circle at 50% 0%, #0078d4 8%, transparent 8%),
    radial-gradient(circle at 100% 50%, #0078d4 8%, transparent 8%),
    radial-gradient(circle at 50% 100%, #0078d4 8%, transparent 8%),
    radial-gradient(circle at 0% 50%, #0078d4 8%, transparent 8%),
    radial-gradient(circle at 85% 85%, #0078d4 8%, transparent 8%),
    radial-gradient(circle at 15% 85%, #0078d4 8%, transparent 8%),
    radial-gradient(circle at 85% 15%, #0078d4 8%, transparent 8%),
    radial-gradient(circle at 15% 15%, #0078d4 8%, transparent 8%);
}

.gear-1 {
  width: 80px;
  height: 80px;
  top: 15px;
  left: 15px;
  animation: rotate-clockwise 3s linear infinite;
}

.gear-2 {
  width: 60px;
  height: 60px;
  top: 55px;
  right: 5px;
  animation: rotate-counter-clockwise 2.5s linear infinite;
}

@keyframes rotate-clockwise {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes rotate-counter-clockwise {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-360deg);
  }
}

.countdown {
  font-size: 2.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1.5rem;
  font-family: monospace;
}

h2 {
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.message {
  color: #666;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.warning {
  color: #666;
  font-size: 1rem;
  line-height: 1.6;
}
</style>
