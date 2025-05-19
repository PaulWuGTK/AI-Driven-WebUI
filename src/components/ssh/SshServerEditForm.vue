<script setup lang="ts">
import { defineProps, defineEmits, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { SshServer } from '../../types/ssh';

const { t } = useI18n();

const props = defineProps<{
  server: SshServer;
  interfaces: string[];
}>();

const emit = defineEmits<{
  (e: 'update:server', server: SshServer): void;
  (e: 'save'): void;
  (e: 'cancel'): void;
}>();

const autoDisableOptions = [
  { value: 0, label: 'Never disable' },
  { value: 300, label: '5 minutes' },
  { value: 600, label: '10 minutes' },
  { value: 1800, label: '30 minutes' },
  { value: 3600, label: '1 hour' }
];

const connectionTimeoutOptions = [
  { value: 0, label: 'Never timeout when idling' },
  { value: -1, label: 'Close connection when idling over' }
];

const keepAliveOptions = [
  { value: 0, label: 'Never send KeepAlive message' },
  { value: -1, label: 'Send KeepAlive message every' }
];

const selectedTimeoutOption = ref(props.server.IdleTimeout === 0 ? 0 : -1);
const customTimeoutValue = ref(props.server.IdleTimeout === 0 ? 10 : Math.min(60, Math.max(1, props.server.IdleTimeout / 60)));

const selectedKeepAliveOption = ref(props.server.KeepAlive === 0 ? 0 : -1);
const customKeepAliveValue = ref(props.server.KeepAlive === 0 ? 5 : Math.min(60, Math.max(1, props.server.KeepAlive / 60)));

const updateServer = (field: keyof SshServer, value: any) => {
  emit('update:server', { ...props.server, [field]: value });
};

const handleTimeoutChange = (event: Event) => {
  const value = parseInt((event.target as HTMLSelectElement).value);
  selectedTimeoutOption.value = value;
  
  if (value === 0) {
    updateServer('IdleTimeout', 0);
  } else {
    // When selecting "Close connection when idling over", use the custom value
    updateServer('IdleTimeout', customTimeoutValue.value * 60);
  }
};

const handleCustomTimeoutChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  let value = parseInt(input.value);
  
  // Enforce range 1-60
  value = Math.min(60, Math.max(1, value));
  input.value = value.toString();
  
  customTimeoutValue.value = value;
  updateServer('IdleTimeout', value * 60);
};

const handleKeepAliveChange = (event: Event) => {
  const value = parseInt((event.target as HTMLSelectElement).value);
  selectedKeepAliveOption.value = value;
  
  if (value === 0) {
    updateServer('KeepAlive', 0);
  } else {
    // When selecting "Send KeepAlive message every", use the custom value
    updateServer('KeepAlive', customKeepAliveValue.value * 60);
  }
};

const handleCustomKeepAliveChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  let value = parseInt(input.value);
  
  // Enforce range 1-60
  value = Math.min(60, Math.max(1, value));
  input.value = value.toString();
  
  customKeepAliveValue.value = value;
  updateServer('KeepAlive', value * 60);
};
</script>

