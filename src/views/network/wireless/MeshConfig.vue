<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { getWlanMesh, updateWlanMesh } from '../../../services/api/wireless';
import type { WlanMeshResponse } from '../../../types/wireless';
import BlockingOverlay from '../../../components/BlockingOverlay.vue';
import { ActionButtons, BaseSecretInput, BaseSwitch, BaseToast } from '../../../components/common';
import { useAutoDismiss } from '../../../composables/useAutoDismiss';
import { extractNokMessage } from '../../../utils/apiUtils';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const meshData = ref<WlanMeshResponse | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const showBlockingOverlay = ref(false);
const successMessage = ref('');
const errorToastMessage = ref('');
const { visible: showSuccessToast, show: triggerSuccessToast } = useAutoDismiss();
const { visible: showErrorToast, show: triggerErrorToast } = useAutoDismiss();

watch(() => meshData.value?.WlanMesh.MeshEnable, (newValue) => {
  if (meshData.value && newValue !== undefined) {
    meshData.value.WlanMesh.Enable = newValue;
  }
});

const fetchMeshConfig = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getWlanMesh();
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      error.value = nokMessage;
      meshData.value = null;
      return;
    }
    meshData.value = response;
  } catch (err) {
    console.error('Error fetching mesh config:', err);
    error.value = 'Failed to fetch mesh config';
  } finally {
    loading.value = false;
  }
};

const showSuccessMessage = (message = `${t('common.apply')} successful`) => {
  successMessage.value = message;
  triggerSuccessToast();
};

const showErrorMessage = (message: string) => {
  errorToastMessage.value = message;
  triggerErrorToast();
};

const handleBlockingComplete = () => {
  showBlockingOverlay.value = false;
  const currentPath = route.path;
  router.replace({ path: currentPath, query: { tab: 'mesh' } }).then(() => {
    router.go(0);
  });
};

const handleSubmit = async () => {
  if (!meshData.value) return;
  showBlockingOverlay.value = true;
  loading.value = true;
  error.value = null;
  try {
    const response = await updateWlanMesh({
      WlanMesh: {
        MeshEnable: Number(meshData.value.WlanMesh.MeshEnable),
        Enable: Number(meshData.value.WlanMesh.Enable),
        SSID: meshData.value.WlanMesh.SSID,
        SecurityMode: meshData.value.WlanMesh.SecurityMode,
        Password: meshData.value.WlanMesh.Password,
        MLOEnable: Number(meshData.value.WlanMesh.MLOEnable),
        CommonSSIDEnable: Number(meshData.value.WlanMesh.CommonSSIDEnable)
      }
    });
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      showBlockingOverlay.value = false;
      showErrorMessage(nokMessage);
      return;
    }
    showSuccessMessage();
  } catch (err) {
    console.error('Error updating mesh config:', err);
    showBlockingOverlay.value = false;
    showErrorMessage('Failed to update mesh config');
  } finally {
    loading.value = false;
  }
};

onMounted(fetchMeshConfig);
</script>

