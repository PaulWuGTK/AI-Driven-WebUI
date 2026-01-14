<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { getWlanMesh, updateWlanMesh } from '../../../services/api/wireless';
import type { WlanMeshResponse } from '../../../types/wireless';
import BlockingOverlay from '../../../components/BlockingOverlay.vue';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const meshData = ref<WlanMeshResponse | null>(null);
const loading = ref(false);
const showSuccess = ref(false);
const error = ref<string | null>(null);
const showBlockingOverlay = ref(false);

watch(() => meshData.value?.WlanMesh.MeshEnable, (newValue) => {
  if (meshData.value && newValue !== undefined) {
    meshData.value.WlanMesh.Enable = newValue;
  }
});

const fetchMeshConfig = async () => {
  loading.value = true;
  error.value = null;
  try {
    meshData.value = await getWlanMesh();
  } catch (err) {
    console.error('Error fetching mesh config:', err);
    error.value = 'Failed to fetch mesh config';
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
  const currentPath = route.path;
  router.replace({ path: currentPath, query: { tab: 'mesh' } }).then(() => {
    router.go(0);
  });
};

const handleSubmit = async () => {
  if (!meshData.value) return;
  showBlockingOverlay.value = true;
  loading.value = true;
  try {
    await updateWlanMesh({
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
    showSuccessMessage();
  } catch (err) {
    console.error('Error updating mesh config:', err);
    error.value = 'Failed to update mesh config';
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
        <label class="switch">
          <input
            type="checkbox"
            :data-testid="qa('wireless-mesh-config-enable-toggle')"
            v-model="meshData.WlanMesh.MeshEnable"
            :true-value="1"
            :false-value="0"
          >
          <span class="slider"></span>
        </label>
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
            <input
              type="password"
              :data-testid="qa('wireless-mesh-config-password-input')"
              v-model="meshData.WlanMesh.Password"
              disabled
              class="disabled-input"
            />
          </div>
        </div>
      </div>

      <div class="mlo-section" v-if="meshData.WlanMesh.MeshEnable === 1" :data-testid="qa('wireless-mesh-config-mlo-section')">
        <div class="switch-label">
          <span :data-testid="qa('wireless-mesh-config-mlo-label')">MLO</span>
          <label class="switch">
            <input
              type="checkbox"
              :data-testid="qa('wireless-mesh-config-mlo-toggle')"
              v-model="meshData.WlanMesh.MLOEnable"
              :true-value="1"
              :false-value="0"
            >
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="button-group" :data-testid="qa('wireless-mesh-config-button-group')">
        <button class="btn btn-secondary" :data-testid="qa('wireless-mesh-config-cancel-button')" @click="fetchMeshConfig" :disabled="loading">
          {{ t('common.cancel') }}
        </button>
        <button class="btn btn-primary" :data-testid="qa('wireless-mesh-config-apply-button')" @click="handleSubmit" :disabled="loading">
          {{ t('common.apply') }}
        </button>
      </div>
    </template>

    <div v-if="showSuccess" class="success-message" :data-testid="qa('wireless-mesh-config-success-message')">
      {{ t('common.apply') }} successful
    </div>

    <!-- Blocking Overlay -->
    <BlockingOverlay
      :data-testid="qa('wireless-mesh-config-blocking-overlay')"
      :is-visible="showBlockingOverlay"
      message="Applying WiFi Mesh Settings..."
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
.switch {
  width: 60px;
  height: 34px;
  flex-shrink: 0;
}

.slider:before {
  height: 26px;
  width: 26px;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

input:disabled + .slider {
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

.disabled-input {
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
  .mesh-config {
    padding: 1rem;
  }

  .ssid-content {
    padding: 1rem;
  }

  .button-group {
    flex-direction: column;
  }

  .button-group .btn {
    width: 100%;
  }
}
</style>
