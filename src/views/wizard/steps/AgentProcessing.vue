<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const countdown = ref(120);
let timer: number | null = null;

onMounted(() => {
  timer = window.setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      router.push('/login');
    }
  }, 1000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
</script>

<template>
  <div class="step-container">
    <div class="step-card">
      <h1 class="step-title">Setting Up Your Device</h1>
      <p class="step-subtitle">Please wait while we configure your agent device...</p>

      <div class="progress-bar">
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
      </div>

      <div class="processing-container">
        <div class="spinner"></div>
        <h3>Connecting to network...</h3>
        <p>This may take a few moments.</p>
        <div class="countdown">
          <p>Timeout in: <strong>{{ formatTime(countdown) }}</strong></p>
        </div>
      </div>

      <div class="info-box">
        <p>If the setup is not completed within 120 seconds, you will be redirected to the login page.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step-container {
  width: 100%;
  max-width: 900px;
}

.step-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
}

.step-title {
  color: #0078d4;
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.step-subtitle {
  color: #666;
  font-size: 1rem;
  margin-bottom: 2rem;
}

.progress-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 3rem;
  max-width: 400px;
}

.progress-step {
  flex: 1;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
}

.progress-step.active {
  background: #0078d4;
}

.processing-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 0;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #e0e0e0;
  border-top-color: #0078d4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.processing-container h3 {
  color: #333;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.processing-container p {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.countdown {
  margin-top: 1rem;
  padding: 1rem 2rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.countdown p {
  color: #333;
  font-size: 1rem;
  margin: 0;
}

.countdown strong {
  color: #0078d4;
  font-size: 1.25rem;
}

.info-box {
  margin-top: 2rem;
  padding: 1rem;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 4px;
  text-align: center;
}

.info-box p {
  color: #856404;
  font-size: 0.9rem;
  margin: 0;
}
</style>
