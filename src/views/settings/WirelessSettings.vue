<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import WirelessBasicConfig from './wireless/WirelessBasicConfig.vue';
import WirelessAdvancedConfig from './wireless/WirelessAdvancedConfig.vue';
import WirelessWpsConfig from './wireless/WirelessWpsConfig.vue';
import WirelessMeshConfig from './wireless/WirelessMeshConfig.vue';

const { t } = useI18n();
const activeTab = ref('basic');

const tabs = [
  { id: 'basic', label: t('wireless.basicConfig') },
  { id: 'advanced', label: t('wireless.advancedConfig') },
  { id: 'wps', label: t('wireless.wpsConfig') },
  { id: 'mesh', label: t('wireless.meshNetwork') }
];
</script>

<template>
  <div class="wireless-settings">
    <h1 class="page-title">{{ t('wireless.title') }}</h1>

    <div class="tab-navigation">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-button"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="tab-content">
      <WirelessBasicConfig v-if="activeTab === 'basic'" />
      <WirelessAdvancedConfig v-if="activeTab === 'advanced'" />
      <WirelessWpsConfig v-if="activeTab === 'wps'" />
      <WirelessMeshConfig v-if="activeTab === 'mesh'" />
    </div>
  </div>
</template>

<style scoped>
.wireless-settings {
  flex: 1;
  background-color: #f5f5f5;
  min-height: 100%;
}

.page-title {
  color: #0070BB;
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0;
  padding: 1rem 2rem;
  text-align: left;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.tab-navigation {
  display: flex;
  gap: 1px;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.tab-button {
  padding: 1rem 2rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  color: #666;
  font-size: 0.9rem;
}

.tab-button:hover {
  color: #0070BB;
}

.tab-button.active {
  color: #0070BB;
  border-bottom-color: #0070BB;
}

.tab-content {
  padding: 1.5rem;
}
</style>