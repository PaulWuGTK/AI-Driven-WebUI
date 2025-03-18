<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import IPv4Configuration from './IPv4Configuration.vue';
import DeviceConnected from './DeviceConnected.vue';

const { t } = useI18n();
const activeTab = ref('ipv4');

const tabs = computed(() => [
  { id: 'ipv4', label: t('lanBasic.ipv4Configuration') },
  { id: 'devices', label: t('lanBasic.deviceConnected') }
]);
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">{{ t('lanBasic.title') }}</h1>

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
          <IPv4Configuration v-if="activeTab === 'ipv4'" />
          <DeviceConnected v-if="activeTab === 'devices'" />
        </div>
      </div>
    </div>
  </div>
</template>