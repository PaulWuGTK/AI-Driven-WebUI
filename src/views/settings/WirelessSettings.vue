<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import WirelessBasicConfig from './wireless/WirelessBasicConfig.vue';
import WirelessAdvancedConfig from './wireless/WirelessAdvancedConfig.vue';
import WirelessWpsConfig from './wireless/WirelessWpsConfig.vue';
import WirelessMeshConfig from './wireless/WirelessMeshConfig.vue';
import { useQA } from '../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const activeTab = ref('basic');

// 使用 computed 來動態生成 tabs,這樣在語言改變時會自動更新
const tabs = computed(() => [
  { id: 'basic', label: t('wireless.basicConfig') },
  { id: 'advanced', label: t('wireless.advancedConfig') },
  { id: 'wps', label: t('wireless.wpsConfig') },
  { id: 'mesh', label: t('wireless.meshNetwork') }
]);

// 監聽路由參數變化來設定活動分頁
watch(() => route.query.tab, (newTab) => {
  if (newTab && typeof newTab === 'string' && tabs.value.some(tab => tab.id === newTab)) {
    activeTab.value = newTab;
  }
}, { immediate: true });

// 當分頁改變時更新 URL 參數
const handleTabChange = (tabId: string) => {
  activeTab.value = tabId;
  router.replace({ 
    path: route.path, 
    query: { ...route.query, tab: tabId } 
  });
};

// 初始化時檢查 URL 參數
onMounted(() => {
  const tabFromQuery = route.query.tab;
  if (tabFromQuery && typeof tabFromQuery === 'string' && tabs.value.some(tab => tab.id === tabFromQuery)) {
    activeTab.value = tabFromQuery;
  }
});
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('wireless-title')">{{ t('wireless.title') }}</h1>

    <div class="status-content" :data-testid="qa('wireless-content')">
      <div class="panel-section" :data-testid="qa('wireless-panel')">
        <div class="tab-navigation" :data-testid="qa('wireless-tabs')">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-button"
            :class="{ active: activeTab === tab.id }"
            :data-testid="qa(`wireless-tab-${tab.id}`)"
            @click="handleTabChange(tab.id)"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content" :data-testid="qa('wireless-tab-content')">
          <WirelessBasicConfig v-if="activeTab === 'basic'" :data-testid="qa('wireless-basic-config')" />
          <WirelessAdvancedConfig v-if="activeTab === 'advanced'" :data-testid="qa('wireless-advanced-config')" />
          <WirelessWpsConfig v-if="activeTab === 'wps'" :data-testid="qa('wireless-wps-config')" />
          <WirelessMeshConfig v-if="activeTab === 'mesh'" :data-testid="qa('wireless-mesh-config')" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 移除原有的 tab-navigation 相關樣式 */
</style>