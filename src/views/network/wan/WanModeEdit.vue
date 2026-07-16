<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WanModeConfig, WanInterface } from '../../../types/wanManagement';
import { ActionButtons, BaseSecretInput, BaseSwitch } from '../../../components/common';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();

const props = defineProps<{
  mode: WanModeConfig | null;
  listPhysicalType: string[];
  listInterface: string[];
  listDNSMode: string[];
  listIPv6DNSMode: string[];
  listIPv4Mode: string[];
  listIPv6Mode: string[];
  listVLANType: string[];
  listConnectionTrigger: string[];
}>();

const emit = defineEmits<{
  (e: 'save', mode: WanModeConfig): void;
  (e: 'cancel'): void;
}>();

const defaultStaticIPv4 = {
  DNSServers: '',
  DefaultRouter: '',
  IPv4Address: '',
  SubnetMask: ''
};

const defaultStaticIPv6 = {
  DNSServers: '',
  DefaultRouter: '',
  IPv6Address: '',
  PrefixLength: 0
};

const defaultInterface: WanInterface = {
  Interface: props.listInterface[0] || "wan",
  IPv4Mode: props.listIPv4Mode[0] || "dhcp4",
  IPv6Mode: "none",
  PPPoEUserName: '',
  PPPoEPassword: '',
  ConnectionTrigger: 'AlwaysOn',
  ServiceName: '',
  IdleTime: 0,
  VLANType: props.listVLANType[0] || "untagged",
  VLANID: 100,
  VLANPriority: 0,
  MTU: 1500,
  StaticIPv4Address: { ...defaultStaticIPv4 },
  StaticIPv6Address: { ...defaultStaticIPv6 }
};

const editingMode = ref<WanModeConfig>(props.mode ? {
  ...JSON.parse(JSON.stringify(props.mode)),
  Interfaces: props.mode.Interfaces.map(iface => ({
    ...iface,
    ConnectionTrigger: iface.ConnectionTrigger || 'AlwaysOn',
    ServiceName: iface.ServiceName || '',
    IdleTime: iface.IdleTime || 0,
    StaticIPv4Address: iface.StaticIPv4Address || { ...defaultStaticIPv4 },
    StaticIPv6Address: iface.StaticIPv6Address || { ...defaultStaticIPv6 }
  }))
} : {
  WANMode: '',
  Status: 'Enabled',
  PhysicalType: props.listPhysicalType[0] || 'Ethernet',
  EnableSensing: 1,
  DNSMode: props.listDNSMode[0] || 'Dynamic',
  IPv6DNSMode: props.listIPv6DNSMode[0] || 'Dynamic',
  Interfaces: [{ ...defaultInterface }]
});

// Compute available interfaces (excluding already selected ones)
const availableInterfaces = computed(() => {
  const selectedInterfaces = new Set(editingMode.value.Interfaces.map(iface => iface.Interface));
  return props.listInterface.filter(iface => !selectedInterfaces.has(iface));
});

const getAvailableInterfaces = (currentInterface: string) => {
  const otherSelectedInterfaces = new Set(
    editingMode.value.Interfaces
      .map(iface => iface.Interface)
      .filter(iface => iface !== currentInterface)
  );
  return props.listInterface.filter(iface => !otherSelectedInterfaces.has(iface));
};

// Rule 1: Can only add interface when all existing interfaces have VLANType = 'vlan'
const canAddInterface = computed(() => {
  if (availableInterfaces.value.length === 0) return false;
  return editingMode.value.Interfaces.every(iface => iface.VLANType === 'vlan');
});

const validationError = ref('');

const showPPPoE = (iface: WanInterface) => {
  return iface.IPv4Mode === 'ppp4' || iface.IPv6Mode === 'ppp6';
};

const showVLAN = (iface: WanInterface) => {
  return iface.VLANType === 'vlan' || iface.VLANType === 'atm';
};

const showStaticIPv4 = (iface: WanInterface) => {
  return iface.IPv4Mode === 'static';
};

const showStaticIPv6 = (iface: WanInterface) => {
  return iface.IPv6Mode === 'static';
};

