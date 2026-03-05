<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import FactoryReset from './tabs/FactoryReset.vue';
import BackupRestore from './tabs/BackupRestore.vue';
import FirmwareUpdate from './tabs/FirmwareUpdate.vue';
import { useMenuVisibilityContext } from '../../../composables/useMenuVisibilityContext';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const activeTab = ref('reset');
const { fetchMenuContext, canShowMenu } = useMenuVisibilityContext('super');

type Tab = {
  id: string;
  label: string;
  menuKey: string;
};

const tabs = computed<Tab[]>(() =>
  [
    { id: 'reset', label: t('settings.reset'), menuKey: 'management.settings.resetToDefault' },
    { id: 'backup', label: t('settings.backup'), menuKey: 'management.settings.backupRestore' },
    { id: 'update', label: t('settings.update'), menuKey: 'management.settings.updateSoftware' }
  ].filter(tab => canShowMenu(tab.menuKey))
);

const ensureActiveTab = () => {
  const tabFromQuery = typeof route.query.tab === 'string' ? route.query.tab : '';
  const exists = tabFromQuery && tabs.value.some(tab => tab.id === tabFromQuery);
  const nextTab = exists ? tabFromQuery : (tabs.value[0]?.id || 'reset');

  if (activeTab.value !== nextTab) activeTab.value = nextTab;
  if (!exists) {
    router.replace({ path: route.path, query: { ...route.query, tab: nextTab } });
  }
};

watch([() => route.query.tab, tabs], ensureActiveTab, { immediate: true });

const selectTab = (tabId: string) => {
  activeTab.value = tabId;
  router.replace({ path: route.path, query: { ...route.query, tab: tabId } });
};

onMounted(async () => {
  await fetchMenuContext();
});
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('settings-management-title')">{{ t('settings.title') }}</h1>

    <div class="status-content" :data-testid="qa('settings-management-content')">
      <div class="panel-section" :data-testid="qa('settings-management-panel')">
        <div class="tab-navigation" :data-testid="qa('settings-management-tabs')">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-button"
            :class="{ active: activeTab === tab.id }"
            :data-testid="qa(`settings-management-tab-${tab.id}`)"
            @click="selectTab(tab.id)"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content" :data-testid="qa('settings-management-tab-content')">
          <FactoryReset v-if="activeTab === 'reset'" :data-testid="qa('settings-factory-reset')" />
          <BackupRestore v-else-if="activeTab === 'backup'" :data-testid="qa('settings-backup-restore')" />
          <FirmwareUpdate v-else-if="activeTab === 'update'" :data-testid="qa('settings-firmware-update')" />
        </div>
      </div>
    </div>
  </div>
</template>
