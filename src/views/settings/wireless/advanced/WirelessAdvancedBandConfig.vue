<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WlanAdvancedConfig } from '../../../../types/wireless';
import { useQA } from '../../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const props = defineProps<{
  title: string;
  modelValue: WlanAdvancedConfig;
  mloEnabled: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: WlanAdvancedConfig): void;
}>();

const modes = computed(() => props.modelValue.ModeList?.split(',') || []);
const bandwidths = computed(() => props.modelValue.ChannelBandwidthList?.split(',') || []);
const channels = computed(() => props.modelValue.ChannelList?.split(',').map(Number) || []);

const updateConfig = (field: keyof WlanAdvancedConfig, value: string | number) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value
  });
};
</script>

<template>
  <div class="band-config" :data-testid="qa(`wireless-advanced-band-config-${slug(title)}`)">
    <div class="band-header">
      <div class="section-title-sp" :data-testid="qa(`wireless-advanced-band-config-title-${slug(title)}`)">{{ title }} {{ t('wireless.settings') }}</div>
    </div>
    
    <div class="band-content" :data-testid="qa(`wireless-advanced-band-config-content-${slug(title)}`)">
      <div class="form-group">
        <div class="switch-label">
          <span :data-testid="qa(`wireless-advanced-band-config-enable-label-${slug(title)}`)">{{ t('common.enable') }}</span>
          <label class="switch">
            <input
              type="checkbox"
              :data-testid="qa(`wireless-advanced-band-config-enable-toggle-${slug(title)}`)"
              :checked="modelValue.RadioEnable === 1"
              @change="updateConfig('RadioEnable', ($event.target as HTMLInputElement).checked ? 1 : 0)"
            >
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label :data-testid="qa(`wireless-advanced-band-config-mode-label-${slug(title)}`)">{{ t('wireless.mode') }}</label>
        <select
          :data-testid="qa(`wireless-advanced-band-config-mode-select-${slug(title)}`)"
          :value="modelValue.Mode"
          @change="updateConfig('Mode', ($event.target as HTMLSelectElement).value)"
          :disabled="modelValue.RadioEnable === 0 || mloEnabled"
        >
          <option v-for="mode in modes" :key="mode" :value="mode" :data-testid="qa(`wireless-advanced-band-config-mode-option-${slug(title)}-${slug(mode)}`)">
            {{ mode.toUpperCase() }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label :data-testid="qa(`wireless-advanced-band-config-bandwidth-label-${slug(title)}`)">{{ t('wireless.bandwidth') }}</label>
        <select
          :data-testid="qa(`wireless-advanced-band-config-bandwidth-select-${slug(title)}`)"
          :value="modelValue.ChannelBandwidth"
          @change="updateConfig('ChannelBandwidth', ($event.target as HTMLSelectElement).value)"
          :disabled="modelValue.RadioEnable === 0"
        >
          <option v-for="bandwidth in bandwidths" :key="bandwidth" :value="bandwidth" :data-testid="qa(`wireless-advanced-band-config-bandwidth-option-${slug(title)}-${slug(bandwidth)}`)">
            {{ bandwidth }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <div class="channel-header" :data-testid="qa(`wireless-advanced-band-config-channel-header-${slug(title)}`)">
          <label :data-testid="qa(`wireless-advanced-band-config-channel-label-${slug(title)}`)">{{ t('wireless.channel') }}</label>
          <div class="switch-label">
            <span :data-testid="qa(`wireless-advanced-band-config-auto-channel-label-${slug(title)}`)">{{ t('wireless.autoChannel') }}</span>
            <label class="switch">
              <input
                type="checkbox"
                :data-testid="qa(`wireless-advanced-band-config-auto-channel-toggle-${slug(title)}`)"
                :checked="modelValue.AutoChannelEnable === 1"
                @change="updateConfig('AutoChannelEnable', ($event.target as HTMLInputElement).checked ? 1 : 0)"
                :disabled="modelValue.RadioEnable === 0"
              />
              <span class="slider"></span>
            </label>
          </div>
        </div>
        <select
          :data-testid="qa(`wireless-advanced-band-config-channel-select-${slug(title)}`)"
          :value="modelValue.Channel"
          @change="updateConfig('Channel', ($event.target as HTMLSelectElement).value)"
          :disabled="modelValue.RadioEnable === 0 || modelValue.AutoChannelEnable === 1"
        >
          <option v-for="channel in channels" :key="channel" :value="channel" :data-testid="qa(`wireless-advanced-band-config-channel-option-${slug(title)}-${channel}`)">
            {{ channel }}
          </option>
        </select>
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

.channel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
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
  margin-left:10px;
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

select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}

select:disabled {
  background-color: var(--bg-secondary);
  cursor: not-allowed;
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

  .channel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .switch-label {
    width: 100%;
    justify-content: space-between;
  }
}
</style>