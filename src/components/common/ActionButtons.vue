<template>
  <div class="action-buttons" :data-testid="dataTestid || undefined">
    <BaseButton
      v-if="showCancel"
      :type="cancelType"
      :variant="cancelVariant"
      :disabled="cancelDisabled"
      :data-testid="cancelDataTestid || undefined"
      @click="handleCancel"
    >
      {{ resolvedCancelText }}
    </BaseButton>

    <BaseButton
      v-if="showApply"
      :type="applyType"
      :variant="applyVariant"
      :disabled="applyDisabled"
      :loading="applyLoading"
      :data-testid="applyDataTestid || undefined"
      @click="handleApply"
    >
      {{ resolvedApplyText }}
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseButton from './BaseButton.vue';

interface Props {
  showCancel?: boolean;
  showApply?: boolean;
  cancelText?: string;
  applyText?: string;
  cancelType?: 'button' | 'submit' | 'reset';
  applyType?: 'button' | 'submit' | 'reset';
  cancelVariant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  applyVariant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  cancelDisabled?: boolean;
  applyDisabled?: boolean;
  applyLoading?: boolean;
  dataTestid?: string;
  cancelDataTestid?: string;
  applyDataTestid?: string;
}

const props = withDefaults(defineProps<Props>(), {
  showCancel: true,
  showApply: true,
  cancelText: '',
  applyText: '',
  cancelType: 'button',
  applyType: 'button',
  cancelVariant: 'secondary',
  applyVariant: 'primary',
  cancelDisabled: false,
  applyDisabled: false,
  applyLoading: false,
  dataTestid: '',
  cancelDataTestid: '',
  applyDataTestid: '',
});

const emit = defineEmits<{
  cancel: [event: MouseEvent];
  apply: [event: MouseEvent];
}>();

const { t } = useI18n({ useScope: 'global' });

const resolvedCancelText = computed(() => props.cancelText || t('common.cancel'));
const resolvedApplyText = computed(() => props.applyText || t('common.apply'));

const handleCancel = (event: MouseEvent) => {
  emit('cancel', event);
};

const handleApply = (event: MouseEvent) => {
  emit('apply', event);
};
</script>

<style scoped>
.action-buttons {
  display: flex;
  gap: var(--space-3);
}
</style>
