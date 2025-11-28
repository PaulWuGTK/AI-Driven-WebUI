<template>
  <div class="page-container">
    <h1 class="page-title">{{ t('qos.title') }}</h1>

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
          <QosBandwidthTab v-if="activeTab === 'bandwidth'" />
          <QosRuleTab v-if="activeTab === 'rule'" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import QosBandwidthTab from './QosBandwidthTab.vue';
import QosRuleTab from './QosRuleTab.vue';

const { t } = useI18n();

const activeTab = ref('bandwidth');

const tabs = computed(() => [
  {
    id: 'bandwidth',
    label: t('qos.bandwidthTab')
  },
  {
    id: 'rule',
    label: t('qos.ruleTab')
  }
]);
</script>

<style scoped>
</style>
