<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import FactoryReset from './tabs/FactoryReset.vue';
import BackupRestore from './tabs/BackupRestore.vue';
import FirmwareUpdate from './tabs/FirmwareUpdate.vue';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const activeTab = ref((route.query.tab as string) || 'reset');

const tabs = computed(() => [
  { id: 'reset', label: t('settings.reset') },
  { id: 'backup', label: t('settings.backup') },
  { id: 'update', label: t('settings.update') }
]);

const selectTab = (tabId: string) => {
  activeTab.value = tabId;
  router.replace({ query: { tab: tabId } });
};
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
