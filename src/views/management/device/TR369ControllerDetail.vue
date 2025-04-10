<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { TR369Controller } from '../../../types/tr369';

const { t } = useI18n();

defineProps<{
  controller: TR369Controller;
}>();
</script>

<template>
  <div class="controller-detail">
    <div class="panel-section">
      <div class="section-title">{{ controller.Alias }}</div>
      
      <div class="card-content">
        <div class="info-grid">
          <div class="info-row">
            <span class="info-label">{{ t('common.enable') }}</span>
            <span class="info-value">{{ controller.Enable ? 'True' : 'False' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('device.status') }}</span>
            <span class="info-value">{{ controller.Status }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('device.alias') }}</span>
            <span class="info-value">{{ controller.Alias }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('device.endpointId') }}</span>
            <span class="info-value">{{ controller.ControllerEndpointID }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('device.controllerTopic') }}</span>
            <span class="info-value">{{ controller.ControllerTopic }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('device.agentTopic') }}</span>
            <span class="info-value">{{ controller.AgentTopic }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('device.brokerAddress') }}</span>
            <span class="info-value">{{ controller.BrokerAddress }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('device.brokerPort') }}</span>
            <span class="info-value">{{ controller.BrokerPort }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('device.username') }}</span>
            <span class="info-value">{{ controller.Username }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('device.clientId') }}</span>
            <span class="info-value">{{ controller.ClientID }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('device.periodicNotify') }}</span>
            <span class="info-value">{{ controller.PeriodicNotify }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('device.keepAliveTime') }}</span>
            <span class="info-value">{{ controller.KeepAliveTime }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('device.connectRetryTime') }}</span>
            <span class="info-value">{{ controller.ConnectRetryTime }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('device.connectRetryMaxInterval') }}</span>
            <span class="info-value">{{ controller.ConnectRetryMaxInterval }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('device.protocolVersion') }}</span>
            <span class="info-value">{{ controller.ProtocolVersion }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('device.transportProtocol') }}</span>
            <span class="info-value">{{ controller.TransportProtocol }}</span>
          </div>
        </div>

        <div class="button-group">
          <button class="btn btn-primary" @click="$emit('back')">
            {{ t('mesh.back') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.controller-detail {
  padding: 1.5rem;
}

.info-grid {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

.info-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  align-items: center;
}

.info-label {
  color: var(--text-secondary);
}

.info-value {
  color: var(--text-primary);
  font-weight: 500;
  word-break: break-all;
}

.button-group {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .controller-detail {
    padding: 1rem;
  }

  .info-row {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }

  .button-group {
    flex-direction: column;
  }

  .button-group .btn {
    width: 100%;
  }
}
</style>