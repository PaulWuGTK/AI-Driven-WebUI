<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { CellularResponse } from '../../types/cellular';
import { getCellularStatus } from '../../services/api/cellular';
import { useQA } from '../../utils/qa';

const { isQAMode, qa, slug } = useQA();
const { t } = useI18n();

const cellularData = ref<CellularResponse | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const formatConnectionTime = (seconds: number): string => {
  if (!seconds) return '00:00:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const displayValue = (value: any): string => {
  if (value === null || value === undefined || value === '' || value === 'None') {
    return 'None';
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  return value;
};

const displayBoolean = (value: number): string => {
  return value === 1 ? 'Enabled' : 'Disabled';
};

const connectionTime = computed(() => {
  if (!cellularData.value?.Cellular?.ConnectionTime) return '00:00:00';
  return formatConnectionTime(cellularData.value.Cellular.ConnectionTime);
});

const fetchCellularStatus = async () => {
  loading.value = true;
  error.value = null;
  try {
    cellularData.value = await getCellularStatus();
  } catch (err) {
    console.error('Error fetching Cellular status:', err);
    error.value = 'Failed to fetch Cellular status';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCellularStatus();
});
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('cellular-title')">{{ t('cellular.title') }}</h1>

    <div class="status-content">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>{{ t('common.loading') }}</span>
      </div>

      <div v-else-if="error" class="error-state">
        {{ error }}
      </div>

      <template v-else-if="cellularData?.Cellular">
        <!-- Basic Information -->
        <div class="panel-section">
          <div class="section-title" :data-testid="qa('cellular-basic-info-title')">{{ t('cellular.basicInfo') }}</div>
          <div class="card-content">
            <div class="info-grid">
              <div class="info-row">
                <span class="info-label">{{ t('cellular.connectionStatus') }}</span>
                <span class="info-value">{{ displayValue(cellularData.Cellular.ConnectionStatus) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('cellular.connectionTime') }}</span>
                <span class="info-value">{{ connectionTime }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('cellular.interfaceEnable') }}</span>
                <span class="info-value">{{ displayBoolean(cellularData.Cellular.InterfaceEnable) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('cellular.roamingEnabled') }}</span>
                <span class="info-value">{{ displayBoolean(cellularData.Cellular.RoamingEnabled) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('cellular.roamingStatus') }}</span>
                <span class="info-value">{{ displayValue(cellularData.Cellular.RoamingStatus) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Device Information -->
        <div class="panel-section">
          <div class="section-title" :data-testid="qa('cellular-device-info-title')">{{ t('cellular.deviceInfo') }}</div>
          <div class="card-content">
            <div class="info-grid">
              <div class="info-row">
                <span class="info-label">{{ t('cellular.imei') }}</span>
                <span class="info-value">{{ displayValue(cellularData.Cellular.IMEI) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('cellular.imsi') }}</span>
                <span class="info-value">{{ displayValue(cellularData.Cellular.IMSI) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('cellular.iccid') }}</span>
                <span class="info-value">{{ displayValue(cellularData.Cellular.ICCID) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('cellular.usimStatus') }}</span>
                <span class="info-value">{{ displayValue(cellularData.Cellular.USIMStatus) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Network Information -->
        <div class="panel-section">
          <div class="section-title" :data-testid="qa('cellular-network-info-title')">{{ t('cellular.networkInfo') }}</div>
          <div class="card-content">
            <div class="info-grid">
              <div class="info-row">
                <span class="info-label">{{ t('cellular.operatorName') }}</span>
                <span class="info-value">{{ displayValue(cellularData.Cellular.OperatorName) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('cellular.plmn') }}</span>
                <span class="info-value">{{ displayValue(cellularData.Cellular.PLMN) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('cellular.preferredAccessTechnology') }}</span>
                <span class="info-value">{{ displayValue(cellularData.Cellular.PreferredAccessTechnology) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('cellular.supportedAccessTechnologies') }}</span>
                <span class="info-value">{{ displayValue(cellularData.Cellular.SupportedAccessTechnologies) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('cellular.apn') }}</span>
                <span class="info-value">{{ displayValue(cellularData.Cellular.APN) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('cellular.ipType') }}</span>
                <span class="info-value">{{ displayValue(cellularData.Cellular.X_PRPLWARE_COM_IPType) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('cellular.cellId') }}</span>
                <span class="info-value">{{ displayValue(cellularData.Cellular.CellID) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('cellular.connectedBand') }}</span>
                <span class="info-value">{{ displayValue(cellularData.Cellular.ConnectedBand) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('cellular.pci') }}</span>
                <span class="info-value">{{ displayValue(cellularData.Cellular.PCI) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('cellular.dlEarfcn') }}</span>
                <span class="info-value">{{ displayValue(cellularData.Cellular.DLEarfcn) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Signal Quality -->
        <div class="panel-section">
          <div class="section-title" :data-testid="qa('cellular-signal-quality-title')">{{ t('cellular.signalQuality') }}</div>
          <div class="card-content">
            <div class="info-grid">
              <div class="info-row">
                <span class="info-label">{{ t('cellular.rssi') }}</span>
                <span class="info-value">{{ displayValue(cellularData.Cellular.RSSI) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('cellular.rsrp') }}</span>
                <span class="info-value">{{ displayValue(cellularData.Cellular.RSRP) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('cellular.rsrq') }}</span>
                <span class="info-value">{{ displayValue(cellularData.Cellular.RSRQ) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('cellular.sinr') }}</span>
                <span class="info-value">{{ displayValue(cellularData.Cellular.SINR) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Traffic Statistics -->
        <div class="panel-section">
          <div class="section-title" :data-testid="qa('cellular-traffic-stats-title')">{{ t('cellular.trafficStatistics') }}</div>
          <div class="card-content">
            <div class="info-grid">
              <div class="info-row">
                <span class="info-label">{{ t('cellular.uplinkCurrentSpeed') }}</span>
                <span class="info-value">{{ displayValue(cellularData.Cellular.UplinkCurrentSpeed) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('cellular.downlinkCurrentSpeed') }}</span>
                <span class="info-value">{{ displayValue(cellularData.Cellular.DownlinkCurrentSpeed) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('cellular.packetsReceived') }}</span>
                <span class="info-value">{{ displayValue(cellularData.Cellular.PacketsReceived) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('cellular.packetsSent') }}</span>
                <span class="info-value">{{ displayValue(cellularData.Cellular.PacketsSent) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('cellular.bytesReceived') }}</span>
                <span class="info-value">{{ displayValue(cellularData.Cellular.BytesReceived) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('cellular.bytesSent') }}</span>
                <span class="info-value">{{ displayValue(cellularData.Cellular.BytesSent) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('cellular.voiceUplinkTraffic') }}</span>
                <span class="info-value">{{ displayValue(cellularData.Cellular.VoiceUplinkTraffic) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('cellular.voiceDownlinkTraffic') }}</span>
                <span class="info-value">{{ displayValue(cellularData.Cellular.VoiceDownlinkTraffic) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Security Information -->
        <div class="panel-section">
          <div class="section-title" :data-testid="qa('cellular-security-info-title')">{{ t('cellular.securityInfo') }}</div>
          <div class="card-content">
            <div class="info-grid">
              <div class="info-row">
                <span class="info-label">{{ t('cellular.pinCheck') }}</span>
                <span class="info-value">{{ displayValue(cellularData.Cellular.PINCheck) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('cellular.pinRemain') }}</span>
                <span class="info-value">{{ displayValue(cellularData.Cellular.PINRemain) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('cellular.pukRemain') }}</span>
                <span class="info-value">{{ displayValue(cellularData.Cellular.PUKRemain) }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
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
</style>
