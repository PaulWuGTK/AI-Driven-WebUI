<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { TR369Controller } from '../../../types/tr369';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();

defineProps<{
  controller: TR369Controller;
}>();
</script>

<template>
  <div class="controller-detail" :data-testid="qa('tr369-controller-detail-content')">
    <div class="panel-section" :data-testid="qa('tr369-controller-detail-section')">
      <div class="section-title" :data-testid="qa('tr369-controller-detail-title')">{{ controller.Alias }}</div>
      
      <div class="card-content">
        <div class="info-grid">
          <div class="info-row">
            <span class="info-label" :data-testid="qa('tr369-controller-detail-enable-label')">{{ t('common.enable') }}</span>
            <span class="info-value" :data-testid="qa('tr369-controller-detail-enable-value')">{{ controller.Enable ? 'True' : 'False' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label" :data-testid="qa('tr369-controller-detail-status-label')">{{ t('device.status') }}</span>
            <span class="info-value" :data-testid="qa('tr369-controller-detail-status-value')">{{ controller.Status }}</span>
          </div>
          <div class="info-row">
            <span class="info-label" :data-testid="qa('tr369-controller-detail-alias-label')">{{ t('device.alias') }}</span>
            <span class="info-value" :data-testid="qa('tr369-controller-detail-alias-value')">{{ controller.Alias }}</span>
          </div>
          <div class="info-row">
            <span class="info-label" :data-testid="qa('tr369-controller-detail-endpoint-id-label')">{{ t('device.endpointId') }}</span>
            <span class="info-value" :data-testid="qa('tr369-controller-detail-endpoint-id-value')">{{ controller.ControllerEndpointID }}</span>
          </div>
          <div class="info-row">
            <span class="info-label" :data-testid="qa('tr369-controller-detail-controller-topic-label')">{{ t('device.controllerTopic') }}</span>
            <span class="info-value" :data-testid="qa('tr369-controller-detail-controller-topic-value')">{{ controller.ControllerTopic }}</span>
          </div>
          <div class="info-row">
            <span class="info-label" :data-testid="qa('tr369-controller-detail-agent-topic-label')">{{ t('device.agentTopic') }}</span>
            <span class="info-value" :data-testid="qa('tr369-controller-detail-agent-topic-value')">{{ controller.AgentTopic }}</span>
          </div>
          <div class="info-row">
            <span class="info-label" :data-testid="qa('tr369-controller-detail-broker-address-label')">{{ t('device.brokerAddress') }}</span>
            <span class="info-value" :data-testid="qa('tr369-controller-detail-broker-address-value')">{{ controller.BrokerAddress }}</span>
          </div>
          <div class="info-row">
            <span class="info-label" :data-testid="qa('tr369-controller-detail-broker-port-label')">{{ t('device.brokerPort') }}</span>
            <span class="info-value" :data-testid="qa('tr369-controller-detail-broker-port-value')">{{ controller.BrokerPort }}</span>
          </div>
          <div class="info-row">
            <span class="info-label" :data-testid="qa('tr369-controller-detail-username-label')">{{ t('device.username') }}</span>
            <span class="info-value" :data-testid="qa('tr369-controller-detail-username-value')">{{ controller.Username }}</span>
          </div>
          <div class="info-row">
            <span class="info-label" :data-testid="qa('tr369-controller-detail-client-id-label')">{{ t('device.clientId') }}</span>
            <span class="info-value" :data-testid="qa('tr369-controller-detail-client-id-value')">{{ controller.ClientID }}</span>
          </div>
          <div class="info-row">
            <span class="info-label" :data-testid="qa('tr369-controller-detail-periodic-notify-label')">{{ t('device.periodicNotify') }}</span>
            <span class="info-value" :data-testid="qa('tr369-controller-detail-periodic-notify-value')">{{ controller.PeriodicNotify }}</span>
          </div>
          <div class="info-row">
            <span class="info-label" :data-testid="qa('tr369-controller-detail-keep-alive-time-label')">{{ t('device.keepAliveTime') }}</span>
            <span class="info-value" :data-testid="qa('tr369-controller-detail-keep-alive-time-value')">{{ controller.KeepAliveTime }}</span>
          </div>
          <div class="info-row">
            <span class="info-label" :data-testid="qa('tr369-controller-detail-connect-retry-time-label')">{{ t('device.connectRetryTime') }}</span>
            <span class="info-value" :data-testid="qa('tr369-controller-detail-connect-retry-time-value')">{{ controller.ConnectRetryTime }}</span>
          </div>
          <div class="info-row">
            <span class="info-label" :data-testid="qa('tr369-controller-detail-connect-retry-max-interval-label')">{{ t('device.connectRetryMaxInterval') }}</span>
            <span class="info-value" :data-testid="qa('tr369-controller-detail-connect-retry-max-interval-value')">{{ controller.ConnectRetryMaxInterval }}</span>
          </div>
          <div class="info-row">
            <span class="info-label" :data-testid="qa('tr369-controller-detail-protocol-version-label')">{{ t('device.protocolVersion') }}</span>
            <span class="info-value" :data-testid="qa('tr369-controller-detail-protocol-version-value')">{{ controller.ProtocolVersion }}</span>
          </div>
          <div class="info-row">
            <span class="info-label" :data-testid="qa('tr369-controller-detail-transport-protocol-label')">{{ t('device.transportProtocol') }}</span>
            <span class="info-value" :data-testid="qa('tr369-controller-detail-transport-protocol-value')">{{ controller.TransportProtocol }}</span>
          </div>
        </div>

        <div class="button-group">
          <button class="btn btn-primary" :data-testid="qa('tr369-controller-detail-back-button')" @click="$emit('back')">
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