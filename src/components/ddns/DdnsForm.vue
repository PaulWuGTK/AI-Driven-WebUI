<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import type { DdnsService } from '../../types/ddns';

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
  <div class="edit-form">
    <h2>{{ service.ID ? 'Edit' : 'Add' }} Service</h2>
    <form @submit.prevent="$emit('save')">
      <div class="form-group">
        <label>Service Provider</label>
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
        <label>Domain Name</label>
        <input 
          type="text" 
          :value="service.DomainName"
          @input="$emit('update:service', { ...service, DomainName: ($event.target as HTMLInputElement).value })"
          required
        >
      </div>

      <div class="form-group">
        <label>Username</label>
        <input 
          type="text" 
          :value="service.ServUsername"
          @input="$emit('update:service', { ...service, ServUsername: ($event.target as HTMLInputElement).value })"
          required
        >
      </div>

      <div class="form-group">
        <label>Password</label>
        <input 
          type="password" 
          :value="service.ServPassword"
          @input="$emit('update:service', { ...service, ServPassword: ($event.target as HTMLInputElement).value })"
          required
        >
      </div>

      <div class="form-group">
        <label>WAN Interface</label>
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
        <label class="checkbox-label">
          <input
            type="checkbox"
            :checked="service.HostEnable === 1"
            @change="$emit('update:service', { ...service, HostEnable: ($event.target as HTMLInputElement).checked ? 1 : 0 })"
          >
          Enable
        </label>
      </div>

      <div class="button-group">
        <button type="button" class="btn btn-secondary" @click="$emit('cancel')">Cancel</button>
        <button type="submit" class="btn btn-primary">Save</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.edit-form {
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

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
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