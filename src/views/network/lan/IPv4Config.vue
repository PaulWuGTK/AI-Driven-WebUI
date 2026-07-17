<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { LanBasicResponse, IPAddressReservation } from '../../../types/lanBasic';
import { getLanBasic, updateLanBasic } from '../../../services/api/lanBasic';
import { ActionButtons, BaseSwitch, BaseTable, BaseToast } from '../../../components/common';
import { useAutoDismiss } from '../../../composables/useAutoDismiss';
import { useQA } from '../../../utils/qa';
import IPChangeRedirect from '../../../components/IPChangeRedirect.vue';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const lanData = ref<LanBasicResponse | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const successMessage = ref('');
const errorToastMessage = ref('');
const { visible: showSuccessToast, show: triggerSuccessToast } = useAutoDismiss();
const { visible: showErrorToast, show: triggerErrorToast } = useAutoDismiss();
const editingIndex = ref<number | null>(null);
const originalIPAddress = ref<string>('');
const showRedirectDialog = ref(false);
const newIPAddress = ref<string>('');

// Local state for IP Address Reservation
const reservations = ref<IPAddressReservation[]>([]);
const tempReservation = ref<IPAddressReservation>({
  MACAddress: '',
  IPAddress: '',
  Enable: 1
});

const reservationColumns = computed(() => [
  { key: 'MACAddress', label: t('lanBasic.macAddress'), headerDataTestid: qa('ipv4-configuration-reservation-header-mac') },
  { key: 'IPAddress', label: t('lanBasic.ipAddress'), headerDataTestid: qa('ipv4-configuration-reservation-header-ip') },
  { key: 'Enable', label: t('lanBasic.enable'), headerDataTestid: qa('ipv4-configuration-reservation-header-enable') },
  { key: 'actions', label: t('lanBasic.action'), headerDataTestid: qa('ipv4-configuration-reservation-header-action') },
]);

const showIPv4Settings = computed(() => lanData.value?.LanBasic.LANIPSetting.IPv4Enable === 1);
const showIPv4StaticFields = computed(() =>
  showIPv4Settings.value && lanData.value?.LanBasic.LANIPSetting.IPv4Protocol === 'Static'
);
const ipv4ProtocolOptions = computed(() => lanData.value?.LanBasic.LANIPSetting.ListIPv4Protocol ?? ['DHCP', 'Static']);
const showIPv6Settings = computed(() => lanData.value?.LanBasic.LANIPSetting.IPv6Enable === 1);
const showIPv6AddressField = computed(() =>
  showIPv6Settings.value && lanData.value?.LanBasic.LANIPSetting.IPv6Protocol === 'Static'
);
const showIPv6PrefixField = computed(() =>
  showIPv6Settings.value && lanData.value?.LanBasic.LANIPSetting.IPv6PrefixProtocol === 'Static'
);
const ipv6ProtocolOptions = computed(() => lanData.value?.LanBasic.LANIPSetting.ListIPv6Protocol ?? ['AutoConfigured', 'Static']);
const ipv6PrefixProtocolOptions = computed(() => lanData.value?.LanBasic.LANIPSetting.ListIPv6PrefixProtocol ?? ['AutoConfigured', 'Static']);
const dnsOriginOptions = computed(() => lanData.value?.LanBasic.DHCPv4Setting.ListDNSServersOrigin ?? ['Static']);
const showDnsServersInput = computed(() => lanData.value?.LanBasic.DHCPv4Setting.DNSServersOrigin === 'Static');
const protocolLabelMap: Record<string, string> = {
  DHCP: 'lanBasic.protocolDhcp',
  Static: 'lanBasic.protocolStatic',
  AutoConfigured: 'lanBasic.protocolAutoConfigured',
  DHCPv6: 'lanBasic.protocolDhcpv6',
};

const getProtocolLabel = (protocol: string): string => {
  const key = protocolLabelMap[protocol];
  return key ? t(key) : protocol;
};

// Validation functions
const isValidIPv4 = (ip: string): boolean => {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Regex.test(ip)) return false;

  const parts = ip.split('.');
  return parts.every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
};

/**
 * Check if an IP address is a reasonable DNS server address.
 * Rejects broadcast, loopback, 0.x.x.x, and 255.x.x.x addresses.
 */
const isValidDnsAddress = (ip: string): boolean => {
  if (!isValidIPv4(ip)) return false;
  const parts = ip.split('.').map(p => parseInt(p, 10));
  // Reject 0.0.0.0
  if (parts.every(p => p === 0)) return false;
  // Reject 255.255.255.255 (broadcast)
  if (parts.every(p => p === 255)) return false;
  // Reject 127.x.x.x (loopback)
  if (parts[0] === 127) return false;
  // Reject first octet 0 or 255
  if (parts[0] === 0 || parts[0] === 255) return false;
  return true;
};

