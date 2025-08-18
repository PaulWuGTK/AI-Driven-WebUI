<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DashboardDevice } from '../../types/dashboardThings';

const { t } = useI18n();

const props = defineProps<{
  device: DashboardDevice;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'toggle', device: DashboardDevice): void;
}>();

const localOnoffState = ref(props.device.Onoff);

// Get device icon based on type
const getDeviceIcon = (type: string): string => {
  if (type.toLowerCase().includes('switch')) return 'toggle_on';
  if (type.toLowerCase().includes('light')) return 'lightbulb';
  if (type.toLowerCase().includes('outlet')) return 'power';
  if (type.toLowerCase().includes('sensor')) return 'sensors';
  if (type.toLowerCase().includes('thermostat')) return 'thermostat';
  if (type.toLowerCase().includes('lock')) return 'lock';
  if (type.toLowerCase().includes('camera')) return 'videocam';
  if (type.toLowerCase().includes('speaker')) return 'speaker';
  return 'device_hub';
};

// Handle toggle
const handleToggle = () => {
  localOnoffState.value = localOnoffState.value === 1 ? 0 : 1;
  emit('toggle', {
    ...props.device,
    Onoff: localOnoffState.value
  });
};

// Watch for device prop changes
import { watch } from 'vue';
watch(() => props.device.Onoff, (newValue) => {
  localOnoffState.value = newValue;
});
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <div class="device-title">
          <span class="material-icons device-icon">{{ getDeviceIcon(device.Type) }}</span>
          <span class="device-name">{{ device.Name }}</span>
        </div>
        <button class="close-button" @click="$emit('close')">
          <span class="material-icons">close</span>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="device-info">
          <div class="info-row">
            <span class="info-label">Node ID:</span>
            <span class="info-value">{{ device.NodeId }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Device Type:</span>
            <span class="info-value">{{ device.Type }}</span>
          </div>
        </div>
        
        <div class="control-section">
          <div class="control-row">
            <span class="control-label">On / Off</span>
            <label class="toggle-switch">
              <input
                type="checkbox"
                :checked="localOnoffState === 1"
                @change="handleToggle"
              >
              <span class="toggle-slider" :data-on="t('dashboard.on')" :data-off="t('dashboard.off')"></span>
            </label>
          </div>
        </div>
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

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.device-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.device-icon {
  color: var(--primary-color);
  font-size: 1.5rem;
}

.device-name {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-primary);
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
}

.device-info {
  margin-bottom: 2rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.info-value {
  color: var(--text-primary);
  font-weight: 500;
}

.control-section {
  border-top: 1px solid var(--border-color);
  padding-top: 1.5rem;
}

.control-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
}

.control-label {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-primary);
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 80px;
  height: 40px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 40px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 32px;
  width: 32px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input:checked + .toggle-slider {
  background-color: var(--primary-color);
}

input:checked + .toggle-slider:before {
  transform: translateX(40px);
}

/* Add ON/OFF text */
.toggle-slider::after {
  content: 'OFF';
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
  transition: opacity 0.4s;
}

input:checked + .toggle-slider::after {
  content: 'ON';
  left: 8px;
  right: auto;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .modal-header {
    padding: 1rem;
  }
  
  .modal-body {
    padding: 1rem;
  }
  
  .device-title {
    gap: 0.5rem;
  }
  
  .device-name {
    font-size: 1rem;
  }
}
</style>