<template>
  <div class="mesh-config" :data-testid="qa('wireless-mesh-config-content')">
    <div v-if="loading" class="loading-state" :data-testid="qa('wireless-mesh-config-loading')">
      <div class="loading-spinner"></div>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="error" class="error-state" :data-testid="qa('wireless-mesh-config-error')">
      {{ error }}
    </div>

    <template v-else-if="meshData">
      <div class="switch-label">
        <span :data-testid="qa('wireless-mesh-config-enable-label')">{{ t('wireless.easyMesh') }}</span>
        <BaseSwitch
          v-model="meshData.WlanMesh.MeshEnable"
          :true-value="1"
          :false-value="0"
          :data-testid="qa('wireless-mesh-config-enable-toggle')"
          :slider-data-testid="qa('wireless-mesh-config-enable-toggle-slider')"
        />
      </div>

      <div class="common-ssid" v-if="meshData.WlanMesh.MeshEnable === 1" :data-testid="qa('wireless-mesh-config-ssid-section')">
        <div class="section-title" :data-testid="qa('wireless-mesh-config-ssid-title')">{{ t('wireless.backhaulSsidConfig') }}</div>
        <div class="ssid-content" :data-testid="qa('wireless-mesh-config-ssid-content')">
          <div class="form-group">
            <label :data-testid="qa('wireless-mesh-config-ssid-label')">SSID</label>
            <input
              type="text"
              :data-testid="qa('wireless-mesh-config-ssid-input')"
              v-model="meshData.WlanMesh.SSID"
              disabled
              class="disabled-input"
            />
          </div>
          <div class="form-group">
            <label :data-testid="qa('wireless-mesh-config-security-label')">Security Mode</label>
            <input
              type="text"
              :data-testid="qa('wireless-mesh-config-security-input')"
              v-model="meshData.WlanMesh.SecurityMode"
              disabled
              class="disabled-input"
            />
          </div>
          <div class="form-group">
            <label :data-testid="qa('wireless-mesh-config-password-label')">Password</label>
            <BaseSecretInput
              v-model="meshData.WlanMesh.Password"
              class="secret-password disabled-input"
              :input-data-testid="qa('wireless-mesh-config-password-input')"
              :disabled="true"
              :show-toggle="false"
            />
          </div>
        </div>
      </div>

      <div class="mlo-section" v-if="meshData.WlanMesh.MeshEnable === 1" :data-testid="qa('wireless-mesh-config-mlo-section')">
        <div class="switch-label">
          <span :data-testid="qa('wireless-mesh-config-mlo-label')">MLO Enable</span>
          <BaseSwitch
            v-model="meshData.WlanMesh.MLOEnable"
            :true-value="1"
            :false-value="0"
            :data-testid="qa('wireless-mesh-config-mlo-toggle')"
            :slider-data-testid="qa('wireless-mesh-config-mlo-toggle-slider')"
          />
        </div>
      </div>

      <div class="button-group" :data-testid="qa('wireless-mesh-config-button-group')">
        <ActionButtons
          :cancel-data-testid="qa('wireless-mesh-config-cancel-button')"
          :apply-data-testid="qa('wireless-mesh-config-apply-button')"
          :cancel-disabled="loading"
          :apply-disabled="loading"
          @cancel="fetchMeshConfig"
          @apply="handleSubmit"
        />
      </div>
    </template>

    <BaseToast
      v-model="showSuccessToast"
      :message="successMessage"
      type="success"
      :data-testid="qa('wireless-mesh-config-success-message')"
    />
    <BaseToast
      v-model="showErrorToast"
      :message="errorToastMessage"
      type="error"
      :data-testid="qa('wireless-mesh-config-error-message')"
    />

    <!-- Blocking Overlay -->
    <BlockingOverlay
      :data-testid="qa('wireless-mesh-config-blocking-overlay')"
      :is-visible="showBlockingOverlay"
      :message="t('wireless.applyingMeshSettings')"
      :description1="t('common.loading')"
      :description2="''"
      :duration="30"
      @complete="handleBlockingComplete"
    />
  </div>
</template>

<style scoped>
.mesh-config {
  padding: 1.5rem;
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

/* Custom switch label with bottom margin for spacing */
.switch-label {
  margin-bottom: 1.5rem;
}

/* Custom switch size (60px × 34px) for larger prominence */
:deep(.switch) {
  width: 60px;
  height: 34px;
  flex-shrink: 0;
}

:deep(.slider:before) {
  height: 26px;
  width: 26px;
}

:deep(input:checked + .slider:before) {
  transform: translateX(26px);
}

:deep(input:disabled + .slider) {
  opacity: 0.6;
  cursor: not-allowed;
}

.common-ssid {
  background-color: white;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.2);
}

.disabled-info {
  padding: 1rem 1.5rem;
  background-color: #f5f5f5;
  color: #d32f2f;
  font-size: 0.9rem;
  border-bottom: 1px solid #e0e0e0;
}

.ssid-content {
  padding: 1.5rem;
}

.mlo-section {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}

.secret-password :deep(.secret-field) {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}

.disabled-input {
  background-color: #f5f5f5;
  color: #9e9e9e;
  cursor: not-allowed;
}

.secret-password :deep(.secret-field:disabled) {
  background-color: #f5f5f5;
  color: #9e9e9e;
  cursor: not-allowed;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
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

@media (max-width: 768px) {
  .mesh-config {
    padding: 1rem;
  }

  .ssid-content {
    padding: 1rem;
  }

  .button-group {
    flex-direction: column;
  }

  .button-group :deep(.btn) {
    width: 100%;
  }
}
</style>
