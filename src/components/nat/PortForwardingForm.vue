<template>
  <div class="port-forward-edit">
    <h3>{{ isEdit ? $t('portForwarding.editRule') : $t('portForwarding.addRule') }}</h3>
    <form @submit.prevent="handleSubmit">
      <div class="form-section">
        <div class="form-group">
          <label class="switch-label">
            <span>{{ $t('portForwarding.enablePortForwarding') }}</span>
            <label class="switch">
              <input
                type="checkbox"
                :checked="formData.Enable"
                @change="formData.Enable = ($event.target as HTMLInputElement).checked"
              />
              <span class="slider"></span>
            </label>
          </label>
        </div>

        <div class="form-group">
          <label>{{ $t('portForwarding.interfaceSelection') }}</label>
          <select v-model="formData.Interface" required>
            <option v-for="wan in wanList" :key="wan" :value="wan">
              {{ wan }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>{{ $t('portForwarding.externalPortStart') }}</label>
          <input
            type="number"
            v-model="externalPortStart"
            placeholder="1-65535"
            min="1"
            max="65535"
            required
          />
        </div>

        <div class="form-group">
          <label>{{ $t('portForwarding.externalPortEnd') }}</label>
          <input
            type="number"
            v-model="externalPortEnd"
            placeholder="1-65535"
            min="1"
            max="65535"
          />
        </div>

        <div class="form-group">
          <label>{{ $t('portForwarding.localIPAddress') }}</label>
          <input
            type="text"
            v-model="formData.InternalIPAdress"
            placeholder="e.g., 192.168.1.100"
            required
          />
        </div>

        <div class="form-group">
          <label>{{ $t('portForwarding.localPort') }}</label>
          <input
            type="number"
            v-model="internalPort"
            placeholder="1-65535"
            min="1"
            max="65535"
            required
          />
        </div>

        <div class="form-group">
          <label>{{ $t('portForwarding.protocol') }}</label>
          <select v-model="formData.Protocol" required>
            <option v-for="proto in protoList" :key="proto" :value="proto">
              {{ proto }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>{{ $t('portForwarding.comment') }}</label>
          <input
            type="text"
            v-model="formData.Description"
            :placeholder="$t('common.placeholder')"
          />
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="handleCancel">
          {{ $t('common.cancel') }}
        </button>
        <button type="submit" class="btn btn-primary">
          {{ $t('common.apply') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { PortForwardRule } from '../../types/portForwarding';

interface Props {
  rule: PortForwardRule;
  wanList: string[];
  protoList: string[];
}

interface Emits {
  (e: 'update:rule', rule: PortForwardRule): void;
  (e: 'save'): void;
  (e: 'cancel'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isEdit = computed(() => !!props.rule.No);

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
  formData.value.InternalPort = internalPort.value;

  emit('update:rule', formData.value);
  emit('save');
}
</script>

<style scoped>
.port-forward-edit {
  padding: 1.5rem;
  background-color: white;
}

.port-forward-edit h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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

.switch-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.switch-label > span {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
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
  transition: 0.3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.switch input:checked + .slider {
  background-color: var(--primary-color);
}

.switch input:checked + .slider:before {
  transform: translateX(24px);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
}

.btn {
  padding: 0.625rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
}

.btn-secondary {
  background-color: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background-color: var(--bg-secondary);
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

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
