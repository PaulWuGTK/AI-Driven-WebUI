<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">{{ t('matter.title') }} {{ t('menu.matterHome') }}</h1>
    
    <div class="status-content">
      <!-- Matter Logo Section -->
      <div class="panel-section">
        <div class="card-content">
          <div class="matter-logo-section">
            <img src="/src/assets/icons/matter/matter_logo.png" alt="Matter Logo" class="matter-logo-img" />
          </div>
        </div>
      </div>

      <!-- What is Matter Section -->
      <div class="panel-section">
        <div class="card-content">
          <h3 class="section-heading">{{ t('matter.whatIsMatter') }}</h3>
          <div class="matter-description">
            <p>
              {{ t('matter.matterDescription1') }}
            </p>
            <p>
              {{ t('matter.matterDescription2') }}
            </p>
          </div>
        </div>
      </div>

      <!-- What is Matter Controller Section -->
      <div class="panel-section">
        <div class="card-content">
          <h4 class="section-heading">{{ t('matter.whatIsMatterController') }}</h4>
          <div class="controller-description">
            <p>
              {{ t('matter.controllerDescription') }}
            </p>
          </div>
          
          <!-- Matter Controller Diagram -->
          <div class="controller-diagram-section">
            <img src="/src/assets/icons/matter/matter_controllers.png" alt="Matter Controllers Diagram" class="controllers-diagram-img" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.matter-logo-section {
  text-align: center;
  padding: 2rem 0;
}

.matter-logo-img {
  max-width: 100%;
  height: auto;
  max-height: 120px;
  width: auto;
}

.section-heading {
  color: var(--text-primary);
  margin: 0 0 1.5rem 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.matter-description,
.controller-description {
  line-height: 1.6;
  color: var(--text-secondary);
}

.matter-description p,
.controller-description p {
  margin-bottom: 1rem;
}

.controller-diagram-section {
  text-align: center;
  margin-top: 2rem;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.controllers-diagram-img {
  max-width: 100%;
  height: auto;
  max-width: 600px;
}

@media (max-width: 768px) {
  .controller-diagram-section {
    padding: 1rem;
  }
  
  .matter-logo-img {
    max-height: 80px;
  }
  
  .controllers-diagram-img {
    max-width: 100%;
  }
}
</style>