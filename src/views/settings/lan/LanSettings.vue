<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import IPv4Configuration from './IPv4Configuration.vue';
import DeviceConnected from './DeviceConnected.vue';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const activeTab = ref('ipv4');

const tabs = computed(() => [
  { id: 'ipv4', label: t('lanBasic.ipv4Configuration') },
  { id: 'devices', label: t('lanBasic.deviceConnected') }
]);
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('lan-settings-title')">{{ t('lanBasic.title') }}</h1>

    <div class="status-content" :data-testid="qa('lan-settings-content')">
      <div class="panel-section" :data-testid="qa('lan-settings-panel')">
        <div class="tab-navigation" :data-testid="qa('lan-settings-tabs')">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-button"
            :class="{ active: activeTab === tab.id }"
            :data-testid="qa(`lan-settings-tab-${tab.id}`)"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content" :data-testid="qa('lan-settings-tab-content')">
          <IPv4Configuration v-if="activeTab === 'ipv4'" :data-testid="qa('lan-ipv4-config')" />
          <DeviceConnected v-if="activeTab === 'devices'" :data-testid="qa('lan-device-connected')" />
        </div>
      </div>
    </div>
  </div>
</template>