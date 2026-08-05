<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DmzResponse } from '../../../types/dmz';
import type { DeviceConnected } from '../../../types/lanBasic';
import { getDmz, updateDmz } from '../../../services/api/dmz';
import { getLanBasic, getDeviceConnected } from '../../../services/api/lanBasic';
import { ActionButtons, BaseSwitch } from '../../../components/common';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const dmzData = ref<DmzResponse | null>(null);
const loading = ref(false);
const showSuccess = ref(false);
const error = ref<string | null>(null);
const lanIpAddress = ref<string>('');
const lanSubnetMask = ref<string>('');
const connectedDevices = ref<DeviceConnected[]>([]);
const selectedDevice = ref<string>('');
const toFlag01 = (value: unknown): 0 | 1 => {
  return value === 1 || value === '1' || value === true ? 1 : 0;
};

const fetchDmz = async () => {
  loading.value = true;
  error.value = null;
  try {
    dmzData.value = await getDmz();
  } catch (err) {
    console.error('Error fetching DMZ settings:', err);
    error.value = 'Failed to fetch DMZ settings';
  } finally {
    loading.value = false;
  }
};

const fetchLanInfo = async () => {
  try {
    const lanData = await getLanBasic();
    if (lanData?.LanBasic?.LANIPSetting) {
      lanIpAddress.value = lanData.LanBasic.LANIPSetting.IPv4IPAddress || '';
      lanSubnetMask.value = lanData.LanBasic.LANIPSetting.SubnetMask || '';
    }
  } catch (err) {
    console.error('Error fetching LAN info:', err);
    // Fallback: allow validation to pass if LAN info unavailable
  }
};

const fetchDevices = async () => {
  try {
    const response = await getDeviceConnected();
    connectedDevices.value = response.LanDeviceConnected ?? [];
  } catch (err) {
    console.error('Error fetching connected devices:', err);
  }
};

const handleDeviceSelect = (event: Event) => {
  const ip = (event.target as HTMLSelectElement).value;
  selectedDevice.value = ip;
  if (ip && dmzData.value) {
    dmzData.value.AdvancedDmz.IPAddress = ip;
    handleIPInput();
  }
};

const isValidIPv4 = (ip: string): boolean => {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Regex.test(ip)) return false;

  const parts = ip.split('.');
  if (!parts.every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  })) {
    return false;
  }

  // Reject invalid DMZ addresses
  if (ip === '0.0.0.0') return false;
  if (ip === '255.255.255.255') return false;

  // Reject addresses starting with 0 or 255
  const firstOctet = parseInt(parts[0], 10);
  if (firstOctet === 0 || firstOctet === 255) return false;

  return true;
};

const isInLanSubnet = (dmzIp: string): boolean => {
  if (!lanIpAddress.value || !lanSubnetMask.value) {
    return true; // Fallback: allow if LAN info unavailable
  }

  const ipToNumber = (ip: string): number => {
    const parts = ip.split('.').map(p => parseInt(p, 10));
    return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
  };

  try {
    const dmzIpNum = ipToNumber(dmzIp);
    const lanIpNum = ipToNumber(lanIpAddress.value);
    const maskNum = ipToNumber(lanSubnetMask.value);

    const dmzNetwork = (dmzIpNum & maskNum) >>> 0;
    const lanNetwork = (lanIpNum & maskNum) >>> 0;

    return dmzNetwork === lanNetwork;
  } catch (e) {
    return true; // Fallback: allow if calculation fails
  }
};

const showSuccessMessage = () => {
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
  }, 3000);
};

const handleIPInput = () => {
  // Clear error when user starts editing
  if (error.value) {
    error.value = null;
  }
};

