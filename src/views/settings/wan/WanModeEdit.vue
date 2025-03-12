<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WanModeConfig, WanInterface } from '../../../types/wanManagement';

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
  PrefixLength: ''
};

const defaultInterface: WanInterface = {
  Interface: 'wan',
  IPv4Mode: 'DHCP',
  IPv6Mode: 'None',
  PPPoEUserName: '',
  PPPoEPassword: '',
  VLANType: 'untagged',
  VLANID: '100',
  VLANPriority: '0',
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
  Interfaces: [{ ...defaultInterface }]
});

//const physicalTypes = ['Ethernet', 'Bridge'];
const physicalTypes = ['Ethernet'];
const allInterfaces = ['wan', 'voip', 'mgmt', 'iptv'];
const ipv4Modes = ['DHCP', 'PPPoE', 'Static', 'None'];
const ipv6Modes = ['DHCP', 'PPPoE', 'Static', 'None'];
const vlanTypes = ['untagged', 'vlan'];

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
  return iface.IPv4Mode === 'PPPoE' || iface.IPv6Mode === 'PPPoE';
};

const showVLAN = (iface: WanInterface) => {
  return iface.VLANType === 'vlan';
};

const showStaticIPv4 = (iface: WanInterface) => {
  return iface.IPv4Mode === 'Static';
};

const showStaticIPv6 = (iface: WanInterface) => {
  return iface.IPv6Mode === 'Static';
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
</script>

<template>
  <div class="wan-mode-edit">
    <h2>{{ mode ? t('wanManagement.editMode') : t('wanManagement.addMode') }}</h2>

    <form @submit.prevent="handleSave">
      <div class="form-group">
        <label>{{ t('wanManagement.name') }}</label>
        <input
          type="text"
          v-model="editingMode.WANMode"
          required
          :readonly="!!mode"
          :class="{ 'readonly': !!mode }"
        />
      </div>

      <div class="form-group">
        <label>{{ t('wanManagement.physicalType') }}</label>
        <select v-model="editingMode.PhysicalType">
          <option v-for="type in physicalTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
      </div>

      <template v-for="(iface, index) in editingMode.Interfaces" :key="index">
        <div class="interface-section">
          <h3>Interface {{ index + 1 }}</h3>
          
          <div class="form-group">
            <label>{{ t('wanManagement.interface') }}</label>
            <select v-model="iface.Interface">
              <option 
                v-for="int in getAvailableInterfaces(iface.Interface)" 
                :key="int" 
                :value="int"
              >
                {{ int }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>{{ t('wanManagement.ipv4Mode') }}</label>
            <select v-model="iface.IPv4Mode">
              <option v-for="mode in ipv4Modes" :key="mode" :value="mode">
                {{ mode }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>{{ t('wanManagement.ipv6Mode') }}</label>
            <select v-model="iface.IPv6Mode">
              <option v-for="mode in ipv6Modes" :key="mode" :value="mode">
                {{ mode }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>{{ t('wanManagement.vlanType') }}</label>
            <select v-model="iface.VLANType">
              <option v-for="type in vlanTypes" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>

          <template v-if="showVLAN(iface)">
            <div class="form-group">
              <label>{{ t('wanManagement.vlanId') }}</label>
              <input
                type="text"
                v-model="iface.VLANID"
                required
              />
            </div>

            <div class="form-group">
              <label>{{ t('wanManagement.vlanPriority') }}</label>
              <input
                type="number"
                v-model="iface.VLANPriority"
                min="-1"
                max="7"
                required
              />
            </div>
          </template>

          <template v-if="showPPPoE(iface)">
            <div class="form-group">
              <label>{{ t('wanManagement.pppoeUsername') }}</label>
              <input
                type="text"
                v-model="iface.PPPoEUserName"
                required
              />
            </div>

            <div class="form-group">
              <label>{{ t('wanManagement.pppoePassword') }}</label>
              <input
                type="password"
                v-model="iface.PPPoEPassword"
                required
              />
            </div>
          </template>

          <template v-if="showStaticIPv4(iface)">
            <div class="static-section">
              <h3>{{ t('wanManagement.staticIpv4') }}</h3>
              <div class="form-group">
                <label>{{ t('wanManagement.ipv4Address') }}</label>
                <input
                  type="text"
                  v-model="iface.StaticIPv4Address!.IPv4Address"
                  required
                />
              </div>
              <div class="form-group">
                <label>{{ t('wanManagement.defaultRouter') }}</label>
                <input
                  type="text"
                  v-model="iface.StaticIPv4Address!.DefaultRouter"
                  required
                />
              </div>
              <div class="form-group">
                <label>{{ t('wanManagement.subnetMask') }}</label>
                <input
                  type="text"
                  v-model="iface.StaticIPv4Address!.SubnetMask"
                  required
                />
              </div>
              <div class="form-group">
                <label>{{ t('wanManagement.dnsServers') }}</label>
                <input
                  type="text"
                  v-model="iface.StaticIPv4Address!.DNSServers"
                  required
                />
              </div>
            </div>
          </template>

          <template v-if="showStaticIPv6(iface)">
            <div class="static-section">
              <h3>{{ t('wanManagement.staticIpv6') }}</h3>
              <div class="form-group">
                <label>{{ t('wanManagement.ipv6Address') }}</label>
                <input
                  type="text"
                  v-model="iface.StaticIPv6Address!.IPv6Address"
                  required
                />
              </div>
              <div class="form-group">
                <label>{{ t('wanManagement.defaultRouter') }}</label>
                <input
                  type="text"
                  v-model="iface.StaticIPv6Address!.DefaultRouter"
                  required
                />
              </div>
              <div class="form-group">
                <label>{{ t('wanManagement.prefixLength') }}</label>
                <input
                  type="text"
                  v-model="iface.StaticIPv6Address!.PrefixLength"
                  required
                />
              </div>
              <div class="form-group">
                <label>{{ t('wanManagement.dnsServers') }}</label>
                <input
                  type="text"
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
          @click="addInterface"
          :disabled="availableInterfaces.length === 0"
        >
          {{ t('wanManagement.addInterface') }}
        </button>
      </div>

      <div class="button-group">
        <button type="button" class="btn btn-secondary" @click="$emit('cancel')">
          {{ t('common.cancel') }}
        </button>
        <button type="submit" class="btn btn-primary">
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