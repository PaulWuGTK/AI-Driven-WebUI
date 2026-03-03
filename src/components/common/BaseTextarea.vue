<template>
  <div class="form-group">
    <label v-if="label" :for="textareaId" class="form-label" :class="{ 'form-label-required': required }">
      {{ label }}
    </label>
    <textarea
      :id="textareaId"
      ref="textareaRef"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :rows="rows"
      :class="textareaClasses"
      :data-testid="dataTestid || undefined"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
    ></textarea>
    <span v-if="helpText && !errorMessage" class="form-help">
      {{ helpText }}
    </span>
    <span v-if="errorMessage" class="invalid-feedback">
      {{ errorMessage }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
  modelValue: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  rows?: number;
  error?: boolean;
  errorMessage?: string;
  helpText?: string;
  id?: string;
  dataTestid?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  disabled: false,
  readonly: false,
  required: false,
  rows: 4,
  error: false,
  dataTestid: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  blur: [event: FocusEvent];
  focus: [event: FocusEvent];
}>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const textareaId = computed(() => props.id || `textarea-${Math.random().toString(36).substring(7)}`);

const textareaClasses = computed(() => {
  const classes = ['form-textarea'];

  if (props.error || props.errorMessage) {
    classes.push('is-invalid');
  }

  return classes;
});

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  emit('update:modelValue', target.value);
};

const handleBlur = (event: FocusEvent) => {
  emit('blur', event);
};

const handleFocus = (event: FocusEvent) => {
  emit('focus', event);
};

defineExpose({
  focus: () => textareaRef.value?.focus(),
  blur: () => textareaRef.value?.blur(),
});
</script>
