<template>
  <div :class="cardClasses">
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <h3 v-if="title" class="card-title">{{ title }}</h3>
        <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
      </slot>
    </div>
    <div :class="bodyClasses">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'flat' | 'elevated';
  hover?: boolean;
  compact?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  hover: false,
  compact: false,
});

const cardClasses = computed(() => {
  const classes = ['card'];

  if (props.variant === 'flat') {
    classes.push('card-flat');
  } else if (props.variant === 'elevated') {
    classes.push('card-elevated');
  }

  if (props.hover) {
    classes.push('card-hover');
  }

  return classes;
});

const bodyClasses = computed(() => {
  return props.compact ? 'card-body card-body-compact' : 'card-body';
});
</script>
