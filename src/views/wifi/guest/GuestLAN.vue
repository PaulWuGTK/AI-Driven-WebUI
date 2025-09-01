<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { GuestLANResponse } from '../../../types/guest';
import { getGuestLAN, updateGuestLAN } from '../../../services/api/guestAccess';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const guestLANData = ref<GuestLANResponse | null>(null);
const loading = ref(false);
const showSuccess = ref(false);
const error = ref<string | null>(null);

const fetchGuestLAN = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getGuestLAN();
    guestLANData.value = response;
  } catch (err) {
    console.error('Error fetching Guest LAN settings:', err);
    error.value = 'Failed to fetch Guest LAN settings';
  } finally {
    loading.value = false;
  }
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

const validateIPInput = (ip: string): string => {
  if (!ip) return '';
  const parts = ip.split('.');
  return parts.map(part => {
    const num = parseInt(part, 10);
    if (isNaN(num)) return '0';
    return Math.min(255, Math.max(0, num)).toString();
  }).join('.');
};

const validateLeaseTime = (time: number): number => {
  if (isNaN(time)) return 43200; // Default to 12 hours
  return Math.max(300, Math.min(604800, time)); // Between 5 minutes and 7 days
};

const validateLANSettings = (): boolean => {
  if (!guestLANData.value) return false;

  const { GUESTIPSetting, DHCPv4Setting } = guestLANData.value.GuestLAN;

  // Validate LAN IP
  if (!isValidIPv4(GUESTIPSetting.IPAddress)) {
    error.value = 'Invalid LAN IP address format';
    return false;
  }

  if (!isValidSubnetMask(GUESTIPSetting.SubnetMask)) {
    error.value = 'Invalid subnet mask format';
    return false;
  }

  // Validate DHCP settings if enabled
  if (DHCPv4Setting.Enable) {
    if (!isValidIPv4(DHCPv4Setting.BeginAddress)) {
      error.value = 'Invalid DHCP start address';
      return false;
    }

    if (!isValidIPv4(DHCPv4Setting.EndAddress)) {
      error.value = 'Invalid DHCP end address';
      return false;
    }

    if (!isValidSubnetMask(DHCPv4Setting.SubnetMask)) {
      error.value = 'Invalid DHCP subnet mask';
      return false;
    }

    // Validate DHCP range is within LAN subnet
    const ipToNumber = (ip: string): number => {
      const parts = ip.split('.').map(part => parseInt(part, 10));
      return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
    };

    const maskToNumber = (mask: string): number => {
      const parts = mask.split('.').map(part => parseInt(part, 10));
      return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
    };

    const lanIp = ipToNumber(GUESTIPSetting.IPAddress);
    const lanMask = maskToNumber(GUESTIPSetting.SubnetMask);
    const beginIp = ipToNumber(DHCPv4Setting.BeginAddress);
    const endIp = ipToNumber(DHCPv4Setting.EndAddress);
    const networkAddr = lanIp & lanMask;
    const broadcastAddr = networkAddr | (~lanMask >>> 0);

    if (beginIp < networkAddr || beginIp > broadcastAddr) {
      error.value = 'DHCP start address must be within LAN subnet';
      return false;
    }

    if (endIp < networkAddr || endIp > broadcastAddr) {
      error.value = 'DHCP end address must be within LAN subnet';
      return false;
    }

    if (beginIp >= endIp) {
      error.value = 'DHCP start address must be lower than end address';
      return false;
    }

    // Validate DNS server if provided
    if (DHCPv4Setting.DNSServers && !DHCPv4Setting.DNSServers.split(',').every(ip => isValidIPv4(ip.trim()))) {
      error.value = 'Invalid DNS server address';
      return false;
    }
  }

  return true;
};

const showSuccessMessage = () => {
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
  }, 3000);
};

