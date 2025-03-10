<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { StatisticsResponse, StatisticsEntry } from '../../types/statistics';
import { getStatistics } from '../../services/api';

const { t } = useI18n();
const statisticsData = ref<StatisticsResponse | null>(null);

type SortKey = keyof StatisticsEntry;
type SortDirection = 'asc' | 'desc';
type TableType = 'ethernet' | 'wlan';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

interface TableSortConfig {
  ethernet: SortConfig;
  wlan: SortConfig;
}

const sortConfig = ref<TableSortConfig>({
  ethernet: { key: 'Port', direction: 'asc' },
  wlan: { key: 'Port', direction: 'asc' }
});

const fetchStatistics = async () => {
  try {
    const response = await getStatistics();
    statisticsData.value = response;
  } catch (error) {
    console.error('Error fetching statistics:', error);
  }
};

const sortData = (data: StatisticsEntry[] | undefined, key: SortKey, direction: SortDirection, tableType: TableType): StatisticsEntry[] => {
  if (!data || !Array.isArray(data)) return [];

  return [...data].sort((a, b) => {
    let aValue = a[key];
    let bValue = b[key];

    // Ethernet: 按 Port 數字排序 (Port0, Port1, Port2, ...)
    if (tableType === 'ethernet' && key === 'Port') {
      const numA = parseInt(aValue.replace('Port', ''), 10);
      const numB = parseInt(bValue.replace('Port', ''), 10);
      return direction === 'asc' ? numA - numB : numB - numA;
    }

    // WLAN: 按特定順序排序 (2G -> 5G -> 6G)
    if (tableType === 'wlan' && key === 'Port') {
      const wlanOrder: Record<string, number> = { '2G': 1, '5G': 2, '6G': 3 };
      const numA = wlanOrder[aValue as string] || 99; // 其他未知類型放最後
      const numB = wlanOrder[bValue as string] || 99;
      return direction === 'asc' ? numA - numB : numB - numA;
    }

    // 其他欄位: 若為數字，則數字排序
    if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
      return direction === 'asc' ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue);
    }

    // 預設字串排序
    return direction === 'asc' ? String(aValue).localeCompare(String(bValue)) : String(bValue).localeCompare(String(aValue));
  });
};

const handleSort = (tableType: TableType, key: SortKey) => {
  if (sortConfig.value[tableType].key === key) {
    // Toggle direction if clicking the same column
    sortConfig.value[tableType].direction = sortConfig.value[tableType].direction === 'asc' ? 'desc' : 'asc';
  } else {
    // New column, default to ascending
    sortConfig.value[tableType].key = key;
    sortConfig.value[tableType].direction = 'asc';
  }
};

const getSortedData = (tableType: TableType): StatisticsEntry[] => {
  if (!statisticsData.value || !statisticsData.value.Statistics) {
    console.warn(`No data found for ${tableType} - statisticsData is null`);
    return [];
  }

  const key = tableType === 'ethernet' ? 'Ethernet' : 'Wlan'; // 統一大小寫
  if (!statisticsData.value.Statistics[key]) {
    console.warn(`No data found for ${key}`);
    return [];
  }
  
  const sortedData = sortData(
    statisticsData.value.Statistics[key],
    sortConfig.value[tableType].key,
    sortConfig.value[tableType].direction,
    tableType
  );
  return sortedData;
};

