<template>
  <div class="pppoe-form" :data-testid="qa('pppoe-form')">
    <div class="panel-section">
      <div class="section-title">PPPoE</div>
      <div class="card-content">
        <div class="form-group">
          <div class="switch-label">
            <span :data-testid="qa('pppoe-enable-label')">{{ $t('basicWanCht.enable') }}</span>
            <BaseSwitch
              v-model="localData.Enable"
              :data-testid="qa('pppoe-enable-toggle')"
              :slider-data-testid="qa('pppoe-enable-toggle-slider')"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="required">{{ $t('basicWanCht.ipv4Protocol') }}</label>
          <BaseInput v-model="localData.Protocol" :disabled="true" :data-testid="qa('pppoe-ipv4-protocol-input')" />
        </div>

        <div class="form-group">
          <label>{{ $t('basicWanCht.username') }}</label>
          <BaseInput v-model="localData.UserName" :data-testid="qa('pppoe-username-input')" />
        </div>

        <div class="form-group">
          <label>{{ $t('basicWanCht.password') }}</label>
          <BaseSecretInput
            v-model="localData.Password"
            :input-data-testid="qa('pppoe-password-input')"
            :toggle-data-testid="qa('pppoe-password-toggle')"
          />
        </div>

        <div class="form-group">
          <label>{{ $t('basicWanCht.serviceName') }}</label>
          <BaseInput v-model="localData.ServiceName" :data-testid="qa('pppoe-service-name-input')" />
        </div>

        <div class="form-group">
          <label>{{ $t('basicWanCht.connectTrigger') }}</label>
          <BaseSelect
            v-model="localData.ConnectionTrigger"
            :data-testid="qa('pppoe-connect-trigger-select')"
            :options="[
              { label: $t('basicWanCht.alwaysOn'), value: 'AlwaysOn' },
              { label: $t('basicWanCht.onDemand'), value: 'OnDemand' }
            ]"
          />
        </div>

        <div class="form-group">
          <label>{{ $t('basicWanCht.idleTime') }}</label>
          <BaseInput v-model.number="localData.IdleTime" type="number" :disabled="localData.ConnectionTrigger !== 'TriggerByTraffic'" :data-testid="qa('pppoe-idle-time-input')" />
        </div>

        <div class="form-group">
          <label>{{ $t('basicWanCht.mtu', { min: 576, max: 1492 }) }}</label>
          <BaseInput v-model.number="localData.MTU" type="number" min="576" max="1492" :data-testid="qa('pppoe-mtu-input')" />
        </div>

        <div class="form-group">
          <div class="switch-label">
            <span :data-testid="qa('pppoe-default-gateway-label')">{{ $t('basicWanCht.defaultGateway') }}</span>
            <BaseSwitch
              v-model="localData.DefaultGateway"
              :data-testid="qa('pppoe-default-gateway-toggle')"
              :slider-data-testid="qa('pppoe-default-gateway-toggle-slider')"
            />
          </div>
        </div>

        <div class="form-group">
          <div class="switch-label">
            <span :data-testid="qa('pppoe-passthrough-label')">{{ $t('basicWanCht.pppoePassThrough') }}</span>
            <BaseSwitch
              v-model="localData.PassthroughEnable"
              :data-testid="qa('pppoe-passthrough-toggle')"
              :slider-data-testid="qa('pppoe-passthrough-toggle-slider')"
            />
          </div>
        </div>

        <div class="form-group">
          <div class="switch-label">
            <span :data-testid="qa('pppoe-ipv4-label')">{{ $t('basicWanCht.ipv4') }}</span>
            <BaseSwitch
              v-model="localData.IPv4Enable"
              :data-testid="qa('pppoe-ipv4-toggle')"
              :slider-data-testid="qa('pppoe-ipv4-toggle-slider')"
            />
          </div>
        </div>

        <div class="form-group">
          <div class="switch-label">
            <span :data-testid="qa('pppoe-ipv6-label')">{{ $t('basicWanCht.ipv6') }}</span>
            <BaseSwitch
              v-model="localData.IPv6Enable"
              :data-testid="qa('pppoe-ipv6-toggle')"
              :slider-data-testid="qa('pppoe-ipv6-toggle-slider')"
            />
          </div>
        </div>

        <div class="form-group">
          <label>{{ $t('basicWanCht.dnsIpAddress') }}</label>
          <BaseSelect
            v-model="localData.DNSMode"
            :data-testid="qa('pppoe-dns-mode-select')"
            :options="[
              { label: $t('basicWanCht.autoObtainFromISP'), value: 'Auto' },
              { label: $t('basicWanCht.manual'), value: 'Manual' }
            ]"
          />
        </div>

        <div class="form-group">
          <label>{{ $t('basicWanCht.primaryDNS') }}</label>
          <BaseInput v-model="localData.PrimaryDNS" :disabled="localData.DNSMode === 'Auto'" :data-testid="qa('pppoe-primary-dns-input')" />
        </div>

        <div class="form-group">
          <label>{{ $t('basicWanCht.secondaryDNS') }}</label>
          <BaseInput v-model="localData.SecondaryDNS" :disabled="localData.DNSMode === 'Auto'" :data-testid="qa('pppoe-secondary-dns-input')" />
        </div>

        <div class="form-group">
          <div class="switch-label">
            <span :data-testid="qa('pppoe-nat-label')">{{ $t('basicWanCht.natFunction') }}</span>
            <BaseSwitch
              v-model="localData.NATEnable"
              :data-testid="qa('pppoe-nat-toggle')"
              :slider-data-testid="qa('pppoe-nat-toggle-slider')"
            />
          </div>
        </div>

        <div class="form-group">
          <div class="switch-label">
            <span :data-testid="qa('pppoe-igmp-label')">{{ $t('basicWanCht.igmpProxy') }}</span>
            <BaseSwitch
              v-model="localData.IGMPEnable"
              :data-testid="qa('pppoe-igmp-toggle')"
              :slider-data-testid="qa('pppoe-igmp-toggle-slider')"
            />
          </div>
        </div>

        <div class="form-group">
          <div class="switch-label">
            <span :data-testid="qa('pppoe-vlan-label')">{{ $t('basicWanCht.vlan') }}</span>
            <BaseSwitch
              v-model="localData.VLANEnable"
              :data-testid="qa('pppoe-vlan-toggle')"
              :slider-data-testid="qa('pppoe-vlan-toggle-slider')"
            />
          </div>
        </div>

        <div class="form-group">
          <label>{{ $t('basicWanCht.priorityBit') }}</label>
          <BaseInput v-model.number="localData.VLANPriority" type="number" :disabled="!localData.VLANEnable" :data-testid="qa('pppoe-vlan-priority-input')" />
        </div>

        <div class="form-group">
          <label>{{ $t('basicWanCht.vlanId') }}</label>
          <BaseInput v-model.number="localData.VLANID" type="number" :disabled="!localData.VLANEnable" :data-testid="qa('pppoe-vlan-id-input')" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { BasicWanChtPPPoE } from '../../types/basicWanCht';
