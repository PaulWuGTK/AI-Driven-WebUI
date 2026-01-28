<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ExecEnvTab from './lcm/ExecEnvTab.vue';
import DeploymentUnitTab from './lcm/DeploymentUnitTab.vue';
import ExecutionUnitTab from './lcm/ExecutionUnitTab.vue';
import { useQA } from '../../utils/qa';

const { qa } = useQA();
const { t } = useI18n();

const activeTab = ref('execenv');

const tabs = computed(() => [
  { id: 'execenv', label: t('lcm.execEnv') },
  { id: 'deploymentunit', label: t('lcm.deploymentUnits') },
  { id: 'executionunit', label: t('lcm.execUnits') },
  { id: 'monitor', label: t('lcm.monitor') }
]);
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('lcm-config-title')">{{ t('lcm.titleConfiguration') }}</h1>

    <div class="status-content" :data-testid="qa('lcm-config-content')">
      <div class="panel-section" :data-testid="qa('lcm-config-panel')">
        <div class="tab-navigation" :data-testid="qa('lcm-config-tabs')">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-button"
            :class="{ active: activeTab === tab.id }"
            :data-testid="qa(`lcm-config-tab-${tab.id}`)"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content" :data-testid="qa('lcm-config-tab-content')">
          <ExecEnvTab v-if="activeTab === 'execenv'" :data-testid="qa('lcm-execenv-tab')" />

          <DeploymentUnitTab
            v-else-if="activeTab === 'deploymentunit'"
            :data-testid="qa('lcm-deployment-unit-tab')"
          />

          <ExecutionUnitTab
            v-else-if="activeTab === 'executionunit'"
            :data-testid="qa('lcm-execution-unit-tab')"
          />

          <div v-else-if="activeTab === 'monitor'" class="in-progress">
            <span class="material-icons">construction</span>
            <p>{{ t('common.inProgress') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.in-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.in-progress .material-icons {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.in-progress p {
  font-size: 1.1rem;
}
</style>
