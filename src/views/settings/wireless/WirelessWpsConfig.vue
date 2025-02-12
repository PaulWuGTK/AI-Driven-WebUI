```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getWlanWps, updateWlanWps } from '../../../services/api/wireless';
import type { WlanWpsResponse } from '../../../types/wireless';
import WpsVapInfo from './wps/WpsVapInfo.vue';
import WpsActions from './wps/WpsActions.vue';

const { t } = useI18n();
const wpsData = ref<WlanWpsResponse | null>(null);
const loading = ref(false);

const fetchWpsConfig = async () => {
  loading.value = true;
  try {
    wpsData.value = await getWlanWps();
  } catch (error) {
    console.error('Error fetching WPS config:', error);
  } finally {
    loading.value = false;
  }
};

const handleEnableToggle = async (enabled: boolean) => {
  try {
    await updateWlanWps({
      WlanWps: {
        Enable: enabled ? 1 : 0
      }
    });
    await fetchWpsConfig();
  } catch (error) {
    console.error('Error updating WPS enable state:', error);
  }
};

onMounted(fetchWpsConfig);
</script>

<template>
  <div class="wireless-wps-config">
    <div class="wps-enable">
      <div class="switch-label">
        <span>{{ t('wireless.wpsConfiguration') }}</span>
        <label class="switch">
          <input
            type="checkbox"
            :checked="wpsData?.WlanWps.Enable === 1"
            @change="handleEnableToggle(($event.target as HTMLInputElement).checked)"
          >
          <span class="slider"></span>
        </label>
      </div>
    </div>

    <template v-if="wpsData?.WlanWps.Enable === 1">
      <WpsActions 
        :pin-code="wpsData.WlanWps.PINCode"
        @refresh="fetchWpsConfig"
      />
      <WpsVapInfo 
        :bands="wpsData.WlanWps.Band"
      />
    </template>
  </div>
</template>

<style scoped>
.wireless-wps-config {
  padding: 1.5rem;
}

.wps-enable {
  margin-bottom: 1.5rem;
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
  .wireless-wps-config {
    padding: 1rem;
  }
}
</style>
```