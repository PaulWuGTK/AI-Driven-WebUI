<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { StatisticsEntry, StatisticsResponse } from '../../types/statistics';
import { getStatistics } from '../../services/api';
import { BaseTable } from '../../components/common';
import { useQA } from '../../utils/qa';

const { qa } = useQA();
const { t } = useI18n();

type SortOrder = 'asc' | 'desc';
type StatisticsSortFn = (a: StatisticsEntry, b: StatisticsEntry, order: SortOrder) => number;

const statisticsData = ref<StatisticsResponse | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const ethernetRows = computed(() => statisticsData.value?.Statistics.Ethernet ?? []);
const wlanRows = computed(() => statisticsData.value?.Statistics.Wlan ?? []);

const toNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const compareNumber = (a: number, b: number, order: SortOrder) =>
  order === 'asc' ? a - b : b - a;

const compareString = (a: string, b: string, order: SortOrder) => {
  const result = a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  return order === 'asc' ? result : -result;
};

const numericSort = (key: keyof StatisticsEntry): StatisticsSortFn => {
  return (a, b, order) => compareNumber(toNumber(a[key] ?? '0'), toNumber(b[key] ?? '0'), order);
};

const ethernetPortRank = (port: string) => {
  const match = /^port\s*(\d+)$/i.exec(port.trim());
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
};

const wlanPortRank = (port: string) => {
  const normalized = port.trim().toLowerCase();
  const fixedOrder: Record<string, number> = {
    '2g': 0,
    '2.4g': 0,
    '5g': 1,
    '6g': 2,
  };

  if (normalized in fixedOrder) {
    return fixedOrder[normalized];
  }

  const parsed = Number(normalized.replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? 100 + parsed : Number.MAX_SAFE_INTEGER;
};

const ethernetPortSort: StatisticsSortFn = (a, b, order) => {
  const rankCompare = compareNumber(ethernetPortRank(a.Port), ethernetPortRank(b.Port), order);
  if (rankCompare !== 0) return rankCompare;
  return compareString(a.Port, b.Port, order);
};

const wlanPortSort: StatisticsSortFn = (a, b, order) => {
  const rankCompare = compareNumber(wlanPortRank(a.Port), wlanPortRank(b.Port), order);
  if (rankCompare !== 0) return rankCompare;
  return compareString(a.Port, b.Port, order);
};

const buildColumns = (portSortFn: StatisticsSortFn, prefix: string) => [
  {
    key: 'Port',
    label: t('statistics.port'),
    sortable: true,
    sortFn: portSortFn,
    headerDataTestid: qa(`${prefix}-header-port`),
  },
  {
    key: 'RxBytes',
    label: t('statistics.rxbytes'),
    sortable: true,
    sortFn: numericSort('RxBytes'),
    headerDataTestid: qa(`${prefix}-header-rxbytes`),
  },
  {
    key: 'RxPackets',
    label: t('statistics.rxpackets'),
    sortable: true,
    sortFn: numericSort('RxPackets'),
    headerDataTestid: qa(`${prefix}-header-rxpackets`),
  },
  {
    key: 'RxError',
    label: t('statistics.rxerror'),
    sortable: true,
    sortFn: numericSort('RxError'),
    headerDataTestid: qa(`${prefix}-header-rxerror`),
  },
  {
    key: 'RxDiscard',
    label: t('statistics.rxdiscard'),
    sortable: true,
    sortFn: numericSort('RxDiscard'),
    headerDataTestid: qa(`${prefix}-header-rxdiscard`),
  },
  {
    key: 'TxBytes',
    label: t('statistics.txbytes'),
    sortable: true,
    sortFn: numericSort('TxBytes'),
    headerDataTestid: qa(`${prefix}-header-txbytes`),
  },
  {
    key: 'TxPackets',
    label: t('statistics.txpackets'),
    sortable: true,
    sortFn: numericSort('TxPackets'),
    headerDataTestid: qa(`${prefix}-header-txpackets`),
  },
  {
    key: 'TxError',
    label: t('statistics.txerror'),
    sortable: true,
    sortFn: numericSort('TxError'),
    headerDataTestid: qa(`${prefix}-header-txerror`),
  },
  {
    key: 'TxDiscard',
    label: t('statistics.txdiscard'),
    sortable: true,
    sortFn: numericSort('TxDiscard'),
    headerDataTestid: qa(`${prefix}-header-txdiscard`),
  },
];

const ethernetColumns = computed(() => buildColumns(ethernetPortSort, 'statistics-ethernet'));
const wlanColumns = computed(() => buildColumns(wlanPortSort, 'statistics-wlan'));

const formatPortLabel = (row: StatisticsEntry) => {
  if (row.Role) {
    return `${row.Role.toUpperCase()} (${row.Port})`;
  }
  return row.Port;
};

const getEthernetRowTestId = (_row: StatisticsEntry, index: number, mobile: boolean) =>
  qa(mobile ? `statistics-ethernet-card-${index}` : `statistics-ethernet-row-${index}`) ?? '';

const getWlanRowTestId = (_row: StatisticsEntry, index: number, mobile: boolean) =>
  qa(mobile ? `statistics-wlan-card-${index}` : `statistics-wlan-row-${index}`) ?? '';

const fetchStatistics = async () => {
  loading.value = true;
  error.value = null;
  try {
    statisticsData.value = await getStatistics();
  } catch (err) {
    console.error('Error fetching statistics:', err);
    error.value = 'Failed to fetch statistics';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchStatistics);
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('statistics-title')">{{ t('statistics.title') }}</h1>

    <div class="status-content" :data-testid="qa('statistics-content')">
      <div v-if="loading" class="loading-state" :data-testid="qa('statistics-loading')">
        <div class="loading-spinner"></div>
        <span>{{ t('common.loading') }}</span>
      </div>

      <div v-else-if="error" class="error-state" :data-testid="qa('statistics-error')">
        {{ error }}
      </div>

      <template v-else-if="statisticsData">
        <div class="panel-section" :data-testid="qa('statistics-ethernet-section')">
          <div class="section-title" :data-testid="qa('statistics-ethernet-title')">
            {{ t('statistics.ethernet') }}
          </div>
          <div class="card-content">
            <BaseTable
              :columns="ethernetColumns"
              :data="ethernetRows"
              row-key="Port"
              :table-data-testid="qa('statistics-ethernet-table')"
              :mobile-data-testid="qa('statistics-ethernet-mobile')"
              initial-sort-key="Port"
              initial-sort-order="asc"
              :row-data-testid="getEthernetRowTestId"
            >
              <template #cell-Port="{ row }">
                {{ formatPortLabel(row as StatisticsEntry) }}
              </template>
            </BaseTable>
          </div>
        </div>

        <div class="panel-section" :data-testid="qa('statistics-wlan-section')">
          <div class="section-title" :data-testid="qa('statistics-wlan-title')">
            {{ t('statistics.wlan') }}
          </div>
          <div class="card-content">
            <BaseTable
              :columns="wlanColumns"
              :data="wlanRows"
              row-key="Port"
              :table-data-testid="qa('statistics-wlan-table')"
              :mobile-data-testid="qa('statistics-wlan-mobile')"
              initial-sort-key="Port"
              initial-sort-order="asc"
              :row-data-testid="getWlanRowTestId"
            />
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
