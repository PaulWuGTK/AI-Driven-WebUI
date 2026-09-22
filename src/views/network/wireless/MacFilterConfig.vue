<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { MACFilteringResponse, MACFilteringEntry } from '../../../types/macFiltering';
import { getMACFiltering, updateMACFiltering } from '../../../services/api/macFiltering';
import MacFilterBand from '../../../components/network/wireless/macfilter/MacFilterBand.vue';
import ConfirmationDialog from '../../../components/ConfirmationDialog.vue';
import { ActionButtons } from '../../../components/common';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const activeTab = ref('2.4G');
const macFilteringData = ref<MACFilteringResponse | null>(null);
const loading = ref(false);
const showSuccess = ref(false);
const error = ref<string | null>(null);
const showConfirmDialog = ref(false);

const filterByBand = (freq: string) =>
  macFilteringData.value?.WifiMACFiltering.Interfaces.filter(
    (e) => e.OperatingFrequencyBand === freq
  ) || [];

const wifi2gEntries = computed(() => filterByBand('2.4GHz'));
const wifi5gEntries = computed(() => filterByBand('5GHz'));
const wifi6gEntries = computed(() => filterByBand('6GHz'));

const originalEntries = ref<MACFilteringEntry[]>([]);

const fetchMACFiltering = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getMACFiltering();
    macFilteringData.value = response;

    originalEntries.value = JSON.parse(JSON.stringify(response.WifiMACFiltering.Interfaces));
  } catch (err) {
    console.error('Error fetching MAC filtering data:', err);
    error.value = 'Failed to fetch MAC filtering data';
  } finally {
    loading.value = false;
  }
};

const updateBandEntries = (freq: string, entries: MACFilteringEntry[]) => {
  if (!macFilteringData.value) return;
  // Replace entries matching this band in the flat Interfaces array
  const others = macFilteringData.value.WifiMACFiltering.Interfaces.filter(
    (e) => e.OperatingFrequencyBand !== freq
  );
  macFilteringData.value.WifiMACFiltering.Interfaces = [...others, ...entries];
};

const showSuccessMessage = () => {
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
  }, 3000);
};

const handleApply = () => {
  const hasOffToOnTransition = checkOffToOnTransition();

  if (hasOffToOnTransition) {
    showConfirmDialog.value = true;
  } else {
    showConfirmDialog.value = false;
    confirmApply();
  }
};

const checkOffToOnTransition = (): boolean => {
  if (!macFilteringData.value) return false;

  return macFilteringData.value.WifiMACFiltering.Interfaces.some((currentEntry) => {
    const orig = originalEntries.value.find(
      (o) => (o.Alias && o.Alias === currentEntry.Alias) || o.Path === currentEntry.Path
    );
    if (!orig) return false;
    return orig.ACLMode === 'Off' &&
           (currentEntry.ACLMode === 'WhiteList' || currentEntry.ACLMode === 'BlackList');
  });
};

const confirmApply = async () => {
  if (!macFilteringData.value) return;

  loading.value = true;
  error.value = null;
  try {
    await updateMACFiltering({
      WifiMACFiltering: {
        Interfaces: macFilteringData.value.WifiMACFiltering.Interfaces.map((e) => ({
          Alias: e.Alias,
          ACLMode: e.ACLMode,
          MACList: e.MACList
        }))
      }
    });
    showSuccessMessage();
    await fetchMACFiltering();
  } catch (err) {
    console.error('Error updating MAC filtering:', err);
    error.value = 'Failed to update MAC filtering';
  } finally {
    loading.value = false;
    showConfirmDialog.value = false;
  }
};

const handleCancel = async () => {
  await fetchMACFiltering();
};

onMounted(fetchMACFiltering);
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('mac-filter-title')">{{ t('macfilter.title') }}</h1>

    <div class="status-content" :data-testid="qa('mac-filter-content')">
      <div v-if="loading && !macFilteringData" class="loading-state" :data-testid="qa('mac-filter-loading')">
        <div class="loading-spinner"></div>
        <span>{{ t('common.loading') }}</span>
      </div>

      <div v-else-if="error" class="error-state" :data-testid="qa('mac-filter-error')">
        {{ error }}
      </div>

      <template v-else-if="macFilteringData">
        <div class="panel-section" :data-testid="qa('mac-filter-panel')">
          <div class="tab-navigation" :data-testid="qa('mac-filter-tabs')">
            <button
              class="tab-button"
              :class="{ active: activeTab === '2.4G' }"
              :data-testid="qa('mac-filter-tab-2g')"
              @click="activeTab = '2.4G'"
            >
              2.4G
            </button>
            <button
              class="tab-button"
              :class="{ active: activeTab === '5G' }"
              :data-testid="qa('mac-filter-tab-5g')"
              @click="activeTab = '5G'"
            >
              5G
            </button>
            <button
              class="tab-button"
              :class="{ active: activeTab === '6G' }"
              :data-testid="qa('mac-filter-tab-6g')"
              @click="activeTab = '6G'"
            >
              6G
            </button>
          </div>

          <div class="tab-content" :data-testid="qa('mac-filter-tab-content')">
            <MacFilterBand
              v-if="activeTab === '2.4G'"
              :entries="wifi2gEntries"
              band="2.4G"
              :data-testid="qa('mac-filter-2g-band')"
              @update:entries="(e: MACFilteringEntry[]) => updateBandEntries('2.4GHz', e)"
            />
            <MacFilterBand
              v-if="activeTab === '5G'"
              :entries="wifi5gEntries"
              band="5G"
              :data-testid="qa('mac-filter-5g-band')"
              @update:entries="(e: MACFilteringEntry[]) => updateBandEntries('5GHz', e)"
            />
            <MacFilterBand
              v-if="activeTab === '6G'"
              :entries="wifi6gEntries"
              band="6G"
              :data-testid="qa('mac-filter-6g-band')"
              @update:entries="(e: MACFilteringEntry[]) => updateBandEntries('6GHz', e)"
            />
          </div>

          <div class="button-group">
            <ActionButtons
              :cancel-disabled="loading"
              :apply-disabled="loading"
              :cancel-data-testid="qa('mac-filter-cancel-button')"
              :apply-data-testid="qa('mac-filter-apply-button')"
              @cancel="handleCancel"
              @apply="handleApply"
            />
          </div>
        </div>
      </template>

      <div v-if="showSuccess" class="success-message" :data-testid="qa('mac-filter-success-message')">
        {{ t('common.apply') }} successful
      </div>

      <ConfirmationDialog
        :is-open="showConfirmDialog"
        :data-testid="qa('mac-filter-confirm-dialog')"
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

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
  z-index: 1100;
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

  .button-group :deep(.btn) {
    width: 100%;
  }
}
</style>