const isPrivateIPv4 = (ip: string): boolean => {
  if (!isValidIPv4(ip)) return false;
  const parts = ip.split('.').map(p => parseInt(p, 10));
  // Class A: 10.0.0.0 – 10.255.255.255
  if (parts[0] === 10) return true;
  // Class B: 172.16.0.0 – 172.31.255.255
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  // Class C: 192.168.0.0 – 192.168.255.255
  if (parts[0] === 192 && parts[1] === 168) return true;
  return false;
};

const isValidSubnetMask = (mask: string): boolean => {
  const maskRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!maskRegex.test(mask)) return false;

  const parts = mask.split('.').map(part => parseInt(part, 10));
  let binary = '';
  parts.forEach(num => {
    binary += num.toString(2).padStart(8, '0');
  });

  // Valid subnet masks should have continuous 1s followed by continuous 0s
  return /^1+0*$/.test(binary);
};

const isReasonableSubnetMask = (ip: string, mask: string): boolean => {
  if (!isValidIPv4(ip) || !isValidSubnetMask(mask)) return false;

  const ipParts = ip.split('.').map(part => parseInt(part, 10));
  const maskParts = mask.split('.').map(part => parseInt(part, 10));

  // Get the network prefix length (number of 1 bits in mask)
  let prefixLength = 0;
  maskParts.forEach(octet => {
    let bits = octet.toString(2).padStart(8, '0');
    prefixLength += bits.split('1').length - 1;
  });

  // Check for private IP ranges and enforce reasonable masks
  // Class A private: 10.0.0.0/8 (mask should be >= /8, i.e., 255.0.0.0 or smaller subnet)
  // Class B private: 172.16.0.0/12 (mask should be >= /12, i.e., 255.240.0.0 or smaller subnet)
  // Class C private: 192.168.0.0/16 (mask should be >= /16, i.e., 255.255.0.0 or smaller subnet)

  // For private Class C (192.168.x.x), mask should be at least /16 (255.255.0.0)
  if (ipParts[0] === 192 && ipParts[1] === 168) {
    if (prefixLength < 16) {
      return false; // Mask like 255.0.0.0 is unreasonable for 192.168.x.x
    }
  }

  // For private Class B (172.16.x.x - 172.31.x.x), mask should be at least /12 (255.240.0.0)
  if (ipParts[0] === 172 && ipParts[1] >= 16 && ipParts[1] <= 31) {
    if (prefixLength < 12) {
      return false; // Mask like 255.0.0.0 is unreasonable for 172.16-31.x.x
    }
  }

  // For private Class A (10.x.x.x), mask should be at least /8 (255.0.0.0)
  if (ipParts[0] === 10) {
    if (prefixLength < 8) {
      return false; // Unreasonable mask for 10.x.x.x
    }
  }

  // For typical LAN usage, mask should not be smaller than /8
  if (prefixLength < 8) {
    return false;
  }

  // For typical LAN usage, mask should not be larger than /30 (point-to-point would be /31 or /32)
  if (prefixLength > 29) {
    return false; // /30 or smaller doesn't make sense for LAN with DHCP
  }

  return true;
};

const isValidMACAddress = (mac: string): boolean => {
  return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(mac);
};

const isIPInRange = (ip: string, beginIp: string, endIp: string): boolean => {
  const ipToNumber = (ip: string): number => {
    const parts = ip.split('.').map(part => parseInt(part, 10));
    return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
  };

  const ipNum = ipToNumber(ip);
  const beginNum = ipToNumber(beginIp);
  const endNum = ipToNumber(endIp);

  return ipNum >= beginNum && ipNum <= endNum;
};

const validateIPInput = (ip: string): string => {
  if (!ip) return '';
  const parts = ip.split('.');
  return parts.map(part => {
    const num = parseInt(part, 10);
    if (isNaN(num)) return '0';
    return Math.min(255, Math.max(0, num)).toString();
  }).join('.');
};

const fetchLanBasic = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getLanBasic();
    lanData.value = response;
    reservations.value = [...response.LanBasic.IPAddressReservation];
    originalIPAddress.value = response.LanBasic.LANIPSetting.IPv4IPAddress;
  } catch (err) {
    console.error('Error fetching LAN basic:', err);
    error.value = 'Failed to fetch LAN settings';
  } finally {
    loading.value = false;
  }
};

const showSuccessMessage = (message = `${t('common.apply')} successful`) => {
  successMessage.value = message;
  triggerSuccessToast();
};

const showErrorMessage = (message: string) => {
  errorToastMessage.value = message;
  triggerErrorToast();
};

const handleAddReservation = () => {
  reservations.value.push({
    MACAddress: '',
    IPAddress: '',
    Enable: 1
  });
  editingIndex.value = reservations.value.length - 1;
};

