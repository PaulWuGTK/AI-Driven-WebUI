<template>
  <div class="ipoe-form">
    <div class="panel-section">
      <div class="section-title">IPoE - {{ localData.Protocol === 'DHCP' ? 'DHCP' : 'Static' }}</div>
      <div class="card-content">
        <div class="form-group">
          <div class="switch-label">
            <span>{{ $t('basicWanCht.enable') }}</span>
            <label class="switch">
              <input
                type="checkbox"
                v-model="localData.Enable"
              >
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>{{ $t('basicWanCht.ipv4Protocol') }}</label>
          <BaseSelect
            v-model="localData.Protocol"
            :options="[
              { label: 'DHCP', value: 'DHCP' },
              { label: 'Static', value: 'Static' }
            ]"
          />
        </div>

        <div class="form-group">
          <label>{{ $t('basicWanCht.mtu', { min: 576, max: 1500 }) }}</label>
          <BaseInput v-model.number="localData.MTU" type="number" min="576" max="1500" />
        </div>

        <template v-if="localData.Protocol === 'Static'">
          <div class="form-group">
            <label>{{ $t('basicWanCht.ipAddress') }}</label>
            <BaseInput v-model="localData.IPAddress" />
          </div>

          <div class="form-group">
            <label>{{ $t('basicWanCht.subnetMask') }}</label>
            <BaseInput v-model="localData.SubnetMask" />
          </div>

          <div class="form-group">
            <label>{{ $t('basicWanCht.gatewayIpAddress') }}</label>
            <BaseInput v-model="localData.Gateway" />
          </div>
        </template>

        <template v-if="localData.Protocol === 'DHCP'">
          <div class="form-group">
            <div class="switch-label">
              <span>{{ $t('basicWanCht.ipv4') }}</span>
              <label class="switch">
                <input
                  type="checkbox"
                  v-model="localData.IPv4Enable"
                >
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <div class="switch-label">
              <span>{{ $t('basicWanCht.ipv6') }}</span>
              <label class="switch">
                <input
                  type="checkbox"
                  v-model="localData.IPv6Enable"
                >
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <div class="switch-label">
              <span>{{ $t('basicWanCht.dhcpOption60') }}</span>
              <label class="switch">
                <input
                  type="checkbox"
                  v-model="localData.Option60Enable"
                >
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>{{ $t('basicWanCht.vendorId') }}</label>
            <BaseInput v-model="localData.Option60Value" :disabled="!localData.Option60Enable" />
          </div>

          <div class="form-group">
            <div class="switch-label">
              <span>{{ $t('basicWanCht.dhcpOption61') }}</span>
              <label class="switch">
                <input
                  type="checkbox"
                  v-model="localData.Option61Enable"
                >
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>{{ $t('basicWanCht.duid') }}</label>
            <BaseInput v-model="localData.Option61Value" />
          </div>
        </template>

        <div class="form-group">
          <label>{{ $t('basicWanCht.dnsIpAddress') }}</label>
          <BaseSelect
            v-model="localData.DNSMode"
            :options="[
              { label: $t('basicWanCht.autoObtainFromISP'), value: 'Auto' },
              { label: $t('basicWanCht.manual'), value: 'Manual' }
            ]"
          />
        </div>

        <div class="form-group">
          <label>{{ $t('basicWanCht.primaryDNS') }}</label>
          <BaseInput v-model="localData.PrimaryDNS" :disabled="localData.DNSMode === 'Auto'" />
        </div>

        <div class="form-group">
          <label>{{ $t('basicWanCht.secondaryDNS') }}</label>
          <BaseInput v-model="localData.SecondaryDNS" :disabled="localData.DNSMode === 'Auto'" />
        </div>

        <template v-if="localData.Protocol === 'Static'">
          <div class="form-group">
            <div class="switch-label">
              <span>{{ $t('basicWanCht.natFunction') }}</span>
              <label class="switch">
                <input
                  type="checkbox"
                  v-model="localData.NATEnable"
                >
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </template>

        <div class="form-group">
          <div class="switch-label">
            <span>{{ $t('basicWanCht.igmpProxy') }}</span>
            <label class="switch">
              <input
                type="checkbox"
                v-model="localData.IGMPEnable"
              >
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <div class="switch-label">
            <span>{{ $t('basicWanCht.vlan') }}</span>
            <label class="switch">
              <input
                type="checkbox"
                v-model="localData.VLANEnable"
              >
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>{{ $t('basicWanCht.priorityBit') }}</label>
          <BaseInput v-model.number="localData.VLANPriority" type="number" :disabled="!localData.VLANEnable" />
        </div>

        <div class="form-group">
          <label>{{ $t('basicWanCht.vlanId') }}</label>
          <BaseInput v-model.number="localData.VLANID" type="number" :disabled="!localData.VLANEnable" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { BasicWanChtIPoE } from '../../types/basicWanCht';
import { BaseInput, BaseSelect } from '../common';

interface Props {
  modelValue: BasicWanChtIPoE;
}

interface Emits {
  (e: 'update:modelValue', value: BasicWanChtIPoE): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const localData = ref<BasicWanChtIPoE>({ ...props.modelValue });

watch(localData, (newValue) => {
  emit('update:modelValue', newValue);
}, { deep: true });

watch(() => props.modelValue, (newValue) => {
  localData.value = { ...newValue };
}, { deep: true });
</script>

<style scoped>
.ipoe-form {
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

input, select {
  width: 100%;
  padding: 0.5rem;
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
  background-color: var(--color-primary);
}

input:checked + .slider:before {
  transform: translateX(26px);
}

@media (max-width: 768px) {
  .ipoe-form {
    padding: 0;
  }
}
</style>
