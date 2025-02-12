<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import WirelessBasicConfig from './wireless/WirelessBasicConfig.vue';
import WirelessAdvancedConfig from './wireless/WirelessAdvancedConfig.vue';
import WirelessWpsConfig from './wireless/WirelessWpsConfig.vue';
import WirelessMeshConfig from './wireless/WirelessMeshConfig.vue';

const { t } = useI18n();
const activeTab = ref('basic');

// 使用 computed 來動態生成 tabs,這樣在語言改變時會自動更新
const tabs = computed(() => [
  { id: 'basic', label: t('wireless.basicConfig') },
  { id: 'advanced', label: t('wireless.advancedConfig') },
  { id: 'wps', label: t('wireless.wpsConfig') },
  { id: 'mesh', label: t('wireless.meshNetwork') }
]);
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">{{ t('wireless.title') }}</h1>

    <div class="status-content">
      <div class="panel-section">
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
    </div>
  </div>
</template>

<style scoped>
/* 移除原有的 tab-navigation 相關樣式 */
</style>