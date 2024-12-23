<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineProps<{
  modelValue: string;
}>();

defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const timeZones = [
  { value: '16', label: '(GMT) Banjul, London, Monrovia' },
  { value: '32', label: '(GMT+8) Beijing, Hong Kong, Singapore' },
  // Add more time zones as needed
];
</script>

<template>
  <select
    class="time-zone-select"
    :value="modelValue"
    @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
  >
    <option v-for="tz in timeZones" :key="tz.value" :value="tz.value">
      {{ tz.label }}
    </option>
  </select>
</template>

<style scoped>
.time-zone-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}
</style>