const handleSubmit = async () => {
  if (!guestLANData.value) return;
  
  error.value = null;
  if (!validateLANSettings()) {
    return;
  }

  loading.value = true;
  try {
    const leaseTime = typeof guestLANData.value.GuestLAN.DHCPv4Setting.LeaseTime === 'string' 
      ? parseInt(guestLANData.value.GuestLAN.DHCPv4Setting.LeaseTime, 10) 
      : guestLANData.value.GuestLAN.DHCPv4Setting.LeaseTime;

    await updateGuestLAN({
      GuestLAN: {
        GUESTIPSetting: guestLANData.value.GuestLAN.GUESTIPSetting,
        DHCPv4Setting: {
          ...guestLANData.value.GuestLAN.DHCPv4Setting,
          LeaseTime: validateLeaseTime(leaseTime)
        }
      }
    });
    showSuccessMessage();
    await fetchGuestLAN();
  } catch (err) {
    console.error('Error updating Guest LAN settings:', err);
    error.value = 'Failed to update Guest LAN settings';
  } finally {
    loading.value = false;
  }
};

const handleIPInput = (event: Event, field: string) => {
  if (!guestLANData.value) return;
  
  const input = event.target as HTMLInputElement;
  const validatedIP = validateIPInput(input.value);
  
  if (field === 'lanIP') {
    guestLANData.value.GuestLAN.GUESTIPSetting.IPAddress = validatedIP;
  } else if (field === 'dnsServer') {
    guestLANData.value.GuestLAN.DHCPv4Setting.DNSServers = validatedIP;
  } else if (field === 'beginAddress') {
    guestLANData.value.GuestLAN.DHCPv4Setting.BeginAddress = validatedIP;
  } else if (field === 'endAddress') {
    guestLANData.value.GuestLAN.DHCPv4Setting.EndAddress = validatedIP;
  }
};

onMounted(fetchGuestLAN);
</script>

