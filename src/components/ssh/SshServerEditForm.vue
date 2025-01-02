<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
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
  { value: 300, label: '5 minutes' },
  { value: 600, label: '10 minutes' },
  { value: 1800, label: '30 minutes' },
  { value: 3600, label: '1 hour' }
];

const keepAliveOptions = [
  { value: 0, label: 'Never send KeepAlive message' },
  { value: 60, label: '1 minute' },
  { value: 300, label: '5 minutes' },
  { value: 600, label: '10 minutes' }
];

const updateServer = (field: keyof SshServer, value: any) => {
  emit('update:server', { ...props.server, [field]: value });
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
            :value="server.IdleTimeout"
            @change="updateServer('IdleTimeout', parseInt(($event.target as HTMLSelectElement).value))"
          >
            <option v-for="option in connectionTimeoutOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>{{ t('ssh.keepAliveMessage') }}</label>
          <select 
            :value="server.KeepAlive"
            @change="updateServer('KeepAlive', parseInt(($event.target as HTMLSelectElement).value))"
          >
            <option v-for="option in keepAliveOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>{{ t('ssh.ipv4Prefix') }}</label>
          <input 
            type="text" 
            :value="server.IPv4AllowedSourcePrefix"
            @input="updateServer('IPv4AllowedSourcePrefix', ($event.target as HTMLInputElement).value)"
            placeholder="e.g., 192.168.1.0/24"
          >
        </div>

        <div class="form-group">
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
</style>