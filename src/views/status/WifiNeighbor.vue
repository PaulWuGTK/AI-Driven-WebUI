<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WifiNeighborStatusResponse, WifiNeighborInfo } from '../../types/wifiNeighbor';
import { getWifiNeighbors, scanWifiNeighbors } from '../../services/api';
import { BaseTable, SectionCard } from '../../components/common';
import { extractNokMessage } from '../../utils/apiUtils';
import { useQA } from '../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const wifiNeighborData = ref<WifiNeighborStatusResponse | null>(null);
const neighborResults = ref<{ [key: string]: WifiNeighborInfo[] }>({
  '2': [],
  '5': [],
  '6': []
});
const loading = ref<{ [key: string]: boolean }>({
  '2': false,
  '5': false,
  '6': false
});
const errors = ref<{ [key: string]: string | null }>({
  '2': null,
  '5': null,
  '6': null
});

const neighborColumns = computed(() => [
  { key: 'SSID', label: t('wifiNeighbor.ssid'), headerDataTestid: qa('wifi-neighbor-header-ssid') },
  { key: 'BSSID', label: t('wifiNeighbor.bssid'), headerDataTestid: qa('wifi-neighbor-header-bssid') },
  { key: 'Channel', label: t('wifiNeighbor.channel'), headerDataTestid: qa('wifi-neighbor-header-channel') },
  { key: 'Signal', label: t('wifiNeighbor.signal'), headerDataTestid: qa('wifi-neighbor-header-signal') },
  { key: 'Security', label: t('wifiNeighbor.security'), headerDataTestid: qa('wifi-neighbor-header-security') },
  { key: 'WirelessMode', label: t('wifiNeighbor.wirelessMode'), headerDataTestid: qa('wifi-neighbor-header-wireless-mode') },
]);

const getNeighborTestId = (band: string, field: string, index: number, mobile: boolean) => {
  if (mobile) {
    return qa(`wifi-neighbor-${band}g-card-${field}-value-${index}`);
  }
  return qa(`wifi-neighbor-${band}g-${field}-${index}`);
};

const fetchWifiNeighbors = async () => {
  try {
    const response = await getWifiNeighbors();
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      console.error('Error fetching WiFi neighbors:', nokMessage);
      return;
    }
    wifiNeighborData.value = response;
  } catch (error) {
    console.error('Error fetching WiFi neighbors:', error);
  }
};

const handleScan = async (band: string) => {
  if (loading.value[band]) return;

  loading.value[band] = true;
  errors.value[band] = null;
  try {
    const response = await scanWifiNeighbors(band);
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      errors.value[band] = nokMessage;
      neighborResults.value[band] = [];
    } else {
      errors.value[band] = null;
      neighborResults.value[band] = Array.isArray(response.WifiNeighbor) ? response.WifiNeighbor : [];
    }
  } catch (error) {
    console.error(`Error scanning ${band}G band:`, error);
    errors.value[band] = error instanceof Error ? error.message : 'Unknown error occurred';
    neighborResults.value[band] = [];
  } finally {
    loading.value[band] = false;
  }
};

