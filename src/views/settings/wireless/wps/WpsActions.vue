<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { updateWlanWps } from '../../../../services/api/wireless';
import ConfirmationDialog from '../../../../components/ConfirmationDialog.vue';

const { t } = useI18n();

const props = defineProps<{
  pinCode: string;
}>();

const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

const clientPin = ref('');
const loading = ref(false);
const showConfirmDialog = ref(false);
const confirmAction = ref<'pushButton' | 'pinConnect' | null>(null);

const handlePushButton = async () => {
  confirmAction.value = 'pushButton';
  showConfirmDialog.value = true;
};

const handlePinConnect = async () => {
  if (!clientPin.value) return;
  
  confirmAction.value = 'pinConnect';
  showConfirmDialog.value = true;
};

const confirmAction_execute = async () => {
  loading.value = true;
  try {
    if (confirmAction.value === 'pushButton') {
      await updateWlanWps({
        WlanWps: {
          Action: 'PBCbtn'
        }
      });
    } else if (confirmAction.value === 'pinConnect') {
      await updateWlanWps({
        WlanWps: {
          Action: 'PIN',
          ClientPIN: parseInt(clientPin.value, 10)
        }
      });
      clientPin.value = '';
    }
    emit('refresh');
  } catch (error) {
    console.error('Error with WPS action:', error);
  } finally {
    loading.value = false;
    showConfirmDialog.value = false;
    confirmAction.value = null;
  }
};

const cancelConfirmation = () => {
  showConfirmDialog.value = false;
  confirmAction.value = null;
};
</script>

<template>
  <div class="wps-actions">
    <!-- WPS Push Button Section -->
    <div class="wps-section">
      <div class="section-title-sp">{{ t('wireless.wpsPushButton') }}</div>
      <div class="action-section">
        <div class="description-title">{{ t('wireless.pushButtonTitle') }}</div>
        <p>{{ t('wireless.wpsPushButtonDesc') }}</p>
        <button 
          class="btn btn-primary"
          @click="handlePushButton"
          :disabled="loading"
        >
          {{ t('wireless.pushButton') }}
        </button>
      </div>
    </div>

    <!-- WPS PIN Code Connect Section -->
    <div class="wps-section">
      <div class="section-title-sp">{{ t('wireless.wpsPinConnect') }}</div>
      <div class="action-section">
        <div class="description-title">{{ t('wireless.pinConnectTitle') }}</div>
        <p>{{ t('wireless.wpsPinConnectDesc') }}</p>
        <div class="pin-section">
          <div class="pin-label">{{ t('wireless.pinCodeOfClient') }}</div>
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
      </div>
    </div>

    <!-- Generate PIN Code Section -->
    <div class="wps-section">
      <div class="section-title-sp">{{ t('wireless.generatePinCode') }}</div>
      <div class="action-section">
        <div class="description-title">{{ t('wireless.devicePinTitle') }}</div>
        <p>{{ t('wireless.devicePinDesc') }}</p>
        <div class="pin-section">
          <div class="pin-label">{{ t('wireless.pinCode') }}</div>
          <div class="pin-display">
            {{ props.pinCode }}
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <ConfirmationDialog
      :is-open="showConfirmDialog"
      :title="t('wireless.enableWpsConfirm')"
      :message="t('wireless.enableWpsMessage')"
      @confirm="confirmAction_execute"
      @cancel="cancelConfirmation"
    />
  </div>
</template>

<style scoped>
.wps-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.wps-section {
  display: flex;
  flex-direction: column;
}

.section-title-sp {
  font-size: 1.25rem;
  color: var(--primary-color);
  font-weight: bold;
  padding: 0.75rem 0rem;
  background-color: white;
  border-bottom: 1px solid var(--border-color);
}

.action-section {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.2);
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.description-title {
  padding: 0.75rem 0;
  font-size: 1rem;
  color: var(--text-primary);
  background-color: var(--bg-secondary);
}

p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 1rem 0;
  flex: 1;
}

.pin-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pin-label {
  color: var(--text-primary);
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.pin-input {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}

.pin-display {
  padding: 0.5rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-family: monospace;
  font-size: 1.1rem;
  text-align: center;
}

.btn {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  min-width: 80px;
}

@media (max-width: 1024px) {
  .wps-actions {
    grid-template-columns: 1fr;
  }

  .action-section {
    padding: 1rem;
  }

  .pin-input {
    flex-direction: column;
    align-items: stretch;
  }

  .pin-input .btn {
    width: 100%;
  }

  .btn {
    width: 100%;
  }
}
</style>