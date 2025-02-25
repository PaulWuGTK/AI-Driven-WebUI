<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import PingTool from './PingTool.vue';
import TraceRouteTool from './TraceRouteTool.vue';
import DNSLookupTool from './DNSLookupTool.vue';

const { t } = useI18n();
const activeTab = ref('ping');

const tabs = computed(() => [
  { id: 'ping', label: t('diagnostics.ping') },
  { id: 'traceroute', label: t('diagnostics.traceRoute') },
  { id: 'dnslookup', label: t('diagnostics.dnsLookup') }
]);
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">{{ t('diagnostics.title') }}</h1>

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
          <PingTool v-if="activeTab === 'ping'" />
          <TraceRouteTool v-if="activeTab === 'traceroute'" />
          <DNSLookupTool v-if="activeTab === 'dnslookup'" />
        </div>
      </div>
    </div>
  </div>
</template>