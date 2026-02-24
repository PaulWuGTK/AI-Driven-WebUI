<template>
  <Teleport to="body">
    <Transition name="toast-fade">
      <div
        v-if="modelValue"
        :class="toastClasses"
        role="status"
        aria-live="polite"
        :data-testid="dataTestid || undefined"
      >
        <span class="toast-message">{{ message }}</span>
        <button
          v-if="closable"
          class="toast-close"
          type="button"
          aria-label="Close notification"
          @click="close"
        >
          &times;
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Props {
  modelValue: boolean;
  message: string;
  type?: ToastType;
  closable?: boolean;
  dataTestid?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'success',
  closable: false,
  dataTestid: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const toastClasses = computed(() => ['base-toast', `is-${props.type}`]);

const close = () => {
  emit('update:modelValue', false);
};
</script>

<style scoped>
.base-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: var(--z-index-toast, 1000);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: min(420px, calc(100vw - 2rem));
  padding: 0.875rem 1rem;
  border-radius: 6px;
  color: white;
  box-shadow: var(--shadow-md);
}

.toast-message {
  line-height: 1.4;
}

.toast-close {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 1.125rem;
  line-height: 1;
  padding: 0;
}

.is-success {
  background-color: #2e7d32;
}

.is-error {
  background-color: #dc3545;
}

.is-warning {
  background-color: #ef6c00;
}

.is-info {
  background-color: #0070bb;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.25s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
