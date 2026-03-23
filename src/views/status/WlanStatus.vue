<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WlanStatusResponse, WlanBand, WlanAssociatedDevice } from '../../types/wlan';
import { getWlanStatus } from '../../services/api';
import WlanBandInfo from '../../components/status/WlanBandInfo.vue';
import { useQA } from '../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const wlanData = ref<WlanStatusResponse | null>(null);
const associatedCollapsedState = ref<Record<string, boolean>>({});
const bandOrder = ["2.4GHz", "5GHz", "6GHz"];

const fetchWlanStatus = async () => {
  try {
    const response = await getWlanStatus();

    response.StatusWlan.sort((a, b) => {
  const aIndex = bandOrder.indexOf(a.Band);
  const bIndex = bandOrder.indexOf(b.Band);
  return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
});

    wlanData.value = response;
    associatedCollapsedState.value = response.StatusWlan.reduce((acc, band) => {
      acc[band.Band] = true;
      return acc;
    }, {} as Record<string, boolean>);
  } catch (error) {
    console.error('Error fetching WLAN status:', error);
  }
};

const getAssociatedDevices = (band: WlanBand): WlanAssociatedDevice[] => {
  return band.AssociatedDevice ?? [];
};

const isAssociatedCollapsed = (band: string): boolean => {
  return associatedCollapsedState.value[band] ?? true;
};

const toggleAssociated = (band: string) => {
  associatedCollapsedState.value[band] = !isAssociatedCollapsed(band);
};

