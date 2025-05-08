<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import GuestWiFi from './guest/GuestWiFi.vue';
import GuestLAN from './guest/GuestLAN.vue';
import GuestDeviceConnected from './guest/GuestDeviceConnected.vue';

const { t } = useI18n();
const activeTab = ref('wifi');

// Use computed to dynamically generate tabs
const tabs = computed(() => [
  { id: 'wifi', label: t('guest.guestWiFi') },
  { id: 'lan', label: t('guest.guestLAN') },
  { id: 'devices', label: t('guest.deviceConnected') }
]);
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">{{ t('guest.title') }}</h1>

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
          <GuestWiFi v-if="activeTab === 'wifi'" />
          <GuestLAN v-if="activeTab === 'lan'" />
          <GuestDeviceConnected v-if="activeTab === 'devices'" />
        </div>
      </div>
    </div>
  </div>
</template>