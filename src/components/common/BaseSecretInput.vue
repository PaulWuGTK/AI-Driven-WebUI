<template>
  <div
    class="base-secret-input"
    :class="{ 'is-display': mode === 'display', 'is-disabled': disabled }"
    :data-testid="containerDataTestid || undefined"
  >
    <input
      v-if="mode === 'input'"
      :type="isVisible ? 'text' : 'password'"
      :value="stringValue"
      :placeholder="placeholder"
      :maxlength="maxLength"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :data-testid="inputDataTestid || undefined"
      class="secret-field"
      @input="handleInput"
    />

    <span
      v-else
      class="secret-display"
      :data-testid="isVisible ? valueDataTestid || undefined : maskedDataTestid || undefined"
    >
      {{ isVisible ? displayValue : maskedValue }}
    </span>

    <button
      v-if="showToggle"
      type="button"
      class="secret-toggle"
      :disabled="disabled"
      :data-testid="toggleDataTestid || undefined"
      @click="isVisible = !isVisible"
    >
      <span class="material-icons">
        {{ isVisible ? 'visibility_off' : 'visibility' }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
  modelValue: string | number | null | undefined;
  mode?: 'input' | 'display';
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  showToggle?: boolean;
  emptyText?: string;
  maskSymbol?: string;
  containerDataTestid?: string;
  inputDataTestid?: string;
  toggleDataTestid?: string;
  valueDataTestid?: string;
  maskedDataTestid?: string;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'input',
  placeholder: '',
  maxLength: undefined,
  disabled: false,
  readonly: false,
  required: false,
  showToggle: true,
  emptyText: '-',
  maskSymbol: '*',
  containerDataTestid: '',
  inputDataTestid: '',
  toggleDataTestid: '',
  valueDataTestid: '',
  maskedDataTestid: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const isVisible = ref(false);

const stringValue = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined) {
    return '';
  }
  return String(props.modelValue);
});

const displayValue = computed(() => stringValue.value || props.emptyText);
const maskedValue = computed(() => {
  if (!stringValue.value) {
    return props.emptyText;
  }
  return props.maskSymbol.repeat(stringValue.value.length);
});

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};
</script>

<style scoped>
.base-secret-input {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.secret-field {
  width: 100%;
  padding: var(--space-3) 2.5rem var(--space-3) var(--space-4);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
  color: var(--text-primary);
  background-color: var(--bg-secondary);
  transition: all var(--transition-fast);
}

.secret-field:disabled {
  background-color: var(--bg-tertiary);
  color: var(--text-tertiary);
  cursor: not-allowed;
}

.secret-display {
  display: inline-flex;
  align-items: center;
  min-height: 1.5rem;
  color: var(--text-primary);
  font-weight: 500;
  word-break: break-all;
}

.secret-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--text-secondary);
  padding: 0.25rem;
  cursor: pointer;
}

.secret-toggle:hover:not(:disabled) {
  color: var(--text-primary);
}

.secret-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.base-secret-input:not(.is-display) .secret-toggle {
  position: absolute;
  right: 0.5rem;
}

.base-secret-input.is-display .secret-toggle {
  margin-left: 0.25rem;
}
</style>
