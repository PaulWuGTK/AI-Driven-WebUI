<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useQA } from '../../../utils/qa';

const { qa } = useQA();
const { t } = useI18n();
</script>

<template>
  <div class="dns-route-tab" :data-testid="qa('dns-route-tab')">
    <div class="panel-section" :data-testid="qa('dns-route-section')">
      <div class="info-message" :data-testid="qa('dns-route-info')">
        {{ t('routing.dnsRouteDescription') }}
      </div>
      <div class="placeholder-content">
        <span class="material-icons">construction</span>
        <h3>{{ t('routing.comingSoon') }}</h3>
        <p>{{ t('routing.featureInDevelopment') }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dns-route-tab {
  padding: 0;
}

.info-message {
  background-color: var(--bg-info);
  border-left: 4px solid var(--info-color);
  padding: 1rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  font-size: 0.9rem;
  line-height: 1.5;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: var(--text-secondary);
}

.placeholder-content .material-icons {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.placeholder-content h3 {
  margin: 0.5rem 0;
  color: var(--text-primary);
  font-size: 1.5rem;
}

.placeholder-content p {
  margin: 0.5rem 0;
  font-size: 1rem;
}
</style>
