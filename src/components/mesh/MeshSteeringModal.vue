<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';
import type { MeshNode } from '../../types/mesh';
import { useQA } from '../../utils/qa';
const { isQAMode, qa, slug } = useQA();

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
  <div class="modal-overlay" :data-testid="qa('mesh-steering-modal-overlay')">
    <div class="modal" :data-testid="qa('mesh-steering-modal-content')">
      <div class="modal-header">
        <h3 :data-testid="qa('mesh-steering-modal-title')">{{ t('mesh.steeringControl') }}</h3>
        <button class="close-button" :data-testid="qa('mesh-steering-modal-close')" @click="$emit('close')">&times;</button>
      </div>

      <div class="modal-content" :data-testid="qa('mesh-steering-modal-body')">
        <div class="form-group">
          <label :data-testid="qa('mesh-steering-modal-selected-node-label')">{{ t('mesh.selectedNode') }}</label>
          <div class="selected-node" :data-testid="qa('mesh-steering-modal-selected-node-value')">{{ node.Name }}</div>
        </div>

        <div class="form-group">
          <label :data-testid="qa('mesh-steering-modal-destination-label')">{{ t('mesh.destination') }}</label>
          <select v-model="selectedDestination" :data-testid="qa('mesh-steering-modal-destination-select')">
            <option value="" disabled :data-testid="qa('mesh-steering-modal-destination-placeholder')">{{ t('mesh.selectDestination') }}</option>
            <option 
              v-for="dest in destinations" 
              :key="dest.MACAddress"
              :value="dest.MACAddress"
              :data-testid="qa(`mesh-steering-modal-destination-option-${slug(dest.Name)}`)"
            >
              {{ dest.Name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label :data-testid="qa('mesh-steering-modal-band-label')">{{ t('mesh.band') }}</label>
          <select v-model="selectedBand" :data-testid="qa('mesh-steering-modal-band-select')">
            <option value="" disabled :data-testid="qa('mesh-steering-modal-band-placeholder')">{{ t('mesh.selectBand') }}</option>
            <option v-for="band in bands" :key="band" :value="band" :data-testid="qa(`mesh-steering-modal-band-option-${slug(band)}`)">
              {{ band }}
            </option>
          </select>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" :data-testid="qa('mesh-steering-modal-cancel')" @click="$emit('close')">
          {{ t('common.close') }}
        </button>
        <button 
          class="btn btn-primary" 
          :data-testid="qa('mesh-steering-modal-apply')"
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