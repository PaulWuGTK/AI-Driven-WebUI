<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { updateWlanWps } from '../../../../services/api/wireless';

const { t } = useI18n();
const props = defineProps<{
  pinCode: string;
}>();

const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

const clientPin = ref('');
const loading = ref(false);

const handlePushButton = async () => {
  loading.value = true;
  try {
    await updateWlanWps({
      WlanWps: {
        Action: 'PBCbtn'
      }
    });
    emit('refresh');
  } catch (error) {
    console.error('Error triggering WPS push button:', error);
  } finally {
    loading.value = false;
  }
};

const handlePinConnect = async () => {
  if (!clientPin.value) return;
  
  loading.value = true;
  try {
    await updateWlanWps({
      WlanWps: {
        Action: 'PIN',
        ClientPIN: parseInt(clientPin.value, 10)
      }
    });
    emit('refresh');
    clientPin.value = '';
  } catch (error) {
    console.error('Error connecting with PIN:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="wps-actions">
    <!-- Push Button Section -->
    <div class="action-section">
      <h3>{{ t('wireless.wpsPushButton') }}</h3>
      <p>{{ t('wireless.wpsPushButtonDesc') }}</p>
      <button 
        class="btn btn-primary"
        @click="handlePushButton"
        :disabled="loading"
      >
        {{ t('wireless.wpsPushButton') }}
      </button>
    </div>

    <!-- PIN Code Connect Section -->
    <div class="action-section">
      <h3>{{ t('wireless.wpsPinConnect') }}</h3>
      <p>{{ t('wireless.wpsPinConnectDesc') }}</p>
      <div class="pin-input">
        <input
          type="text"
          v-model="clientPin"
          :placeholder="t('wireless.enterPin')"
        />
        <button 
          class="btn btn-primary"
          @click="handlePinConnect"
          :disabled="loading || !clientPin"
        >
          {{ t('wireless.connect') }}
        </button>
      </div>
    </div>

    <!-- Generated PIN Section -->
    <div class="action-section">
      <h3>{{ t('wireless.generatePinCode') }}</h3>
      <p>{{ t('wireless.devicePinDesc') }}</p>
      <div class="pin-display">
        {{ props.pinCode }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.wps-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.action-section {
  background-color: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 1.5rem;
}

h3 {
  font-size: 1rem;
  color: #333;
  margin: 0 0 1rem 0;
}

p {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.pin-input {
  display: flex;
  gap: 0.5rem;
}

input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.pin-display {
  padding: 0.5rem;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
  font-size: 1.1rem;
  text-align: center;
}

.btn {
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-primary {
  background-color: #0070BB;
  color: white;
}

.btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn:hover:not(:disabled) {
  opacity: 0.9;
}
</style>