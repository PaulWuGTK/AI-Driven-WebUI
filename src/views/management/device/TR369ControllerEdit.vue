<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TR369Controller } from '../../../types/tr369';

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
  <div class="controller-edit">
    <h2>{{ controller.Alias ? t('device.editController') : t('device.addController') }}</h2>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <div class="switch-label">
          <span>{{ t('common.enable') }}</span>
          <label class="switch">
            <input
              type="checkbox"
              v-model="editingController.Enable"
              :true-value="1"
              :false-value="0"
            >
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label>{{ t('device.alias') }}</label>
        <input
          type="text"
          v-model="editingController.Alias"
          required
        />
      </div>

      <div class="form-group">
        <label>{{ t('device.endpointId') }}</label>
        <input
          type="text"
          v-model="editingController.ControllerEndpointID"
          required
        />
      </div>

      <div class="form-group">
        <label>{{ t('device.controllerTopic') }}</label>
        <input
          type="text"
          v-model="editingController.ControllerTopic"
          required
        />
      </div>

      <div class="form-group">
        <label>{{ t('device.agentTopic') }}</label>
        <input
          type="text"
          v-model="editingController.AgentTopic"
          required
        />
      </div>

      <div class="form-group">
        <label>{{ t('device.brokerAddress') }}</label>
        <input
          type="text"
          v-model="editingController.BrokerAddress"
          required
        />
      </div>

      <div class="form-group">
        <label>{{ t('device.brokerPort') }}</label>
        <input
          type="text"
          v-model="editingController.BrokerPort"
          required
          pattern="[0-9]+"
        />
      </div>

      <div class="form-group">
        <label>{{ t('device.username') }}</label>
        <input
          type="text"
          v-model="editingController.Username"
          required
        />
      </div>

      <div class="form-group">
        <label>{{ t('device.password') }}</label>
        <input
          type="password"
          v-model="editingController.Password"
        />
      </div>

      <div class="form-group">
        <label>{{ t('device.clientId') }}</label>
        <input
          type="text"
          v-model="editingController.ClientID"
        />
      </div>

      <div class="form-group">
        <label>{{ t('device.periodicNotify') }}</label>
        <input
          type="number"
          v-model="editingController.PeriodicNotify"
          required
          min="1"
        />
      </div>

      <div class="form-group">
        <label>{{ t('device.keepAliveTime') }}</label>
        <input
          type="number"
          v-model="editingController.KeepAliveTime"
          required
          min="1"
        />
      </div>

      <div class="form-group">
        <label>{{ t('device.connectRetryTime') }}</label>
        <input
          type="number"
          v-model="editingController.ConnectRetryTime"
          required
          min="1"
        />
      </div>

      <div class="form-group">
        <label>{{ t('device.connectRetryMaxInterval') }}</label>
        <input
          type="number"
          v-model="editingController.ConnectRetryMaxInterval"
          required
          min="1"
        />
      </div>

      <div class="form-group">
        <label>{{ t('device.protocolVersion') }}</label>
        <select v-model="editingController.ProtocolVersion">
          <option v-for="version in protocolVersions" :key="version" :value="version">
            {{ version }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>{{ t('device.transportProtocol') }}</label>
        <select v-model="editingController.TransportProtocol">
          <option v-for="protocol in transportProtocols" :key="protocol" :value="protocol">
            {{ protocol }}
          </option>
        </select>
      </div>

      <div class="button-group">
        <button type="button" class="btn btn-secondary" @click="$emit('cancel')">
          {{ t('common.cancel') }}
        </button>
        <button type="submit" class="btn btn-primary">
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