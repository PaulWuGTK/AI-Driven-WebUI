<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="btn-spinner"></span>
    <slot v-if="!loading" name="icon-left"></slot>
    <span v-if="!loading && $slots.default" class="btn-text">
      <slot></slot>
    </span>
    <slot v-if="!loading" name="icon-right"></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  block?: boolean;
  icon?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  block: false,
  icon: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const buttonClasses = computed(() => {
  const classes = ['btn'];

  classes.push(`btn-${props.variant}`);

  if (props.size !== 'md') {
    classes.push(`btn-${props.size}`);
  }

  if (props.loading) {
    classes.push('btn-loading');
  }

  if (props.block) {
    classes.push('btn-block');
  }

  if (props.icon) {
    classes.push(`btn-icon`);
    if (props.size !== 'md') {
      classes.push(`btn-icon-${props.size}`);
    }
  }

  return classes;
});

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};
</script>

<style scoped>
.btn-spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid currentColor;
  border-radius: 50%;
  border-right-color: transparent;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.btn-block {
  width: 100%;
}

.btn-text {
  display: inline-block;
}
</style>
