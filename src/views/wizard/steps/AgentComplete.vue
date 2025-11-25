<script setup lang="ts">
import { ref } from 'vue';
import { wizardApi } from '../../../services/api/wizard';

interface Props {
  wizardData: any;
}

const props = defineProps<Props>();

const isRedirecting = ref(false);

const handleFinish = async () => {
  if (isRedirecting.value) return;

  try {
    isRedirecting.value = true;
    await wizardApi.completeAgentSetup();

    // Redirect to 192.168.101.1
    window.location.href = 'http://192.168.101.1';
  } catch (error) {
    console.error('Failed to complete agent setup:', error);
    isRedirecting.value = false;
  }
};

const deviceModel = props.wizardData?.ModelName || 'WNRFQQ-112BE';
</script>

<template>
  <div class="step-container">
    <div class="step-card">
      <div class="success-content">
        <div class="device-icon">
          <svg viewBox="0 0 200 200" class="device-svg">
            <circle cx="100" cy="100" r="90" fill="#0078d4" opacity="0.1"/>
            <circle cx="100" cy="100" r="70" fill="#0078d4" opacity="0.2"/>
            <circle cx="100" cy="100" r="50" fill="#0078d4"/>

            <!-- Router/Device shape -->
            <rect x="70" y="80" width="60" height="40" rx="8" fill="white"/>

            <!-- WiFi waves -->
            <path d="M 50 100 Q 70 80, 90 100" stroke="white" stroke-width="3" fill="none" opacity="0.6"/>
            <path d="M 110 100 Q 130 80, 150 100" stroke="white" stroke-width="3" fill="none" opacity="0.6"/>

            <path d="M 40 100 Q 70 60, 100 100" stroke="white" stroke-width="3" fill="none" opacity="0.3"/>
            <path d="M 100 100 Q 130 60, 160 100" stroke="white" stroke-width="3" fill="none" opacity="0.3"/>
          </svg>
        </div>

        <h1 class="device-model">{{ deviceModel }}</h1>

        <h2 class="finish-title">Finish!</h2>

        <div class="instructions">
          <p>Wait until the LED stops blinking and turns solid blue.</p>
          <p>Then you can log in to the web-based configuration page to check the mesh topology.</p>
        </div>

        <button
          class="finish-button"
          @click="handleFinish"
          :disabled="isRedirecting"
        >
          {{ isRedirecting ? 'Redirecting...' : 'Finish Setup' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step-container {
  width: 100%;
  max-width: 900px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.step-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 3rem 2.5rem;
  width: 100%;
  max-width: 600px;
}

.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.device-icon {
  width: 200px;
  height: 200px;
  margin-bottom: 2rem;
}

.device-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 8px rgba(0, 120, 212, 0.2));
}

.device-model {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 1rem 0;
}

.finish-title {
  font-size: 2rem;
  font-weight: 700;
  color: #0078d4;
  margin: 0 0 2rem 0;
}

.instructions {
  max-width: 500px;
  margin-bottom: 2.5rem;
}

.instructions p {
  color: #666;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0.75rem 0;
}

.finish-button {
  background: #0078d4;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 3rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 120, 212, 0.3);
}

.finish-button:hover:not(:disabled) {
  background: #006abd;
  box-shadow: 0 4px 12px rgba(0, 120, 212, 0.4);
  transform: translateY(-1px);
}

.finish-button:disabled {
  background: #999;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

@media (max-width: 768px) {
  .step-card {
    padding: 2rem 1.5rem;
  }

  .device-icon {
    width: 150px;
    height: 150px;
  }

  .device-model {
    font-size: 1.25rem;
  }

  .finish-title {
    font-size: 1.75rem;
  }

  .instructions p {
    font-size: 0.95rem;
  }

  .finish-button {
    padding: 0.875rem 2.5rem;
    font-size: 1rem;
  }
}
</style>
