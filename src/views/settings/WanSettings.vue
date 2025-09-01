<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import WanModeSetup from './wan/WanModeSetup.vue';
import WanModeManagement from './wan/WanModeManagement.vue';
import { useQA } from '../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const activeTab = ref('setup');

const tabs = computed(() => [
  { id: 'setup', label: t('wanSetup.modeSetup') },
  { id: 'management', label: t('wanSetup.modeManagement') }
]);
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('wan-settings-title')">{{ t('wanSetup.title') }}</h1>

    <div class="status-content" :data-testid="qa('wan-settings-content')">
      <div class="panel-section" :data-testid="qa('wan-settings-panel')">
        <div class="tab-navigation" :data-testid="qa('wan-settings-tabs')">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-button"
            :class="{ active: activeTab === tab.id }"
            :data-testid="qa(`wan-settings-tab-${tab.id}`)"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content" :data-testid="qa('wan-settings-tab-content')">
          <WanModeSetup v-if="activeTab === 'setup'" :data-testid="qa('wan-mode-setup')" />
          <WanModeManagement v-if="activeTab === 'management'" :data-testid="qa('wan-mode-management')" />
        </div>
      </div>
    </div>
  </div>
</template>