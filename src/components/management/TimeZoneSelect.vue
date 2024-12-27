<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getTimezones } from '../../services/api';
import type { TimezoneResponse } from '../../types/timezone';

const { t } = useI18n();

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const timezones = ref<string[]>([]);
const loading = ref(true);

const fetchTimezones = async () => {
  try {
    const response: TimezoneResponse = await getTimezones();
    timezones.value = response.Timezone.TimeZones;
  } catch (error) {
    console.error('Error fetching timezones:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchTimezones();
});
</script>

<template>
  <select
    class="time-zone-select"
    :value="modelValue"
    @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    :disabled="loading"
  >
    <option v-if="loading" value="">Loading...</option>
    <option 
      v-else
      v-for="(timezone, index) in timezones" 
      :key="index" 
      :value="index"
    >
      {{ timezone }}
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

.time-zone-select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}
</style>