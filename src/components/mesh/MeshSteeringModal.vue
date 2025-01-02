<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';
import type { MeshNode } from '../../types/mesh';

const { t } = useI18n();

const props = defineProps<{
  node: MeshNode;
  destinations: MeshNode[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'apply', data: { destination: string; band: string }): void;
}>();

const selectedDestination = ref('');
const selectedBand = ref('');

const bands = ['2.4G', '5G', '6G'];

const handleApply = () => {
  if (selectedDestination.value && selectedBand.value) {
    emit('apply', {
      destination: selectedDestination.value,
      band: selectedBand.value
    });
  }
};
</script>

<template>
  <div class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <h3>{{ t('mesh.steeringControl') }}</h3>
        <button class="close-button" @click="$emit('close')">&times;</button>
      </div>

      <div class="modal-content">
        <div class="form-group">
          <label>{{ t('mesh.selectedNode') }}</label>
          <div class="selected-node">{{ node.Name }}</div>
        </div>

        <div class="form-group">
          <label>{{ t('mesh.destination') }}</label>
          <select v-model="selectedDestination">
            <option value="" disabled>{{ t('mesh.selectDestination') }}</option>
            <option 
              v-for="dest in destinations" 
              :key="dest.MACAddress"
              :value="dest.MACAddress"
            >
              {{ dest.Name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>{{ t('mesh.band') }}</label>
          <select v-model="selectedBand">
            <option value="" disabled>{{ t('mesh.selectBand') }}</option>
            <option v-for="band in bands" :key="band" :value="band">
              {{ band }}
            </option>
          </select>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">
          {{ t('common.close') }}
        </button>
        <button 
          class="btn btn-primary" 
          @click="handleApply"
          :disabled="!selectedDestination || !selectedBand"
        >
          {{ t('common.apply') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.modal {
  background-color: white;
  border-radius: 4px;
  width: 90%;
  max-width: 500px;
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-content {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
}

.selected-node {
  padding: 0.5rem;
  background-color: #f5f5f5;
  border-radius: 4px;
  color: #333;
}

select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
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

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>