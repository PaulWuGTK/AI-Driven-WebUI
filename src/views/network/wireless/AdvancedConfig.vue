<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { getWlanAdvanced, updateWlanAdvanced } from '../../../services/api/wireless';
import type { WlanAdvancedResponse } from '../../../types/wireless';
import WirelessAdvancedBandConfig from './advanced/WirelessAdvancedBandConfig.vue';
import BlockingOverlay from '../../../components/BlockingOverlay.vue';
import { ActionButtons } from '../../../components/common';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const router = useRouter();
const advancedData = ref<WlanAdvancedResponse | null>(null);
const loading = ref(false);
const showSuccess = ref(false);
const showBlockingOverlay = ref(false);

const sortedRadios = computed(() => {
  const radios = advancedData.value?.WlanAdvanced.Radios ?? [];
  return [...radios].sort((a, b) => (a.InstanceIndex ?? 0) - (b.InstanceIndex ?? 0));
});

const mloEnabledGroupsText = computed(() => {
  if (!advancedData.value?.WlanAdvanced.MLOEnabledGroups?.length) {
    return '';
  }
  return advancedData.value.WlanAdvanced.MLOEnabledGroups.join(', ');
});

const fetchAdvancedConfig = async () => {
  loading.value = true;
  try {
    advancedData.value = await getWlanAdvanced();
  } catch (error) {
    console.error('Error fetching wireless advanced config:', error);
  } finally {
    loading.value = false;
  }
};

const showSuccessMessage = () => {
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
  }, 3000);
};

const handleBlockingComplete = () => {
  showBlockingOverlay.value = false;
  // Redirect back to the current page to refresh data
  router.go(0);
};

const handleSubmit = async () => {
  if (!advancedData.value) return;
  loading.value = true;
  try {
    const postData: WlanAdvancedResponse = {
      WlanAdvanced: {
        Radios: advancedData.value.WlanAdvanced.Radios.map((radio) => ({
          Alias: radio.Alias,
          RadioEnable: radio.RadioEnable,
          Mode: radio.Mode,
          Channel: radio.Channel.toString(),
          ChannelBandwidth: radio.ChannelBandwidth,
          AutoChannelEnable: Number(radio.AutoChannelEnable),
          MultiUserMIMOEnabled: radio.MultiUserMIMOEnabled ?? 0
        }))
      }
    };

    await updateWlanAdvanced(postData);
    showSuccessMessage();

    // Show blocking overlay instead of immediate refresh
    showBlockingOverlay.value = true;
  } catch (error) {
    console.error('Error updating wireless advanced config:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchAdvancedConfig);
</script>

<template>
  <div class="wireless-advanced-config" :data-testid="qa('wireless-advanced-config-content')">
    <form @submit.prevent="handleSubmit" :class="{ 'loading': loading }" :data-testid="qa('wireless-advanced-config-form')">
      <div v-if="loading" class="loading-overlay" :data-testid="qa('wireless-advanced-config-loading-overlay')">
        <div class="loading-spinner"></div>
      </div>

      <div v-if="showSuccess" class="success-message" :data-testid="qa('wireless-advanced-config-success-message')">
        {{ t('common.apply') }} successful
      </div>

      <div v-if="advancedData" class="band-sections" :data-testid="qa('wireless-advanced-config-band-sections')">
        <!-- MLO Enable Status Information -->
        <div class="mlo-status" v-if="advancedData.WlanAdvanced.MLOEnable === 1" :data-testid="qa('wireless-advanced-config-mlo-status')">
          <div class="info-banner" :data-testid="qa('wireless-advanced-config-mlo-info-banner')">
            <span class="material-icons">info</span>
            <span v-if="mloEnabledGroupsText">{{ t('wireless.mloModeDisabledWithGroups', { groups: mloEnabledGroupsText }) }}</span>
            <span v-else>{{ t('wireless.mloModeDisabled') }}</span>
          </div>
        </div>

        <WirelessAdvancedBandConfig
          v-for="(radio, idx) in sortedRadios"
          :key="radio.Alias ?? idx"
          :data-testid="qa(`wireless-advanced-config-${slug(radio.OperatingFrequencyBand ?? '')}-band`)"
          :title="radio.OperatingFrequencyBand ?? ''"
          v-model="sortedRadios[idx]"
          :mloEnabled="advancedData.WlanAdvanced.MLOEnable === 1"
        />
      </div>

      <div class="button-group" :data-testid="qa('wireless-advanced-config-button-group')">
        <ActionButtons
          :cancel-data-testid="qa('wireless-advanced-config-cancel-button')"
          :apply-data-testid="qa('wireless-advanced-config-apply-button')"
          :cancel-disabled="loading"
          :apply-disabled="loading"
          apply-type="submit"
          @cancel="fetchAdvancedConfig"
        />
      </div>
    </form>

    <!-- Blocking Overlay -->
    <BlockingOverlay
      :data-testid="qa('wireless-advanced-config-blocking-overlay')"
      :is-visible="showBlockingOverlay"
      :message="t('wireless.applyingAdvancedSettings')"
      :description1="t('wireless.applyingDescription')"
      :description2="''"
      :show-countdown="false"
      :duration="60"
      @complete="handleBlockingComplete"
    />
  </div>
</template>

<style scoped>
.wireless-advanced-config {
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0070BB;
  border-radius: 50%;
  animation: spin 1s linear infinite;
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

.mlo-status {
  margin-bottom: 1.5rem;
}

.info-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background-color: #e3f2fd;
  border-left: 4px solid #0070BB;
  border-radius: 4px;
  color: #0070BB;
}

.info-banner .material-icons {
  font-size: 1.25rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
}

.band-sections {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  padding: 0 1.5rem 1.5rem;
}
</style>
