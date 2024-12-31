<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import SshServerManagement from './SshServerManagement.vue';
import SshPublicKeyManagement from './SshPublicKeyManagement.vue';
import SshCurrentSessions from './SshCurrentSessions.vue';

const { t } = useI18n();
const activeTab = ref('server');

const tabs = [
  { id: 'server', label: t('ssh.serverManagement') },
  { id: 'key', label: t('ssh.publicKeyManagement') },
  { id: 'sessions', label: t('ssh.currentSessions') }
];
</script>

<template>
  <div class="ssh-management">
    <h1 class="page-title">{{ t('ssh.title') }}</h1>

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
</template>

<style scoped>
.ssh-management {
  flex: 1;
  background-color: #f5f5f5;
  min-height: 100%;
}

.page-title {
  color: #0070BB;
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0;
  padding: 1rem 2rem;
  text-align: left;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.tab-navigation {
  display: flex;
  gap: 1px;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.tab-button {
  padding: 1rem 2rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  color: #666;
  font-size: 0.9rem;
}

.tab-button:hover {
  color: #0070BB;
}

.tab-button.active {
  color: #0070BB;
  border-bottom-color: #0070BB;
}

.tab-content {
  padding: 1.5rem;
}
</style>