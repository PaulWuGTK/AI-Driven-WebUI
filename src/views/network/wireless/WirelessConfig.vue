<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import WirelessBasicConfig from './BasicConfig.vue';
import WirelessAdvancedConfig from './AdvancedConfig.vue';
import WirelessWpsConfig from './WpsConfig.vue';
import WirelessMeshConfig from './MeshConfig.vue';
import WirelessExtenderTab from './ExtenderConfig.vue';
import GuestNetworkTab from './GuestNetwork.vue';
import TabInProgress from '../../../components/TabInProgress.vue';
import { useMenuVisibilityContext } from '../../../composables/useMenuVisibilityContext';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const activeTab = ref('basic');

const { fetchMenuContext, canShowMenu } = useMenuVisibilityContext('super');

// 檢查是否啟用開發者模式（通過 URL 參數）
const isDeveloperMode = computed(() => {
  return route.query.dev === 'true' || sessionStorage.getItem('wirelessDevMode') === 'true';
});

// 如果 URL 有 dev=true，保存到 sessionStorage
watch(() => route.query.dev, (newValue) => {
  if (newValue === 'true') {
    sessionStorage.setItem('wirelessDevMode', 'true');
  }
}, { immediate: true });

type Tab = {
  id: string;
  label: string;
  menuKey?: string;
};

const tabs = computed<Tab[]>(() => {
  const baseTabs: Tab[] = [
    { id: 'basic',    label: t('wireless.basicConfig'),    menuKey: 'basicSetup.wlan.basicConfig' },
    { id: 'advanced', label: t('wireless.advancedConfig'), menuKey: 'basicSetup.wlan.advancedConfig' },
    { id: 'wps',      label: t('wireless.wpsConfig'),      menuKey: 'basicSetup.wlan.wpsConfig' },
    { id: 'mesh',     label: t('wireless.meshNetwork'),    menuKey: 'basicSetup.wlan.meshNetwork' },
    { id: 'zones',    label: t('wireless.wifiZones'),      menuKey: 'basicSetup.wlan.wifiZones' },
  ].filter(tab =>
    !tab.menuKey || canShowMenu(tab.menuKey)
  );

  if (isDeveloperMode.value) {
    baseTabs.push(
      { id: 'guest', label: t('guest.title') },
      { id: 'wlan',  label: t('wireless.wlanExtender') }
    );
  }

  return baseTabs;
});

// 監聽路由參數變化來設定活動分頁
const ensureActiveTab = () => {
  const tabFromQuery = typeof route.query.tab === 'string' ? route.query.tab : '';
  const exists = tabFromQuery && tabs.value.some(t => t.id === tabFromQuery);
  const nextTab = exists ? tabFromQuery : (tabs.value[0]?.id || 'basic');

  if (activeTab.value !== nextTab) activeTab.value = nextTab;
  if (!exists) {
    router.replace({ path: route.path, query: { ...route.query, tab: nextTab } });
  }
};

watch([() => route.query.tab, tabs], ensureActiveTab, { immediate: true });

// 當分頁改變時更新 URL 參數
const handleTabChange = (tabId: string) => {
  activeTab.value = tabId;
  router.replace({ 
    path: route.path, 
    query: { ...route.query, tab: tabId } 
  });
};

// 初始化時檢查 URL 參數
onMounted(async () => {
  await fetchMenuContext();
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
          <GuestNetworkTab v-if="activeTab === 'guest' && isDeveloperMode" :data-testid="qa('wireless-guest-network')" />
          <WirelessExtenderTab v-if="activeTab === 'wlan' && isDeveloperMode" :data-testid="qa('wireless-wlan-extender')" />
          <TabInProgress v-if="activeTab === 'zones'" :data-testid="qa('wireless-wifi-zones')" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 移除原有的 tab-navigation 相關樣式 */
</style>
