<script setup lang="ts">
import { computed, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DdnsService } from '../../types/ddns';
import { ActionButtons, BaseSecretInput, BaseSwitch } from '../common';
import { useQA } from '../../utils/qa';
const { qa, slug } = useQA();

const { t } = useI18n();

interface Props {
  service: DdnsService;
  supportedProviders: string[];
  interfaces: string[];
  showTitle?: boolean;
  embedded?: boolean;
  testIdPrefix?: string;
}

const props = withDefaults(defineProps<Props>(), {
  showTitle: true,
  embedded: false,
  testIdPrefix: 'ddns-form',
});

const { service, supportedProviders, interfaces, showTitle, embedded } = toRefs(props);

defineEmits<{
  (e: 'update:service', service: DdnsService): void;
  (e: 'save'): void;
  (e: 'cancel'): void;
}>();

const title = computed(() => (
  service.value.ID ? t('ddns.editService') : t('ddns.addService')
));

const tid = (suffix: string) => qa(`${props.testIdPrefix}-${suffix}`);
</script>

<template>
  <div
    class="edit-view"
    :class="{ 'edit-view-embedded': embedded }"
    :data-testid="tid('content')"
  >
    <h2 v-if="showTitle" :data-testid="tid('title')">{{ title }}</h2>
    <form class="compact-modal-form" @submit.prevent="$emit('save')" :data-testid="tid('form')">
      <div class="form-group">
        <label :data-testid="tid('provider-label')">{{ t('ddns.provider') }}</label>
        <select 
          :data-testid="tid('provider-select')"
          :value="service.ServProv"
          @input="$emit('update:service', { ...service, ServProv: ($event.target as HTMLSelectElement).value })"
        >
          <option
            v-for="provider in supportedProviders"
            :key="provider"
            :value="provider"
            :data-testid="tid(`provider-option-${slug(provider)}`)"
          >
            {{ provider }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label :data-testid="tid('domain-label')">{{ t('ddns.domain') }}</label>
        <input 
          type="text" 
          :data-testid="tid('domain-input')"
          :value="service.DomainName"
          @input="$emit('update:service', { ...service, DomainName: ($event.target as HTMLInputElement).value })"
          required
        >
      </div>

      <div class="form-group">
        <label :data-testid="tid('username-label')">{{ t('ddns.username') }}</label>
        <input 
          type="text" 
          :data-testid="tid('username-input')"
          :value="service.ServUsername"
          @input="$emit('update:service', { ...service, ServUsername: ($event.target as HTMLInputElement).value })"
          required
        >
      </div>

      <div class="form-group">
        <label :data-testid="tid('password-label')">{{ t('ddns.password') }}</label>
        <BaseSecretInput
          :model-value="service.ServPassword"
          :input-data-testid="tid('password-input')"
          :toggle-data-testid="tid('password-toggle')"
          :required="true"
          @update:model-value="$emit('update:service', { ...service, ServPassword: $event })"
        />
      </div>

      <div class="form-group">
        <label :data-testid="tid('interface-label')">{{ t('ddns.wanInterface') }}</label>
        <select 
          :data-testid="tid('interface-select')"
          :value="service.UpdatedIP"
          @input="$emit('update:service', { ...service, UpdatedIP: ($event.target as HTMLSelectElement).value })"
        >
          <option
            v-for="iface in interfaces"
            :key="iface"
            :value="iface"
            :data-testid="tid(`interface-option-${slug(iface)}`)"
          >
            {{ iface }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label class="switch-label">
          <span :data-testid="tid('enable-label')">{{ t('common.enable') }}</span>
          <BaseSwitch
            :model-value="service.HostEnable"
            :true-value="1"
            :false-value="0"
            :data-testid="tid('enable-toggle')"
            :slider-data-testid="tid('enable-slider')"
            @update:model-value="(value) => $emit('update:service', { ...service, HostEnable: Number(value) })"
          />
        </label>
      </div>

      <ActionButtons
        class="button-group"
        :cancel-text="t('ddns.cancel')"
        :apply-text="t('ddns.save')"
        apply-type="submit"
        :cancel-data-testid="tid('cancel-button')"
        :apply-data-testid="tid('save-button')"
        @cancel="$emit('cancel')"
      />
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

.edit-view-embedded {
  background-color: transparent;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
}

.compact-modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.375rem;
  color: #333;
}

.form-group label.switch-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
  margin-bottom: 0;
}

.form-group label.switch-label > span:first-child {
  flex: 1;
  min-width: 0;
}

.compact-modal-form :deep(.form-group) {
  margin-bottom: 0;
}

input, select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.form-group :deep(.secret-field) {
  width: 100%;
  padding: 0.5rem;
  padding-right: 2.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}
</style>