const toNumber = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const formatDuration = (seconds: unknown): string => {
  const total = Math.max(0, Math.floor(toNumber(seconds)));
  const hours = Math.floor(total / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((total % 3600) / 60).toString().padStart(2, '0');
  const secs = (total % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:${secs}`;
};

const formatSignalStrength = (signal: unknown): string => {
  return `${toNumber(signal)} dBm`;
};

const formatRateMbps = (rate: unknown): string => {
  return `${(toNumber(rate) / 1000).toFixed(1)} Mbps`;
};

const formatDlUlRate = (downlink: unknown, uplink: unknown): string => {
  return `${formatRateMbps(downlink)} / ${formatRateMbps(uplink)}`;
};

const getInterfaceNameByBssid = (band: WlanBand, bssid: string): string => {
  const matched = (band.Interface || []).find((iface) => String(iface.BSSID || '').toLowerCase() === String(bssid || '').toLowerCase());
  return matched?.Name || '';
};

const formatAssociatedApBssid = (band: WlanBand, device: WlanAssociatedDevice): string => {
  const interfaceName = getInterfaceNameByBssid(band, device.BSSID);
  return interfaceName ? `${device.BSSID} (${interfaceName})` : device.BSSID;
};

onMounted(() => {
  fetchWlanStatus();
});
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('wlan-title')">{{ t('wlan.title') }}</h1>
    
    <div v-if="wlanData" class="status-content" :data-testid="qa('wlan-content')">
      <div v-for="band in wlanData.StatusWlan" :key="band.Band" class="panel-section" :data-testid="qa(`wlan-band-${slug(band.Band)}`)">
        <div class="section-title" :data-testid="qa(`wlan-band-title-${slug(band.Band)}`)">WiFi {{ band.Band }}</div>
        
        <div class="card-content">
          <WlanBandInfo :band="band" />
          
          <div class="table-container" :data-testid="qa(`wlan-band-table-${slug(band.Band)}`)">
            <table>
              <thead>
                <tr>
                  <th :data-testid="qa('wlan-header-name')">{{ t('wlan.name') }}</th>
                  <th :data-testid="qa('wlan-header-alias')">{{ t('wlan.alias') }}</th>
                  <th :data-testid="qa('wlan-header-status')">{{ t('wlan.status') }}</th>
                  <th :data-testid="qa('wlan-header-ssid')">{{ t('wlan.ssid') }}</th>
                  <th :data-testid="qa('wlan-header-authentication')">{{ t('wlan.authentication') }}</th>
                  <th :data-testid="qa('wlan-header-encryption')">{{ t('wlan.encryption') }}</th>
                  <th :data-testid="qa('wlan-header-password')">{{ t('wlan.password') }}</th>
                  <th :data-testid="qa('wlan-header-bssid')">{{ t('wlan.bssid') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(iface, ifaceIndex) in band.Interface" :key="iface.Name" :data-testid="qa(`wlan-interface-row-${slug(band.Band)}-${ifaceIndex}`)">
                  <td :data-testid="qa(`wlan-interface-name-${slug(band.Band)}-${ifaceIndex}`)">{{ iface.Name }}</td>
                  <td :data-testid="qa(`wlan-interface-alias-${slug(band.Band)}-${ifaceIndex}`)">{{ iface.Alias }}</td>
                  <td :data-testid="qa(`wlan-interface-status-${slug(band.Band)}-${ifaceIndex}`)">{{ iface.Enable === 1 ? t('wlan.enable') : t('wlan.disable') }}</td>
                  <td :data-testid="qa(`wlan-interface-ssid-${slug(band.Band)}-${ifaceIndex}`)">{{ iface.SSID }}</td>
                  <td :data-testid="qa(`wlan-interface-authentication-${slug(band.Band)}-${ifaceIndex}`)">{{ iface.Authentication }}</td>
                  <td :data-testid="qa(`wlan-interface-encryption-${slug(band.Band)}-${ifaceIndex}`)">{{ iface.Encryption }}</td>
                  <td :data-testid="qa(`wlan-interface-password-${slug(band.Band)}-${ifaceIndex}`)">{{ iface.Password }}</td>
                  <td :data-testid="qa(`wlan-interface-bssid-${slug(band.Band)}-${ifaceIndex}`)">{{ iface.BSSID }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mobile-cards" :data-testid="qa(`wlan-band-mobile-${slug(band.Band)}`)">
            <div class="table-card" v-for="(iface, ifaceIndex) in band.Interface" :key="iface.Name" :data-testid="qa(`wlan-interface-card-${slug(band.Band)}-${ifaceIndex}`)">
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wlan-interface-card-name-label-${slug(band.Band)}-${ifaceIndex}`)">{{ t('wlan.name') }}</span>
                <span class="card-value" :data-testid="qa(`wlan-interface-card-name-value-${slug(band.Band)}-${ifaceIndex}`)">{{ iface.Name }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wlan-interface-card-alias-label-${slug(band.Band)}-${ifaceIndex}`)">{{ t('wlan.alias') }}</span>
                <span class="card-value" :data-testid="qa(`wlan-interface-card-alias-value-${slug(band.Band)}-${ifaceIndex}`)">{{ iface.Alias }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wlan-interface-card-status-label-${slug(band.Band)}-${ifaceIndex}`)">{{ t('wlan.status') }}</span>
                <span class="card-value" :data-testid="qa(`wlan-interface-card-status-value-${slug(band.Band)}-${ifaceIndex}`)">{{ iface.Enable === 1 ? t('wlan.enable') : t('wlan.disable') }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wlan-interface-card-ssid-label-${slug(band.Band)}-${ifaceIndex}`)">{{ t('wlan.ssid') }}</span>
                <span class="card-value" :data-testid="qa(`wlan-interface-card-ssid-value-${slug(band.Band)}-${ifaceIndex}`)">{{ iface.SSID }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wlan-interface-card-authentication-label-${slug(band.Band)}-${ifaceIndex}`)">{{ t('wlan.authentication') }}</span>
                <span class="card-value" :data-testid="qa(`wlan-interface-card-authentication-value-${slug(band.Band)}-${ifaceIndex}`)">{{ iface.Authentication }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wlan-interface-card-encryption-label-${slug(band.Band)}-${ifaceIndex}`)">{{ t('wlan.encryption') }}</span>
                <span class="card-value" :data-testid="qa(`wlan-interface-card-encryption-value-${slug(band.Band)}-${ifaceIndex}`)">{{ iface.Encryption }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wlan-interface-card-password-label-${slug(band.Band)}-${ifaceIndex}`)">{{ t('wlan.password') }}</span>
                <span class="card-value" :data-testid="qa(`wlan-interface-card-password-value-${slug(band.Band)}-${ifaceIndex}`)">{{ iface.Password }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wlan-interface-card-bssid-label-${slug(band.Band)}-${ifaceIndex}`)">{{ t('wlan.bssid') }}</span>
                <span class="card-value" :data-testid="qa(`wlan-interface-card-bssid-value-${slug(band.Band)}-${ifaceIndex}`)">{{ iface.BSSID }}</span>
              </div>
            </div>
          </div>

          <div class="associated-devices-container" :data-testid="qa(`wlan-associated-${slug(band.Band)}`)">
            <button
              type="button"
              class="associated-devices-header"
              :data-testid="qa(`wlan-associated-toggle-${slug(band.Band)}`)"
              @click="toggleAssociated(band.Band)"
            >
              <span :data-testid="qa(`wlan-associated-title-${slug(band.Band)}`)">
                {{ t('wlan.associatedDevicesTotal', { count: getAssociatedDevices(band).length }) }}
              </span>
              <span
                class="material-icons associated-toggle-icon"
                :class="{ expanded: !isAssociatedCollapsed(band.Band) }"
                :data-testid="qa(`wlan-associated-toggle-icon-${slug(band.Band)}`)"
              >
                chevron_right
              </span>
            </button>

            <div
              v-show="!isAssociatedCollapsed(band.Band)"
              class="associated-devices-content"
              :data-testid="qa(`wlan-associated-content-${slug(band.Band)}`)"
            >
              <div class="table-container" :data-testid="qa(`wlan-associated-table-${slug(band.Band)}`)">
                <table>
                  <thead>
                    <tr>
                      <th :data-testid="qa('wlan-associated-header-mac')">{{ t('wlan.macAddress') }}</th>
                      <th :data-testid="qa('wlan-associated-header-ap-bssid')">{{ t('wlan.apBssid') }}</th>
                      <th :data-testid="qa('wlan-associated-header-conn-time')">{{ t('wlan.connTime') }}</th>
                      <th :data-testid="qa('wlan-associated-header-rssi')">{{ t('wlan.rssi') }}</th>
                      <th :data-testid="qa('wlan-associated-header-rate')">{{ t('wlan.dlUlRate') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(device, deviceIndex) in getAssociatedDevices(band)"
                      :key="`${device.MACAddress}-${deviceIndex}`"
                      :data-testid="qa(`wlan-associated-row-${slug(band.Band)}-${deviceIndex}`)"
                    >
                      <td :data-testid="qa(`wlan-associated-mac-${slug(band.Band)}-${deviceIndex}`)">{{ device.MACAddress }}</td>
                      <td :data-testid="qa(`wlan-associated-bssid-${slug(band.Band)}-${deviceIndex}`)">{{ formatAssociatedApBssid(band, device) }}</td>
                      <td :data-testid="qa(`wlan-associated-conn-time-${slug(band.Band)}-${deviceIndex}`)">{{ formatDuration(device.ConnectionDuration) }}</td>
                      <td :data-testid="qa(`wlan-associated-rssi-${slug(band.Band)}-${deviceIndex}`)">{{ formatSignalStrength(device.SignalStrength) }}</td>
                      <td :data-testid="qa(`wlan-associated-rate-${slug(band.Band)}-${deviceIndex}`)">{{ formatDlUlRate(device.LastDataDownlinkRate, device.LastDataUplinkRate) }}</td>
                    </tr>
                    <tr v-if="getAssociatedDevices(band).length === 0" :data-testid="qa(`wlan-associated-empty-${slug(band.Band)}`)">
                      <td colspan="5" class="associated-empty">{{ t('wlan.noAssociatedDevices') }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="mobile-cards associated-mobile-cards" :data-testid="qa(`wlan-associated-mobile-${slug(band.Band)}`)">
                <div
                  class="table-card"
                  v-for="(device, deviceIndex) in getAssociatedDevices(band)"
                  :key="`${device.MACAddress}-card-${deviceIndex}`"
                  :data-testid="qa(`wlan-associated-card-${slug(band.Band)}-${deviceIndex}`)"
                >
                  <div class="card-row">
                    <span class="card-label">{{ t('wlan.macAddress') }}</span>
                    <span class="card-value">{{ device.MACAddress }}</span>
                  </div>
                  <div class="card-row">
                    <span class="card-label">{{ t('wlan.apBssid') }}</span>
                    <span class="card-value">{{ formatAssociatedApBssid(band, device) }}</span>
                  </div>
                  <div class="card-row">
                    <span class="card-label">{{ t('wlan.connTime') }}</span>
                    <span class="card-value">{{ formatDuration(device.ConnectionDuration) }}</span>
                  </div>
                  <div class="card-row">
                    <span class="card-label">{{ t('wlan.rssi') }}</span>
                    <span class="card-value">{{ formatSignalStrength(device.SignalStrength) }}</span>
                  </div>
                  <div class="card-row">
                    <span class="card-label">{{ t('wlan.dlUlRate') }}</span>
                    <span class="card-value">{{ formatDlUlRate(device.LastDataDownlinkRate, device.LastDataUplinkRate) }}</span>
                  </div>
                </div>

                <div
                  v-if="getAssociatedDevices(band).length === 0"
                  class="associated-empty associated-empty-mobile"
                  :data-testid="qa(`wlan-associated-mobile-empty-${slug(band.Band)}`)"
                >
                  {{ t('wlan.noAssociatedDevices') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.associated-devices-container {
  margin-top: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: #fff;
}

.associated-devices-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border: 0;
  background: #f8f9fb;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  text-align: left;
}

.associated-toggle-icon {
  transition: transform 0.2s ease;
  color: var(--text-secondary);
}

.associated-toggle-icon.expanded {
  transform: rotate(90deg);
}

.associated-devices-content {
  padding: 0.25rem 0 0;
}

.associated-empty {
  text-align: center;
  color: var(--text-secondary);
  padding: 1rem 0.5rem;
}

.associated-mobile-cards {
  display: none;
}

.associated-empty-mobile {
  margin: 0.5rem 0.75rem 1rem;
  border: 1px dashed var(--border-color);
  border-radius: 6px;
  background: #fff;
}

@media (max-width: 768px) {
  .associated-devices-content .table-container {
    display: none;
  }

  .associated-mobile-cards {
    display: flex;
  }
}

</style>
