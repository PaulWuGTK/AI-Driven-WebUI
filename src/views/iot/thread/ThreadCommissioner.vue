<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { 
  ThreadCommissionerResponse, 
  ThreadCommissionerUpdateRequest,
  ThreadJoiner
} from '../../../types/thread';
import { getThreadCommissioner, updateThreadCommissioner } from '../../../services/api/thread';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const commissionerData = ref<ThreadCommissionerResponse | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const showSuccess = ref(false);
const successMessage = ref('');
const showAddJoinerModal = ref(false);

// Commissioner enabled state
const commissionerEnabled = ref(false);

// New joiner form data
const newJoiner = ref<{
  joinerId: string;
  pskd: string;
  timeout: number;
}>({
  joinerId: '*',
  pskd: '',
  timeout: 60
});

// Fetch commissioner data
const fetchCommissionerData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getThreadCommissioner();
    commissionerData.value = response;
    commissionerEnabled.value = response.ThreadCommissioner.Enable;
  } catch (err) {
    console.error('Error fetching Thread commissioner data:', err);
    error.value = 'Failed to fetch Thread commissioner data';
  } finally {
    loading.value = false;
  }
};

// Update commissioner enabled state
const updateCommissionerEnabled = async () => {
  loading.value = true;
  error.value = null;
  try {
    const request: ThreadCommissionerUpdateRequest = {
      ThreadCommissioner: {
        Enable: commissionerEnabled.value,
        Operation: 'Add', // Dummy operation, not used for enable/disable
        JoinerId: '*',
        Pskd: '',
        Timeout: 60
      }
    };
    
    await updateThreadCommissioner(request);
    await fetchCommissionerData();
    showSuccessNotification(`Commissioner ${commissionerEnabled.value ? 'enabled' : 'disabled'} successfully`);
  } catch (err) {
    console.error('Error updating commissioner enabled state:', err);
    error.value = 'Failed to update commissioner enabled state';
  } finally {
    loading.value = false;
  }
};

// Add joiner
const addJoiner = async () => {
  if (!newJoiner.value.pskd) {
    error.value = 'PSKd is required';
    return;
  }
  
  loading.value = true;
  error.value = null;
  try {
    const request: ThreadCommissionerUpdateRequest = {
      ThreadCommissioner: {
        Enable: commissionerEnabled.value,
        Operation: 'Add',
        JoinerId: newJoiner.value.joinerId,
        Pskd: newJoiner.value.pskd,
        Timeout: newJoiner.value.timeout
      }
    };
    
    await updateThreadCommissioner(request);
    await fetchCommissionerData();
    showSuccessNotification('Joiner added successfully');
    showAddJoinerModal.value = false;
    resetNewJoiner();
  } catch (err) {
    console.error('Error adding joiner:', err);
    error.value = 'Failed to add joiner';
  } finally {
    loading.value = false;
  }
};

// Delete joiner
const deleteJoiner = async (joinerId: string) => {
  loading.value = true;
  error.value = null;
  try {
    const request: ThreadCommissionerUpdateRequest = {
      ThreadCommissioner: {
        Enable: commissionerEnabled.value,
        Operation: 'Delete',
        JoinerId: joinerId,
        Pskd: '',
        Timeout: 0
      }
    };
    
    await updateThreadCommissioner(request);
    await fetchCommissionerData();
    showSuccessNotification('Joiner deleted successfully');
  } catch (err) {
    console.error('Error deleting joiner:', err);
    error.value = 'Failed to delete joiner';
  } finally {
    loading.value = false;
  }
};

// Reset new joiner form
const resetNewJoiner = () => {
  newJoiner.value = {
    joinerId: '*',
    pskd: '',
    timeout: 60
  };
};

// Show success notification
const showSuccessNotification = (message: string) => {
  successMessage.value = message;
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
  }, 3000);
};

// Open add joiner modal
const openAddJoinerModal = () => {
  resetNewJoiner();
  showAddJoinerModal.value = true;
};

// Close add joiner modal
const closeAddJoinerModal = () => {
  showAddJoinerModal.value = false;
};

onMounted(() => {
  fetchCommissionerData();
});
</script>

