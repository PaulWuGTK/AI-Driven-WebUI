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
  props.modelValue.SecurityModeAvailable.split(',')  // Changed from SecurityModeSupport
);

const updateConfig = (field: keyof WlanBasicConfig, value: string | number) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value
  });
};
</script>

<template>
  <div class="band-config">
    <h2 class="band-title">{{ title }} {{ t('wireless.settings') }}</h2>
    
    <!-- Added Enable toggle -->
    <div class="form-group">
      <label class="switch-label">
        <span>{{ t('common.enable') }}</span>
        <label class="switch">
          <input
            type="checkbox"
            :checked="modelValue.Enable === 1"
            @change="updateConfig('Enable', ($event.target as HTMLInputElement).checked ? 1 : 0)"
          >
          <span class="slider"></span>
        </label>
      </label>
    </div>

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

/* Add styles for the switch */
.switch-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #0070BB;
}

input:checked + .slider:before {
  transform: translateX(26px);
}
</style>