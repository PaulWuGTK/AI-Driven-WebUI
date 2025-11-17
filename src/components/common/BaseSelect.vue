<template>
  <div class="form-group">
    <label v-if="label" :for="selectId" class="form-label" :class="{ 'form-label-required': required }">
      {{ label }}
    </label>
    <select
      :id="selectId"
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      :class="selectClasses"
      @change="handleChange"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="getOptionValue(option)"
        :value="getOptionValue(option)"
      >
        {{ getOptionLabel(option) }}
      </option>
    </select>
    <span v-if="helpText && !errorMessage" class="form-help">
      {{ helpText }}
    </span>
    <span v-if="errorMessage" class="invalid-feedback">
      {{ errorMessage }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type Option = string | number | { label: string; value: string | number };

interface Props {
  modelValue: string | number;
  options: Option[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  errorMessage?: string;
  helpText?: string;
  id?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  disabled: false,
  required: false,
  size: 'md',
  error: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
  change: [value: string | number];
}>();

const selectId = computed(() => props.id || `select-${Math.random().toString(36).substring(7)}`);

const selectClasses = computed(() => {
  const classes = ['form-select'];

  if (props.size !== 'md') {
    classes.push(`form-input-${props.size}`);
  }

  if (props.error || props.errorMessage) {
    classes.push('is-invalid');
  }

  return classes;
});

const getOptionValue = (option: Option): string | number => {
  return typeof option === 'object' ? option.value : option;
};

const getOptionLabel = (option: Option): string => {
  return typeof option === 'object' ? option.label : String(option);
};

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const value = target.value;
  emit('update:modelValue', value);
  emit('change', value);
};
</script>
