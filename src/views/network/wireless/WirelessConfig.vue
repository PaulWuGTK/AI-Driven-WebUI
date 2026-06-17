<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import WirelessBasicConfig from './BasicConfig.vue';
import WirelessAdvancedConfig from './AdvancedConfig.vue';
import WirelessWpsConfig from './WpsConfig.vue';
import WirelessMeshConfig from './MeshConfig.vue';
import WirelessExtenderTab from './ExtenderConfig.vue';
import MacFilteringTab from '../../advanced/security/MacFilteringTab.vue';
import TabInProgress from '../../../components/TabInProgress.vue';
import { useMenuVisibilityContext } from '../../../composables/useMenuVisibilityContext';
import { useQA } from '../../../utils/qa';

const { qa } = useQA();

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const activeTab = ref('basic');

const { fetchMenuContext, canShowMenu } = useMenuVisibilityContext('super');

type Tab = {
  id: string;
  label: string;
  menuKey?: string;
};

const tabs = computed<Tab[]>(() => {
  const baseTabs: Tab[] = [
    { id: 'basic', label: t('wireless.basicConfig'), menuKey: 'basicSetup.wlan.basicConfig' },
    { id: 'advanced', label: t('wireless.advancedConfig'), menuKey: 'basicSetup.wlan.advancedConfig' },
    { id: 'wps', label: t('wireless.wpsConfig'), menuKey: 'basicSetup.wlan.wpsConfig' },
    { id: 'mesh', label: t('wireless.meshNetwork'), menuKey: 'basicSetup.wlan.meshNetwork' },
    { id: 'zones', label: t('wireless.wifiZones'), menuKey: 'basicSetup.wlan.wifiZones' }
  ].filter((tab) => !tab.menuKey || canShowMenu(tab.menuKey));

  if (canShowMenu('basicSetup.wlan.wirelessExtender')) {
    baseTabs.push({
      id: 'wlan',
      label: t('wireless.wlanExtender'),
      menuKey: 'basicSetup.wlan.wirelessExtender'
    });
  }

  if (canShowMenu('basicSetup.wlan.wirelessMacFilter')) {
    baseTabs.push({
      id: 'macfilter',
      label: t('menu.wifiMacFiltering'),
      menuKey: 'basicSetup.wlan.wirelessMacFilter'
    });
  }

  return baseTabs;
});

const ensureActiveTab = () => {
  const tabFromQuery = typeof route.query.tab === 'string' ? route.query.tab : '';
  const exists = tabFromQuery && tabs.value.some((t) => t.id === tabFromQuery);
  const nextTab = exists ? tabFromQuery : (tabs.value[0]?.id || 'basic');

  if (activeTab.value !== nextTab) activeTab.value = nextTab;
  if (!exists) {
    router.replace({ path: route.path, query: { ...route.query, tab: nextTab } });
  }
};

watch([() => route.query.tab, tabs], ensureActiveTab, { immediate: true });

const handleTabChange = (tabId: string) => {
  activeTab.value = tabId;
  router.replace({
    path: route.path,
    query: { ...route.query, tab: tabId }
  });
};

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
          <WirelessExtenderTab v-if="activeTab === 'wlan'" :data-testid="qa('wireless-wlan-extender')" />
          <MacFilteringTab v-if="activeTab === 'macfilter'" :data-testid="qa('wireless-mac-filter')" />
          <TabInProgress v-if="activeTab === 'zones'" :data-testid="qa('wireless-wifi-zones')" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styles inherited from shared layout classes. */
</style>