import { BaseInput, BaseSecretInput, BaseSelect, BaseSwitch } from '../common';
import { useQA } from '../../utils/qa';

const { qa } = useQA();

interface Props {
  modelValue: BasicWanChtPPPoE;
}

interface Emits {
  (e: 'update:modelValue', value: BasicWanChtPPPoE): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const localData = ref<BasicWanChtPPPoE>({ ...props.modelValue });
// 1) 父層改 modelValue → 同步到 localData
watch(
  () => props.modelValue,
  (newValue) => {
    // 深拷貝一次，避免直接共用 reference
    localData.value = JSON.parse(JSON.stringify(newValue)) as BasicWanChtPPPoE;
  },
  { deep: true, immediate: true }
);

// 2) 表單改 localData → 回寫父層
watch(
  localData,
  (newValue) => {
    const fromChild = JSON.stringify(newValue);
    const fromParent = JSON.stringify(props.modelValue);

    // 內容一樣就不要 emit，避免 props watcher + local watcher 互相打架
    if (fromChild === fromParent) {
      return;
    }

    emit('update:modelValue', newValue);
  },
  { deep: true }
);
</script>

<style scoped>
.pppoe-form {
  padding: 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.form-group label.required::after {
  content: ' *';
  color: var(--color-error);
}

input, select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}

.form-group :deep(.secret-field) {
  width: 100%;
  padding: 0.5rem;
  padding-right: 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}

.switch-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

:deep(.switch) {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  flex-shrink: 0;
}

:deep(.switch input) {
  opacity: 0;
  width: 0;
  height: 0;
}

:deep(.switch .slider) {
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

:deep(.switch .slider:before) {
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

:deep(.switch input:checked + .slider) {
  background-color: var(--color-primary);
}

:deep(.switch input:checked + .slider:before) {
  transform: translateX(26px);
}

@media (max-width: 768px) {
  .pppoe-form {
    padding: 0;
  }
}
</style>
