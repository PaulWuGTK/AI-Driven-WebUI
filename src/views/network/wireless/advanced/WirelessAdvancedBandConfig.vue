<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WlanAdvancedConfig } from '../../../../types/wireless';
import { BaseSwitch } from '../../../../components/common';
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
          <BaseSwitch
            :model-value="Number(modelValue.RadioEnable)"
            :true-value="1"
            :false-value="0"
            :disabled="mloEnabled"
            :data-testid="qa(`wireless-advanced-band-config-enable-toggle-${slug(title)}`)"
            :slider-data-testid="qa(`wireless-advanced-band-config-enable-toggle-slider-${slug(title)}`)"
            @update:model-value="(value) => updateConfig('RadioEnable', Number(value))"
          />
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
          <div class="auto-channel">
            <span :data-testid="qa(`wireless-advanced-band-config-auto-channel-label-${slug(title)}`)">{{ t('wireless.autoChannel') }}</span>
            <BaseSwitch
              :model-value="Number(modelValue.AutoChannelEnable)"
              :true-value="1"
              :false-value="0"
              :disabled="modelValue.RadioEnable === 0"
              :data-testid="qa(`wireless-advanced-band-config-auto-channel-toggle-${slug(title)}`)"
              :slider-data-testid="qa(`wireless-advanced-band-config-auto-channel-toggle-slider-${slug(title)}`)"
              @update:model-value="(value) => updateConfig('AutoChannelEnable', Number(value))"
            />
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

      <div class="form-group">
        <div class="switch-label">
          <span :data-testid="qa(`wireless-advanced-band-config-mu-mimo-label-${slug(title)}`)">{{ t('wireless.muMimo') }}</span>
          <BaseSwitch
            :model-value="Number(modelValue.MultiUserMIMOEnabled)"
            :true-value="1"
            :false-value="0"
            :disabled="modelValue.RadioEnable === 0"
            :data-testid="qa(`wireless-advanced-band-config-mu-mimo-toggle-${slug(title)}`)"
            :slider-data-testid="qa(`wireless-advanced-band-config-mu-mimo-toggle-slider-${slug(title)}`)"
            @update:model-value="(value) => updateConfig('MultiUserMIMOEnabled', Number(value))"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.channel-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom: 0.5rem;
  gap: 12px;
}

.channel-header > label{
  margin: 0;
}

.auto-channel{
  display:flex;
  align-items:center;
  justify-content:flex-end;
  gap: 8px;
  white-space: nowrap;
  
}

.auto-channel .switch{
  margin-left: 0;
}

.band-config {
  background-color: var(--bg-secondary);
  border-radius: var(--radius-sm);
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-md);
}

.band-config:last-child {
  margin-bottom: 0;
}

.band-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 1.5rem;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.section-title-sp {
  font-size: 1rem;
  color: var(--text-primary);
  padding: 0.5rem 0rem;
  background-color: var(--bg-secondary);
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
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.channel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

/* Custom switch size (60px × 34px) with left margin for layout */
:deep(.switch) {
  width: 60px;
  height: 34px;
  flex-shrink: 0;
  margin-left:10px;
}

:deep(.slider:before) {
  height: 26px;
  width: 26px;
}

:deep(input:checked + .slider:before) {
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

  .auto-channel{
    width: 100%;
    justify-content: space-between;
  }
  
}
</style>