const handleSave = () => {
  validationError.value = '';

  // Rule 2: VLAN ID must be unique across interfaces with VLANType = 'vlan'
  const vlanInterfaces = editingMode.value.Interfaces.filter(iface => iface.VLANType === 'vlan');
  const vlanIds = vlanInterfaces.map(iface => iface.VLANID);
  if (vlanIds.length !== new Set(vlanIds).size) {
    validationError.value = t('wanManagement.duplicateVlanId');
    return;
  }

  // Rule 3: ppp4/ppp6 can only be enabled on one interface at a time
  const pppInterfaces = editingMode.value.Interfaces.filter(
    iface => iface.IPv4Mode === 'ppp4' || iface.IPv6Mode === 'ppp6'
  );
  if (pppInterfaces.length > 1) {
    validationError.value = t('wanManagement.pppModeOnlyOneInterface');
    return;
  }

  emit('save', editingMode.value);
};

const addInterface = () => {
  if (availableInterfaces.value.length > 0) {
    editingMode.value.Interfaces.push({
      ...defaultInterface,
      Interface: availableInterfaces.value[0],
      VLANType: 'vlan'
    });
  }
};

const validatePPPoEInput = (value: string, field: 'username' | 'password') => {
  if (value.length > 64) {
    return value.slice(0, 64);
  }
  return value;
};

const validateVLANPriority = (value: number) => {
  const num = value;
  if (isNaN(num)) return 0;
  return Math.max(-1, Math.min(7, num));
};
</script>

