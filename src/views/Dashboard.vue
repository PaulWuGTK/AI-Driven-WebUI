<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import DashboardThings from '../components/dashboard/DashboardThings.vue';

const { t } = useI18n();
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">{{ t('menu.dashboard') }}</h1>
    
    <div class="status-content">
      <div class="panel-section">
        <div class="section-title">{{ t('dashboard.connectedDevices') }}</div>
        <div class="card-content">
          <DashboardThings />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Dashboard specific styles */
</style>