<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WlanBasicConfig } from '../../../../types/wireless';

const { t } = useI18n();
const props = defineProps<{
  title: string;
  modelValue: WlanBasicConfig;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: WlanBasicConfig): void;
}>();

const showPassword = ref(false);

const securityModes = computed(() => 
  props.modelValue.SecurityModeSupport.split(',')
);

const updateConfig = (field: keyof WlanBasicConfig, value: string) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value
  });
};
</script>

<template>
  <div class="band-config">
    <h2 class="band-title">{{ title }} {{ t('wireless.settings') }}</h2>
    
    <div class="form-group">
      <label>{{ t('wireless.ssid') }}</label>
      <input
        type="text"
        :value="modelValue.SSID"
        @input="updateConfig('SSID', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <div class="form-group">
      <label>{{ t('wireless.authentication') }}</label>
      <select
        :value="modelValue.SecurityMode"
        @change="updateConfig('SecurityMode', ($event.target as HTMLSelectElement).value)"
      >
        <option v-for="mode in securityModes" :key="mode" :value="mode">
          {{ mode }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label>{{ t('wireless.password') }}</label>
      <div class="password-input">
        <input
          :type="showPassword ? 'text' : 'password'"
          :value="modelValue.Password"
          @input="updateConfig('Password', ($event.target as HTMLInputElement).value)"
        />
        <button 
          type="button" 
          class="toggle-password"
          @click="showPassword = !showPassword"
        >
          <span class="material-icons">
            {{ showPassword ? 'visibility_off' : 'visibility' }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.band-config {
  background-color: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 1.5rem;
}

.band-title {
  font-size: 1rem;
  color: #333;
  margin: 0 0 1.5rem 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
}

input, select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.password-input {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input input {
  padding-right: 2.5rem;
}

.toggle-password {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 0.25rem;
}

.toggle-password:hover {
  color: #333;
}
</style>