const validateReservation = (reservation: IPAddressReservation): boolean => {
  if (!isValidMACAddress(reservation.MACAddress)) {
    showErrorMessage('Invalid MAC address format');
    return false;
  }

  if (!isValidIPv4(reservation.IPAddress)) {
    showErrorMessage('Invalid IP address format');
    return false;
  }

  if (lanData.value && lanData.value.LanBasic.DHCPv4Setting.Enable) {
    const { BeginAddress, EndAddress } = lanData.value.LanBasic.DHCPv4Setting;
    if (!isIPInRange(reservation.IPAddress, BeginAddress, EndAddress)) {
      showErrorMessage('Reserved IP must be within DHCP range');
      return false;
    }
  }

  return true;
};

const handleConfirmReservation = (index: number) => {
  const reservation = reservations.value[index];
  if (!validateReservation(reservation)) {
    return;
  }
  editingIndex.value = null;
};

const handleCancelReservation = (index: number) => {
  if (reservations.value[index].MACAddress === '' && reservations.value[index].IPAddress === '') {
    reservations.value.splice(index, 1);
  }
  editingIndex.value = null;
};

const handleEditReservation = (index: number) => {
  editingIndex.value = index;
  tempReservation.value = { ...reservations.value[index] };
};

const handleDeleteReservation = (index: number) => {
  reservations.value.splice(index, 1);
  editingIndex.value = null;
};

const validateLANSettings = (): boolean => {
  if (!lanData.value) return false;

  const { LANIPSetting, DHCPv4Setting } = lanData.value.LanBasic;
  const isIPv4Static = LANIPSetting.IPv4Enable === 1 && LANIPSetting.IPv4Protocol === 'Static';

  // Validate LAN IP
  if (isIPv4Static && !isValidIPv4(LANIPSetting.IPv4IPAddress)) {
    showErrorMessage(t('lanBasic.invalidLanIP'));
    return false;
  }

  // Validate LAN IP is within private IPv4 ranges (RFC 1918)
  if (isIPv4Static && !isPrivateIPv4(LANIPSetting.IPv4IPAddress)) {
    showErrorMessage(t('lanBasic.invalidPrivateIp'));
    return false;
  }

  if (isIPv4Static && !isValidSubnetMask(LANIPSetting.SubnetMask)) {
    showErrorMessage(t('lanBasic.invalidSubnetMask'));
    return false;
  }

  // Check if subnet mask is reasonable for the given IP address
  if (isIPv4Static && !isReasonableSubnetMask(LANIPSetting.IPv4IPAddress, LANIPSetting.SubnetMask)) {
    const ipParts = LANIPSetting.IPv4IPAddress.split('.').map(p => parseInt(p, 10));
    let suggestion = '255.255.255.0'; // Default suggestion

    if (ipParts[0] === 192 && ipParts[1] === 168) {
      suggestion = '255.255.255.0'; // Class C
    } else if (ipParts[0] === 172 && ipParts[1] >= 16 && ipParts[1] <= 31) {
      suggestion = '255.255.0.0'; // Class B
    } else if (ipParts[0] === 10) {
      suggestion = '255.255.255.0'; // Class A but suggest Class C for typical usage
    }

    showErrorMessage(t('lanBasic.unreasonableSubnetMask', {
      ip: LANIPSetting.IPv4IPAddress,
      mask: LANIPSetting.SubnetMask,
      suggestion
    }));
    return false;
  }

  // Validate DHCP settings if enabled
  if (DHCPv4Setting.Enable) {
    // Validate Lease Time is a positive integer
    if (!DHCPv4Setting.LeaseTime || DHCPv4Setting.LeaseTime < 1 || DHCPv4Setting.LeaseTime > 604800) {
      showErrorMessage(t('lanBasic.invalidLeaseTime'));
      return false;
    }

    if (!isValidIPv4(DHCPv4Setting.BeginAddress)) {
      showErrorMessage('Invalid DHCP start address');
      return false;
    }

    if (!isValidIPv4(DHCPv4Setting.EndAddress)) {
      showErrorMessage('Invalid DHCP end address');
      return false;
    }

    if (!isValidSubnetMask(DHCPv4Setting.SubnetMask)) {
      showErrorMessage('Invalid DHCP subnet mask');
      return false;
    }

    if (isIPv4Static) {
      // Validate DHCP range is within LAN subnet for static IPv4 mode
      const ipToNumber = (ip: string): number => {
        const parts = ip.split('.').map(part => parseInt(part, 10));
        return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
      };

      const maskToNumber = (mask: string): number => {
        const parts = mask.split('.').map(part => parseInt(part, 10));
        return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
      };

      const lanIp = ipToNumber(LANIPSetting.IPv4IPAddress);
      const lanMask = maskToNumber(LANIPSetting.SubnetMask);
      const beginIp = ipToNumber(DHCPv4Setting.BeginAddress);
      const endIp = ipToNumber(DHCPv4Setting.EndAddress);
      const networkAddr = lanIp & lanMask;
      const broadcastAddr = networkAddr | (~lanMask >>> 0);

      if (beginIp < networkAddr || beginIp > broadcastAddr) {
        showErrorMessage('DHCP start address must be within LAN subnet');
        return false;
      }

      if (endIp < networkAddr || endIp > broadcastAddr) {
        showErrorMessage('DHCP end address must be within LAN subnet');
        return false;
      }

      if (beginIp >= endIp) {
        showErrorMessage('DHCP start address must be lower than end address');
        return false;
      }
    }

    // Validate DNS servers if provided and origin is Static
    if (DHCPv4Setting.DNSServersOrigin === 'Static' && DHCPv4Setting.DNSServers) {
      const dnsEntries = DHCPv4Setting.DNSServers.split(',').map(ip => ip.trim()).filter(ip => ip);
      if (dnsEntries.length > 4) {
        showErrorMessage(t('lanBasic.dnsServersTooMany'));
        return false;
      }
      if (!dnsEntries.every(ip => isValidDnsAddress(ip))) {
        showErrorMessage(t('lanBasic.dnsServersInvalid'));
        return false;
      }
    }
  }

  return true;
};

