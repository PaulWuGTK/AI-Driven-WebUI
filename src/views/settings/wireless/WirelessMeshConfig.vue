<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getWlanMesh, updateWlanMesh } from '../../../services/api/wireless';
import type { WlanMeshResponse } from '../../../types/wireless';

const { t } = useI18n();
const meshData = ref<WlanMeshResponse | null>(null);
const loading = ref(false);
const showSuccess = ref(false);

const fetchMeshConfig = async () => {
  loading.value = true;
  try {
    meshData.value = await getWlanMesh();
  } catch (error) {
    console.error('Error fetching mesh config:', error);
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

const handleSubmit = async () => {
  if (!meshData.value) return;
  
  loading.value = true;
  try {
    await updateWlanMesh({
      WlanMesh: {
        MeshEnable: Number(meshData.value.WlanMesh.MeshEnable),
        CommonSSID: meshData.value.WlanMesh.CommonSSID
      }
    });
    showSuccessMessage();
    await fetchMeshConfig(); // Refresh data after successful update
  } catch (error) {
    console.error('Error updating mesh config:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchMeshConfig);
</script>

<template>
  <div class="wireless-mesh-config">
    <form @submit.prevent="handleSubmit" v-if="meshData" :class="{ 'loading': loading }">
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>

      <div v-if="showSuccess" class="success-message">
        {{ t('common.apply') }} successful
      </div>

      <div class="mesh-enable">
        <label class="switch-label">
          <span>{{ t('wireless.easyMesh') }}</span>
          <label class="switch">
            <input
              type="checkbox"
              :checked="meshData.WlanMesh.MeshEnable === 1"
              @change="meshData.WlanMesh.MeshEnable = ($event.target as HTMLInputElement).checked ? 1 : 0"
              :disabled="loading"
            >
            <span class="slider"></span>
          </label>
        </label>
      </div>

      <div class="common-ssid" v-if="meshData.WlanMesh.MeshEnable === 1">
        <h3>{{ t('wireless.commonSsidConfig') }}</h3>
        <div class="form-group">
          <label>{{ t('wireless.ssid') }}</label>
          <input
            type="text"
            v-model="meshData.WlanMesh.CommonSSID"
            required
            :disabled="loading"
          />
        </div>
      </div>

      <div class="button-group">
        <button type="button" class="btn btn-secondary" @click="fetchMeshConfig" :disabled="loading">
          {{ t('common.cancel') }}
        </button>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ t('common.apply') }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.wireless-mesh-config {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
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

.mesh-enable {
  margin-bottom: 2rem;
}

.switch-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  color: #333;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
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
  background-color: #0070BB;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.common-ssid {
  margin-bottom: 2rem;
}

h3 {
  font-size: 1rem;
  color: #333;
  margin: 0 0 1rem 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  transition: opacity 0.2s;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-primary {
  background-color: #0070BB;
  color: white;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #666;
}

.btn:not(:disabled):hover {
  opacity: 0.9;
}
</style>