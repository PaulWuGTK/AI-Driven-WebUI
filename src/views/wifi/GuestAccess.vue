<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import GuestWiFi from './guest/GuestWiFi.vue';
import GuestLAN from './guest/GuestLAN.vue';
import GuestDeviceConnected from './guest/GuestDeviceConnected.vue';
import { useQA } from '../../utils/qa';
const { isQAMode, qa, slug } = useQA();

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
    <h1 class="page-title" :data-testid="qa('guest-access-title')">{{ t('guest.title') }}</h1>

    <div class="status-content" :data-testid="qa('guest-access-content')">
      <div class="panel-section" :data-testid="qa('guest-access-panel')">
        <div class="tab-navigation" :data-testid="qa('guest-access-tabs')">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-button"
            :class="{ active: activeTab === tab.id }"
            :data-testid="qa(`guest-access-tab-${tab.id}`)"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content" :data-testid="qa('guest-access-tab-content')">
          <GuestWiFi v-if="activeTab === 'wifi'" :data-testid="qa('guest-wifi')" />
          <GuestLAN v-if="activeTab === 'lan'" :data-testid="qa('guest-lan')" />
          <GuestDeviceConnected v-if="activeTab === 'devices'" :data-testid="qa('guest-device-connected')" />
        </div>
      </div>
    </div>
  </div>
</template>