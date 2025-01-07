<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getTimezones } from '../../services/api';
import type { TimezoneEntry } from '../../types/timezone';

const { t } = useI18n();

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'timezone-change', timezone: TimezoneEntry): void;
}>();

const timezones = ref<TimezoneEntry[]>([]);
const loading = ref(true);

const fetchTimezones = async () => {
  try {
    const response = await getTimezones();
    timezones.value = response.Timezone;
  } catch (error) {
    console.error('Error fetching timezones:', error);
  } finally {
    loading.value = false;
  }
};

const handleChange = (event: Event) => {
  const index = parseInt((event.target as HTMLSelectElement).value);
  const timezone = timezones.value[index-1];
  emit('update:modelValue', index.toString());
  emit('timezone-change', timezone);
};

onMounted(() => {
  fetchTimezones();
});
</script>

<template>
  <select
    class="time-zone-select"
    :value="modelValue"
    @change="handleChange"
    :disabled="loading"
  >
    <option v-if="loading" value="">Loading...</option>
    <option 
      v-else
      v-for="(timezone, index) in timezones" 
      :key="index" 
      :value="index + 1"
    >
      {{ timezone.region }}
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