onMounted(fetchWifiNeighbors);
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('wifi-neighbor-title')">{{ t('wifiNeighbor.title') }}</h1>

    <div class="status-content" :data-testid="qa('wifi-neighbor-content')">
      <!-- 2.4G Section -->
      <SectionCard
        :data-testid="qa('wifi-neighbor-2g-section')"
        :title="`2.4G ${t('wifiNeighbor.wifiNeighbor')}`"
        :title-data-testid="qa('wifi-neighbor-2g-title')"
      >
        <div v-if="errors['2']" class="error-message" :data-testid="qa('wifi-neighbor-2g-error')">
          {{ errors['2'] }}
        </div>

        <BaseTable
          v-if="neighborResults['2'].length > 0"
          :columns="neighborColumns"
          :data="neighborResults['2']"
          row-key="BSSID"
          :table-data-testid="qa('wifi-neighbor-2g-table')"
          :mobile-data-testid="qa('wifi-neighbor-2g-mobile')"
        >
          <template #cell-SSID="{ row, index, mobile }">
            <span :data-testid="getNeighborTestId('2', 'ssid', index, mobile)">{{ row.SSID }}</span>
          </template>
          <template #cell-BSSID="{ row, index, mobile }">
            <span :data-testid="getNeighborTestId('2', 'bssid', index, mobile)">{{ row.BSSID }}</span>
          </template>
          <template #cell-Channel="{ row, index, mobile }">
            <span :data-testid="getNeighborTestId('2', 'channel', index, mobile)">{{ row.Channel }}</span>
          </template>
          <template #cell-Signal="{ row, index, mobile }">
            <span :data-testid="getNeighborTestId('2', 'signal', index, mobile)">{{ row.Signal }}</span>
          </template>
          <template #cell-Security="{ row, index, mobile }">
            <span :data-testid="getNeighborTestId('2', 'security', index, mobile)">{{ row.Security }}</span>
          </template>
          <template #cell-WirelessMode="{ row, index, mobile }">
            <span :data-testid="getNeighborTestId('2', 'wireless-mode', index, mobile)">{{ row.WirelessMode }}</span>
          </template>
        </BaseTable>

        <div class="scan-button-container">
          <button 
            class="btn btn-primary"
            :data-testid="qa('wifi-neighbor-2g-scan-button')"
            @click="handleScan('2')"
            :disabled="loading['2'] || !wifiNeighborData?.WifiNeighbor.Enable2g"
          >
            {{ loading['2'] ? t('wifiNeighbor.scanning') : t('wifiNeighbor.scan') }}
          </button>
        </div>
      </SectionCard>

      <!-- 5G Section -->
      <SectionCard
        :data-testid="qa('wifi-neighbor-5g-section')"
        :title="`5G ${t('wifiNeighbor.wifiNeighbor')}`"
        :title-data-testid="qa('wifi-neighbor-5g-title')"
      >
        <div v-if="errors['5']" class="error-message" :data-testid="qa('wifi-neighbor-5g-error')">
          {{ errors['5'] }}
        </div>

        <BaseTable
          v-if="neighborResults['5'].length > 0"
          :columns="neighborColumns"
          :data="neighborResults['5']"
          row-key="BSSID"
          :table-data-testid="qa('wifi-neighbor-5g-table')"
          :mobile-data-testid="qa('wifi-neighbor-5g-mobile')"
        >
            <template #cell-SSID="{ row, index, mobile }">
              <span :data-testid="getNeighborTestId('5', 'ssid', index, mobile)">{{ row.SSID }}</span>
            </template>
            <template #cell-BSSID="{ row, index, mobile }">
              <span :data-testid="getNeighborTestId('5', 'bssid', index, mobile)">{{ row.BSSID }}</span>
            </template>
            <template #cell-Channel="{ row, index, mobile }">
              <span :data-testid="getNeighborTestId('5', 'channel', index, mobile)">{{ row.Channel }}</span>
            </template>
            <template #cell-Signal="{ row, index, mobile }">
              <span :data-testid="getNeighborTestId('5', 'signal', index, mobile)">{{ row.Signal }}</span>
            </template>
            <template #cell-Security="{ row, index, mobile }">
              <span :data-testid="getNeighborTestId('5', 'security', index, mobile)">{{ row.Security }}</span>
            </template>
            <template #cell-WirelessMode="{ row, index, mobile }">
              <span :data-testid="getNeighborTestId('5', 'wireless-mode', index, mobile)">{{ row.WirelessMode }}</span>
            </template>
        </BaseTable>

        <div class="scan-button-container">
          <button 
            class="btn btn-primary"
            :data-testid="qa('wifi-neighbor-5g-scan-button')"
            @click="handleScan('5')"
            :disabled="loading['5'] || !wifiNeighborData?.WifiNeighbor.Enable5g"
          >
            {{ loading['5'] ? t('wifiNeighbor.scanning') : t('wifiNeighbor.scan') }}
          </button>
        </div>
      </SectionCard>

      <!-- 6G Section -->
      <SectionCard
        :data-testid="qa('wifi-neighbor-6g-section')"
        :title="`6G ${t('wifiNeighbor.wifiNeighbor')}`"
        :title-data-testid="qa('wifi-neighbor-6g-title')"
      >
        <div v-if="errors['6']" class="error-message" :data-testid="qa('wifi-neighbor-6g-error')">
          {{ errors['6'] }}
        </div>

        <BaseTable
          v-if="neighborResults['6'].length > 0"
          :columns="neighborColumns"
          :data="neighborResults['6']"
          row-key="BSSID"
          :table-data-testid="qa('wifi-neighbor-6g-table')"
          :mobile-data-testid="qa('wifi-neighbor-6g-mobile')"
        >
            <template #cell-SSID="{ row, index, mobile }">
              <span :data-testid="getNeighborTestId('6', 'ssid', index, mobile)">{{ row.SSID }}</span>
            </template>
            <template #cell-BSSID="{ row, index, mobile }">
              <span :data-testid="getNeighborTestId('6', 'bssid', index, mobile)">{{ row.BSSID }}</span>
            </template>
            <template #cell-Channel="{ row, index, mobile }">
              <span :data-testid="getNeighborTestId('6', 'channel', index, mobile)">{{ row.Channel }}</span>
            </template>
            <template #cell-Signal="{ row, index, mobile }">
              <span :data-testid="getNeighborTestId('6', 'signal', index, mobile)">{{ row.Signal }}</span>
            </template>
            <template #cell-Security="{ row, index, mobile }">
              <span :data-testid="getNeighborTestId('6', 'security', index, mobile)">{{ row.Security }}</span>
            </template>
            <template #cell-WirelessMode="{ row, index, mobile }">
              <span :data-testid="getNeighborTestId('6', 'wireless-mode', index, mobile)">{{ row.WirelessMode }}</span>
            </template>
        </BaseTable>

        <div class="scan-button-container">
          <button 
            class="btn btn-primary"
            :data-testid="qa('wifi-neighbor-6g-scan-button')"
            @click="handleScan('6')"
            :disabled="loading['6'] || !wifiNeighborData?.WifiNeighbor.Enable6g"
          >
            {{ loading['6'] ? t('wifiNeighbor.scanning') : t('wifiNeighbor.scan') }}
          </button>
        </div>
      </SectionCard>
    </div>
  </div>
</template>

<style scoped>
.scan-button-container {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.error-message {
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: #fee;
  color: #dc3545;
  border-radius: 4px;
  text-align: center;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .scan-button-container {
    margin-top: 1rem;
  }

  .btn {
    width: 100%;
  }
}
</style>
