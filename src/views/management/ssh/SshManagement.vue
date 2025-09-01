<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import SshServerManagement from './SshServerManagement.vue';
import SshPublicKeyManagement from './SshPublicKeyManagement.vue';
import SshCurrentSessions from './SshCurrentSessions.vue';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

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
    <h1 class="page-title" :data-testid="qa('ssh-title')">{{ t('ssh.title') }}</h1>

    <div class="status-content" :data-testid="qa('ssh-content')">
      <div class="panel-section" :data-testid="qa('ssh-panel')">
        <div class="tab-navigation" :data-testid="qa('ssh-tabs')">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-button"
            :class="{ active: activeTab === tab.id }"
            :data-testid="qa(`ssh-tab-${tab.id}`)"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content" :data-testid="qa('ssh-tab-content')">
          <SshServerManagement v-if="activeTab === 'server'" :data-testid="qa('ssh-server-management')" />
          <SshPublicKeyManagement v-if="activeTab === 'key'" :data-testid="qa('ssh-public-key-management')" />
          <SshCurrentSessions v-if="activeTab === 'sessions'" :data-testid="qa('ssh-current-sessions')" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 移除原有的 tab-navigation 相關樣式 */
</style>