<template>
  <div class="ssh-server-edit">
    <h3>{{ t('ssh.editServer') }}</h3>
    <form @submit.prevent="$emit('save')">
      <!-- Server Settings Section -->
      <div class="form-section">
        <div class="form-group">
          <label>{{ t('ssh.interface') }}</label>
          <select 
            :value="server.Interface"
            @change="updateServer('Interface', ($event.target as HTMLSelectElement).value)"
          >
            <option v-for="iface in interfaces" :key="iface" :value="iface">
              {{ iface }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>{{ t('ssh.port') }}</label>
          <input 
            type="number" 
            :value="server.Port"
            @input="updateServer('Port', parseInt(($event.target as HTMLInputElement).value))"
            min="1"
            max="65535"
            required
          >
        </div>

        <div class="form-group">
          <label class="switch-label">
            <span>{{ t('ssh.enable') }}</span>
            <label class="switch">
              <input
                type="checkbox"
                :checked="server.Enable === 1"
                @change="updateServer('Enable', ($event.target as HTMLInputElement).checked ? 1 : 0)"
              >
              <span class="slider"></span>
            </label>
          </label>
        </div>
      </div>

      <!-- Connection Settings Section -->
      <div class="form-section">
        <div class="form-group">
          <label>{{ t('ssh.autoDisableServer') }}</label>
          <select 
            :value="server.AutoDisableDuration"
            @change="updateServer('AutoDisableDuration', parseInt(($event.target as HTMLSelectElement).value))"
          >
            <option v-for="option in autoDisableOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>{{ t('ssh.connectionTimeout') }}</label>
          <select 
            :value="selectedTimeoutOption"
            @change="handleTimeoutChange"
          >
            <option v-for="option in connectionTimeoutOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          
          <div v-if="selectedTimeoutOption === -1" class="custom-input-wrapper">
            <input 
              type="number" 
              :value="customTimeoutValue"
              @input="handleCustomTimeoutChange"
              min="1"
              max="60"
              class="custom-input"
            >
            <span class="input-unit">mins</span>
          </div>
        </div>

        <div class="form-group">
          <label>{{ t('ssh.keepAliveMessage') }}</label>
          <select 
            :value="selectedKeepAliveOption"
            @change="handleKeepAliveChange"
          >
            <option v-for="option in keepAliveOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          
          <div v-if="selectedKeepAliveOption === -1" class="custom-input-wrapper">
            <input 
              type="number" 
              :value="customKeepAliveValue"
              @input="handleCustomKeepAliveChange"
              min="1"
              max="60"
              class="custom-input"
            >
            <span class="input-unit">mins</span>
          </div>
        </div>

        <div class="form-group">
          <label class="switch-label">
            <span>{{ t('ssh.allowAllIPv4') }}</span>
            <label class="switch">
              <input
                type="checkbox"
                :checked="server.AllowAllIPv4 === 1"
                @change="updateServer('AllowAllIPv4', ($event.target as HTMLInputElement).checked ? 1 : 0)"
              >
              <span class="slider"></span>
            </label>
          </label>
        </div>

        <div class="form-group" v-if="!server.AllowAllIPv4">
          <label>{{ t('ssh.ipv4Prefix') }}</label>
          <input 
            type="text" 
            :value="server.IPv4AllowedSourcePrefix"
            @input="updateServer('IPv4AllowedSourcePrefix', ($event.target as HTMLInputElement).value)"
            placeholder="e.g., 192.168.1.0/24"
          >
        </div>

        <div class="form-group">
          <label class="switch-label">
            <span>{{ t('ssh.allowAllIPv6') }}</span>
            <label class="switch">
              <input
                type="checkbox"
                :checked="server.AllowAllIPv6 === 1"
                @change="updateServer('AllowAllIPv6', ($event.target as HTMLInputElement).checked ? 1 : 0)"
              >
              <span class="slider"></span>
            </label>
          </label>
        </div>

        <div class="form-group" v-if="!server.AllowAllIPv6">
          <label>{{ t('ssh.ipv6Prefix') }}</label>
          <input 
            type="text" 
            :value="server.IPv6AllowedSourcePrefix"
            @input="updateServer('IPv6AllowedSourcePrefix', ($event.target as HTMLInputElement).value)"
            placeholder="e.g., 2001:db8::/32"
          >
        </div>
      </div>

      <!-- Authentication Settings Section -->
      <div class="form-section">
        <div class="form-group">
          <label class="switch-label">
            <span>{{ t('ssh.allowPasswordLogin') }}</span>
            <label class="switch">
              <input
                type="checkbox"
                :checked="server.AllowPasswordLogin === 1"
                @change="updateServer('AllowPasswordLogin', ($event.target as HTMLInputElement).checked ? 1 : 0)"
              >
              <span class="slider"></span>
            </label>
          </label>
        </div>

        <div class="form-group">
          <label class="switch-label">
            <span>{{ t('ssh.allowRootLogin') }}</span>
            <label class="switch">
              <input
                type="checkbox"
                :checked="server.AllowRootLogin === 1"
                @change="updateServer('AllowRootLogin', ($event.target as HTMLInputElement).checked ? 1 : 0)"
              >
              <span class="slider"></span>
            </label>
          </label>
        </div>

        <div class="form-group">
          <label class="switch-label">
            <span>{{ t('ssh.rootLoginWithPassword') }}</span>
            <label class="switch">
              <input
                type="checkbox"
                :checked="server.AllowRootPasswordLogin === 1"
                @change="updateServer('AllowRootPasswordLogin', ($event.target as HTMLInputElement).checked ? 1 : 0)"
              >
              <span class="slider"></span>
            </label>
          </label>
        </div>

        <div class="form-group">
          <label>{{ t('ssh.maxAuthTries') }}</label>
          <input 
            type="number" 
            :value="server.MaxAuthTries"
            @input="updateServer('MaxAuthTries', parseInt(($event.target as HTMLInputElement).value))"
            min="1"
            max="20"
            required
          >
        </div>
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
.ssh-server-edit {
  padding: 1.5rem;
}

.form-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.form-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
}

input, select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.unit {
  position: absolute;
  right: 10px;
  top: 33px;
  color: #666;
}

.switch-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
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
  background-color: #0070BB;
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

.btn {
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-primary {
  background-color: #0070BB;
  color: white;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #666;
}

.btn:hover {
  opacity: 0.9;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.radio-label input[type="radio"] {
  width: auto;
  margin-right: 0.5rem;
}

.custom-input-wrapper {
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
  gap: 0.5rem;
}

.custom-input {
  width: 80px;
}

.input-unit {
  color: #666;
}

@media (max-width: 768px) {
  .ssh-server-edit {
    padding: 1rem;
  }

  .form-section {
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