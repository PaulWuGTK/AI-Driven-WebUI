<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface Props {
  etaSeconds: number;
}

const props = defineProps<Props>();
const emit = defineEmits(['complete']);

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
  <div class="applying-container">
    <div class="applying-card">
      <div class="loading-icon">
        <div class="gear gear-1"></div>
        <div class="gear gear-2"></div>
      </div>

      <div class="countdown">{{ formatTime(remainingTime) }}</div>

      <h2>Applying Settings...</h2>

      <p class="message">We're rebooting your router and applying your settings.</p>
      <p class="warning">Please don't turn off or unplug it.</p>
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
  position: relative;
  width: 140px;
  height: 140px;
  margin: 0 auto 2rem;
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