const handleSubmit = async () => {
  if (!dmzData.value) return;

  error.value = null;

  const enabled = toFlag01(dmzData.value.AdvancedDmz.Enable) === 1;
  const ipAddress = dmzData.value.AdvancedDmz.IPAddress.trim();

  if (enabled) {
    if (!ipAddress) {
      error.value = t('dmz.ipRequired');
      return;
    }

    if (!isValidIPv4(ipAddress)) {
      error.value = t('dmz.invalidIpFormat');
      return;
    }

    if (!isInLanSubnet(ipAddress)) {
      error.value = t('dmz.ipNotInLanSubnet');
      return;
    }
  }

  loading.value = true;
  try {
    await updateDmz({
      AdvancedDmz: {
        Enable: toFlag01(dmzData.value.AdvancedDmz.Enable),
        IPAddress: ipAddress || "0.0.0.0"  // Preserve IP, use 0.0.0.0 only if empty
      }
    });
    showSuccessMessage();
    await fetchDmz();
  } catch (err) {
    console.error('Error updating DMZ settings:', err);
    error.value = 'Failed to update DMZ settings';
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await Promise.all([fetchDmz(), fetchLanInfo(), fetchDevices()]);
});
</script>

<template>
  <div class="status-content" :data-testid="qa('dmz-tab-content')">
    <div v-if="loading && !dmzData" class="loading-state" :data-testid="qa('dmz-loading')">
      <div class="loading-spinner"></div>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="error" class="error-state" :data-testid="qa('dmz-error')">
      {{ error }}
    </div>

    <div v-else-if="dmzData" class="panel-section" :data-testid="qa('dmz-panel')">
      <div class="card-content">
        <div class="form-group">
          <div class="switch-label">
            <span :data-testid="qa('dmz-enable-label')">{{ t('dmz.enable') }}</span>
            <BaseSwitch
              v-model="dmzData.AdvancedDmz.Enable"
              :true-value="1"
              :false-value="0"
              :data-testid="qa('dmz-enable-checkbox')"
              :slider-data-testid="qa('dmz-enable-slider')"
            />
          </div>
        </div>

        <div v-if="dmzData.AdvancedDmz.Enable && connectedDevices.length > 0" class="form-group">
          <label :data-testid="qa('dmz-device-select-label')">
            {{ t('dmz.selectDevice') }}
          </label>
          <select
            :value="selectedDevice"
            class="form-select"
            :data-testid="qa('dmz-device-select')"
            @change="handleDeviceSelect"
          >
            <option value="">{{ t('dmz.selectDevicePlaceholder') }}</option>
            <option
              v-for="device in connectedDevices"
              :key="device.MACAddress"
              :value="device.IPAddress"
            >
              {{ device.Host || device.MACAddress }} ({{ device.IPAddress }})
            </option>
          </select>
        </div>

        <div v-if="dmzData.AdvancedDmz.Enable" class="form-group">
          <label :data-testid="qa('dmz-ip-label')">
            {{ t('dmz.ipAddress') }}
          </label>
          <input
            type="text"
            v-model="dmzData.AdvancedDmz.IPAddress"
            @input="handleIPInput"
            placeholder="192.168.1.100"
            :data-testid="qa('dmz-ip-input')"
          >
        </div>

        <div class="button-group">
          <ActionButtons
            :cancel-disabled="loading"
            :apply-disabled="loading"
            :cancel-data-testid="qa('dmz-cancel-button')"
            :apply-data-testid="qa('dmz-apply-button')"
            @cancel="fetchDmz"
            @apply="handleSubmit"
          />
        </div>
      </div>
    </div>

    <div v-if="showSuccess" class="success-message" :data-testid="qa('dmz-success-message')">
      {{ t('common.apply') }} successful
    </div>
  </div>
</template>

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

input,
.form-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
}

.form-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0, 120, 212, 0.1);
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

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
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

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  padding: 2rem;
  text-align: center;
  color: #dc3545;
  background-color: white;
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
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
  z-index: 1100;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
}

@media (max-width: 768px) {
  .button-group {
    flex-direction: column;
  }

  .button-group :deep(.btn) {
    width: 100%;
  }
}
</style>
