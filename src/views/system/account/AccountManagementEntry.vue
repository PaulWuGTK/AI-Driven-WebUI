<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQA } from '../../../utils/qa';
import { useMenuVisibilityContext } from '../../../composables/useMenuVisibilityContext';
import AccountManagement from './AccountManagement.vue';
import AccountManagementCht from './AccountManagementCht.vue';

const { t } = useI18n();
const { qa } = useQA();
const { netLayoutType, fetchMenuContext } = useMenuVisibilityContext();

const loading = ref(true);
const isCht = computed(() => netLayoutType.value === 'cht');

onMounted(async () => {
  try {
    await fetchMenuContext();
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div v-if="loading" class="loading-state" :data-testid="qa('account-entry-loading')">
    <div class="loading-spinner"></div>
    <span>{{ t('common.loading') }}</span>
  </div>
  <AccountManagementCht v-else-if="isCht" />
  <AccountManagement v-else />
</template>

<style scoped>
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  background-color: white;
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
}
</style>
