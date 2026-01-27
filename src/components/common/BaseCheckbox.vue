<template>
  <div class="form-check">
    <input
      :id="checkboxId"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      :required="required"
      :data-testid="dataTestid"
      class="form-check-input"
      @change="handleChange"
    />
    <label v-if="label || $slots.default" :for="checkboxId" class="form-check-label">
      <slot>{{ label }}</slot>
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: boolean;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  dataTestid?: string;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  change: [value: boolean];
}>();

const checkboxId = computed(() => props.id || `checkbox-${Math.random().toString(36).substring(7)}`);

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.checked);
  emit('change', target.checked);
};
</script>
