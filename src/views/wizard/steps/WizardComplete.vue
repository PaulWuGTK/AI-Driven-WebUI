<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  ssid?: string;
  deviceModel?: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['finish']);

const displaySsid = computed(() => props.ssid || 'WNRFQQ-9d93-WPA3');
const displayModel = computed(() => props.deviceModel || 'WNRFQQ-112BE');
</script>

<template>
  <div class="complete-container">
    <div class="complete-card">
      <div class="success-icon">
        <div class="router-icon"></div>
        <div class="wifi-rings">
          <div class="ring ring-1"></div>
          <div class="ring ring-2"></div>
          <div class="ring ring-3"></div>
        </div>
      </div>

      <h1 class="device-name">{{ displayModel }}</h1>

      <h2>Finish!</h2>

      <p class="message">
        Once setup is complete and the Internet LED on your router is solid blue, you can join your<br>
        new Wi-Fi network (SSID: <strong>{{ displaySsid }}</strong>) with the saved password.
      </p>

      <button class="btn-finish" @click="$emit('finish')">
        Go to Dashboard
      </button>
    </div>
  </div>
</template>

<style scoped>
.complete-container {
  width: 100%;
  max-width: 900px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
}

.complete-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 4rem 3rem;
  text-align: center;
  width: 100%;
}

.success-icon {
  position: relative;
  width: 160px;
  height: 160px;
  margin: 0 auto 2rem;
}

.router-icon {
  position: absolute;
  width: 100px;
  height: 100px;
  top: 30px;
  left: 30px;
  background: linear-gradient(135deg, #0098DA 0%, #0078d4 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 120, 212, 0.3);
  z-index: 2;
}

.router-icon::before {
  content: '📶';
  font-size: 3rem;
}

.wifi-rings {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.ring {
  position: absolute;
  border: 3px solid #0098DA;
  border-radius: 50%;
  opacity: 0;
  animation: pulse-ring 2s ease-out infinite;
}

.ring-1 {
  width: 110px;
  height: 110px;
  top: 25px;
  left: 25px;
  animation-delay: 0s;
}

.ring-2 {
  width: 135px;
  height: 135px;
  top: 12px;
  left: 12px;
  animation-delay: 0.6s;
}

.ring-3 {
  width: 160px;
  height: 160px;
  top: 0;
  left: 0;
  animation-delay: 1.2s;
}

@keyframes pulse-ring {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  30% {
    opacity: 0.6;
  }
  100% {
    opacity: 0;
    transform: scale(1);
  }
}

.device-name {
  color: #333;
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
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
  line-height: 1.8;
  margin-bottom: 2.5rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.message strong {
  color: #0098DA;
  font-weight: 600;
}

.btn-finish {
  background: #0078d4;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.875rem 3rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  box-shadow: 0 2px 8px rgba(0, 120, 212, 0.3);
}

.btn-finish:hover {
  background: #006abd;
  box-shadow: 0 4px 12px rgba(0, 120, 212, 0.4);
}

.btn-finish:active {
  transform: translateY(1px);
}
</style>
