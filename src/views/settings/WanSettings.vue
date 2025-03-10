<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import WanModeSetup from './wan/WanModeSetup.vue';
import WanModeManagement from './wan/WanModeManagement.vue';

const { t } = useI18n();
const activeTab = ref('setup');

const tabs = computed(() => [
  { id: 'setup', label: t('wanSetup.modeSetup') },
  { id: 'management', label: t('wanSetup.modeManagement') }
]);
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">{{ t('wanSetup.title') }}</h1>

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
          <WanModeSetup v-if="activeTab === 'setup'" />
          <WanModeManagement v-if="activeTab === 'management'" />
        </div>
      </div>
    </div>
  </div>
</template>