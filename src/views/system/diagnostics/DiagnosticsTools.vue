<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import PingTool from './PingTool.vue';
import TraceRouteTool from './TraceRouteTool.vue';
import DNSLookupTool from './DNSLookupTool.vue';
import { useMenuVisibilityContext } from '../../../composables/useMenuVisibilityContext';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const activeTab = ref('ping');
const { fetchMenuContext, canShowMenu } = useMenuVisibilityContext('super');

type Tab = {
  id: string;
  label: string;
  menuKey: string;
};

const tabs = computed<Tab[]>(() =>
  [
    { id: 'ping', label: t('diagnostics.ping'), menuKey: 'management.tools.pingDiagnosis' },
    { id: 'traceroute', label: t('diagnostics.traceRoute'), menuKey: 'management.tools.traceRoute' },
    { id: 'dnslookup', label: t('diagnostics.dnsLookup'), menuKey: 'management.tools.dnsDiagnosis' }
  ].filter(tab => canShowMenu(tab.menuKey))
);

const ensureActiveTab = () => {
  const tabFromQuery = typeof route.query.tab === 'string' ? route.query.tab : '';
  const exists = tabFromQuery && tabs.value.some(tab => tab.id === tabFromQuery);
  const nextTab = exists ? tabFromQuery : (tabs.value[0]?.id || 'ping');

  if (activeTab.value !== nextTab) activeTab.value = nextTab;
  if (!exists) {
    router.replace({ path: route.path, query: { ...route.query, tab: nextTab } });
  }
};

watch([() => route.query.tab, tabs], ensureActiveTab, { immediate: true });

const handleTabChange = (tabId: string) => {
  activeTab.value = tabId;
  router.replace({ path: route.path, query: { ...route.query, tab: tabId } });
};

onMounted(async () => {
  await fetchMenuContext();
});
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('diagnostics-title')">{{ t('diagnostics.title') }}</h1>

    <div class="status-content" :data-testid="qa('diagnostics-content')">
      <div class="panel-section" :data-testid="qa('diagnostics-panel')">
        <div class="tab-navigation" :data-testid="qa('diagnostics-tabs')">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-button"
            :class="{ active: activeTab === tab.id }"
            :data-testid="qa(`diagnostics-tab-${tab.id}`)"
            @click="handleTabChange(tab.id)"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content" :data-testid="qa('diagnostics-tab-content')">
          <PingTool v-if="activeTab === 'ping'" :data-testid="qa('diagnostics-ping-tool')" />
          <TraceRouteTool v-if="activeTab === 'traceroute'" :data-testid="qa('diagnostics-traceroute-tool')" />
          <DNSLookupTool v-if="activeTab === 'dnslookup'" :data-testid="qa('diagnostics-dnslookup-tool')" />
        </div>
      </div>
    </div>
  </div>
</template>
