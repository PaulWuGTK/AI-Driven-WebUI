<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ActionButtons, BaseInput, BaseSecretInput, BaseSelect, BaseSwitch } from '../../components/common';
import { useQA } from '../../utils/qa';
import type { OpenWrtActionResult, OpenWrtWifiBandConfig, OpenWrtWifiBasicRequest, OpenWrtWifiBasicResponse } from '../../types/openwrtWifi';
import {
  applyOpenWrtWifi,
  getOpenWrtWifiBasic,
  isPasswordRequiredForAuthentication,
  updateOpenWrtWifiBasic
} from '../../services/api-openwrt';

const { qa } = useQA();

const loading = ref(false);
const submitting = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const payload = ref<OpenWrtWifiBasicResponse | null>(null);
const formBands = ref<OpenWrtWifiBandConfig[]>([]);

const deepClone = <T>(input: T): T => JSON.parse(JSON.stringify(input));

const loadWifiBasic = async () => {
  loading.value = true;
  error.value = null;
  successMessage.value = null;
  try {
    const res = await getOpenWrtWifiBasic();
    payload.value = res;
    formBands.value = deepClone(res.WifiBasic.Bands || []);
  } catch (err) {
    console.error('Failed to load OpenWrt wifi basic:', err);
    error.value = 'Failed to load Wi-Fi basic settings.';
  } finally {
    loading.value = false;
  }
};

const canApply = computed(() => formBands.value.length > 0 && !submitting.value);

const normalizeBandBeforeSubmit = (band: OpenWrtWifiBandConfig): OpenWrtWifiBandConfig => {
  const next = deepClone(band);
  next.Enable = next.Enable ? 1 : 0;
  next.HideSSID = next.HideSSID ? 1 : 0;
  next.IsolationEnable = next.IsolationEnable ? 1 : 0;
  if (!isPasswordRequiredForAuthentication(next.Authentication)) {
    next.Password = '';
  }
  return next;
};

const onCancel = async () => {
  await loadWifiBasic();
};

const onApply = async () => {
  submitting.value = true;
  error.value = null;
  successMessage.value = null;
  try {
    const requestBody: OpenWrtWifiBasicRequest = {
      WifiBasic: {
        Bands: formBands.value.map(normalizeBandBeforeSubmit)
      }
    };

    const result: OpenWrtActionResult = await updateOpenWrtWifiBasic(requestBody);
    if (result.result !== 'Success') {
      throw new Error(result.reason || 'update failed');
    }

    if (result.applyRequired === 1) {
      const applyResult = await applyOpenWrtWifi();
      if (applyResult.result !== 'Success') {
        throw new Error(applyResult.reason || 'apply failed');
      }
    }

    successMessage.value = 'Wi-Fi settings applied successfully.';
    await loadWifiBasic();
  } catch (err) {
    console.error('Failed to apply OpenWrt wifi basic:', err);
    error.value = 'Failed to apply Wi-Fi settings.';
  } finally {
    submitting.value = false;
  }
};

onMounted(loadWifiBasic);
</script>

<template>
  <div class="openwrt-page page-container">
    <h1 class="page-title" :data-testid="qa('openwrt-wifi-title')">OpenWrt Wi-Fi Basic</h1>

    <div class="status-content" :data-testid="qa('openwrt-wifi-content')">
      <div v-if="loading" class="loading-state" :data-testid="qa('openwrt-wifi-loading')">
        <div class="loading-spinner"></div>
        <span>Loading...</span>
      </div>

      <div v-else-if="error" class="error-state" :data-testid="qa('openwrt-wifi-error')">
        {{ error }}
      </div>

      <template v-else>
        <div
          v-for="(band, index) in formBands"
          :key="`${band.Band}-${band.Radio}-${index}`"
          class="panel-section"
          :data-testid="qa(`openwrt-wifi-band-${index}`)"
        >
          <div class="card-content">
            <h3 class="section-title">{{ band.Band }}</h3>
            <div class="field-grid">
              <div class="field-item switch-item">
                <span class="field-label">Enable</span>
                <BaseSwitch
                  v-model="band.Enable"
                  :true-value="1"
                  :false-value="0"
                />
              </div>

              <BaseInput v-model="band.SSID" label="SSID" />

              <BaseSelect
                v-model="band.Authentication"
                label="Authentication"
                :options="band.AuthOptions || ['none', 'owe', 'psk2', 'sae', 'sae-mixed']"
              />

              <BaseSecretInput
                v-if="isPasswordRequiredForAuthentication(band.Authentication)"
                v-model="band.Password"
                mode="input"
                placeholder="Enter password"
              />

              <div class="field-item switch-item">
                <span class="field-label">Hide SSID</span>
                <BaseSwitch
                  v-model="band.HideSSID"
                  :true-value="1"
                  :false-value="0"
                />
              </div>

              <div class="field-item switch-item">
                <span class="field-label">Client Isolation</span>
                <BaseSwitch
                  v-model="band.IsolationEnable"
                  :true-value="1"
                  :false-value="0"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="button-bar">
          <ActionButtons
            :cancel-disabled="submitting"
            :apply-disabled="!canApply"
            :apply-loading="submitting"
            @cancel="onCancel"
            @apply="onApply"
          />
        </div>

        <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.openwrt-page {
  width: 100%;
}

.section-title {
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 0.9rem 1.25rem;
}

.field-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.switch-item {
  justify-content: center;
}

.button-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.loading-state,
.error-state,
.success-message {
  padding: 1rem;
  text-align: center;
}

.success-message {
  color: #0f9d58;
}
</style>
