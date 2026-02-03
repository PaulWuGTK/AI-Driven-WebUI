<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import StaticRouteTab from './StaticRouteTab.vue';
import DnsRouteTab from './DnsRouteTab.vue';
import { useQA } from '../../../utils/qa';

const { qa } = useQA();
const { t } = useI18n();

const activeTab = ref('static-route');

const tabs = computed(() => [
  { id: 'static-route', label: t('routing.staticRoute') },
  { id: 'dns-route', label: t('routing.dnsRoute') }
]);
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('routing-config-title')">{{ t('routing.title') }}</h1>

    <div class="status-content" :data-testid="qa('routing-config-content')">
      <div class="panel-section" :data-testid="qa('routing-config-panel')">
        <div class="tab-navigation" :data-testid="qa('routing-config-tabs')">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-button"
            :class="{ active: activeTab === tab.id }"
            :data-testid="qa(`routing-config-tab-${tab.id}`)"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content" :data-testid="qa('routing-config-tab-content')">
          <StaticRouteTab v-if="activeTab === 'static-route'" :data-testid="qa('routing-static-route-tab')" />
          <DnsRouteTab v-else-if="activeTab === 'dns-route'" :data-testid="qa('routing-dns-route-tab')" />
        </div>
      </div>
    </div>
  </div>
</template>