const handleApply = async () => {
  if (!lanData.value) return;

  if (!validateLANSettings()) {
    return;
  }

  const currentIP = lanData.value.LanBasic.LANIPSetting.IPv4IPAddress;
  const ipChanged = currentIP !== originalIPAddress.value;

  if (ipChanged) {
      newIPAddress.value = currentIP;
      showRedirectDialog.value = true;
  }
  
  loading.value = true;
  try {
    await updateLanBasic({
      LanBasic: {
        LANIPSetting: lanData.value.LanBasic.LANIPSetting,
        DHCPv4Setting: {
          ...lanData.value.LanBasic.DHCPv4Setting,
          LeaseTime: lanData.value.LanBasic.DHCPv4Setting.LeaseTime
        },
        IPAddressReservation: reservations.value
      }
    });

    showSuccessMessage(t('lanBasic.applySuccess'));
    await fetchLanBasic();

  } catch (err) {
    console.error('Error updating LAN settings:', err);
    showErrorMessage('Failed to update LAN settings');
  } finally {
    loading.value = false;
  }
};

const handleRedirect = () => {
  const protocol = window.location.protocol;
  const port = window.location.port ? `:${window.location.port}` : '';
  const newURL = `${protocol}//${newIPAddress.value}${port}${window.location.pathname}`;
  window.location.href = newURL;
};

const autoAdjustDHCPRange = (oldLanIP?: string) => {
  if (!lanData.value) return;

  const { LANIPSetting, DHCPv4Setting } = lanData.value.LanBasic;

  // Only auto-adjust if DHCP is enabled and IPv4 is static
  if (!DHCPv4Setting.Enable || LANIPSetting.IPv4Enable !== 1 || LANIPSetting.IPv4Protocol !== 'Static') {
    return;
  }

  const newLanIP = LANIPSetting.IPv4IPAddress;
  const mask = LANIPSetting.SubnetMask;

  if (!isValidIPv4(newLanIP) || !isValidSubnetMask(mask)) {
    return;
  }

  // Calculate network address and range
  const ipParts = newLanIP.split('.').map(p => parseInt(p, 10));
  const maskParts = mask.split('.').map(p => parseInt(p, 10));

  // Calculate network address
  const networkParts = ipParts.map((part, i) => part & maskParts[i]);

  // Calculate broadcast address
  const broadcastParts = networkParts.map((part, i) => part | (~maskParts[i] & 255));

  // Calculate usable IP range (excluding network address, LAN IP, and broadcast)
  // Strategy: Use .2 to (broadcast - 10) to leave room for static IPs
  const beginParts = [...networkParts];
  const endParts = [...broadcastParts];

  // First usable IP (skip network address)
  beginParts[3] = networkParts[3] + 2;

  // Last usable IP (reserve last 10 IPs for static assignments)
  endParts[3] = broadcastParts[3] - 10;

  // Ensure we don't include the LAN IP in DHCP range
  const lanLastOctet = ipParts[3];
  if (beginParts[3] === lanLastOctet) {
    beginParts[3]++;
  }
  if (endParts[3] === lanLastOctet) {
    endParts[3]--;
  }

  // Validate range is reasonable (at least 10 IPs)
  const rangeSize = endParts[3] - beginParts[3] + 1;
  if (rangeSize < 10) {
    // Subnet too small, use minimal range
    beginParts[3] = networkParts[3] + 1;
    endParts[3] = Math.min(broadcastParts[3] - 1, beginParts[3] + 9);
  }

  const newBegin = beginParts.join('.');
  const newEnd = endParts.join('.');

  // Update DHCP range
  DHCPv4Setting.BeginAddress = newBegin;
  DHCPv4Setting.EndAddress = newEnd;
  DHCPv4Setting.SubnetMask = mask;

  // Update DNS Server if it was set to the old LAN IP
  if (oldLanIP && DHCPv4Setting.DNSServers === oldLanIP) {
    DHCPv4Setting.DNSServers = newLanIP;
  }
};

