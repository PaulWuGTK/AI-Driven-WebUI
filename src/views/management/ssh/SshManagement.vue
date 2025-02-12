<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import SshServerManagement from './SshServerManagement.vue';
import SshPublicKeyManagement from './SshPublicKeyManagement.vue';
import SshCurrentSessions from './SshCurrentSessions.vue';

const { t } = useI18n();
const activeTab = ref('server');

// 使用 computed 來動態生成 tabs,這樣在語言改變時會自動更新
const tabs = computed(() => [
  { id: 'server', label: t('ssh.serverManagement') },
  { id: 'key', label: t('ssh.publicKeyManagement') },
  { id: 'sessions', label: t('ssh.currentSessions') }
]);
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">{{ t('ssh.title') }}</h1>

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
          <SshServerManagement v-if="activeTab === 'server'" />
          <SshPublicKeyManagement v-if="activeTab === 'key'" />
          <SshCurrentSessions v-if="activeTab === 'sessions'" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 移除原有的 tab-navigation 相關樣式 */
</style>