onMounted(() => {
  fetchStatistics();
});
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">{{ t('statistics.title') }}</h1>

    <div v-if="statisticsData" class="status-content">
      <!-- Ethernet Statistics -->
      <div class="panel-section">
        <div class="section-title">{{ t('statistics.ethernet') }}</div>
        
        <div class="card-content">
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th 
                    v-for="key in ['Port', 'RxBytes', 'RxPackets', 'RxError', 'RxDiscard', 'TxBytes', 'TxPackets', 'TxError', 'TxDiscard']" 
                    :key="key"
                    @click="handleSort('ethernet', key as SortKey)"
                    :class="{ 
                      sortable: true,
                      sorted: sortConfig.ethernet.key === key,
                      asc: sortConfig.ethernet.key === key && sortConfig.ethernet.direction === 'asc',
                      desc: sortConfig.ethernet.key === key && sortConfig.ethernet.direction === 'desc'
                    }"
                  >
                    {{ t(`statistics.${key.toLowerCase()}`) }}
                    <span class="sort-icon" v-if="sortConfig.ethernet.key === key">
                      {{ sortConfig.ethernet.direction === 'asc' ? '▲' : '▼' }}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="entry in getSortedData('ethernet')" :key="entry.Port">
                  <td>{{ entry.Port }}</td>
                  <td>{{ entry.RxBytes }}</td>
                  <td>{{ entry.RxPackets }}</td>
                  <td>{{ entry.RxError }}</td>
                  <td>{{ entry.RxDiscard }}</td>
                  <td>{{ entry.TxBytes }}</td>
                  <td>{{ entry.TxPackets }}</td>
                  <td>{{ entry.TxError }}</td>
                  <td>{{ entry.TxDiscard }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mobile-cards">
            <div class="table-card" v-for="entry in getSortedData('ethernet')" :key="entry.Port">
              <div class="card-row">
                <span class="card-label">{{ t('statistics.port') }}</span>
                <span class="card-value">{{ entry.Port }}</span>
              </div>
              <div class="card-section">
                <div class="section-subtitle">Rx</div>
                <div class="card-row">
                  <span class="card-label">{{ t('statistics.rxbytes') }}</span>
                  <span class="card-value">{{ entry.RxBytes }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">{{ t('statistics.rxpackets') }}</span>
                  <span class="card-value">{{ entry.RxPackets }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">{{ t('statistics.rxerror') }}</span>
                  <span class="card-value">{{ entry.RxError }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">{{ t('statistics.rxdiscard') }}</span>
                  <span class="card-value">{{ entry.RxDiscard }}</span>
                </div>
              </div>
              <div class="card-section">
                <div class="section-subtitle">Tx</div>
                <div class="card-row">
                  <span class="card-label">{{ t('statistics.txbytes') }}</span>
                  <span class="card-value">{{ entry.TxBytes }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">{{ t('statistics.txpackets') }}</span>
                  <span class="card-value">{{ entry.TxPackets }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">{{ t('statistics.txerror') }}</span>
                  <span class="card-value">{{ entry.TxError }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">{{ t('statistics.txdiscard') }}</span>
                  <span class="card-value">{{ entry.TxDiscard }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- WLAN Statistics -->
      <div class="panel-section">
        <div class="section-title">{{ t('statistics.wlan') }}</div>
        
        <div class="card-content">
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th 
                    v-for="key in ['Port', 'RxBytes', 'RxPackets', 'RxError', 'RxDiscard', 'TxBytes', 'TxPackets', 'TxError', 'TxDiscard']" 
                    :key="key"
                    @click="handleSort('wlan', key as SortKey)"
                    :class="{ 
                      sortable: true,
                      sorted: sortConfig.wlan.key === key,
                      asc: sortConfig.wlan.key === key && sortConfig.wlan.direction === 'asc',
                      desc: sortConfig.wlan.key === key && sortConfig.wlan.direction === 'desc'
                    }"
                  >
                    {{ t(`statistics.${key.toLowerCase()}`) }}
                    <span class="sort-icon" v-if="sortConfig.wlan.key === key">
                      {{ sortConfig.wlan.direction === 'asc' ? '▲' : '▼' }}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="entry in getSortedData('wlan')" :key="entry.Port">
                  <td>{{ entry.Port }}</td>
                  <td>{{ entry.RxBytes }}</td>
                  <td>{{ entry.RxPackets }}</td>
                  <td>{{ entry.RxError }}</td>
                  <td>{{ entry.RxDiscard }}</td>
                  <td>{{ entry.TxBytes }}</td>
                  <td>{{ entry.TxPackets }}</td>
                  <td>{{ entry.TxError }}</td>
                  <td>{{ entry.TxDiscard }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mobile-cards">
            <div class="table-card" v-for="entry in getSortedData('wlan')" :key="entry.Port">
              <div class="card-row">
                <span class="card-label">{{ t('statistics.port') }}</span>
                <span class="card-value">{{ entry.Port }}</span>
              </div>
              <div class="card-section">
                <div class="section-subtitle">Rx</div>
                <div class="card-row">
                  <span class="card-label">{{ t('statistics.rxbytes') }}</span>
                  <span class="card-value">{{ entry.RxBytes }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">{{ t('statistics.rxpackets') }}</span>
                  <span class="card-value">{{ entry.RxPackets }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">{{ t('statistics.rxerror') }}</span>
                  <span class="card-value">{{ entry.RxError }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">{{ t('statistics.rxdiscard') }}</span>
                  <span class="card-value">{{ entry.RxDiscard }}</span>
                </div>
              </div>
              <div class="card-section">
                <div class="section-subtitle">Tx</div>
                <div class="card-row">
                  <span class="card-label">{{ t('statistics.txbytes') }}</span>
                  <span class="card-value">{{ entry.TxBytes }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">{{ t('statistics.txpackets') }}</span>
                  <span class="card-value">{{ entry.TxPackets }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">{{ t('statistics.txerror') }}</span>
                  <span class="card-value">{{ entry.TxError }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">{{ t('statistics.txdiscard') }}</span>
                  <span class="card-value">{{ entry.TxDiscard }}</span>
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
.card-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.section-subtitle {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

th.sortable {
  cursor: pointer;
  user-select: none;
  position: relative;
  padding-right: 1.5rem;
}

th.sortable:hover {
  background-color: var(--bg-secondary);
}

.sort-icon {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8rem;
  opacity: 0.7;
}

th.sorted {
  background-color: var(--bg-secondary);
}

@media (max-width: 768px) {
  .card-section {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
  }

  .section-subtitle {
    font-size: 0.9rem;
  }
}
</style>