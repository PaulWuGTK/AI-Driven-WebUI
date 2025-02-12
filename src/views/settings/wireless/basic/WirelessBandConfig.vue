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
  props.modelValue.SecurityModeAvailable.split(',')
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
    <div class="band-header">
      <div class="section-title-sp">{{ title }} {{ t('wireless.settings') }}</div>
    </div>

    <div class="band-content">
      <div class="form-group">
        <div class="switch-label">
          <span>{{ t('common.enable') }}</span>
          <label class="switch">
            <input
              type="checkbox"
              :checked="modelValue.Enable === 1"
              @change="updateConfig('Enable', ($event.target as HTMLInputElement).checked ? 1 : 0)"
            >
            <span class="slider"></span>
          </label>
        </div>
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
  </div>
</template>

<style scoped>
.band-config {
  background-color: white;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.2);
}

.band-config:last-child {
  margin-bottom: 0;
}

.band-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 1.5rem;
  background-color: white;
  border-bottom: 1px solid var(--border-color);
}

.section-title-sp {
  font-size: 1rem;
  color: var(--text-primary);
  padding: 0.5rem 0rem;
  background-color: white;
}

.band-content {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

input, select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
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
  color: var(--text-secondary);
  padding: 0.25rem;
}

.toggle-password:hover {
  color: var(--text-primary);
}

.switch-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-primary);
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  flex-shrink: 0;
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
  background-color: var(--primary-color);
}

input:checked + .slider:before {
  transform: translateX(26px);
}

@media (max-width: 768px) {
  .band-header {
    padding: 1rem;
  }

  .band-content {
    padding: 1rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }
}
</style>