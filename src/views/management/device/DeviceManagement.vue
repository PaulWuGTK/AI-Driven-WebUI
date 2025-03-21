<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import TR069Config from './TR069Config.vue';
import TR369Config from './TR369Config.vue';

const { t } = useI18n();
const activeTab = ref('tr069');

// Use computed to dynamically generate tabs
const tabs = computed(() => [
  { id: 'tr069', label: t('device.tr069Config') },
  { id: 'tr369', label: t('device.tr369Config') }
]);
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">{{ t('device.title') }}</h1>

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
          <TR069Config v-if="activeTab === 'tr069'" />
          <TR369Config v-if="activeTab === 'tr369'" />
        </div>
      </div>
    </div>
  </div>
</template>