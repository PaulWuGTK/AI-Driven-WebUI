<template>
  <div class="ipoe-form" :data-testid="qa('ipoe-form')">
    <div class="panel-section">
      <div class="section-title">IPoE - {{ localData.Protocol === 'DHCP' ? 'DHCP' : 'Static' }}</div>
      <div class="card-content">
        <div class="form-group">
          <div class="switch-label">
            <span :data-testid="qa('ipoe-enable-label')">{{ $t('basicWanCht.enable') }}</span>
            <BaseSwitch
              v-model="localData.Enable"
              :true-value="1"
              :false-value="0"
              :data-testid="qa('ipoe-enable-toggle')"
              :slider-data-testid="qa('ipoe-enable-toggle-slider')"
            />
          </div>
        </div>

        <div class="form-group">
          <label>{{ $t('basicWanCht.ipv4Protocol') }}</label>
          <BaseSelect
            v-model="localData.Protocol"
            :data-testid="qa('ipoe-ipv4-protocol-select')"
            :options="[
              { label: 'DHCP', value: 'DHCP' },
              { label: 'Static', value: 'Static' }
            ]"
          />
        </div>

        <div class="form-group">
          <label>{{ $t('basicWanCht.mtu', { min: 576, max: 1500 }) }}</label>
          <BaseInput v-model.number="localData.MTU" type="number" min="576" max="1500" :data-testid="qa('ipoe-mtu-input')" />
        </div>


        <template v-if="localData.Protocol === 'Static'">
          <div class="form-group">
            <label>{{ $t('basicWanCht.ipAddress') }}</label>
            <BaseInput v-model="localData.IPAddress" :data-testid="qa('ipoe-ip-address-input')" />
          </div>

          <div class="form-group">
            <label>{{ $t('basicWanCht.subnetMask') }}</label>
            <BaseInput v-model="localData.SubnetMask" :data-testid="qa('ipoe-subnet-mask-input')" />
          </div>

          <div class="form-group">
            <label>{{ $t('basicWanCht.gatewayIpAddress') }}</label>
            <BaseInput v-model="localData.Gateway" :data-testid="qa('ipoe-gateway-input')" />
          </div>
        </template>

        <template v-if="localData.Protocol === 'DHCP'">
          <div class="form-group">
            <div class="switch-label">
              <span :data-testid="qa('ipoe-ipv4-label')">{{ $t('basicWanCht.ipv4') }}</span>
            <BaseSwitch
              v-model="localData.IPv4Enable"
              :true-value="1"
              :false-value="0"
              :data-testid="qa('ipoe-ipv4-toggle')"
              :slider-data-testid="qa('ipoe-ipv4-toggle-slider')"
            />
            </div>
          </div>

          <div class="form-group">
            <div class="switch-label">
              <span :data-testid="qa('ipoe-ipv6-label')">{{ $t('basicWanCht.ipv6') }}</span>
            <BaseSwitch
              v-model="localData.IPv6Enable"
              :true-value="1"
              :false-value="0"
              :data-testid="qa('ipoe-ipv6-toggle')"
              :slider-data-testid="qa('ipoe-ipv6-toggle-slider')"
            />
            </div>
          </div>

          <div class="form-group">
            <div class="switch-label">
              <span :data-testid="qa('ipoe-option60-label')">{{ $t('basicWanCht.dhcpOption60') }}</span>
            <BaseSwitch
              v-model="localData.DHCPv4Option60Enable"
              :true-value="1"
              :false-value="0"
              :data-testid="qa('ipoe-option60-toggle')"
              :slider-data-testid="qa('ipoe-option60-toggle-slider')"
            />
            </div>
          </div>

          <div class="form-group">
            <label :data-testid="qa('ipoe-vendor-id-label')">{{ $t('basicWanCht.vendorId') }}</label>
            <BaseInput
              v-model="localData.DHCPv4Option60Value"
              :disabled="!localData.DHCPv4Option60Enable"
              :data-testid="qa('ipoe-vendor-id-input')"
            />
          </div>

          <div class="form-group">
            <div class="switch-label">
              <span :data-testid="qa('ipoe-option61-label')">{{ $t('basicWanCht.dhcpOption61') }}</span>
            <BaseSwitch
              v-model="localData.DHCPv4Option61Enable"
              :true-value="1"
              :false-value="0"
              :data-testid="qa('ipoe-option61-toggle')"
              :slider-data-testid="qa('ipoe-option61-toggle-slider')"
            />
            </div>
          </div>

          <div class="form-group">
            <label>{{ $t('basicWanCht.iaid') }}</label>
            <BaseInput v-model="localData.IAID" :disabled="!localData.DHCPv4Option61Enable" :data-testid="qa('ipoe-iaid-input')" />
          </div>

          <div class="form-group">
            <label>{{ $t('basicWanCht.duidType') }}</label>
            <BaseInput v-model="localData.DUIDType" :disabled="!localData.DHCPv4Option61Enable" :data-testid="qa('ipoe-duid-type-input')" />
          </div>

          <div class="form-group">
            <label>{{ $t('basicWanCht.enterpriseNumber') }}</label>
            <BaseInput
              v-model="localData.EnterpriseNumber"
              :disabled="!localData.DHCPv4Option61Enable"
              :data-testid="qa('ipoe-enterprise-number-input')"
            />
          </div>

          <div class="form-group">
            <label>{{ $t('basicWanCht.identifier') }}</label>
            <BaseInput
              v-model="localData.Identifier"
              :disabled="!localData.DHCPv4Option61Enable"
              :data-testid="qa('ipoe-identifier-input')"
            />
          </div>
        </template>

        <div class="form-group">
          <div class="switch-label">
            <span :data-testid="qa('ipoe-default-gateway-label')">{{ $t('basicWanCht.defaultGateway') }}</span>
            <BaseSwitch
              v-model="localData.DefaultGateway"
              :true-value="1"
              :false-value="0"
              :data-testid="qa('ipoe-default-gateway-toggle')"
              :slider-data-testid="qa('ipoe-default-gateway-toggle-slider')"
            />
          </div>
        </div>

        <div class="form-group">
          <label>{{ $t('basicWanCht.dnsIpAddress') }}</label>
          <BaseSelect
            v-model="localData.DNSMode"
            :data-testid="qa('ipoe-dns-mode-select')"
            :options="[
              { label: $t('basicWanCht.autoObtainFromISP'), value: 'Auto' },
              { label: $t('basicWanCht.manual'), value: 'Manual' }
            ]"
          />
        </div>

        <div class="form-group">
          <label>{{ $t('basicWanCht.primaryDNS') }}</label>
          <BaseInput v-model="localData.PrimaryDNS" :disabled="localData.DNSMode === 'Auto'" :data-testid="qa('ipoe-primary-dns-input')" />
        </div>

        <div class="form-group">
          <label>{{ $t('basicWanCht.secondaryDNS') }}</label>
          <BaseInput v-model="localData.SecondaryDNS" :disabled="localData.DNSMode === 'Auto'" :data-testid="qa('ipoe-secondary-dns-input')" />
        </div>

        <div class="form-group">
          <div class="switch-label">
            <span :data-testid="qa('ipoe-nat-label')">{{ $t('basicWanCht.natFunction') }}</span>
            <BaseSwitch
              v-model="localData.NATEnable"
              :true-value="1"
              :false-value="0"
              :data-testid="qa('ipoe-nat-toggle')"
              :slider-data-testid="qa('ipoe-nat-toggle-slider')"
            />
          </div>
        </div>

        <div class="form-group">
          <div class="switch-label">
            <span :data-testid="qa('ipoe-igmp-label')">{{ $t('basicWanCht.igmpProxy') }}</span>
            <BaseSwitch
              v-model="localData.IGMPEnable"
              :true-value="1"
              :false-value="0"
              :data-testid="qa('ipoe-igmp-toggle')"
              :slider-data-testid="qa('ipoe-igmp-toggle-slider')"
            />
          </div>
        </div>

        <div class="form-group">
          <div class="switch-label">
            <span :data-testid="qa('ipoe-vlan-label')">{{ $t('basicWanCht.vlan') }}</span>
            <BaseSwitch
              v-model="localData.VLANEnable"
              :true-value="1"
              :false-value="0"
              :data-testid="qa('ipoe-vlan-toggle')"
              :slider-data-testid="qa('ipoe-vlan-toggle-slider')"
            />
          </div>
        </div>

        <div class="form-group">
          <label>{{ $t('basicWanCht.priorityBit') }}</label>
          <BaseInput v-model.number="localData.VLANPriority" type="number" :disabled="!localData.VLANEnable" :data-testid="qa('ipoe-vlan-priority-input')" />
        </div>

        <div class="form-group">
          <label>{{ $t('basicWanCht.vlanId') }}</label>
          <BaseInput v-model.number="localData.VLANID" type="number" :disabled="!localData.VLANEnable" :data-testid="qa('ipoe-vlan-id-input')" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { BasicWanChtIPoE } from '../../types/basicWanCht';
import { BaseInput, BaseSelect, BaseSwitch } from '../common';
import { useQA } from '../../utils/qa';

const { qa } = useQA();

interface Props {
  modelValue: BasicWanChtIPoE;
}

interface Emits {
  (e: 'update:modelValue', value: BasicWanChtIPoE): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const localData = ref<BasicWanChtIPoE>({ ...props.modelValue });

watch(
  () => props.modelValue,
  (newValue) => {
    localData.value = JSON.parse(JSON.stringify(newValue)) as BasicWanChtIPoE;
  },
  { deep: true, immediate: true }
);

watch(
  localData,
  (newValue) => {
    const fromChild = JSON.stringify(newValue);
    const fromParent = JSON.stringify(props.modelValue);
    if (fromChild === fromParent) return;
    emit('update:modelValue', newValue);
  },
  { deep: true }
);
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
  .ipoe-form {
    padding: 0;
  }
}
</style>
