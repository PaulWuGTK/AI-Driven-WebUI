<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DdnsService } from '../../types/ddns';

const { t } = useI18n();

defineProps<{
  service: DdnsService;
  supportedProviders: string[];
  interfaces: string[];
}>();

defineEmits<{
  (e: 'update:service', service: DdnsService): void;
  (e: 'save'): void;
  (e: 'cancel'): void;
}>();
</script>

<template>
  <div class="edit-view">
    <h2>{{ service.ID ? t('ddns.editService') : t('ddns.addService') }}</h2>
    <form @submit.prevent="$emit('save')">
      <div class="form-group">
        <label>{{ t('ddns.provider') }}</label>
        <select 
          :value="service.ServProv"
          @input="$emit('update:service', { ...service, ServProv: ($event.target as HTMLSelectElement).value })"
        >
          <option v-for="provider in supportedProviders" :key="provider" :value="provider">
            {{ provider }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>{{ t('ddns.domain') }}</label>
        <input 
          type="text" 
          :value="service.DomainName"
          @input="$emit('update:service', { ...service, DomainName: ($event.target as HTMLInputElement).value })"
          required
        >
      </div>

      <div class="form-group">
        <label>{{ t('ddns.username') }}</label>
        <input 
          type="text" 
          :value="service.ServUsername"
          @input="$emit('update:service', { ...service, ServUsername: ($event.target as HTMLInputElement).value })"
          required
        >
      </div>

      <div class="form-group">
        <label>{{ t('ddns.password') }}</label>
        <input 
          type="password" 
          :value="service.ServPassword"
          @input="$emit('update:service', { ...service, ServPassword: ($event.target as HTMLInputElement).value })"
          required
        >
      </div>

      <div class="form-group">
        <label>{{ t('ddns.wanInterface') }}</label>
        <select 
          :value="service.UpdatedIP"
          @input="$emit('update:service', { ...service, UpdatedIP: ($event.target as HTMLSelectElement).value })"
        >
          <option v-for="iface in interfaces" :key="iface" :value="iface">
            {{ iface }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label class="switch-label">
          <span>{{ t('common.enable') }}</span>
          <label class="switch">
            <input
              type="checkbox"
              :checked="service.HostEnable === 1"
              @change="$emit('update:service', { ...service, HostEnable: ($event.target as HTMLInputElement).checked ? 1 : 0 })"
            >
            <span class="slider"></span>
          </label>
        </label>
      </div>

      <div class="button-group">
        <button type="button" class="btn btn-secondary" @click="$emit('cancel')">
          {{ t('ddns.cancel') }}
        </button>
        <button type="submit" class="btn btn-primary">
          {{ t('ddns.save') }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.edit-view {
  background-color: white;
  border-radius: 4px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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