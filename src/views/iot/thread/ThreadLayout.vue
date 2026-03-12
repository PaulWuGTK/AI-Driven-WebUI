<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ThreadStatusTab from './ThreadStatusTab.vue'
import ThreadConfigurationTab from './ThreadConfigurationTab.vue'
import ThreadJoinTab from './ThreadJoinTab.vue'
import ThreadCommissionerTab from './ThreadCommissionerTab.vue'
import ThreadTopologyTab from './ThreadTopologyTab.vue'
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const activeTab = ref('status');

// Tab navigation
const tabs = computed(() => [
  { id: 'status', label: t('thread.status')},
  { id: 'configuration', label: t('thread.configuration')},
  { id: 'join', label: t('thread.join')},
  { id: 'commissioner', label: t('thread.commissioner')},
  { id: 'topology', label: t('thread.topology')}
]);

</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('thread-title')">{{ t('thread.title') }}</h1>

    <div class="status-content" :data-testid="qa('thread-content')">
      <div class="panel-section" :data-testid="qa('thread-panel')">
        <div class="tab-navigation" :data-testid="qa('thread-tabs')">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-button"
            :class="{ active: activeTab === tab.id }"
            :data-testid="qa(`thread-tab-${tab.id}`)"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content" :data-testid="qa('thread-tab-content')">
          <ThreadStatusTab v-if="activeTab === 'status'" :data-testid="qa('thread-status')" />
          <ThreadConfigurationTab v-if="activeTab === 'configuration'" :data-testid="qa('thread-configuration')" />
          <ThreadJoinTab v-if="activeTab === 'join'" :data-testid="qa('thread-join')" />
          <ThreadCommissionerTab v-if="activeTab === 'commissioner'" :data-testid="qa('thread-commissioner')" />
          <ThreadTopologyTab v-if="activeTab === 'topology'" :data-testid="qa('thread-topology')" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Tab styles are inherited from global styles */
</style>
