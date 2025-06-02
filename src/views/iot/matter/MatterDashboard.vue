<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const openMatterDashboard = () => {
  // Get the current hostname and protocol
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  
  // Construct the Matter dashboard URL with port 8889
  const matterDashboardUrl = `${protocol}//${hostname}:8889`;
  
  // Open in a new tab
  window.open(matterDashboardUrl, '_blank');
};
</script>

<template>
  <h1 class="page-title">{{ t('matter.title') }}</h1>
  <div class="matter-content">
    <div class="panel-section">
      <div class="section-title">{{ t('matter.title') }}</div>
      
      <div class="card-content">
        <div class="matter-description">
          <p>{{ t('matter.description') }}</p>
        </div>
        
        <div class="dashboard-section">
          <h3>{{ t('matter.openDashboard') }}</h3>
          <p>{{ t('matter.dashboardDescription') }}</p>
          <p class="port-info">{{ t('matter.dashboardPort') }}</p>
          
          <div class="button-container">
            <button class="btn btn-primary" @click="openMatterDashboard">
              <span class="material-icons">open_in_new</span>
              {{ t('matter.openDashboard') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.matter-content {
  padding: 0.1rem 1.5rem 0 1.5rem;
}

.panel-section {
  margin-bottom: 1.5rem;
}

.matter-description {
  margin-bottom: 2rem;
  line-height: 1.6;
}

.dashboard-section {
  background-color: var(--bg-secondary);
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
}

.dashboard-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  color: var(--text-primary);
}

.dashboard-section p {
  margin-bottom: 1rem;
  color: var(--text-secondary);
}

.port-info {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2rem;
}

.button-container {
  display: flex;
  justify-content: center;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .matter-content {
    padding: 1rem;
  }
  
  .panel-section {
    margin-bottom: 1rem;
  }
  
  .dashboard-section {
    padding: 1.5rem;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>