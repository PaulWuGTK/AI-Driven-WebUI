<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WanModeConfig, WanInterface } from '../../../types/wanManagement';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();

const props = defineProps<{
  mode: WanModeConfig | null;
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
  Interface: "wan",
  IPv4Mode: "dhcp4",
  IPv6Mode: "none",
  PPPoEUserName: '',
  PPPoEPassword: '',
  VLANType: "untagged",
  VLANID: 100,
  VLANPriority: 0,
  StaticIPv4Address: { ...defaultStaticIPv4 },
  StaticIPv6Address: { ...defaultStaticIPv6 }
};

const editingMode = ref<WanModeConfig>(props.mode ? {
  ...JSON.parse(JSON.stringify(props.mode)),
  Interfaces: props.mode.Interfaces.map(iface => ({
    ...iface,
    StaticIPv4Address: iface.StaticIPv4Address || { ...defaultStaticIPv4 },
    StaticIPv6Address: iface.StaticIPv6Address || { ...defaultStaticIPv6 }
  }))
} : {
  WANMode: '',
  Status: 'Enabled',
  PhysicalType: 'Ethernet',
  EnableSensing: 1,
  DNSMode: 'Dynamic',
  IPv6DNSMode: 'Dynamic',
  Interfaces: [{ ...defaultInterface }]
});

const physicalTypes = ['Ethernet', 'ADSL', 'VDSL', 'SFP', 'GPON', 'GFAST', 'Bridge', 'WWAN'];
const allInterfaces = ['wan', 'voip', 'mgmt', 'iptv'] as const;
const ipv4Modes = ['dhcp4', 'ppp4', 'none', 'static', 'dslite', 'link'] as const;
const ipv6Modes = ['dhcp6', 'ppp6', 'none', 'static', 'link'] as const;
const vlanTypes = ['untagged', 'vlan', 'atm'] as const;
const dnsModes = ['Static', 'Dynamic', ''] as const;

// Compute available interfaces (excluding already selected ones)
const availableInterfaces = computed(() => {
  const selectedInterfaces = new Set(editingMode.value.Interfaces.map(iface => iface.Interface));
  return allInterfaces.filter(iface => !selectedInterfaces.has(iface));
});

const getAvailableInterfaces = (currentInterface: string) => {
  const otherSelectedInterfaces = new Set(
    editingMode.value.Interfaces
      .map(iface => iface.Interface)
      .filter(iface => iface !== currentInterface)
  );
  return allInterfaces.filter(iface => !otherSelectedInterfaces.has(iface));
};

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
          <label class="switch">
            <input
              type="checkbox"
              :data-testid="qa('wan-mode-edit-enable-sensing-toggle')"
              v-model="editingMode.EnableSensing"
              :true-value="1"
              :false-value="0"
            >
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label :data-testid="qa('wan-mode-edit-ipv4-dns-mode-label')">{{ t('wanManagement.ipv4DnsMode') }}</label>
        <select v-model="editingMode.DNSMode" :data-testid="qa('wan-mode-edit-ipv4-dns-mode-select')">
          <option v-for="mode in dnsModes" :key="mode" :value="mode" :data-testid="qa(`wan-mode-edit-ipv4-dns-mode-option-${slug(mode || 'none')}`)">
            {{ mode || 'None' }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label :data-testid="qa('wan-mode-edit-ipv6-dns-mode-label')">{{ t('wanManagement.ipv6DnsMode') }}</label>
        <select v-model="editingMode.IPv6DNSMode" :data-testid="qa('wan-mode-edit-ipv6-dns-mode-select')">
          <option v-for="mode in dnsModes" :key="mode" :value="mode" :data-testid="qa(`wan-mode-edit-ipv6-dns-mode-option-${slug(mode || 'none')}`)">
            {{ mode || 'None' }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label :data-testid="qa('wan-mode-edit-physical-type-label')">{{ t('wanManagement.physicalType') }}</label>
        <select v-model="editingMode.PhysicalType" :data-testid="qa('wan-mode-edit-physical-type-select')">
          <option v-for="type in physicalTypes" :key="type" :value="type" :data-testid="qa(`wan-mode-edit-physical-type-option-${slug(type)}`)">
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
              <option v-for="mode in ipv4Modes" :key="mode" :value="mode" :data-testid="qa(`wan-mode-edit-ipv4-mode-option-${ifaceIndex}-${slug(mode)}`)">
                {{ mode }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label :data-testid="qa(`wan-mode-edit-ipv6-mode-label-${ifaceIndex}`)">{{ t('wanManagement.ipv6Mode') }}</label>
            <select v-model="iface.IPv6Mode" :data-testid="qa(`wan-mode-edit-ipv6-mode-select-${ifaceIndex}`)">
              <option v-for="mode in ipv6Modes" :key="mode" :value="mode" :data-testid="qa(`wan-mode-edit-ipv6-mode-option-${ifaceIndex}-${slug(mode)}`)">
                {{ mode }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label :data-testid="qa(`wan-mode-edit-vlan-type-label-${ifaceIndex}`)">{{ t('wanManagement.vlanType') }}</label>
            <select v-model="iface.VLANType" :data-testid="qa(`wan-mode-edit-vlan-type-select-${ifaceIndex}`)">
              <option v-for="type in vlanTypes" :key="type" :value="type" :data-testid="qa(`wan-mode-edit-vlan-type-option-${ifaceIndex}-${slug(type)}`)">
                {{ type }}
              </option>
            </select>
          </div>

          <template v-if="showVLAN(iface)" :data-testid="qa(`wan-mode-edit-vlan-settings-${ifaceIndex}`)">
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
          </template>

          <template v-if="showPPPoE(iface)" :data-testid="qa(`wan-mode-edit-pppoe-settings-${ifaceIndex}`)">
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
              <input
                type="password"
                :data-testid="qa(`wan-mode-edit-pppoe-password-input-${ifaceIndex}`)"
                v-model="iface.PPPoEPassword"
                required
                maxlength="64"
                @input="iface.PPPoEPassword = validatePPPoEInput(($event.target as HTMLInputElement).value, 'password')"
              />
            </div>
          </template>

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
          :disabled="availableInterfaces.length === 0"
        >
          {{ t('wanManagement.addInterface') }}
        </button>
      </div>

      <div class="button-group">
        <button type="button" class="btn btn-secondary" :data-testid="qa('wan-mode-edit-cancel-button')" @click="$emit('cancel')">
          {{ t('common.cancel') }}
        </button>
        <button type="submit" class="btn btn-primary" :data-testid="qa('wan-mode-edit-save-button')">
          {{ t('common.save') }}
        </button>
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

input.readonly {
  background-color: var(--bg-secondary);
  cursor: not-allowed;
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

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.switch-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-primary);
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
  background-color: var(--primary-color);
}

input:checked + .slider:before {
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

  .button-group .btn {
    width: 100%;
  }
}
</style>