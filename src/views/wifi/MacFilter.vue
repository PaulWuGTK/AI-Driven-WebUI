<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { MACFilteringResponse, MACFilteringEntry } from '../../types/macFiltering';
import { getMACFiltering, updateMACFiltering } from '../../services/api/macFiltering';
import MacFilterBand from './macfilter/MacFilterBand.vue';
import ConfirmationDialog from '../../components/ConfirmationDialog.vue';

const { t } = useI18n();
const activeTab = ref('2.4G');
const macFilteringData = ref<MACFilteringResponse | null>(null);
const loading = ref(false);
const showSuccess = ref(false);
const error = ref<string | null>(null);
const showConfirmDialog = ref(false);

// Computed properties for each band's entries
const wifi2gEntries = computed(() => 
  macFilteringData.value?.MACFiltering.wifi2g || []
);

const wifi5gEntries = computed(() => 
  macFilteringData.value?.MACFiltering.wifi5g || []
);

const wifi6gEntries = computed(() => 
  macFilteringData.value?.MACFiltering.wifi6g || []
);

// Store original entries to compare for off-to-on transitions
const originalWifi2gEntries = ref<MACFilteringEntry[]>([]);
const originalWifi5gEntries = ref<MACFilteringEntry[]>([]);
const originalWifi6gEntries = ref<MACFilteringEntry[]>([]);

// Fetch MAC filtering data
const fetchMACFiltering = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getMACFiltering();
    macFilteringData.value = response;
    
    // Store original entries for comparison
    originalWifi2gEntries.value = JSON.parse(JSON.stringify(response.MACFiltering.wifi2g));
    originalWifi5gEntries.value = JSON.parse(JSON.stringify(response.MACFiltering.wifi5g));
    originalWifi6gEntries.value = JSON.parse(JSON.stringify(response.MACFiltering.wifi6g));
  } catch (err) {
    console.error('Error fetching MAC filtering data:', err);
    error.value = 'Failed to fetch MAC filtering data';
  } finally {
    loading.value = false;
  }
};

// Update 2.4G entries
const update2GEntries = (entries: MACFilteringEntry[]) => {
  if (!macFilteringData.value) return;
  macFilteringData.value.MACFiltering.wifi2g = entries;
};

// Update 5G entries
const update5GEntries = (entries: MACFilteringEntry[]) => {
  if (!macFilteringData.value) return;
  macFilteringData.value.MACFiltering.wifi5g = entries;
};

// Update 6G entries
const update6GEntries = (entries: MACFilteringEntry[]) => {
  if (!macFilteringData.value) return;
  macFilteringData.value.MACFiltering.wifi6g = entries;
};

// Show success message
const showSuccessMessage = () => {
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
  }, 3000);
};

// Apply changes
const handleApply = () => {
  // Check if any band is changing from 'Off' to 'Allow' or 'Deny'
  const hasOffToOnTransition = checkOffToOnTransition();
  
  if (hasOffToOnTransition) {
    showConfirmDialog.value = true;
  } else {
    showConfirmDialog.value = false;
    // If no off-to-on transitions, apply directly without confirmation
    confirmApply();
  }
};

// Check if there are any transitions from 'Off' to 'Allow' or 'Deny'
const checkOffToOnTransition = (): boolean => {
  if (!macFilteringData.value) return false;
  
  // Check each band for off-to-on transitions (only 2.4G and 5G since 6G doesn't have WPS)
  const checkBandTransitions = (currentEntries: MACFilteringEntry[], originalEntries: MACFilteringEntry[]): boolean => {
    return currentEntries.some(currentEntry => {
      const originalEntry = originalEntries.find(orig => orig.Path === currentEntry.Path);
      if (!originalEntry) return false;
      
      // Only off to on transitions (Off -> WhiteList or Off -> BlackList)
      return originalEntry.ACLMode === 'Off' && 
             (currentEntry.ACLMode === 'WhiteList' || currentEntry.ACLMode === 'BlackList');
    });
  };
  
  // Only check 2.4G and 5G bands (6G doesn't have WPS)
  return checkBandTransitions(macFilteringData.value.MACFiltering.wifi2g, originalWifi2gEntries.value) ||
         checkBandTransitions(macFilteringData.value.MACFiltering.wifi5g, originalWifi5gEntries.value);
};

// Confirm apply changes
const confirmApply = async () => {
  if (!macFilteringData.value) return;
  
  loading.value = true;
  error.value = null;
  try {
    await updateMACFiltering({
      MACFiltering: macFilteringData.value.MACFiltering
    });
    showSuccessMessage();
    // 重新獲取最新資料並更新原始資料基準
    await fetchMACFiltering();
  } catch (err) {
    console.error('Error updating MAC filtering:', err);
    error.value = 'Failed to update MAC filtering';
  } finally {
    loading.value = false;
    showConfirmDialog.value = false;
  }
};

// Cancel changes
const handleCancel = async () => {
  await fetchMACFiltering();
};

onMounted(fetchMACFiltering);
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">{{ t('macfilter.title') }}</h1>

    <div class="status-content">
      <div v-if="loading && !macFilteringData" class="loading-state">
        <div class="loading-spinner"></div>
        <span>{{ t('common.loading') }}</span>
      </div>

      <div v-else-if="error" class="error-state">
        {{ error }}
      </div>

      <template v-else-if="macFilteringData">
        <div class="panel-section">
          <div class="tab-navigation">
            <button
              class="tab-button"
              :class="{ active: activeTab === '2.4G' }"
              @click="activeTab = '2.4G'"
            >
              2.4G
            </button>
            <button
              class="tab-button"
              :class="{ active: activeTab === '5G' }"
              @click="activeTab = '5G'"
            >
              5G
            </button>
            <button
              class="tab-button"
              :class="{ active: activeTab === '6G' }"
              @click="activeTab = '6G'"
            >
              6G
            </button>
          </div>

          <div class="tab-content">
            <MacFilterBand 
              v-if="activeTab === '2.4G'" 
              :entries="wifi2gEntries" 
              band="2.4G"
              @update:entries="update2GEntries"
            />
            <MacFilterBand 
              v-if="activeTab === '5G'" 
              :entries="wifi5gEntries" 
              band="5G"
              @update:entries="update5GEntries"
            />
            <MacFilterBand 
              v-if="activeTab === '6G'" 
              :entries="wifi6gEntries" 
              band="6G"
              @update:entries="update6GEntries"
            />
          </div>

          <div class="button-group">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="handleCancel"
              :disabled="loading"
            >
              {{ t('common.cancel') }}
            </button>
            <button 
              type="button"
              class="btn btn-primary"
              @click="handleApply"
              :disabled="loading"
            >
              {{ t('common.apply') }}
            </button>
          </div>
        </div>
      </template>

      <div v-if="showSuccess" class="success-message">
        {{ t('common.apply') }} successful
      </div>

      <!-- Confirmation Dialog -->
      <ConfirmationDialog
        :is-open="showConfirmDialog"
        :title="t('macfilter.applyChangesTitle')"
        :message="t('macfilter.applyChangesMessage')"
        @confirm="confirmApply"
        @cancel="showConfirmDialog = false"
      />
    </div>
  </div>
</template>

<style scoped>
.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
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
  .button-group {
    flex-direction: column;
    padding: 1rem;
  }

  .button-group .btn {
    width: 100%;
  }
}
</style>