<template>
  <div class="wan-mode-edit" :data-testid="qa('wan-mode-edit-content')">
    <h2 :data-testid="qa('wan-mode-edit-title')">{{ mode?.WANMode ? t('wanManagement.editMode') : t('wanManagement.addMode') }}</h2>

    <form @submit.prevent="handleSave" :data-testid="qa('wan-mode-edit-form')">
      <div class="form-group">
        <label :data-testid="qa('wan-mode-edit-name-label')">{{ t('wanManagement.name') }}</label>
        <input
          type="text"
          :data-testid="qa('wan-mode-edit-name-input')"
          v-model="editingMode.WANMode"
          required
          :readonly="!!mode?.WANMode"
          :class="{ 'readonly': !!mode?.WANMode }"
        />
      </div>

      <div class="form-group">
        <div class="switch-label">
          <span :data-testid="qa('wan-mode-edit-enable-sensing-label')">{{ t('wanManagement.enableSensing') }}</span>
          <BaseSwitch
            v-model="editingMode.EnableSensing"
            :true-value="1"
            :false-value="0"
            :data-testid="qa('wan-mode-edit-enable-sensing-toggle')"
            :slider-data-testid="qa('wan-mode-edit-enable-sensing-toggle-slider')"
          />
        </div>
      </div>

      <div class="form-group">
        <label :data-testid="qa('wan-mode-edit-ipv4-dns-mode-label')">{{ t('wanManagement.ipv4DnsMode') }}</label>
        <select v-model="editingMode.DNSMode" :data-testid="qa('wan-mode-edit-ipv4-dns-mode-select')">
          <option v-for="mode in listDNSMode" :key="mode" :value="mode" :data-testid="qa(`wan-mode-edit-ipv4-dns-mode-option-${slug(mode)}`)">
            {{ mode }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label :data-testid="qa('wan-mode-edit-ipv6-dns-mode-label')">{{ t('wanManagement.ipv6DnsMode') }}</label>
        <select v-model="editingMode.IPv6DNSMode" :data-testid="qa('wan-mode-edit-ipv6-dns-mode-select')">
          <option v-for="mode in listIPv6DNSMode" :key="mode" :value="mode" :data-testid="qa(`wan-mode-edit-ipv6-dns-mode-option-${slug(mode)}`)">
            {{ mode }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label :data-testid="qa('wan-mode-edit-physical-type-label')">{{ t('wanManagement.physicalType') }}</label>
        <select v-model="editingMode.PhysicalType" :data-testid="qa('wan-mode-edit-physical-type-select')">
          <option v-for="type in listPhysicalType" :key="type" :value="type" :data-testid="qa(`wan-mode-edit-physical-type-option-${slug(type)}`)">
            {{ type }}
          </option>
        </select>
      </div>

      <template v-for="(iface, ifaceIndex) in editingMode.Interfaces" :key="ifaceIndex">
        <div class="interface-section" :data-testid="qa(`wan-mode-edit-interface-section-${ifaceIndex}`)">
          <h3 :data-testid="qa(`wan-mode-edit-interface-title-${ifaceIndex}`)">Interface {{ ifaceIndex + 1 }}</h3>

          <div class="form-group">
            <label :data-testid="qa(`wan-mode-edit-interface-label-${ifaceIndex}`)">{{ t('wanManagement.interface') }}</label>
            <select v-model="iface.Interface" :data-testid="qa(`wan-mode-edit-interface-select-${ifaceIndex}`)">
              <option
                v-for="int in getAvailableInterfaces(iface.Interface)"
                :key="int"
                :value="int"
                :data-testid="qa(`wan-mode-edit-interface-option-${ifaceIndex}-${slug(int)}`)"
              >
                {{ int }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label :data-testid="qa(`wan-mode-edit-ipv4-mode-label-${ifaceIndex}`)">{{ t('wanManagement.ipv4Mode') }}</label>
            <select v-model="iface.IPv4Mode" :data-testid="qa(`wan-mode-edit-ipv4-mode-select-${ifaceIndex}`)">
              <option v-for="mode in listIPv4Mode" :key="mode" :value="mode" :data-testid="qa(`wan-mode-edit-ipv4-mode-option-${ifaceIndex}-${slug(mode)}`)">
                {{ mode }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label :data-testid="qa(`wan-mode-edit-ipv6-mode-label-${ifaceIndex}`)">{{ t('wanManagement.ipv6Mode') }}</label>
            <select v-model="iface.IPv6Mode" :data-testid="qa(`wan-mode-edit-ipv6-mode-select-${ifaceIndex}`)">
              <option v-for="mode in listIPv6Mode" :key="mode" :value="mode" :data-testid="qa(`wan-mode-edit-ipv6-mode-option-${ifaceIndex}-${slug(mode)}`)">
                {{ mode }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label :data-testid="qa(`wan-mode-edit-mtu-label-${ifaceIndex}`)">{{ t('wanManagement.mtu') }}</label>
            <input
              type="number"
              :data-testid="qa(`wan-mode-edit-mtu-input-${ifaceIndex}`)"
              v-model.number="iface.MTU"
              required
              min="0"
            />
          </div>

          <div class="form-group">
            <label :data-testid="qa(`wan-mode-edit-vlan-type-label-${ifaceIndex}`)">{{ t('wanManagement.vlanType') }}</label>
            <select v-model="iface.VLANType" :data-testid="qa(`wan-mode-edit-vlan-type-select-${ifaceIndex}`)">
              <option v-for="type in listVLANType" :key="type" :value="type" :data-testid="qa(`wan-mode-edit-vlan-type-option-${ifaceIndex}-${slug(type)}`)">
                {{ type }}
              </option>
            </select>
          </div>

          <div v-if="showVLAN(iface)" :data-testid="qa(`wan-mode-edit-vlan-settings-${ifaceIndex}`)">
            <div class="form-group">
              <label :data-testid="qa(`wan-mode-edit-vlan-id-label-${ifaceIndex}`)">{{ t('wanManagement.vlanId') }}</label>
              <input
                type="number"
                :data-testid="qa(`wan-mode-edit-vlan-id-input-${ifaceIndex}`)"
                v-model="iface.VLANID"
                required
                min="0"
              />
            </div>

            <div class="form-group">
              <label :data-testid="qa(`wan-mode-edit-vlan-priority-label-${ifaceIndex}`)">{{ t('wanManagement.vlanPriority') }}</label>
              <input
                type="number"
                :data-testid="qa(`wan-mode-edit-vlan-priority-input-${ifaceIndex}`)"
                v-model="iface.VLANPriority"
                required
                min="-1"
                max="7"
                @input="iface.VLANPriority = validateVLANPriority(Number(($event.target as HTMLInputElement).value))"
              />
            </div>
          </div>

          <div v-if="showPPPoE(iface)" :data-testid="qa(`wan-mode-edit-pppoe-settings-${ifaceIndex}`)">
            <div class="form-group">
              <label :data-testid="qa(`wan-mode-edit-pppoe-username-label-${ifaceIndex}`)">{{ t('wanManagement.pppoeUsername') }}</label>
              <input
                type="text"
                :data-testid="qa(`wan-mode-edit-pppoe-username-input-${ifaceIndex}`)"
                v-model="iface.PPPoEUserName"
                required
                maxlength="64"
                @input="iface.PPPoEUserName = validatePPPoEInput(($event.target as HTMLInputElement).value, 'username')"
              />
            </div>

            <div class="form-group">
              <label :data-testid="qa(`wan-mode-edit-pppoe-password-label-${ifaceIndex}`)">{{ t('wanManagement.pppoePassword') }}</label>
              <BaseSecretInput
                :model-value="iface.PPPoEPassword"
                :input-data-testid="qa(`wan-mode-edit-pppoe-password-input-${ifaceIndex}`)"
                :toggle-data-testid="qa(`wan-mode-edit-pppoe-password-toggle-${ifaceIndex}`)"
                :required="true"
                :max-length="64"
                @update:model-value="iface.PPPoEPassword = validatePPPoEInput($event, 'password')"
              />
            </div>

            <div class="form-group">
              <label :data-testid="qa(`wan-mode-edit-connection-trigger-label-${ifaceIndex}`)">{{ t('wanManagement.connectionTrigger') }}</label>
              <select v-model="iface.ConnectionTrigger" :data-testid="qa(`wan-mode-edit-connection-trigger-select-${ifaceIndex}`)">
                <option v-for="trigger in listConnectionTrigger" :key="trigger" :value="trigger" :data-testid="qa(`wan-mode-edit-connection-trigger-option-${ifaceIndex}-${slug(trigger)}`)">
                  {{ trigger }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label :data-testid="qa(`wan-mode-edit-service-name-label-${ifaceIndex}`)">{{ t('wanManagement.serviceName') }}</label>
              <input
                type="text"
                :data-testid="qa(`wan-mode-edit-service-name-input-${ifaceIndex}`)"
                v-model="iface.ServiceName"
              />
            </div>

            <div class="form-group">
              <label :data-testid="qa(`wan-mode-edit-idle-time-label-${ifaceIndex}`)">{{ t('wanManagement.idleTime') }}</label>
              <input
                type="number"
                :data-testid="qa(`wan-mode-edit-idle-time-input-${ifaceIndex}`)"
                v-model.number="iface.IdleTime"
                min="0"
                :disabled="iface.ConnectionTrigger !== 'OnDemand'"
              />
            </div>
          </div>

          <template v-if="showStaticIPv4(iface)" :data-testid="qa(`wan-mode-edit-static-ipv4-${ifaceIndex}`)">
            <div class="static-section" :data-testid="qa(`wan-mode-edit-static-ipv4-section-${ifaceIndex}`)">
              <h3 :data-testid="qa(`wan-mode-edit-static-ipv4-title-${ifaceIndex}`)">{{ t('wanManagement.staticIpv4') }}</h3>
              <div class="form-group">
                <label :data-testid="qa(`wan-mode-edit-static-ipv4-address-label-${ifaceIndex}`)">{{ t('wanManagement.ipv4Address') }}</label>
                <input
                  type="text"
                  :data-testid="qa(`wan-mode-edit-static-ipv4-address-input-${ifaceIndex}`)"
                  v-model="iface.StaticIPv4Address!.IPv4Address"
                  required
                />
              </div>
              <div class="form-group">
                <label :data-testid="qa(`wan-mode-edit-static-ipv4-router-label-${ifaceIndex}`)">{{ t('wanManagement.defaultRouter') }}</label>
                <input
                  type="text"
                  :data-testid="qa(`wan-mode-edit-static-ipv4-router-input-${ifaceIndex}`)"
                  v-model="iface.StaticIPv4Address!.DefaultRouter"
                  required
                />
              </div>
              <div class="form-group">
                <label :data-testid="qa(`wan-mode-edit-static-ipv4-subnet-label-${ifaceIndex}`)">{{ t('wanManagement.subnetMask') }}</label>
                <input
                  type="text"
                  :data-testid="qa(`wan-mode-edit-static-ipv4-subnet-input-${ifaceIndex}`)"
                  v-model="iface.StaticIPv4Address!.SubnetMask"
                  required
                />
              </div>
              <div class="form-group">
                <label :data-testid="qa(`wan-mode-edit-static-ipv4-dns-label-${ifaceIndex}`)">{{ t('wanManagement.dnsServers') }}</label>
                <input
                  type="text"
                  :data-testid="qa(`wan-mode-edit-static-ipv4-dns-input-${ifaceIndex}`)"
                  v-model="iface.StaticIPv4Address!.DNSServers"
                  required
                />
              </div>
            </div>
          </template>

          <template v-if="showStaticIPv6(iface)" :data-testid="qa(`wan-mode-edit-static-ipv6-${ifaceIndex}`)">
            <div class="static-section" :data-testid="qa(`wan-mode-edit-static-ipv6-section-${ifaceIndex}`)">
              <h3 :data-testid="qa(`wan-mode-edit-static-ipv6-title-${ifaceIndex}`)">{{ t('wanManagement.staticIpv6') }}</h3>
              <div class="form-group">
                <label :data-testid="qa(`wan-mode-edit-static-ipv6-address-label-${ifaceIndex}`)">{{ t('wanManagement.ipv6Address') }}</label>
                <input
                  type="text"
                  :data-testid="qa(`wan-mode-edit-static-ipv6-address-input-${ifaceIndex}`)"
                  v-model="iface.StaticIPv6Address!.IPv6Address"
                  required
                />
              </div>
              <div class="form-group">
                <label :data-testid="qa(`wan-mode-edit-static-ipv6-router-label-${ifaceIndex}`)">{{ t('wanManagement.defaultRouter') }}</label>
                <input
                  type="text"
                  :data-testid="qa(`wan-mode-edit-static-ipv6-router-input-${ifaceIndex}`)"
                  v-model="iface.StaticIPv6Address!.DefaultRouter"
                  required
                />
              </div>
              <div class="form-group">
                <label :data-testid="qa(`wan-mode-edit-static-ipv6-prefix-label-${ifaceIndex}`)">{{ t('wanManagement.prefixLength') }}</label>
                <input
                  type="text"
                  :data-testid="qa(`wan-mode-edit-static-ipv6-prefix-input-${ifaceIndex}`)"
                  v-model="iface.StaticIPv6Address!.PrefixLength"
                  required
                />
              </div>
              <div class="form-group">
                <label :data-testid="qa(`wan-mode-edit-static-ipv6-dns-label-${ifaceIndex}`)">{{ t('wanManagement.dnsServers') }}</label>
                <input
                  type="text"
                  :data-testid="qa(`wan-mode-edit-static-ipv6-dns-input-${ifaceIndex}`)"
                  v-model="iface.StaticIPv6Address!.DNSServers"
                  required
                />
              </div>
            </div>
          </template>
        </div>
      </template>

      <div class="button-group">
        <button
          type="button"
          class="btn btn-secondary"
          :data-testid="qa('wan-mode-edit-add-interface-button')"
          @click="addInterface"
          :disabled="!canAddInterface"
          :title="!canAddInterface && availableInterfaces.length > 0 ? t('wanManagement.vlanRequiredForMultiInterface') : ''"
        >
          {{ t('wanManagement.addInterface') }}
        </button>
      </div>

      <div v-if="validationError" class="validation-error" :data-testid="qa('wan-mode-edit-validation-error')">
        {{ validationError }}
      </div>

      <div class="button-group">
        <ActionButtons
          :cancel-data-testid="qa('wan-mode-edit-cancel-button')"
          :apply-data-testid="qa('wan-mode-edit-save-button')"
          :apply-text="t('common.save')"
          apply-type="submit"
          @cancel="$emit('cancel')"
        />
      </div>
    </form>
  </div>
</template>

<style scoped>
.wan-mode-edit {
  padding: 1.5rem;
}

h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.1rem;
  color: var(--text-primary);
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

.form-group :deep(.secret-field) {
  width: 100%;
  padding: 0.5rem;
  padding-right: 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}

input.readonly {
  background-color: var(--bg-secondary);
  cursor: not-allowed;
}

input:disabled {
  background-color: var(--bg-tertiary, #f0f0f0);
  cursor: not-allowed;
  opacity: 0.6;
}

.interface-section {
  margin-top: 2rem;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-secondary);
}

.interface-section h3 {
  margin: -1.5rem -1.5rem 1.5rem -1.5rem;
  padding: 1rem 1.5rem;
  background-color: white;
  border-bottom: 1px solid var(--border-color);
  font-size: 1rem;
  color: var(--text-primary);
}

.static-section {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background-color: white;
  border-radius: 4px;
}

.static-section h3 {
  margin: 0 0 1rem 0;
  padding: 0;
  font-size: 1rem;
  color: var(--text-primary);
  border: none;
  background: none;
}

.validation-error {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background-color: #fff3f3;
  border: 1px solid #dc3545;
  border-radius: 4px;
  color: #dc3545;
  font-size: 0.9rem;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

/* Custom switch size (60px × 34px) for larger prominence */
:deep(.switch) {
  width: 60px;
  height: 34px;
  flex-shrink: 0;
}

:deep(.slider:before) {
  height: 26px;
  width: 26px;
}

:deep(input:checked + .slider:before) {
  transform: translateX(26px);
}

@media (max-width: 768px) {
  .wan-mode-edit {
    padding: 1rem;
  }

  .interface-section {
    padding: 1rem;
  }

  .interface-section h3 {
    margin: -1rem -1rem 1rem -1rem;
    padding: 0.75rem 1rem;
  }

  .static-section {
    padding: 1rem;
  }

  .button-group {
    flex-direction: column;
  }

  .button-group :deep(.btn) {
    width: 100%;
  }
}
</style>
