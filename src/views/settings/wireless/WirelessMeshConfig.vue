<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getWlanMesh, updateWlanMesh } from '../../../services/api/wireless';
import type { WlanMeshResponse } from '../../../types/wireless';

const { t } = useI18n();
const meshData = ref<WlanMeshResponse | null>(null);
const loading = ref(false);

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

const handleSubmit = async () => {
  if (!meshData.value) return;
  
  try {
    await updateWlanMesh(meshData.value);
  } catch (error) {
    console.error('Error updating mesh config:', error);
  }
};

onMounted(fetchMeshConfig);
</script>

<template>
  <div class="wireless-mesh-config">
    <form @submit.prevent="handleSubmit" v-if="meshData">
      <div class="mesh-enable">
        <label class="switch-label">
          <span>{{ t('wireless.easyMesh') }}</span>
          <label class="switch">
            <input
              type="checkbox"
              :checked="meshData.WlanMesh.MeshEnable === '1'"
              @change="meshData.WlanMesh.MeshEnable = ($event.target as HTMLInputElement).checked ? '1' : '0'"
            >
            <span class="slider"></span>
          </label>
        </label>
      </div>

      <div class="common-ssid" v-if="meshData.WlanMesh.MeshEnable === '1'">
        <h3>{{ t('wireless.commonSsidConfig') }}</h3>
        <div class="form-group">
          <label>{{ t('wireless.ssid') }}</label>
          <input
            type="text"
            v-model="meshData.WlanMesh.CommonSSID"
            required
          />
        </div>
      </div>

      <div class="button-group">
        <button type="button" class="btn btn-secondary" @click="fetchMeshConfig">
          {{ t('common.cancel') }}
        </button>
        <button type="submit" class="btn btn-primary">
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
}

.btn-primary {
  background-color: #0070BB;
  color: white;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #666;
}

.btn:hover {
  opacity: 0.9;
}
</style>