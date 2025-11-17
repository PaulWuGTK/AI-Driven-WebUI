<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import DmzHostTab from './DmzHostTab.vue';
import TabInProgress from '../../../components/TabInProgress.vue';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const activeTab = ref('portforwarding');

const tabs = computed(() => [
  { id: 'portforwarding', label: t('nat.portForwarding') },
  { id: 'dmz', label: t('nat.dmzHost') },
  { id: 'alg', label: t('nat.alg') }
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
          <TabInProgress v-if="activeTab === 'portforwarding'" :data-testid="qa('nat-portforwarding')" />
          <DmzHostTab v-if="activeTab === 'dmz'" :data-testid="qa('nat-dmz')" />
          <TabInProgress v-if="activeTab === 'alg'" :data-testid="qa('nat-alg')" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
