<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import IpFilteringTab from './security/IpFilteringTab.vue';
import MacFilteringTab from './security/MacFilteringTab.vue';
import { useQA } from '../../utils/qa';

const { isQAMode, qa, slug } = useQA();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const activeTab = ref('ipfiltering');

const tabs = computed(() => [
  { id: 'ipfiltering', label: t('menu.ipFiltering') },
  { id: 'macfiltering', label: t('menu.macFiltering') }
]);

watch(() => route.query.tab, (newTab) => {
  if (newTab && typeof newTab === 'string' && tabs.value.some(tab => tab.id === newTab)) {
    activeTab.value = newTab;
  }
}, { immediate: true });

const handleTabChange = (tabId: string) => {
  activeTab.value = tabId;
  router.replace({
    path: route.path,
    query: { ...route.query, tab: tabId }
  });
};

onMounted(() => {
  const tabFromQuery = route.query.tab;
  if (tabFromQuery && typeof tabFromQuery === 'string' && tabs.value.some(tab => tab.id === tabFromQuery)) {
    activeTab.value = tabFromQuery;
  }
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
          <MacFilteringTab v-if="activeTab === 'macfiltering'" :data-testid="qa('security-macfiltering-content')" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
