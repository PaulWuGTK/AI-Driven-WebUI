<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ThreadJoinNetworkRequest } from '../../../types/thread';
import { joinThreadNetwork } from '../../../services/api/thread';
import { BaseToast } from '../../../components/common';
import { useAutoDismiss } from '../../../composables/useAutoDismiss';
import { extractNokMessage } from '../../../utils/apiUtils';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const loading = ref(false);
const error = ref<string | null>(null);
const successMessage = ref('');
const errorToastMessage = ref('');
const { visible: showSuccessToast, show: triggerSuccessToast } = useAutoDismiss();
const { visible: showErrorToast, show: triggerErrorToast } = useAutoDismiss();

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
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      showErrorNotification(nokMessage);
      return;
    }
    
    if (response.ThreadJoinNetwork.Status === 'Join Success') {
      showSuccessNotification(t('thread.joinSuccess'));
      credentialValue.value = '';
    } else {
      error.value = response.ThreadJoinNetwork.Status || t('thread.joinFailed');
    }
  } catch (err) {
    console.error('Error joining Thread network:', err);
    showErrorNotification('Failed to join Thread network');
  } finally {
    loading.value = false;
  }
};

// Show success notification
const showSuccessNotification = (message: string) => {
  successMessage.value = message;
  triggerSuccessToast();
};

const showErrorNotification = (message: string) => {
  errorToastMessage.value = message;
  triggerErrorToast();
};
</script>

<template>
  <div class="thread-content" :data-testid="qa('thread-join-content')">
    <div class="panel-section" :data-testid="qa('thread-join-section')">
      <div class="section-title" :data-testid="qa('thread-join-title')">{{ t('thread.join') }}</div>
      
      <div class="card-content">
        <div class="join-container">
          <!-- Network Key Join -->
          <div class="join-section" :data-testid="qa('thread-join-form-section')">
            <div class="credential-type">
              <div class="credential-label" :data-testid="qa('thread-join-credential-type-label')">{{ t('thread.credentialType') }}:</div>
              <select v-model="credentialType" class="credential-select" :data-testid="qa('thread-join-credential-type-select')">
                <option value="NetworkKey">{{ t('thread.networkKey') }}</option>
                <option value="PSKd">{{ t('thread.pskc') }}</option>
              </select>
            </div>
            
            <div class="credential-value">
              <div class="credential-label" :data-testid="qa('thread-join-credential-value-label')">{{ credentialType }}:</div>
              <input 
                type="text" 
                :data-testid="qa('thread-join-credential-value-input')"
                v-model="credentialValue" 
                class="credential-input"
                :placeholder="credentialType === 'NetworkKey' ? '80DD708D25F4F8ED06285A11054A708C' : 'J01NME'"
              />
            </div>
          </div>
          
          <div class="join-button-container">
            <button 
              class="btn btn-primary join-button" 
              :data-testid="qa('thread-join-button')"
              @click="handleJoin"
              :disabled="loading || !credentialValue"
            >
              <span class="material-icons" v-if="loading">sync</span>
              {{ t('thread.joinButton') }}
            </button>
          </div>
        </div>

        <div v-if="error" class="error-message" :data-testid="qa('thread-join-error')">
          {{ error }}
        </div>
      </div>
    </div>

    <BaseToast
      v-model="showSuccessToast"
      :message="successMessage"
      type="success"
      :data-testid="qa('thread-join-success-message')"
    />
    <BaseToast
      v-model="showErrorToast"
      :message="errorToastMessage"
      type="error"
      :data-testid="qa('thread-join-error-toast')"
    />
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
