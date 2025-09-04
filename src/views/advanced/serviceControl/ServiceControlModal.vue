<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import type { ServiceControlRule, ServiceControlOptions, ServiceOption } from '../../../types/serviceControl';

const { t } = useI18n();

const props = defineProps<{
  rule: ServiceControlRule;
  options: ServiceControlOptions;
}>();

const emit = defineEmits<{
  (e: 'save', rule: ServiceControlRule): void;
  (e: 'cancel'): void;
}>();

const editingRule = ref<ServiceControlRule>({
  ...props.rule,
  // 兼容舊資料：若沒有 InterfaceOriginal 就用目前的 Interface
  InterfaceOriginal: (props.rule as any).InterfaceOriginal ?? props.rule.Interface,
});
const selectedPredefinedService = ref<string>('');
const showSourceIPRange = ref(false);

// Enhanced protocol options that include combined protocols
const enhancedProtocolOptions = computed(() => {
  const baseProtocols = [...props.options.Protocols];
  
  // Add combined protocol options
  const combinedProtocols = [
    { value: "17,6", label: "UDP/TCP" },
    { value: "6,17", label: "TCP/UDP" },
    { value: "1,58", label: "ICMP (v4/v6)" },
    { value: "2", label: "IGMP" }
  ];
  
  // Only add combined protocols if they don't already exist
  combinedProtocols.forEach(combined => {
    if (!baseProtocols.find(p => p.value === combined.value)) {
      baseProtocols.push(combined);
    }
  });
  
  return baseProtocols;
});

// Enhanced IP version options
const enhancedIPVersionOptions = computed(() => {
  const baseOptions = [...props.options.IPVersions];
  
  // Add special IP version options if they don't exist
  const specialOptions = [
    { value: "0", label: "Both IPv4 & IPv6" },
    { value: "-1", label: "Both IPv4 & IPv6 (Legacy)" }
  ];
  
  specialOptions.forEach(special => {
    if (!baseOptions.find(o => o.value === special.value)) {
      baseOptions.push(special);
    }
  });
  
  return baseOptions;
});

// Watch for changes in the predefined service selection
watch(selectedPredefinedService, (newValue) => {
  if (newValue) {
    const service = props.options.Services.find(s => s.value === newValue);
    if (service) {
      editingRule.value.Service = service.value;
      editingRule.value.DestPort = service.port;
      editingRule.value.Protocol = service.protocol;
    }
  }
});

// Initialize source IP range visibility
watch(() => editingRule.value, (newValue) => {
  showSourceIPRange.value = !!(newValue.SourceIPStart || newValue.SourceIPEnd);
}, { immediate: true });

// Handle form submission
const handleSubmit = () => {
  // Validate form
  if (!editingRule.value.Service) {
    alert('Service name is required');
    return;
  }

  if (!editingRule.value.DestPort && editingRule.value.Protocol !== '1' && editingRule.value.Protocol !== '58') {
    alert('Destination port is required for this protocol');
    return;
  }

  // If source IP range is not shown, remove those properties
  if (!showSourceIPRange.value) {
    delete editingRule.value.SourceIPStart;
    delete editingRule.value.SourceIPEnd;
  }

  // 送出時也保險補一次，避免在某些流程中被移除
  emit('save', {
    ...editingRule.value,
    InterfaceOriginal: (editingRule.value as any).InterfaceOriginal ?? editingRule.value.Interface,
  });
};

// Toggle source IP range visibility
const toggleSourceIPRange = () => {
  showSourceIPRange.value = !showSourceIPRange.value;
  if (!showSourceIPRange.value) {
    editingRule.value.SourceIPStart = undefined;
    editingRule.value.SourceIPEnd = undefined;
  }
};

// Check if the protocol is ICMP (doesn't need port)
const isICMPProtocol = (protocol: string): boolean => {
  return protocol === '1' || protocol === '58';
};

// Watch for protocol changes to handle ICMP special case
watch(() => editingRule.value.Protocol, (newProtocol) => {
  if (isICMPProtocol(newProtocol)) {
    editingRule.value.DestPort = '-1';
  } else if (editingRule.value.DestPort === '-1') {
    editingRule.value.DestPort = '';
  }
});
</script>

