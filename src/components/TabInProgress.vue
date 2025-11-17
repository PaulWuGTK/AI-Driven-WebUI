<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <div class="tab-in-progress">
    <div class="icon-container">
      <span class="material-icons">construction</span>
    </div>
    <p class="status-text">{{ t('common.underDevelopment') }}</p>
    <p class="description">{{ t('common.underDevelopmentDesc') }}</p>
  </div>
</template>

<style scoped>
.tab-in-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 8px;
  text-align: center;
}

.icon-container {
  margin-bottom: 1.5rem;
}

.material-icons {
  font-size: 4rem;
  color: #FFA500;
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.status-text {
  font-size: 1.25rem;
  color: #FFA500;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
}

.description {
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
  margin: 0;
  max-width: 500px;
}

@media (max-width: 768px) {
  .tab-in-progress {
    padding: 3rem 1.5rem;
  }

  .material-icons {
    font-size: 3rem;
  }

  .status-text {
    font-size: 1.1rem;
  }

  .description {
    font-size: 0.9rem;
  }
}
</style>
