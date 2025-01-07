<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WlanAdvancedConfig } from '../../../../types/wireless';

const { t } = useI18n();
const props = defineProps<{
  modelValue: WlanAdvancedConfig;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: WlanAdvancedConfig): void;
}>();

const modes = computed(() => props.modelValue.ModeList.split(','));
const bandwidths = computed(() => props.modelValue.ChannelBandwidthList.split(','));
const channels = computed(() => props.modelValue.ChannelList.split(',').map(Number));

const updateConfig = (field: keyof WlanAdvancedConfig, value: string | number) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value
  });
};
</script>

<template>
  <div class="band-config">
    <h2 class="band-title">{{ modelValue.Band }} {{ t('wireless.settings') }}</h2>
    
    <div class="form-group">
      <label>{{ t('wireless.mode') }}</label>
      <select
        :value="modelValue.Mode"
        @change="updateConfig('Mode', ($event.target as HTMLSelectElement).value)"
      >
        <option v-for="mode in modes" :key="mode" :value="mode">
          {{ mode.toUpperCase() }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label>{{ t('wireless.bandwidth') }}</label>
      <select
        :value="modelValue.ChannelBandwidth"
        @change="updateConfig('ChannelBandwidth', ($event.target as HTMLSelectElement).value)"
      >
        <option v-for="bandwidth in bandwidths" :key="bandwidth" :value="bandwidth">
          {{ bandwidth }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <div class="channel-header">
        <label>{{ t('wireless.channel') }}</label>
        <label class="auto-channel">
          <input
            type="checkbox"
            :checked="modelValue.AutoChannelEnable === 1"
            @change="updateConfig('AutoChannelEnable', ($event.target as HTMLInputElement).checked ? 1 : 0)"
          />
          {{ t('wireless.autoChannel') }}
        </label>
      </div>
      <select
        :value="modelValue.Channel"
        @change="updateConfig('Channel', Number(($event.target as HTMLSelectElement).value))"
        :disabled="modelValue.AutoChannelEnable === 1"
      >
        <option v-for="channel in channels" :key="channel" :value="channel">
          {{ channel }}
        </option>
      </select>
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

.channel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.auto-channel {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

input[type="checkbox"] {
  margin: 0;
}

select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

select:disabled {
  background-color: #f0f0f0;
  cursor: not-allowed;
}
</style>