<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const { t } = useI18n();

const pageTitle = computed(() => {
  const path = route.path;
  const segments = path.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  return lastSegment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
});
</script>

<template>
  <div class="in-progress-container">
    <div class="in-progress-card">
      <div class="icon-container">
        <span class="material-icons">construction</span>
      </div>
      <h1 class="page-title">{{ pageTitle }}</h1>
      <p class="status-text">{{ t('common.underDevelopment') }}</p>
      <p class="description">{{ t('common.underDevelopmentDesc') }}</p>
    </div>
  </div>
</template>

<style scoped>
.in-progress-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - var(--header-height));
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.in-progress-card {
  background: white;
  border-radius: 12px;
  padding: 3rem 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.icon-container {
  margin-bottom: 1.5rem;
}

.material-icons {
  font-size: 64px;
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

.page-title {
  font-size: 2rem;
  color: #333;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.status-text {
  font-size: 1.25rem;
  color: #FFA500;
  font-weight: 500;
  margin: 0 0 1rem 0;
}

.description {
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 768px) {
  .in-progress-card {
    padding: 2rem 1.5rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .material-icons {
    font-size: 48px;
  }
}
</style>
