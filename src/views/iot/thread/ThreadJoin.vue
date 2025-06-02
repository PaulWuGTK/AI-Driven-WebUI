<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ThreadJoinNetworkRequest } from '../../../types/thread';
import { joinThreadNetwork } from '../../../services/api/thread';

const { t } = useI18n();
const loading = ref(false);
const error = ref<string | null>(null);
const showSuccess = ref(false);
const successMessage = ref('');

// Form data
const credentialType = ref<'NetworkKey' | 'PSKd'>('NetworkKey');
const credentialValue = ref('');

// Join network
const handleJoin = async () => {
  if (!credentialValue.value) {
    error.value = 'Please enter a credential value';
    return;
  }
  
  loading.value = true;
  error.value = null;
  try {
    const request: ThreadJoinNetworkRequest = {
      ThreadJoinNetwork: {
        'Credential Type': credentialType.value,
        'Credential Value': credentialValue.value
      }
    };
    
    const response = await joinThreadNetwork(request);
    
    if (response.ThreadJoinNetwork.Status === 'Join Success') {
      showSuccessNotification(t('thread.joinSuccess'));
      credentialValue.value = '';
    } else {
      error.value = response.ThreadJoinNetwork.Status || t('thread.joinFailed');
    }
  } catch (err) {
    console.error('Error joining Thread network:', err);
    error.value = 'Failed to join Thread network';
  } finally {
    loading.value = false;
  }
};

// Show success notification
const showSuccessNotification = (message: string) => {
  successMessage.value = message;
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
  }, 3000);
};
</script>

<template>
  <div class="thread-content">
    <div class="panel-section">
      <div class="section-title">{{ t('thread.join') }}</div>
      
      <div class="card-content">
        <div class="join-container">
          <!-- Network Key Join -->
          <div class="join-section">
            <div class="credential-type">
              <div class="credential-label">{{ t('thread.credentialType') }}:</div>
              <select v-model="credentialType" class="credential-select">
                <option value="NetworkKey">{{ t('thread.networkKey') }}</option>
                <option value="PSKd">{{ t('thread.pskc') }}</option>
              </select>
            </div>
            
            <div class="credential-value">
              <div class="credential-label">{{ credentialType }}:</div>
              <input 
                type="text" 
                v-model="credentialValue" 
                class="credential-input"
                :placeholder="credentialType === 'NetworkKey' ? '80DD708D25F4F8ED06285A11054A708C' : 'J01NME'"
              />
            </div>
          </div>
          
          <div class="join-button-container">
            <button 
              class="btn btn-primary join-button" 
              @click="handleJoin"
              :disabled="loading || !credentialValue"
            >
              <span class="material-icons" v-if="loading">sync</span>
              {{ t('thread.joinButton') }}
            </button>
          </div>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>
    </div>

    <!-- Success notification -->
    <div v-if="showSuccess" class="success-message">
      {{ successMessage }}
    </div>
  </div>
</template>

<style scoped>
.thread-content {
  padding: 1.5rem;
}

.panel-section {
  margin-bottom: 1.5rem;
}

.join-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.join-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.credential-type, .credential-value {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.credential-label {
  min-width: 150px;
  color: var(--text-primary);
  font-weight: 500;
}

.credential-select, .credential-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}

.join-button-container {
  display: flex;
  justify-content: center;
}

.join-button {
  min-width: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.error-message {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #fee;
  color: #dc3545;
  border-radius: 4px;
  text-align: center;
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

@media (max-width: 768px) {
  .thread-content {
    padding: 1rem;
  }
  
  .panel-section {
    margin-bottom: 1rem;
  }
  
  .credential-type, .credential-value {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .credential-label {
    min-width: auto;
  }

  .credential-select, .credential-input {
    width: 100%;
  }

  .join-button {
    width: 100%;
  }
}
</style>