<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import IpFilteringTab from './security/IpFilteringTab.vue';
import GeneralMacFilteringTab from './security/GeneralMacFilteringTab.vue';
import { useMenuVisibilityContext } from '../../composables/useMenuVisibilityContext';
import { useQA } from '../../utils/qa';

const { isQAMode, qa, slug } = useQA();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const activeTab = ref('ipfiltering');
const { fetchMenuContext, canShowMenu } = useMenuVisibilityContext('super');

const tabs = computed(() => {
  return [
    { id: 'ipfiltering', label: t('menu.ipFiltering'), menuKey: 'basicSetup.security.ipFiltering' },
    { id: 'general-macfiltering', label: t('menu.generalMacFiltering'), menuKey: 'basicSetup.security.macFiltering' }
  ].filter(tab => canShowMenu(tab.menuKey));
});

const ensureActiveTab = () => {
  const tabFromQuery = typeof route.query.tab === 'string' ? route.query.tab : '';
  const exists = tabFromQuery && tabs.value.some(t => t.id === tabFromQuery);
  const nextTab = exists ? tabFromQuery : (tabs.value[0]?.id || 'ipfiltering');

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
    <h1 class="page-title" :data-testid="qa('security-title')">{{ t('menu.security') }}</h1>

    <div class="status-content" :data-testid="qa('security-content')">
      <div class="panel-section" :data-testid="qa('security-panel')">
        <div class="tab-navigation" :data-testid="qa('security-tabs')">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-button"
            :class="{ active: activeTab === tab.id }"
            :data-testid="qa(`security-tab-${tab.id}`)"
            @click="handleTabChange(tab.id)"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content" :data-testid="qa('security-tab-content')">
          <IpFilteringTab v-if="activeTab === 'ipfiltering'" :data-testid="qa('security-ipfiltering-content')" />
          <GeneralMacFilteringTab v-if="activeTab === 'general-macfiltering'" :data-testid="qa('security-general-macfiltering-content')" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
