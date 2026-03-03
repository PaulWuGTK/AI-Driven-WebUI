<template>
  <div
    class="port-forward-edit"
    :class="{ 'port-forward-edit-embedded': embedded }"
    :data-testid="qa('port-forward-edit')"
  >
    <h3 v-if="showTitle" :data-testid="qa('port-forward-title')">
      {{ isEdit ? $t('portForwarding.editRule') : $t('portForwarding.addRule') }}
    </h3>
    <form class="compact-modal-form" @submit.prevent="handleSubmit" :data-testid="qa('port-forward-form')">
      <div class="form-section">
        <div class="form-group">
          <div class="switch-label">
            <span :data-testid="qa('port-forward-enable-label')">{{ $t('portForwarding.enablePortForwarding') }}</span>
            <BaseSwitch
              v-model="formData.Enable"
              :data-testid="qa('port-forward-enable-toggle')"
              :slider-data-testid="qa('port-forward-enable-toggle-slider')"
            />
          </div>
        </div>

        <div class="form-group">
          <label :data-testid="qa('port-forward-interface-label')">{{ $t('portForwarding.interfaceSelection') }}</label>
          <select v-model="formData.Interface" required :data-testid="qa('port-forward-interface-select')">
            <option v-for="wan in wanList" :key="wan" :value="wan">
              {{ wan }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label :data-testid="qa('port-forward-external-port-start-label')">{{ $t('portForwarding.externalPortStart') }}</label>
          <input
            type="number"
            v-model="externalPortStart"
            placeholder="1-65535"
            min="1"
            max="65535"
            required
            :data-testid="qa('port-forward-external-port-start-input')"
          />
        </div>

        <div class="form-group">
          <label :data-testid="qa('port-forward-external-port-end-label')">{{ $t('portForwarding.externalPortEnd') }}</label>
          <input
            type="number"
            v-model="externalPortEnd"
            placeholder="1-65535"
            min="1"
            max="65535"
            :data-testid="qa('port-forward-external-port-end-input')"
          />
        </div>

        <div class="form-group">
          <label :data-testid="qa('port-forward-internal-ip-label')">{{ $t('portForwarding.localIPAddress') }}</label>
          <input
            type="text"
            v-model="formData.InternalIPAdress"
            placeholder="e.g., 192.168.1.100"
            required
            :data-testid="qa('port-forward-internal-ip-input')"
          />
        </div>

        <div class="form-group">
          <label :data-testid="qa('port-forward-internal-port-label')">{{ $t('portForwarding.localPort') }}</label>
          <input
            type="number"
            v-model="internalPort"
            placeholder="1-65535"
            min="1"
            max="65535"
            required
            :data-testid="qa('port-forward-internal-port-input')"
          />
        </div>

        <div class="form-group">
          <label :data-testid="qa('port-forward-protocol-label')">{{ $t('portForwarding.protocol') }}</label>
          <select v-model="formData.Protocol" required :data-testid="qa('port-forward-protocol-select')">
            <option v-for="proto in protoList" :key="proto" :value="proto">
              {{ proto }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label :data-testid="qa('port-forward-description-label')">{{ $t('portForwarding.comment') }}</label>
          <input
            type="text"
            v-model="formData.Description"
            :placeholder="$t('common.placeholder')"
            :data-testid="qa('port-forward-description-input')"
          />
        </div>
      </div>

      <div class="form-actions">
        <ActionButtons
          apply-type="submit"
          :cancel-data-testid="qa('port-forward-cancel-btn')"
          :apply-data-testid="qa('port-forward-apply-btn')"
          @cancel="handleCancel"
        />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { PortForwardRule } from '../../types/portForwarding';
import { ActionButtons, BaseSwitch } from '../common';
import { useQA } from '../../utils/qa';

const { qa } = useQA();

interface Props {
  rule: PortForwardRule;
  wanList: string[];
  protoList: string[];
  showTitle?: boolean;
  embedded?: boolean;
  isEdit?: boolean;
}

interface Emits {
  (e: 'update:rule', rule: PortForwardRule): void;
  (e: 'save'): void;
  (e: 'cancel'): void;
}

const props = withDefaults(defineProps<Props>(), {
  showTitle: true,
  embedded: false,
  isEdit: undefined,
});
const emit = defineEmits<Emits>();

const isEdit = computed(() => (
  typeof props.isEdit === 'boolean' ? props.isEdit : !!props.rule.No
));

const formData = ref<PortForwardRule>({ ...props.rule });

const externalPortStart = ref('');
const externalPortEnd = ref('');
const internalPort = ref('');

function parsePortRange(range: string) {
  if (range && range.includes('-')) {
    const [start, end] = range.split('-');
    return { start, end };
  }
  return { start: range, end: '' };
}

watch(() => props.rule, (newRule) => {
  formData.value = { ...newRule };

  const externalPorts = parsePortRange(newRule.ExternalPortRange);
  externalPortStart.value = externalPorts.start;
  externalPortEnd.value = externalPorts.end;

  internalPort.value = newRule.InternalPort || '';
}, { immediate: true });

function handleCancel() {
  emit('cancel');
}

function handleSubmit() {
  const externalRange = externalPortEnd.value
    ? `${externalPortStart.value}-${externalPortEnd.value}`
    : externalPortStart.value;

  formData.value.ExternalPortRange = externalRange;
  formData.value.InternalPort = internalPort.value === '' ? '' : String(internalPort.value);

  emit('update:rule', formData.value);
  emit('save');
}
</script>

<style scoped>
.port-forward-edit {
  padding: 1.5rem;
  background-color: white;
}

.port-forward-edit-embedded {
  padding: 0;
  background-color: transparent;
}

.port-forward-edit h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.compact-modal-form {
  display: flex;
  flex-direction: column;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 0;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group select {
  padding: 0.625rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.875rem;
  background-color: white;
  color: var(--text-primary);
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-group input::placeholder {
  color: var(--text-tertiary);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
}


@media (max-width: 768px) {
  .port-forward-edit {
    padding: 1rem;
  }

  .port-forward-edit h3 {
    font-size: 1rem;
    margin-bottom: 1rem;
  }

  .form-section {
    gap: 1rem;
  }

  .form-actions {
    flex-direction: column-reverse;
    gap: 0.5rem;
  }

  .form-actions :deep(.btn) {
    width: 100%;
    justify-content: center;
  }
}
</style>
