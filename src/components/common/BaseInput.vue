<template>
  <div class="form-group">
    <label v-if="label" :for="inputId" class="form-label" :class="{ 'form-label-required': required }">
      {{ label }}
    </label>
    <div class="input-wrapper">
      <slot name="prepend"></slot>
      <input
        :id="inputId"
        ref="inputRef"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :data-testid="dataTestid"
        :class="inputClasses"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />
      <slot name="append"></slot>
    </div>
    <span v-if="helpText && !errorMessage" class="form-help">
      {{ helpText }}
    </span>
    <span v-if="errorMessage" class="invalid-feedback">
      {{ errorMessage }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';

interface Props {
  modelValue: string | number;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  errorMessage?: string;
  helpText?: string;
  id?: string;
  dataTestid?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  disabled: false,
  readonly: false,
  required: false,
  size: 'md',
  error: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
  blur: [event: FocusEvent];
  focus: [event: FocusEvent];
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const inputId = computed(() => props.id || `input-${Math.random().toString(36).substring(7)}`);

const inputClasses = computed(() => {
  const classes = ['form-input'];

  if (props.size !== 'md') {
    classes.push(`form-input-${props.size}`);
  }

  if (props.error || props.errorMessage) {
    classes.push('is-invalid');
  }

  return classes;
});

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = props.type === 'number' ? Number(target.value) : target.value;
  emit('update:modelValue', value);
  // After parent processes the value (e.g. truncation), sync DOM back to model
  nextTick(() => {
    if (target.value !== String(props.modelValue)) {
      target.value = String(props.modelValue);
    }
  });
};

const handleBlur = (event: FocusEvent) => {
  emit('blur', event);
};

const handleFocus = (event: FocusEvent) => {
  emit('focus', event);
};

defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
});
</script>

<style scoped>
.input-wrapper {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.input-wrapper .form-input {
  flex: 1;
}
</style>