<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ editingRule.Service ? t('serviceControl.editRule') : t('serviceControl.addRule') }}</h3>
        <button class="close-button" @click="$emit('cancel')">&times;</button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <!-- Enable/Disable Toggle -->
          <div class="form-group">
            <div class="switch-label">
              <span>{{ t('common.enable') }}</span>
              <label class="switch">
                <input
                  type="checkbox"
                  v-model="editingRule.Enable"
                >
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <!-- Predefined Service Selection -->
          <div class="form-group">
            <label>{{ t('serviceControl.serviceType') }}</label>
            <select v-model="selectedPredefinedService">
              <option value="">Custom Service</option>
              <option v-for="service in options.Services" :key="service.value" :value="service.value">
                {{ service.value }}
              </option>
            </select>
          </div>

          <!-- Service Name -->
          <div class="form-group">
            <label>{{ t('serviceControl.serviceType') }}</label>
            <input 
              type="text" 
              v-model="editingRule.Service" 
              required
              :disabled="!!selectedPredefinedService"
            />
          </div>

          <!-- Protocol -->
          <div class="form-group">
            <label>{{ t('serviceControl.protocol') }}</label>
            <select v-model="editingRule.Protocol" required>
              <option v-for="protocol in enhancedProtocolOptions" :key="protocol.value" :value="protocol.value">
                {{ protocol.label }}
              </option>
            </select>
          </div>

          <!-- Destination Port (not needed for ICMP) -->
          <div class="form-group" v-if="!isICMPProtocol(editingRule.Protocol)">
            <label>{{ t('ssh.port') }}</label>
            <input 
              type="text" 
              v-model="editingRule.DestPort" 
              required
              placeholder="e.g., 80 or 80-90"
            />
          </div>

          <!-- Interface Selection -->
          <div class="form-group">
            <label>{{ t('serviceControl.accessDirection') }}</label>
            <select v-model="editingRule.Interface" required>
              <option v-for="iface in options.Interfaces" :key="iface.value" :value="iface.value">
                {{ iface.label }}
              </option>
            </select>
          </div>

          <!-- IP Version -->
          <div class="form-group">
            <label>{{ t('serviceControl.ipRange') }}</label>
            <select v-model="editingRule.IPVersion" required>
              <option v-for="ipVersion in enhancedIPVersionOptions" :key="ipVersion.value" :value="Number(ipVersion.value)">
                {{ ipVersion.label }}
              </option>
            </select>
          </div>

          <!-- Source IP Range Toggle -->
          <div class="form-group">
            <div class="switch-label">
              <span>Specify Source IP Range</span>
              <label class="switch">
                <input
                  type="checkbox"
                  :checked="showSourceIPRange"
                  @change="toggleSourceIPRange"
                >
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <!-- Source IP Range (if enabled) -->
          <div v-if="showSourceIPRange" class="ip-range-container">
            <div class="form-group">
              <label>Source IP (Start)</label>
              <input 
                type="text" 
                v-model="editingRule.SourceIPStart" 
                placeholder="e.g., 192.168.1.1"
              />
            </div>
            <div class="form-group">
              <label>Source IP (End)</label>
              <input 
                type="text" 
                v-model="editingRule.SourceIPEnd" 
                placeholder="e.g., 192.168.1.255"
              />
            </div>
          </div>

          <!-- Action Selection -->
          <div class="form-group">
            <label>{{ t('serviceControl.action') }}</label>
            <select v-model="editingRule.Action" required>
              <option value="Accept">Accept</option>
              <option value="Drop">Drop</option>
            </select>
          </div>

          <!-- Form Buttons -->
          <div class="button-group">
            <button type="button" class="btn btn-secondary" @click="$emit('cancel')">
              {{ t('common.cancel') }}
            </button>
            <button type="submit" class="btn btn-primary">
              {{ t('common.confirm') }}
            </button>
          </div>
        </form>
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
  border-radius: 4px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

input, select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}

input:disabled, select:disabled {
  background-color: var(--bg-secondary);
  cursor: not-allowed;
}

.switch-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-primary);
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  flex-shrink: 0;
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
  background-color: var(--primary-color);
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.ip-range-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .ip-range-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .button-group {
    flex-direction: column;
  }

  .button-group .btn {
    width: 100%;
  }
}
</style>