const handleIPInput = (event: Event, field: string) => {
  if (!lanData.value) return;

  const input = event.target as HTMLInputElement;
  const validatedIP = validateIPInput(input.value);

  if (field === 'lanIP') {
    const oldLanIP = lanData.value.LanBasic.LANIPSetting.IPv4IPAddress;
    lanData.value.LanBasic.LANIPSetting.IPv4IPAddress = validatedIP;
    autoAdjustDHCPRange(oldLanIP);
  } else if (field === 'dnsServer') {
    // Allow commas for multiple DNS servers - don't use validateIPInput
    lanData.value.LanBasic.DHCPv4Setting.DNSServers = (event.target as HTMLInputElement).value;
  } else if (field === 'beginAddress') {
    lanData.value.LanBasic.DHCPv4Setting.BeginAddress = validatedIP;
  } else if (field === 'endAddress') {
    lanData.value.LanBasic.DHCPv4Setting.EndAddress = validatedIP;
  }
};

const handleSubnetMaskChange = () => {
  autoAdjustDHCPRange();
};

onMounted(fetchLanBasic);
</script>

<template>
  <div class="ipv4-configuration" :data-testid="qa('ipv4-configuration-content')">
    <div v-if="loading" class="loading-state" :data-testid="qa('ipv4-configuration-loading')">
      <div class="loading-spinner"></div>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="error" class="error-state" :data-testid="qa('ipv4-configuration-error')">
      {{ error }}
    </div>

    <template v-else-if="lanData">
      <!-- LAN IP Setting -->
      <div class="panel-section" :data-testid="qa('ipv4-configuration-lan-ip-section')">
        <div class="section-title" :data-testid="qa('ipv4-configuration-lan-ip-title')">{{ t('lanBasic.lanIpSetting') }}</div>
        <div class="card-content" :data-testid="qa('ipv4-configuration-lan-ip-content')">
          <div class="form-group">
            <div class="switch-label">
              <span :data-testid="qa('ipv4-configuration-lan-ip-enable-label')">{{ t('lanBasic.ipv4Enable') }}</span>
              <BaseSwitch
                v-model="lanData.LanBasic.LANIPSetting.IPv4Enable"
                :true-value="1"
                :false-value="0"
                :data-testid="qa('ipv4-configuration-lan-ip-enable-toggle')"
                :slider-data-testid="qa('ipv4-configuration-lan-ip-enable-slider')"
              />
            </div>
          </div>

          <template v-if="showIPv4Settings">
            <div class="form-group">
              <label :data-testid="qa('ipv4-configuration-lan-ipv4-protocol-label')">{{ t('lanBasic.ipv4Protocol') }}</label>
              <select
                v-model="lanData.LanBasic.LANIPSetting.IPv4Protocol"
                :data-testid="qa('ipv4-configuration-lan-ipv4-protocol-select')"
                class="form-select"
              >
                <option
                  v-for="protocol in ipv4ProtocolOptions"
                  :key="protocol"
                  :value="protocol"
                  :data-testid="qa(`ipv4-configuration-lan-ipv4-protocol-option-${protocol.toLowerCase()}`)"
                >
                  {{ getProtocolLabel(protocol) }}
                </option>
              </select>
            </div>

            <template v-if="showIPv4StaticFields">
              <div class="form-group">
                <label :data-testid="qa('ipv4-configuration-lan-ip-address-label')">{{ t('lanBasic.ipv4Address') }}</label>
                <input
                  type="text"
                  :data-testid="qa('ipv4-configuration-lan-ip-address-input')"
                  :value="lanData.LanBasic.LANIPSetting.IPv4IPAddress"
                  @input="handleIPInput($event, 'lanIP')"
                  placeholder="192.168.1.1"
                />
              </div>

              <div class="form-group">
                <label :data-testid="qa('ipv4-configuration-lan-ip-subnet-mask-label')">{{ t('lanBasic.subnetMask') }}</label>
                <input
                  type="text"
                  :data-testid="qa('ipv4-configuration-lan-ip-subnet-mask-input')"
                  v-model="lanData.LanBasic.LANIPSetting.SubnetMask"
                  @change="handleSubnetMaskChange"
                  placeholder="255.255.255.0"
                />
              </div>
            </template>
          </template>

          <div class="form-group">
            <div class="switch-label">
              <span :data-testid="qa('ipv4-configuration-lan-ipv6-enable-label')">{{ t('lanBasic.ipv6Enable') }}</span>
              <BaseSwitch
                v-model="lanData.LanBasic.LANIPSetting.IPv6Enable"
                :true-value="1"
                :false-value="0"
                :data-testid="qa('ipv4-configuration-lan-ipv6-enable-toggle')"
                :slider-data-testid="qa('ipv4-configuration-lan-ipv6-enable-slider')"
              />
            </div>
          </div>

          <template v-if="showIPv6Settings">
            <div class="form-group">
              <label :data-testid="qa('ipv4-configuration-lan-ipv6-protocol-label')">{{ t('lanBasic.ipv6Protocol') }}</label>
              <select
                v-model="lanData.LanBasic.LANIPSetting.IPv6Protocol"
                :data-testid="qa('ipv4-configuration-lan-ipv6-protocol-select')"
                class="form-select"
              >
                <option
                  v-for="protocol in ipv6ProtocolOptions"
                  :key="protocol"
                  :value="protocol"
                  :data-testid="qa(`ipv4-configuration-lan-ipv6-protocol-option-${protocol.toLowerCase()}`)"
                >
                  {{ getProtocolLabel(protocol) }}
                </option>
              </select>
            </div>

            <div v-if="showIPv6AddressField" class="form-group">
              <label :data-testid="qa('ipv4-configuration-lan-ipv6-address-label')">{{ t('lanBasic.ipv6Address') }}</label>
              <input
                type="text"
                :data-testid="qa('ipv4-configuration-lan-ipv6-address-input')"
                v-model="lanData.LanBasic.LANIPSetting.IPv6Address"
                placeholder=""
              />
            </div>

            <div class="form-group">
              <label :data-testid="qa('ipv4-configuration-lan-ipv6-prefix-protocol-label')">{{ t('lanBasic.ipv6PrefixProtocol') }}</label>
              <select
                v-model="lanData.LanBasic.LANIPSetting.IPv6PrefixProtocol"
                :data-testid="qa('ipv4-configuration-lan-ipv6-prefix-protocol-select')"
                class="form-select"
              >
                <option
                  v-for="protocol in ipv6PrefixProtocolOptions"
                  :key="protocol"
                  :value="protocol"
                  :data-testid="qa(`ipv4-configuration-lan-ipv6-prefix-protocol-option-${protocol.toLowerCase()}`)"
                >
                  {{ getProtocolLabel(protocol) }}
                </option>
              </select>
            </div>

            <div v-if="showIPv6PrefixField" class="form-group">
              <label :data-testid="qa('ipv4-configuration-lan-ipv6-prefix-label')">{{ t('lanBasic.ipv6Prefix') }}</label>
              <input
                type="text"
                :data-testid="qa('ipv4-configuration-lan-ipv6-prefix-input')"
                v-model="lanData.LanBasic.LANIPSetting.IPv6Prefix"
                placeholder=""
              />
            </div>
          </template>
        </div>
      </div>

      <!-- DHCPv4 Setting -->
      <div class="panel-section" :data-testid="qa('ipv4-configuration-dhcp-section')">
        <div class="section-title" :data-testid="qa('ipv4-configuration-dhcp-title')">{{ t('lanBasic.dhcpv4Setting') }}</div>
        <div class="card-content" :data-testid="qa('ipv4-configuration-dhcp-content')">
          <div class="form-group">
            <div class="switch-label">
              <span :data-testid="qa('ipv4-configuration-dhcp-enable-label')">{{ t('lanBasic.enableDhcpServer') }}</span>
              <BaseSwitch
                v-model="lanData.LanBasic.DHCPv4Setting.Enable"
                :true-value="1"
                :false-value="0"
                :data-testid="qa('ipv4-configuration-dhcp-enable-toggle')"
                :slider-data-testid="qa('ipv4-configuration-dhcp-enable-slider')"
              />
            </div>
          </div>

          <div class="form-group">
            <label :data-testid="qa('ipv4-configuration-dhcp-dns-origin-label')">{{ t('lanBasic.dnsServersOrigin') }}</label>
            <select
              v-model="lanData.LanBasic.DHCPv4Setting.DNSServersOrigin"
              :data-testid="qa('ipv4-configuration-dhcp-dns-origin-select')"
              :disabled="!lanData.LanBasic.DHCPv4Setting.Enable"
              class="form-select"
            >
              <option
                v-for="origin in dnsOriginOptions"
                :key="origin"
                :value="origin"
                :data-testid="qa(`ipv4-configuration-dhcp-dns-origin-option-${origin.toLowerCase()}`)"
              >
                {{ origin }}
              </option>
            </select>
          </div>

          <div v-if="showDnsServersInput" class="form-group">
            <label :data-testid="qa('ipv4-configuration-dhcp-dns-server-label')">{{ t('lanBasic.dnsServers') }}</label>
            <input
              type="text"
              :data-testid="qa('ipv4-configuration-dhcp-dns-server-input')"
              :value="lanData.LanBasic.DHCPv4Setting.DNSServers"
              @input="handleIPInput($event, 'dnsServer')"
              :disabled="!lanData.LanBasic.DHCPv4Setting.Enable"
              placeholder="192.168.1.1, 8.8.8.8"
            />
            <span class="field-hint">{{ t('lanBasic.dnsServersHint') }}</span>
          </div>

          <div class="form-group">
            <label :data-testid="qa('ipv4-configuration-dhcp-begin-address-label')">{{ t('lanBasic.beginAddress') }}</label>
            <input
              type="text"
              :data-testid="qa('ipv4-configuration-dhcp-begin-address-input')"
              :value="lanData.LanBasic.DHCPv4Setting.BeginAddress"
              @input="handleIPInput($event, 'beginAddress')"
              :disabled="!lanData.LanBasic.DHCPv4Setting.Enable"
              placeholder="192.168.1.2"
            />
          </div>

          <div class="form-group">
            <label :data-testid="qa('ipv4-configuration-dhcp-end-address-label')">{{ t('lanBasic.endAddress') }}</label>
            <input
              type="text"
              :data-testid="qa('ipv4-configuration-dhcp-end-address-input')"
              :value="lanData.LanBasic.DHCPv4Setting.EndAddress"
              @input="handleIPInput($event, 'endAddress')"
              :disabled="!lanData.LanBasic.DHCPv4Setting.Enable"
              placeholder="192.168.1.254"
            />
          </div>

          <div class="form-group">
            <label :data-testid="qa('ipv4-configuration-dhcp-subnet-mask-label')">{{ t('lanBasic.subnetMask') }}</label>
            <input
              type="text"
              :data-testid="qa('ipv4-configuration-dhcp-subnet-mask-input')"
              v-model="lanData.LanBasic.DHCPv4Setting.SubnetMask"
              :disabled="!lanData.LanBasic.DHCPv4Setting.Enable"
              placeholder="255.255.255.0"
            />
          </div>

          <div class="form-group">
            <label :data-testid="qa('ipv4-configuration-dhcp-lease-time-label')">{{ t('lanBasic.leaseTime') }}</label>
            <div class="input-with-unit" :data-testid="qa('ipv4-configuration-dhcp-lease-time-container')">
              <input
                type="number"
                :data-testid="qa('ipv4-configuration-dhcp-lease-time-input')"
                v-model="lanData.LanBasic.DHCPv4Setting.LeaseTime"
                :disabled="!lanData.LanBasic.DHCPv4Setting.Enable"
                min="1"
                max="604800"
              />
              <span class="unit" :data-testid="qa('ipv4-configuration-dhcp-lease-time-unit')">{{ t('lanBasic.seconds') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- IP Address Reservation -->
      <div class="panel-section" :data-testid="qa('ipv4-configuration-reservation-section')">
        <div class="header-row">
          <div class="section-title-sp" :data-testid="qa('ipv4-configuration-reservation-title')">{{ t('lanBasic.ipAddressReservation') }}</div>
          <button class="btn btn-primary" :data-testid="qa('ipv4-configuration-reservation-add-button')" @click="handleAddReservation">
            <span class="material-icons">add</span>
            {{ t('lanBasic.add') }}
          </button>
        </div>

        <div class="card-content" :data-testid="qa('ipv4-configuration-reservation-content')">
          <BaseTable
            :columns="reservationColumns"
            :data="reservations"
            :table-data-testid="qa('ipv4-configuration-reservation-table-container')"
            :mobile-data-testid="qa('ipv4-configuration-reservation-mobile')"
          >
            <template #cell-MACAddress="{ row, index, mobile }">
              <input
                v-if="editingIndex === index"
                type="text"
                :data-testid="qa(mobile ? `ipv4-configuration-reservation-card-mac-input-${index}` : `ipv4-configuration-reservation-mac-input-${index}`)"
                v-model="row.MACAddress"
                placeholder="00:11:22:33:44:55"
              />
              <span v-else :data-testid="qa(mobile ? `ipv4-configuration-reservation-card-mac-value-${index}` : `ipv4-configuration-reservation-mac-value-${index}`)">
                {{ row.MACAddress }}
              </span>
            </template>
            <template #cell-IPAddress="{ row, index, mobile }">
              <input
                v-if="editingIndex === index"
                type="text"
                :data-testid="qa(mobile ? `ipv4-configuration-reservation-card-ip-input-${index}` : `ipv4-configuration-reservation-ip-input-${index}`)"
                v-model="row.IPAddress"
                placeholder="192.168.1.100"
              />
              <span v-else :data-testid="qa(mobile ? `ipv4-configuration-reservation-card-ip-value-${index}` : `ipv4-configuration-reservation-ip-value-${index}`)">
                {{ row.IPAddress }}
              </span>
            </template>
            <template #cell-Enable="{ row, index, mobile }">
              <div class="switch-label" :data-testid="qa(mobile ? `ipv4-configuration-reservation-card-enable-container-${index}` : `ipv4-configuration-reservation-enable-container-${index}`)">
                <BaseSwitch
                  v-model="row.Enable"
                  :true-value="1"
                  :false-value="0"
                  :data-testid="qa(mobile ? `ipv4-configuration-reservation-card-enable-toggle-${index}` : `ipv4-configuration-reservation-enable-toggle-${index}`)"
                  :slider-data-testid="qa(mobile ? `ipv4-configuration-reservation-card-enable-slider-${index}` : `ipv4-configuration-reservation-enable-slider-${index}`)"
                />
              </div>
            </template>
            <template #cell-actions="{ index, mobile }">
              <div class="action-buttons" :data-testid="qa(mobile ? `ipv4-configuration-reservation-card-actions-${index}` : `ipv4-configuration-reservation-actions-${index}`)">
                <template v-if="editingIndex === index">
                  <button class="btn-action" :data-testid="qa(mobile ? `ipv4-configuration-reservation-card-confirm-${index}` : `ipv4-configuration-reservation-confirm-${index}`)" @click="handleConfirmReservation(index)">
                    <span class="material-icons">check</span>
                  </button>
                  <button class="btn-action" :data-testid="qa(mobile ? `ipv4-configuration-reservation-card-cancel-${index}` : `ipv4-configuration-reservation-cancel-${index}`)" @click="handleCancelReservation(index)">
                    <span class="material-icons">close</span>
                  </button>
                </template>
                <template v-else>
                  <button class="btn-action" :data-testid="qa(mobile ? `ipv4-configuration-reservation-card-edit-${index}` : `ipv4-configuration-reservation-edit-${index}`)" @click="handleEditReservation(index)">
                    <span class="material-icons">edit</span>
                  </button>
                  <button class="btn-action" :data-testid="qa(mobile ? `ipv4-configuration-reservation-card-delete-${index}` : `ipv4-configuration-reservation-delete-${index}`)" @click="handleDeleteReservation(index)">
                    <span class="material-icons">delete</span>
                  </button>
                </template>
              </div>
            </template>
          </BaseTable>
        </div>
      </div>

      <div class="button-group">
        <ActionButtons
          :cancel-text="t('lanBasic.cancel')"
          :apply-text="t('lanBasic.apply')"
          :cancel-data-testid="qa('ipv4-configuration-cancel-button')"
          :apply-data-testid="qa('ipv4-configuration-apply-button')"
          @cancel="fetchLanBasic"
          @apply="handleApply"
        />
      </div>
    </template>

    <BaseToast
      v-model="showSuccessToast"
      :message="successMessage"
      type="success"
      :data-testid="qa('ipv4-configuration-success-toast')"
    />
    <BaseToast
      v-model="showErrorToast"
      :message="errorToastMessage"
      type="error"
      :data-testid="qa('ipv4-configuration-error-toast')"
    />

    <IPChangeRedirect
      :is-visible="showRedirectDialog"
      :new-i-p="newIPAddress"
      :duration="15"
      @redirect="handleRedirect"
    />
  </div>
</template>

<style scoped>
.ipv4-configuration {
  padding: 1.5rem;
}

.panel-section {
  background-color: white;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.2);
}

.section-title {
  padding: 1rem 1.5rem;
  font-size: 1rem;
  color: var(--text-primary);
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.section-title-sp {
  font-size: 1rem;
  color: var(--text-primary);
  padding: 0.5rem 0;
}

.card-content {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.field-hint {
  font-size: 12px;
  color: var(--text-secondary, #6b7280);
  margin-top: 2px;
}

.input-with-unit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.unit {
  color: var(--text-secondary);
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}

.form-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: white;
}

input:disabled {
  background-color: var(--bg-secondary);
  cursor: not-allowed;
}

.form-select:disabled {
  background-color: var(--bg-secondary);
  cursor: not-allowed;
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

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 1.5rem;
  background-color: white;
  border-bottom: 1px solid var(--border-color);
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

:deep(.table-container table th:last-child),
:deep(.table-container table td:last-child) {
  width: 5.5rem;
  text-align: center;
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 4px;
}

.btn-action:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.success-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #4caf50;
  color: white;
  padding: 1rem 2rem;
  border-radius: 4px;
  animation: fadeInOut 3s ease-in-out;
  z-index: 100;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  background-color: white;
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
}

.error-state {
  padding: 2rem;
  text-align: center;
  color: #dc3545;
  background-color: white;
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
}

@media (max-width: 768px) {
  .ipv4-configuration {
    padding: 1rem;
  }

  .header-row {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .button-group {
    flex-direction: column;
  }

  .button-group :deep(.btn) {
    width: 100%;
  }
}
</style>
