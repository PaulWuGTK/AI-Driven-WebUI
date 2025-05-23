<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineProps<{
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isOpen: boolean;
}>();

defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();
</script>

<template>
  <div v-if="isOpen" class="dialog-overlay">
    <div class="dialog-content">
      <h3 class="dialog-title">{{ title }}</h3>
      <p class="dialog-message">{{ message }}</p>
      <div class="dialog-buttons">
        <button class="btn btn-secondary" @click="$emit('cancel')">
          {{ cancelText || t('common.no') }}
        </button>
        <button class="btn btn-primary" @click="$emit('confirm')">
          {{ confirmText || t('common.yes') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-content {
  background-color: white;
  border-radius: 4px;
  padding: 1.5rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.dialog-title {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  color: var(--text-primary);
}

.dialog-message {
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

@media (max-width: 768px) {
  .dialog-content {
    padding: 1rem;
  }
  
  .dialog-buttons {
    flex-direction: column-reverse;
  }
  
  .dialog-buttons .btn {
    width: 100%;
  }
}
</style>