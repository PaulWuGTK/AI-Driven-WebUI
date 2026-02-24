<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DdnsService } from '../../types/ddns';
import { BaseSwitch } from '../common';
import { useQA } from '../../utils/qa';
const { isQAMode, qa, slug } = useQA();

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
  <div class="edit-view" :data-testid="qa('ddns-form-content')">
    <h2 :data-testid="qa('ddns-form-title')">{{ service.ID ? t('ddns.editService') : t('ddns.addService') }}</h2>
    <form @submit.prevent="$emit('save')" :data-testid="qa('ddns-form')">
      <div class="form-group">
        <label :data-testid="qa('ddns-form-provider-label')">{{ t('ddns.provider') }}</label>
        <select 
          :data-testid="qa('ddns-form-provider-select')"
          :value="service.ServProv"
          @input="$emit('update:service', { ...service, ServProv: ($event.target as HTMLSelectElement).value })"
        >
          <option v-for="provider in supportedProviders" :key="provider" :value="provider" :data-testid="qa(`ddns-form-provider-option-${slug(provider)}`)">
            {{ provider }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label :data-testid="qa('ddns-form-domain-label')">{{ t('ddns.domain') }}</label>
        <input 
          type="text" 
          :data-testid="qa('ddns-form-domain-input')"
          :value="service.DomainName"
          @input="$emit('update:service', { ...service, DomainName: ($event.target as HTMLInputElement).value })"
          required
        >
      </div>

      <div class="form-group">
        <label :data-testid="qa('ddns-form-username-label')">{{ t('ddns.username') }}</label>
        <input 
          type="text" 
          :data-testid="qa('ddns-form-username-input')"
          :value="service.ServUsername"
          @input="$emit('update:service', { ...service, ServUsername: ($event.target as HTMLInputElement).value })"
          required
        >
      </div>

      <div class="form-group">
        <label :data-testid="qa('ddns-form-password-label')">{{ t('ddns.password') }}</label>
        <input 
          type="password" 
          :data-testid="qa('ddns-form-password-input')"
          :value="service.ServPassword"
          @input="$emit('update:service', { ...service, ServPassword: ($event.target as HTMLInputElement).value })"
          required
        >
      </div>

      <div class="form-group">
        <label :data-testid="qa('ddns-form-interface-label')">{{ t('ddns.wanInterface') }}</label>
        <select 
          :data-testid="qa('ddns-form-interface-select')"
          :value="service.UpdatedIP"
          @input="$emit('update:service', { ...service, UpdatedIP: ($event.target as HTMLSelectElement).value })"
        >
          <option v-for="iface in interfaces" :key="iface" :value="iface" :data-testid="qa(`ddns-form-interface-option-${slug(iface)}`)">
            {{ iface }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label class="switch-label">
          <span :data-testid="qa('ddns-form-enable-label')">{{ t('common.enable') }}</span>
          <BaseSwitch
            :model-value="service.HostEnable"
            :true-value="1"
            :false-value="0"
            :data-testid="qa('ddns-form-enable-toggle')"
            :slider-data-testid="qa('ddns-form-enable-toggle-slider')"
            @update:model-value="(value) => $emit('update:service', { ...service, HostEnable: Number(value) })"
          />
        </label>
      </div>

      <div class="button-group">
        <button type="button" class="btn btn-secondary" :data-testid="qa('ddns-form-cancel-button')" @click="$emit('cancel')">
          {{ t('ddns.cancel') }}
        </button>
        <button type="submit" class="btn btn-primary" :data-testid="qa('ddns-form-save-button')">
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
