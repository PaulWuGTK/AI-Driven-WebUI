<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import PortForwardingTab from './PortForwardingTab.vue';
import DmzHostTab from './DmzHostTab.vue';
import TabInProgress from '../../../components/TabInProgress.vue';
import { useMenuVisibilityContext } from '../../../composables/useMenuVisibilityContext';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const activeTab = ref('portforwarding');
const { fetchMenuContext, canShowMenu } = useMenuVisibilityContext('super');

const tabs = computed(() =>
  [
    { id: 'portforwarding', label: t('nat.portForwarding'), menuKey: 'basicSetup.nat.portForwarding' },
    { id: 'dmz', label: t('nat.dmzHost'), menuKey: 'basicSetup.nat.dmzHost' },
    { id: 'alg', label: t('nat.alg'), menuKey: 'basicSetup.nat.alg' }
  ].filter(tab => canShowMenu(tab.menuKey))
);

const ensureActiveTab = () => {
  const tabFromQuery = typeof route.query.tab === 'string' ? route.query.tab : '';
  const exists = tabFromQuery && tabs.value.some(t => t.id === tabFromQuery);
  const nextTab = exists ? tabFromQuery : (tabs.value[0]?.id || 'portforwarding');

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
    <h1 class="page-title" :data-testid="qa('nat-title')">{{ t('nat.title') }}</h1>

    <div class="status-content" :data-testid="qa('nat-content')">
      <div class="panel-section" :data-testid="qa('nat-panel')">
        <div class="tab-navigation" :data-testid="qa('nat-tabs')">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-button"
            :class="{ active: activeTab === tab.id }"
            :data-testid="qa(`nat-tab-${tab.id}`)"
            @click="handleTabChange(tab.id)"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content" :data-testid="qa('nat-tab-content')">
          <PortForwardingTab v-if="activeTab === 'portforwarding'" :data-testid="qa('nat-portforwarding')" />
          <DmzHostTab v-if="activeTab === 'dmz'" :data-testid="qa('nat-dmz')" />
          <TabInProgress v-if="activeTab === 'alg'" :data-testid="qa('nat-alg')" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
