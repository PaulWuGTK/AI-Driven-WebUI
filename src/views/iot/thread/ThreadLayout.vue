<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ThreadStatus from './ThreadStatus.vue'
import ThreadConfiguration from './ThreadConfiguration.vue'
import ThreadJoin from './ThreadJoin.vue'
import ThreadCommissioner from './ThreadCommissioner.vue'
import ThreadTopology from './ThreadTopology.vue'

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
    <h1 class="page-title">{{ t('thread.title') }}</h1>

    <div class="status-content">
      <div class="panel-section">
        <div class="tab-navigation">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-button"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content">
          <ThreadStatus v-if="activeTab === 'status'" />
          <ThreadConfiguration v-if="activeTab === 'configuration'" />
          <ThreadJoin v-if="activeTab === 'join'" />
          <ThreadCommissioner v-if="activeTab === 'commissioner'" />
          <ThreadTopology v-if="activeTab === 'topology'" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Tab styles are inherited from global styles */
</style>