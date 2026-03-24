<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import {
  BOOL01_LEGACY_EVENT,
  clearLegacyBooleanIssues,
  getLegacyBooleanIssues,
  type Bool01LegacyIssue
} from '../../services/bool01MigrationGuard';

const expanded = ref(false);
const issues = ref<Bool01LegacyIssue[]>(getLegacyBooleanIssues());

const visibleIssues = computed(() => (expanded.value ? issues.value : issues.value.slice(0, 6)));

const refreshIssues = () => {
  issues.value = getLegacyBooleanIssues();
};

const onLegacyDetected = () => {
  refreshIssues();
};

const clearAll = () => {
  clearLegacyBooleanIssues();
  refreshIssues();
};

onMounted(() => {
  window.addEventListener(BOOL01_LEGACY_EVENT, onLegacyDetected as EventListener);
});

onUnmounted(() => {
  window.removeEventListener(BOOL01_LEGACY_EVENT, onLegacyDetected as EventListener);
});
</script>

<template>
  <div v-if="issues.length > 0" class="bool01-banner" data-testid="bool01-legacy-banner">
    <div class="banner-header">
      <strong>Bool -> 0/1 Migration Warning</strong>
      <span class="count">{{ issues.length }}</span>
    </div>

    <p class="banner-note">
      Legacy boolean fields detected in API response. Backend should migrate these to <code>0/1</code>.
    </p>

    <ul class="issue-list">
      <li v-for="issue in visibleIssues" :key="`${issue.endpoint}|${issue.path}`">
        <code>{{ issue.endpoint }}</code>
        <span> -> </span>
        <code>{{ issue.path }}</code>
        <span> ({{ issue.sample ? 'true' : 'false' }})</span>
      </li>
    </ul>

    <div class="banner-actions">
      <button type="button" class="mini-btn" @click="expanded = !expanded">
        {{ expanded ? 'Collapse' : 'Expand' }}
      </button>
      <button type="button" class="mini-btn danger" @click="clearAll">
        Clear
      </button>
    </div>
  </div>
</template>

<style scoped>
.bool01-banner {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 1200;
  width: min(560px, calc(100vw - 32px));
  background: #fff8e1;
  border: 1px solid #ffcc80;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
  padding: 12px;
  color: #6d4c41;
}

.banner-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.count {
  font-size: 12px;
  background: #ef6c00;
  color: white;
  border-radius: 10px;
  padding: 2px 8px;
}

.banner-note {
  margin: 8px 0;
  font-size: 12px;
}

.issue-list {
  margin: 0;
  padding-left: 18px;
  max-height: 180px;
  overflow: auto;
  font-size: 12px;
}

.issue-list li {
  margin: 4px 0;
  line-height: 1.4;
}

.banner-actions {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.mini-btn {
  border: 1px solid #bdbdbd;
  background: white;
  color: #333;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
}

.mini-btn.danger {
  border-color: #ef9a9a;
  color: #c62828;
}
</style>
