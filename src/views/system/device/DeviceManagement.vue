<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import TR069Config from './TR069Config.vue';
import TR069Log from './TR069Log.vue';
import TR369Config from './TR369Config.vue';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const props = defineProps<{
  mode?: 'tr069' | 'tr369';
}>();
const isTR369Only = computed(() => props.mode === 'tr369');
const activeTab = ref(isTR369Only.value ? 'tr369' : 'tr069');

watch(isTR369Only, (value) => {
  activeTab.value = value ? 'tr369' : 'tr069';
}, { immediate: true });

const tabs = computed(() => {
  if (isTR369Only.value) {
    return [{ id: 'tr369', label: t('device.tr369Config') }];
  }
  return [
    { id: 'tr069', label: t('device.tr069Config') },
    { id: 'tr069-log', label: t('device.tr069Log') }
  ];
});
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('device-management-title')">
      {{ isTR369Only ? t('device.tr369Config') : t('device.tr069Config') }}
    </h1>

    <div class="status-content" :data-testid="qa('device-management-content')">
      <div class="panel-section" :data-testid="qa('device-management-panel')">
        <div class="tab-navigation" :data-testid="qa('device-management-tabs')">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-button"
            :class="{ active: activeTab === tab.id }"
            :data-testid="qa(`device-management-tab-${tab.id}`)"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content" :data-testid="qa('device-management-tab-content')">
          <TR069Config v-if="activeTab === 'tr069'" :data-testid="qa('device-tr069-config')" />
          <TR069Log v-if="activeTab === 'tr069-log'" :data-testid="qa('device-tr069-log')" />
          <TR369Config v-if="activeTab === 'tr369'" :data-testid="qa('device-tr369-config')" />
        </div>
      </div>
    </div>
  </div>
</template>