<template>
  <div class="guest-lan" :data-testid="qa('guest-lan-content')">
    <div v-if="loading && !guestLANData" class="loading-state" :data-testid="qa('guest-lan-loading')">
      <div class="loading-spinner"></div>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="error" class="error-state" :data-testid="qa('guest-lan-error')">
      {{ error }}
    </div>

    <form v-else-if="guestLANData" @submit.prevent="handleSubmit" :data-testid="qa('guest-lan-form')">
      <!-- LAN IP Setting -->
      <div class="panel-section" :data-testid="qa('guest-lan-ip-section')">
        <div class="section-title" :data-testid="qa('guest-lan-ip-title')">{{ t('guest.lanIpSetting') }}</div>
        <div class="card-content">
          <div class="form-group">
            <div class="switch-label">
              <span :data-testid="qa('guest-lan-ip-enable-label')">{{ t('guest.enable') }}</span>
              <label class="switch">
                <input
                  type="checkbox"
                  :data-testid="qa('guest-lan-ip-enable-toggle')"
                  v-model="guestLANData.GuestLAN.GUESTIPSetting.Enable"
                  :true-value="1"
                  :false-value="0"
                >
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label :data-testid="qa('guest-lan-ip-address-label')">{{ t('guest.ipAddress') }}</label>
            <input
              type="text"
              :data-testid="qa('guest-lan-ip-address-input')"
              :value="guestLANData.GuestLAN.GUESTIPSetting.IPAddress"
              @input="handleIPInput($event, 'lanIP')"
              :disabled="!guestLANData.GuestLAN.GUESTIPSetting.Enable"
              placeholder="192.168.2.1"
            />
          </div>

          <div class="form-group">
            <label :data-testid="qa('guest-lan-subnet-mask-label')">{{ t('guest.subnetMask') }}</label>
            <input
              type="text"
              :data-testid="qa('guest-lan-subnet-mask-input')"
              v-model="guestLANData.GuestLAN.GUESTIPSetting.SubnetMask"
              :disabled="!guestLANData.GuestLAN.GUESTIPSetting.Enable"
              placeholder="255.255.255.0"
            />
          </div>
        </div>
      </div>

      <!-- DHCPv4 Setting -->
      <div class="panel-section" :data-testid="qa('guest-lan-dhcp-section')">
        <div class="section-title" :data-testid="qa('guest-lan-dhcp-title')">{{ t('guest.dhcpSetting') }}</div>
        <div class="card-content">
          <div class="form-group">
            <div class="switch-label">
              <span :data-testid="qa('guest-lan-dhcp-enable-label')">{{ t('guest.enableDhcpServer') }}</span>
              <label class="switch">
                <input
                  type="checkbox"
                  :data-testid="qa('guest-lan-dhcp-enable-toggle')"
                  v-model="guestLANData.GuestLAN.DHCPv4Setting.Enable"
                  :true-value="1"
                  :false-value="0"
                >
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label :data-testid="qa('guest-lan-dns-server-label')">{{ t('guest.dnsServer') }}</label>
            <input
              type="text"
              :data-testid="qa('guest-lan-dns-server-input')"
              :value="guestLANData.GuestLAN.DHCPv4Setting.DNSServers"
              @input="handleIPInput($event, 'dnsServer')"
              :disabled="!guestLANData.GuestLAN.DHCPv4Setting.Enable"
              placeholder="192.168.2.1"
            />
          </div>

          <div class="form-group">
            <label :data-testid="qa('guest-lan-begin-address-label')">{{ t('guest.beginAddress') }}</label>
            <input
              type="text"
              :data-testid="qa('guest-lan-begin-address-input')"
              :value="guestLANData.GuestLAN.DHCPv4Setting.BeginAddress"
              @input="handleIPInput($event, 'beginAddress')"
              :disabled="!guestLANData.GuestLAN.DHCPv4Setting.Enable"
              placeholder="192.168.2.2"
            />
          </div>

          <div class="form-group">
            <label :data-testid="qa('guest-lan-end-address-label')">{{ t('guest.endAddress') }}</label>
            <input
              type="text"
              :data-testid="qa('guest-lan-end-address-input')"
              :value="guestLANData.GuestLAN.DHCPv4Setting.EndAddress"
              @input="handleIPInput($event, 'endAddress')"
              :disabled="!guestLANData.GuestLAN.DHCPv4Setting.Enable"
              placeholder="192.168.2.254"
            />
          </div>

          <div class="form-group">
            <label :data-testid="qa('guest-lan-dhcp-subnet-mask-label')">{{ t('guest.subnetMask') }}</label>
            <input
              type="text"
              :data-testid="qa('guest-lan-dhcp-subnet-mask-input')"
              v-model="guestLANData.GuestLAN.DHCPv4Setting.SubnetMask"
              :disabled="!guestLANData.GuestLAN.DHCPv4Setting.Enable"
              placeholder="255.255.255.0"
            />
          </div>

          <div class="form-group">
            <label :data-testid="qa('guest-lan-lease-time-label')">{{ t('guest.leaseTime') }}</label>
            <div class="input-with-unit" :data-testid="qa('guest-lan-lease-time-container')">
              <input
                type="number"
                :data-testid="qa('guest-lan-lease-time-input')"
                v-model="guestLANData.GuestLAN.DHCPv4Setting.LeaseTime"
                :disabled="!guestLANData.GuestLAN.DHCPv4Setting.Enable"
                min="300"
                max="604800"
              />
              <span class="unit" :data-testid="qa('guest-lan-lease-time-unit')">{{ t('guest.seconds') }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="button-group">
        <button 
          type="button" 
          class="btn btn-secondary" 
          :data-testid="qa('guest-lan-cancel-button')"
          @click="fetchGuestLAN"
        >
          {{ t('common.cancel') }}
        </button>
        <button 
          type="submit"
          class="btn btn-primary"
          :data-testid="qa('guest-lan-apply-button')"
        >
          {{ t('common.apply') }}
        </button>
      </div>
    </form>

    <div v-if="showSuccess" class="success-message" :data-testid="qa('guest-lan-success-message')">
      {{ t('common.apply') }} successful
    </div>
  </div>
</template>

<style scoped>
.guest-lan {
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

input:disabled {
  background-color: var(--bg-secondary);
  cursor: not-allowed;
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
  .guest-lan {
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