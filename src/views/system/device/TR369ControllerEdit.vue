<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TR369Controller } from '../../../types/tr369';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();

const props = defineProps<{
  controller: TR369Controller;
}>();

const emit = defineEmits<{
  (e: 'save', controller: TR369Controller): void;
  (e: 'cancel'): void;
}>();

const editingController = ref<TR369Controller>({ ...props.controller });

const protocolVersions = ['3.1','3.1.1', '5'];
const transportProtocols = ['TCP/IP','TLS','WebSocket','WebSocketTLS'];

const handleSubmit = () => {
  emit('save', editingController.value);
};
</script>

<template>
  <div class="controller-edit" :data-testid="qa('tr369-controller-edit-content')">
    <h2 :data-testid="qa('tr369-controller-edit-title')">{{ controller.Alias ? t('device.editController') : t('device.addController') }}</h2>

    <form @submit.prevent="handleSubmit" :data-testid="qa('tr369-controller-edit-form')">
      <div class="form-group">
        <div class="switch-label">
          <span :data-testid="qa('tr369-controller-edit-enable-label')">{{ t('common.enable') }}</span>
          <label class="switch">
            <input
              type="checkbox"
              :data-testid="qa('tr369-controller-edit-enable-toggle')"
              v-model="editingController.Enable"
              :true-value="1"
              :false-value="0"
            >
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label :data-testid="qa('tr369-controller-edit-alias-label')">{{ t('device.alias') }}</label>
        <input
          type="text"
          :data-testid="qa('tr369-controller-edit-alias-input')"
          v-model="editingController.Alias"
          required
        />
      </div>

      <div class="form-group">
        <label :data-testid="qa('tr369-controller-edit-endpoint-id-label')">{{ t('device.endpointId') }}</label>
        <input
          type="text"
          :data-testid="qa('tr369-controller-edit-endpoint-id-input')"
          v-model="editingController.ControllerEndpointID"
          required
        />
      </div>

      <div class="form-group">
        <label :data-testid="qa('tr369-controller-edit-controller-topic-label')">{{ t('device.controllerTopic') }}</label>
        <input
          type="text"
          :data-testid="qa('tr369-controller-edit-controller-topic-input')"
          v-model="editingController.ControllerTopic"
          required
        />
      </div>

      <div class="form-group">
        <label :data-testid="qa('tr369-controller-edit-agent-topic-label')">{{ t('device.agentTopic') }}</label>
        <input
          type="text"
          :data-testid="qa('tr369-controller-edit-agent-topic-input')"
          v-model="editingController.AgentTopic"
          required
        />
      </div>

      <div class="form-group">
        <label :data-testid="qa('tr369-controller-edit-broker-address-label')">{{ t('device.brokerAddress') }}</label>
        <input
          type="text"
          :data-testid="qa('tr369-controller-edit-broker-address-input')"
          v-model="editingController.BrokerAddress"
          required
        />
      </div>

      <div class="form-group">
        <label :data-testid="qa('tr369-controller-edit-broker-port-label')">{{ t('device.brokerPort') }}</label>
        <input
          type="text"
          :data-testid="qa('tr369-controller-edit-broker-port-input')"
          v-model="editingController.BrokerPort"
          required
          pattern="[0-9]+"
        />
      </div>

      <div class="form-group">
        <label :data-testid="qa('tr369-controller-edit-username-label')">{{ t('device.username') }}</label>
        <input
          type="text"
          :data-testid="qa('tr369-controller-edit-username-input')"
          v-model="editingController.Username"
          required
        />
      </div>

      <div class="form-group">
        <label :data-testid="qa('tr369-controller-edit-password-label')">{{ t('device.password') }}</label>
        <input
          type="password"
          :data-testid="qa('tr369-controller-edit-password-input')"
          v-model="editingController.Password"
        />
      </div>

      <div class="form-group">
        <label :data-testid="qa('tr369-controller-edit-client-id-label')">{{ t('device.clientId') }}</label>
        <input
          type="text"
          :data-testid="qa('tr369-controller-edit-client-id-input')"
          v-model="editingController.ClientID"
        />
      </div>

      <div class="form-group">
        <label :data-testid="qa('tr369-controller-edit-periodic-notify-label')">{{ t('device.periodicNotify') }}</label>
        <input
          type="number"
          :data-testid="qa('tr369-controller-edit-periodic-notify-input')"
          v-model="editingController.PeriodicNotify"
          required
          min="1"
        />
      </div>

      <div class="form-group">
        <label :data-testid="qa('tr369-controller-edit-keep-alive-time-label')">{{ t('device.keepAliveTime') }}</label>
        <input
          type="number"
          :data-testid="qa('tr369-controller-edit-keep-alive-time-input')"
          v-model="editingController.KeepAliveTime"
          required
          min="1"
        />
      </div>

      <div class="form-group">
        <label :data-testid="qa('tr369-controller-edit-connect-retry-time-label')">{{ t('device.connectRetryTime') }}</label>
        <input
          type="number"
          :data-testid="qa('tr369-controller-edit-connect-retry-time-input')"
          v-model="editingController.ConnectRetryTime"
          required
          min="1"
        />
      </div>

      <div class="form-group">
        <label :data-testid="qa('tr369-controller-edit-connect-retry-max-interval-label')">{{ t('device.connectRetryMaxInterval') }}</label>
        <input
          type="number"
          :data-testid="qa('tr369-controller-edit-connect-retry-max-interval-input')"
          v-model="editingController.ConnectRetryMaxInterval"
          required
          min="1"
        />
      </div>

      <div class="form-group">
        <label :data-testid="qa('tr369-controller-edit-protocol-version-label')">{{ t('device.protocolVersion') }}</label>
        <select v-model="editingController.ProtocolVersion" :data-testid="qa('tr369-controller-edit-protocol-version-select')">
          <option v-for="version in protocolVersions" :key="version" :value="version" :data-testid="qa(`tr369-controller-edit-protocol-version-option-${version}`)">
            {{ version }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label :data-testid="qa('tr369-controller-edit-transport-protocol-label')">{{ t('device.transportProtocol') }}</label>
        <select v-model="editingController.TransportProtocol" :data-testid="qa('tr369-controller-edit-transport-protocol-select')">
          <option v-for="protocol in transportProtocols" :key="protocol" :value="protocol" :data-testid="qa(`tr369-controller-edit-transport-protocol-option-${slug(protocol)}`)">
            {{ protocol }}
          </option>
        </select>
      </div>

      <div class="button-group">
        <button type="button" class="btn btn-secondary" :data-testid="qa('tr369-controller-edit-cancel-button')" @click="$emit('cancel')">
          {{ t('common.cancel') }}
        </button>
        <button type="submit" class="btn btn-primary" :data-testid="qa('tr369-controller-edit-save-button')">
          {{ t('common.save') }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.controller-edit {
  padding: 1.5rem;
}

h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

input, select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}

.switch-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-primary);
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  flex-shrink: 0;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary-color);
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .controller-edit {
    padding: 1rem;
  }

  .button-group {
    flex-direction: column;
  }

  .button-group .btn {
    width: 100%;
  }
}
</style>