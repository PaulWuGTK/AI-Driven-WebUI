<template>
  <div :class="wrapperClasses">
    <span v-if="hasLabel" class="switch-label-text" :data-testid="labelDataTestid || undefined">
      <slot name="label">{{ label }}</slot>
    </span>
    <label class="switch" :for="switchId">
      <input
        :id="switchId"
        type="checkbox"
        :checked="isChecked"
        :disabled="disabled"
        :required="required"
        :name="name"
        :data-testid="dataTestid || undefined"
        @change="handleChange"
      >
      <span class="slider" :data-testid="sliderDataTestid || undefined"></span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';

type SwitchValue = string | number | boolean;

interface Props {
  modelValue: SwitchValue;
  trueValue?: SwitchValue;
  falseValue?: SwitchValue;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  dataTestid?: string;
  sliderDataTestid?: string;
  labelDataTestid?: string;
}

const props = withDefaults(defineProps<Props>(), {
  trueValue: true,
  falseValue: false,
  label: '',
  disabled: false,
  required: false,
  name: '',
});

const slots = useSlots();

const emit = defineEmits<{
  'update:modelValue': [value: SwitchValue];
  change: [value: SwitchValue];
}>();

const switchId = computed(() => props.id || `switch-${Math.random().toString(36).substring(7)}`);
const hasLabel = computed(() => Boolean(props.label || slots.label));
const isChecked = computed(() => props.modelValue === props.trueValue);
const wrapperClasses = computed(() => ['base-switch', { 'switch-label': hasLabel.value }]);

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const nextValue = target.checked ? props.trueValue : props.falseValue;
  emit('update:modelValue', nextValue);
  emit('change', nextValue);
};
</script>

<style scoped>
.base-switch {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
}

.switch-label-text {
  flex: 1;
  min-width: 0;
}
</style>
