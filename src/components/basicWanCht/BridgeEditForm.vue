<template>
  <div class="bridge-form" :data-testid="qa('bridge-form')">
    <div class="panel-section">
      <div class="section-title">Bridge</div>
      <div class="card-content">
        <div class="form-group">
          <div class="switch-label">
            <span :data-testid="qa('bridge-enable-label')">{{ $t('basicWanCht.enable') }}</span>
            <label class="switch">
              <input
                type="checkbox"
                v-model="localData.Enable"
                :data-testid="qa('bridge-enable-toggle')"
              >
              <span class="slider" :data-testid="qa('bridge-enable-toggle-slider')"></span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label :data-testid="qa('bridge-protocol-label')">{{ $t('basicWanCht.protocol') }}</label>
          <BaseInput v-model="localData.Protocol" :disabled="true" :data-testid="qa('bridge-protocol-input')" />
        </div>

        <div class="form-group">
          <label :data-testid="qa('bridge-mtu-label')">{{ $t('basicWanCht.mtu', { min: 576, max: 1500 }) }}</label>
          <BaseInput v-model.number="localData.MTU" type="number" min="576" max="1500" :data-testid="qa('bridge-mtu-input')" />
        </div>

        <div class="form-group">
          <label :data-testid="qa('bridge-lan-interface-label')">{{ $t('basicWanCht.lanInterface') }}</label>
          <div class="interface-list">
            <div v-for="iface in (localData.ListSupportedLANInterfaces || [])" :key="iface" class="switch-label">
              <span :data-testid="qa(`bridge-lan-interface-${slug(iface)}`)">{{ iface }}</span>
              <label class="switch">
                <input
                  type="checkbox"
                  :checked="localData.ListLANInterfaces.includes(iface)"
                  :data-testid="qa(`bridge-lan-interface-toggle-${slug(iface)}`)"
                  @change="(e) => toggleInterface(iface, (e.target as HTMLInputElement).checked)"
                >
                <span class="slider" :data-testid="qa(`bridge-lan-interface-toggle-slider-${slug(iface)}`)"></span>
              </label>
            </div>
          </div>
        </div>

        <div class="form-group">
          <div class="switch-label">
            <span :data-testid="qa('bridge-vlan-enable-label')">{{ $t('basicWanCht.vlan') }}</span>
            <label class="switch">
              <input
                type="checkbox"
                v-model="localData.VLANEnable"
                :data-testid="qa('bridge-vlan-enable-toggle')"
              >
              <span class="slider" :data-testid="qa('bridge-vlan-enable-toggle-slider')"></span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label :data-testid="qa('bridge-vlan-priority-label')">{{ $t('basicWanCht.priorityBit') }}</label>
          <BaseInput
            v-model.number="localData.VLANPriority"
            type="number"
            :disabled="!localData.VLANEnable"
            :data-testid="qa('bridge-vlan-priority-input')"
          />
        </div>

        <div class="form-group">
          <label :data-testid="qa('bridge-vlan-id-label')">{{ $t('basicWanCht.vlanId') }}</label>
          <BaseInput
            v-model.number="localData.VLANID"
            type="number"
            :disabled="!localData.VLANEnable"
            :data-testid="qa('bridge-vlan-id-input')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { BasicWanChtBridge } from '../../types/basicWanCht';
import { BaseInput } from '../common';
import { useQA } from '../../utils/qa';

const { qa, slug } = useQA();

interface Props {
  modelValue: BasicWanChtBridge;
}

interface Emits {
  (e: 'update:modelValue', value: BasicWanChtBridge): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const localData = ref<BasicWanChtBridge>({ ...props.modelValue });

const toggleInterface = (iface: string, checked: boolean) => {
  if (checked) {
    if (!localData.value.ListLANInterfaces.includes(iface)) {
      localData.value.ListLANInterfaces.push(iface);
    }
  } else {
    localData.value.ListLANInterfaces = localData.value.ListLANInterfaces.filter(i => i !== iface);
  }
};

watch(localData, (newValue) => {
  emit('update:modelValue', newValue);
}, { deep: true });

watch(() => props.modelValue, (newValue) => {
  localData.value = { ...newValue };
}, { deep: true });
</script>

<style scoped>
.bridge-form {
  padding: 0;
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

.interface-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.switch-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
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
  background-color: var(--color-primary);
}

input:checked + .slider:before {
  transform: translateX(26px);
}

@media (max-width: 768px) {
  .bridge-form {
    padding: 0;
  }
}
</style>
