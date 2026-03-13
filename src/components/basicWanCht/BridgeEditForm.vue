<template>
  <div class="bridge-form" :data-testid="qa('bridge-form')">
    <div class="panel-section">
      <div class="section-title">Bridge</div>
      <div class="card-content">
        <div class="form-group">
          <div class="switch-label">
            <span :data-testid="qa('bridge-enable-label')">{{ $t('basicWanCht.enable') }}</span>
            <BaseSwitch
              v-model="localData.Enable"
              :data-testid="qa('bridge-enable-toggle')"
              :slider-data-testid="qa('bridge-enable-toggle-slider')"
            />
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
              <BaseSwitch
                :model-value="localData.ListLANInterfaces.includes(iface)"
                :data-testid="qa(`bridge-lan-interface-toggle-${slug(iface)}`)"
                :slider-data-testid="qa(`bridge-lan-interface-toggle-slider-${slug(iface)}`)"
                @update:model-value="(value) => toggleInterface(iface, Boolean(value))"
              />
            </div>
          </div>
        </div>

        <div class="form-group">
          <div class="switch-label">
            <span :data-testid="qa('bridge-vlan-enable-label')">{{ $t('basicWanCht.vlan') }}</span>
            <BaseSwitch
              v-model="localData.VLANEnable"
              :data-testid="qa('bridge-vlan-enable-toggle')"
              :slider-data-testid="qa('bridge-vlan-enable-toggle-slider')"
            />
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
import { BaseInput, BaseSwitch } from '../common';
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

watch(
  () => props.modelValue,
  (newValue) => {
    localData.value = JSON.parse(JSON.stringify(newValue)) as BasicWanChtBridge;
  },
  { deep: true, immediate: true }
);

watch(
  localData,
  (newValue) => {
    const fromChild = JSON.stringify(newValue);
    const fromParent = JSON.stringify(props.modelValue);
    if (fromChild === fromParent) return;
    emit('update:modelValue', newValue);
  },
  { deep: true }
);
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

:deep(.switch) {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  flex-shrink: 0;
}

:deep(.switch input) {
  opacity: 0;
  width: 0;
  height: 0;
}

:deep(.switch .slider) {
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

:deep(.switch .slider:before) {
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

:deep(.switch input:checked + .slider) {
  background-color: var(--color-primary);
}

:deep(.switch input:checked + .slider:before) {
  transform: translateX(26px);
}

@media (max-width: 768px) {
  .bridge-form {
    padding: 0;
  }
}
</style>