<template>
  <div class="thread-content" :data-testid="qa('thread-commissioner-content')">
    <div v-if="loading && !commissionerData" class="loading-state" :data-testid="qa('thread-commissioner-loading')">
      <div class="loading-spinner"></div>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="error" class="error-state" :data-testid="qa('thread-commissioner-error')">
      {{ error }}
    </div>

    <template v-else-if="commissionerData">
      <div class="panel-section" :data-testid="qa('thread-commissioner-section')">
        <div class="section-title" :data-testid="qa('thread-commissioner-title')">{{ t('thread.commissioner') }}</div>
        
        <div class="card-content">
          <div class="form-group">
            <div class="switch-label">
              <span :data-testid="qa('thread-commissioner-enable-label')">{{ t('thread.commissionerEnable') }}</span>
              <label class="switch">
                <input
                  type="checkbox"
                  :data-testid="qa('thread-commissioner-enable-toggle')"
                  v-model="commissionerEnabled"
                  @change="updateCommissionerEnabled"
                >
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <div v-if="commissionerEnabled" class="joiners-section" :data-testid="qa('thread-commissioner-joiners-section')">
            <div class="header-row">
              <div class="section-title-sp" :data-testid="qa('thread-commissioner-joiners-title')">{{ t('thread.availableJoiner') }}</div>
              <div class="action-buttons" :data-testid="qa('thread-commissioner-action-buttons')">
                <button class="btn btn-primary" :data-testid="qa('thread-commissioner-add-joiner-button')" @click="openAddJoinerModal">
                  <span class="material-icons">add</span>
                  {{ t('thread.add') }}
                </button>
                <button class="btn btn-secondary" :data-testid="qa('thread-commissioner-refresh-button')" @click="fetchCommissionerData">
                  <span class="material-icons">refresh</span>
                  {{ t('thread.refresh') }}
                </button>
              </div>
            </div>

            <div class="table-container" :data-testid="qa('thread-commissioner-joiners-table')">
              <table>
                <thead>
                  <tr>
                    <th :data-testid="qa('thread-commissioner-joiners-header-no')">{{ t('thread.no') }}</th>
                    <th :data-testid="qa('thread-commissioner-joiners-header-eui64')">{{ t('thread.eui64OrDiscerner') }}</th>
                    <th :data-testid="qa('thread-commissioner-joiners-header-pskd')">{{ t('thread.pskd') }}</th>
                    <th :data-testid="qa('thread-commissioner-joiners-header-timeout')">{{ t('thread.timeout') }}</th>
                    <th :data-testid="qa('thread-commissioner-joiners-header-operation')">{{ t('thread.operation') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(joiner, index) in commissionerData.ThreadCommissioner.Joiners" :key="index" :data-testid="qa(`thread-commissioner-joiners-row-${index}`)">
                    <td :data-testid="qa(`thread-commissioner-joiners-no-${index}`)">{{ index + 1 }}</td>
                    <td :data-testid="qa(`thread-commissioner-joiners-eui64-${index}`)">{{ joiner.JoinerId }}</td>
                    <td :data-testid="qa(`thread-commissioner-joiners-pskd-${index}`)">{{ joiner.Pskd }}</td>
                    <td :data-testid="qa(`thread-commissioner-joiners-timeout-${index}`)">{{ joiner.Timeout }}</td>
                    <td>
                      <button 
                        class="btn-delete"
                        :data-testid="qa(`thread-commissioner-joiners-delete-${index}`)"
                        @click="deleteJoiner(joiner.JoinerId)"
                      >
                        {{ t('common.delete') }}
                      </button>
                    </td>
                  </tr>
                  <tr v-if="commissionerData.ThreadCommissioner.Joiners.length === 0" :data-testid="qa('thread-commissioner-joiners-no-data-row')">
                    <td colspan="5" class="no-data" :data-testid="qa('thread-commissioner-joiners-no-data')">No joiners available</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="mobile-cards" :data-testid="qa('thread-commissioner-joiners-mobile')">
              <div v-if="commissionerData.ThreadCommissioner.Joiners.length === 0" class="no-data-mobile" :data-testid="qa('thread-commissioner-joiners-no-data-mobile')">
                No joiners available
              </div>
              <div 
                v-else
                class="table-card" 
                v-for="(joiner, index) in commissionerData.ThreadCommissioner.Joiners" 
                :key="index"
                :data-testid="qa(`thread-commissioner-joiners-card-${index}`)"
              >
                <div class="card-row">
                  <span class="card-label" :data-testid="qa(`thread-commissioner-joiners-card-no-label-${index}`)">{{ t('thread.no') }}</span>
                  <span class="card-value" :data-testid="qa(`thread-commissioner-joiners-card-no-value-${index}`)">{{ index + 1 }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label" :data-testid="qa(`thread-commissioner-joiners-card-eui64-label-${index}`)">{{ t('thread.eui64OrDiscerner') }}</span>
                  <span class="card-value" :data-testid="qa(`thread-commissioner-joiners-card-eui64-value-${index}`)">{{ joiner.JoinerId }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label" :data-testid="qa(`thread-commissioner-joiners-card-pskd-label-${index}`)">{{ t('thread.pskd') }}</span>
                  <span class="card-value" :data-testid="qa(`thread-commissioner-joiners-card-pskd-value-${index}`)">{{ joiner.Pskd }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label" :data-testid="qa(`thread-commissioner-joiners-card-timeout-label-${index}`)">{{ t('thread.timeout') }}</span>
                  <span class="card-value" :data-testid="qa(`thread-commissioner-joiners-card-timeout-value-${index}`)">{{ joiner.Timeout }}</span>
                </div>
                <div class="card-actions">
                  <button 
                    class="btn-delete"
                    :data-testid="qa(`thread-commissioner-joiners-card-delete-${index}`)"
                    @click="deleteJoiner(joiner.JoinerId)"
                  >
                    {{ t('common.delete') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Add Joiner Modal -->
    <div v-if="showAddJoinerModal" class="modal-overlay" :data-testid="qa('thread-commissioner-add-joiner-modal')">
      <div class="modal-content" :data-testid="qa('thread-commissioner-add-joiner-modal-content')">
        <div class="modal-header">
          <h3 :data-testid="qa('thread-commissioner-add-joiner-modal-title')">{{ t('thread.add') }}</h3>
          <button class="close-button" :data-testid="qa('thread-commissioner-add-joiner-modal-close')" @click="closeAddJoinerModal">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label :data-testid="qa('thread-commissioner-add-joiner-eui64-label')">{{ t('thread.eui64OrDiscerner') }}</label>
            <input 
              type="text" 
              :data-testid="qa('thread-commissioner-add-joiner-eui64-input')"
              v-model="newJoiner.joinerId" 
              class="form-control"
              placeholder="* (any joiner)"
            />
            <div class="form-hint" :data-testid="qa('thread-commissioner-add-joiner-eui64-hint')">* for any joiner, or EUI-64 like cd771262388e44d1</div>
          </div>
          
          <div class="form-group">
            <label :data-testid="qa('thread-commissioner-add-joiner-pskd-label')">{{ t('thread.pskd') }}</label>
            <input 
              type="text" 
              :data-testid="qa('thread-commissioner-add-joiner-pskd-input')"
              v-model="newJoiner.pskd" 
              class="form-control"
              placeholder="J01NME"
              required
            />
          </div>
          
          <div class="form-group">
            <label :data-testid="qa('thread-commissioner-add-joiner-timeout-label')">{{ t('thread.timeout') }}</label>
            <input 
              type="number" 
              :data-testid="qa('thread-commissioner-add-joiner-timeout-input')"
              v-model="newJoiner.timeout" 
              class="form-control"
              min="1"
              required
            />
            <div class="form-hint" :data-testid="qa('thread-commissioner-add-joiner-timeout-hint')">Timeout in seconds</div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" :data-testid="qa('thread-commissioner-add-joiner-cancel')" @click="closeAddJoinerModal">
            {{ t('common.cancel') }}
          </button>
          <button 
            class="btn btn-primary" 
            :data-testid="qa('thread-commissioner-add-joiner-save')"
            @click="addJoiner"
            :disabled="!newJoiner.pskd"
          >
            {{ t('thread.add') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Success notification -->
    <div v-if="showSuccess" class="success-message" :data-testid="qa('thread-commissioner-success-message')">
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

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}

.form-hint {
  margin-top: 0.25rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.switch-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-primary);
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  flex-shrink: 0;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary-color);
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.joiners-section {
  margin-top: 1.5rem;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title-sp {
  font-size: 1rem;
  color: var(--text-primary);
  padding: 0.5rem 0;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-delete {
  color: #dc3545;
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.btn-delete:hover {
  background-color: rgba(220, 53, 69, 0.1);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 4px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid var(--border-color);
}

.no-data {
  text-align: center;
  padding: 1rem;
  color: var(--text-secondary);
}

.no-data-mobile {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  background-color: var(--bg-secondary);
  border-radius: 4px;
  margin-bottom: 1rem;
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

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  background-color: white;
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
}

.error-state {
  padding: 2rem;
  text-align: center;
  color: #dc3545;
  background-color: white;
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
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
  
  .header-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .action-buttons {
    width: 100%;
  }

  .action-buttons .btn {
    flex: 1;
    justify-content: center;
  }

  .table-container {
    display: none;
  }

  .mobile-cards {
    display: block;
  }

  .card-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-footer .btn {
    width: 100%;
  }
}
</style>