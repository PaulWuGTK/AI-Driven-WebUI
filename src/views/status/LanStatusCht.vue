<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { StatusBridgeLanResponse } from '../../types/statusBridgeLan';
import { getStatusBridgeLan } from '../../services/api/statusBridgeLan';
import { useQA } from '../../utils/qa';

const { qa } = useQA();
const { t } = useI18n();

const lanData = ref<StatusBridgeLanResponse | null>(null);
const loading = ref(false);
const showDetails = ref(false);

const fetchStatusBridgeLan = async () => {
  loading.value = true;
  try {
    lanData.value = await getStatusBridgeLan();
  } catch (error) {
    console.error('Error fetching LAN CHT status:', error);
  } finally {
    loading.value = false;
  }
};

const handleUpdate = async () => {
  await fetchStatusBridgeLan();
};

const openDetails = () => {
  showDetails.value = true;
};

const closeDetails = () => {
  showDetails.value = false;
};

const getDisplayValue = (value?: string) => {
  return value && value !== '' ? value : '-';
};

onMounted(() => {
  fetchStatusBridgeLan();
});
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('lan-cht-title')">{{ t('lanCht.title') }}</h1>

    <div v-if="loading" class="loading-state">{{ t('common.loading') }}</div>

    <div v-else-if="lanData?.StatusBridgeLan" class="status-content" :data-testid="qa('lan-cht-content')">
      <div v-if="showDetails" class="panel-section" :data-testid="qa('lan-cht-detail-panel')">
        <div class="header-row">
          <h2 class="section-title-sp">{{ t('lanCht.connectionStatus') }}</h2>
          <button class="btn btn-secondary" @click="closeDetails" :data-testid="qa('lan-cht-back-button')">
            {{ t('common.back') }}
          </button>
        </div>
        <div class="card-content">
          <div class="detail-grid">
            <div class="detail-row">
              <div class="detail-item">
                <span class="detail-label" :data-testid="qa('lan-cht-detail-interface-label')">{{ t('lanCht.interface') }}</span>
                <span class="detail-value" :data-testid="qa('lan-cht-detail-interface-value')">{{ t('lanCht.lanInterface') }}</span>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-item">
                <span class="detail-label" :data-testid="qa('lan-cht-detail-protocol-label')">{{ t('lanCht.ipv4protocol') }}</span>
                <span class="detail-value" :data-testid="qa('lan-cht-detail-protocol-value')">{{ lanData.StatusBridgeLan.IPv4Protocol }}</span>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-item">
                <span class="detail-label" :data-testid="qa('lan-cht-detail-ipv4-address-label')">{{ t('lanCht.ipv4Address') }}</span>
                <span class="detail-value" :data-testid="qa('lan-cht-detail-ipv4-address-value')">{{ getDisplayValue(lanData.StatusBridgeLan.IPv4Address) }}</span>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-item">
                <span class="detail-label" :data-testid="qa('lan-cht-detail-subnet-mask-label')">{{ t('lanCht.subnetMask') }}</span>
                <span class="detail-value" :data-testid="qa('lan-cht-detail-subnet-mask-value')">{{ getDisplayValue(lanData.StatusBridgeLan.SubnetMask) }}</span>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-item">
                <span class="detail-label" :data-testid="qa('lan-cht-detail-ipv4-status-label')">{{ t('lanCht.ipv4Status') }}</span>
                <span class="detail-value" :data-testid="qa('lan-cht-detail-ipv4-status-value')">{{ getDisplayValue(lanData.StatusBridgeLan.IPv4Status) }}</span>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-item">
                <span class="detail-label" :data-testid="qa('lan-cht-detail-mac-address-label')">{{ t('lanCht.macAddress') }}</span>
                <span class="detail-value" :data-testid="qa('lan-cht-detail-mac-address-value')">{{ getDisplayValue(lanData.StatusBridgeLan.MACAddress) }}</span>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-item">
                <span class="detail-label" :data-testid="qa('lan-cht-detail-ipv6-protocol-label')">{{ t('lanCht.ipv6protocol') }}</span>
                <span class="detail-value" :data-testid="qa('lan-cht-detail-ipv6-protocol-value')">{{  getDisplayValue(lanData.StatusBridgeLan.IPv6Protocol) }}</span>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-item">
                <span class="detail-label" :data-testid="qa('lan-cht-detail-ipv6-address-label')">{{ t('lanCht.ipv6Address') }}</span>
                <span class="detail-value" :data-testid="qa('lan-cht-detail-ipv6-address-value')">{{ getDisplayValue(lanData.StatusBridgeLan.IPv6Address) }}</span>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-item">
                <span class="detail-label" :data-testid="qa('lan-cht-detail-ipv6-prefix-label')">{{ t('lanCht.ipv6Prefix') }}</span>
                <span class="detail-value" :data-testid="qa('lan-cht-detail-ipv6-prefix-value')">{{ getDisplayValue(lanData.StatusBridgeLan.IPv6Prefix) }}</span>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-item">
                <span class="detail-label" :data-testid="qa('lan-cht-detail-ipv6-status-label')">{{ t('lanCht.ipv6Status') }}</span>
                <span class="detail-value" :data-testid="qa('lan-cht-detail-ipv6-status-value')">{{ getDisplayValue(lanData.StatusBridgeLan.IPv6Status) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="panel-section" :data-testid="qa('lan-cht-table-panel')">
        <div class="header-row">
          <h2 class="section-title-sp">{{ t('lanCht.connectionStatus') }}</h2>
          <button class="btn btn-primary" @click="handleUpdate" :data-testid="qa('lan-cht-update-button')">
            {{ t('common.update') }}
          </button>
        </div>
        <div class="card-content">
          <div class="table-container">
            <table :data-testid="qa('lan-cht-status-table')">
              <thead>
                <tr>
                  <th :data-testid="qa('lan-cht-table-interface-header')">{{ t('lanCht.interface') }}</th>
                  <th :data-testid="qa('lan-cht-table-protocol-header')">{{ t('lanCht.ipv4protocol') }}</th>
                  <th :data-testid="qa('lan-cht-table-ipv4-address-header')">{{ t('lanCht.ipv4Address') }}</th>
                  <th :data-testid="qa('lan-cht-table-subnet-mask-header')">{{ t('lanCht.subnetMask') }}</th>
                  <th :data-testid="qa('lan-cht-table-ipv6-protocol-header')">{{ t('lanCht.ipv6protocol') }}</th>
                  <th :data-testid="qa('lan-cht-table-ipv6-address-header')">{{ t('lanCht.ipv6Address') }}</th>
                  <th :data-testid="qa('lan-cht-table-ipv6-prefix-header')">{{ t('lanCht.ipv6Prefix') }}</th>
                  <th :data-testid="qa('lan-cht-table-actions-header')">{{ t('lanCht.action') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr :data-testid="qa('lan-cht-table-lan-row')">
                  <td :data-testid="qa('lan-cht-table-interface')">{{ t('lanCht.lanInterface') }}</td>
                  <td :data-testid="qa('lan-cht-table-protocol')">{{ lanData.StatusBridgeLan.IPv4Protocol }}</td>
                  <td :data-testid="qa('lan-cht-table-ipv4-address')">{{ getDisplayValue(lanData.StatusBridgeLan.IPv4Address) }}</td>
                  <td :data-testid="qa('lan-cht-table-subnet-mask')">{{ getDisplayValue(lanData.StatusBridgeLan.SubnetMask) }}</td>
                  <td :data-testid="qa('lan-cht-table-ipv6-protocol')">{{ lanData.StatusBridgeLan.IPv6Protocol }}</td>
                  <td :data-testid="qa('lan-cht-table-ipv6-address')">{{ getDisplayValue(lanData.StatusBridgeLan.IPv6Address) }}</td>
                  <td :data-testid="qa('lan-cht-table-ipv6-prefix')">{{ getDisplayValue(lanData.StatusBridgeLan.IPv6Prefix) }}</td>
                  <td :data-testid="qa('lan-cht-table-actions')">
                    <button class="btn-action" @click="openDetails" :data-testid="qa('lan-cht-table-details')" title="Details">
                      <span class="material-icons">info</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mobile-cards" :data-testid="qa('lan-cht-mobile-cards')">
            <div class="table-card" :data-testid="qa('lan-cht-mobile-card')">
              <div class="card-row">
                <span class="card-label">{{ t('lanCht.interface') }}</span>
                <span class="card-value">{{ t('lanCht.lanInterface') }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('lanCht.ipv4protocol') }}</span>
                <span class="card-value">{{ lanData.StatusBridgeLan.IPv4Protocol }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('lanCht.ipv4Address') }}</span>
                <span class="card-value">{{ getDisplayValue(lanData.StatusBridgeLan.IPv4Address) }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('lanCht.subnetMask') }}</span>
                <span class="card-value">{{ getDisplayValue(lanData.StatusBridgeLan.SubnetMask) }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('lanCht.ipv6protocol') }}</span>
                <span class="card-value">{{ lanData.StatusBridgeLan.IPv6Protocol }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('lanCht.ipv6Address') }}</span>
                <span class="card-value">{{ getDisplayValue(lanData.StatusBridgeLan.IPv6Address) }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('lanCht.ipv6Prefix') }}</span>
                <span class="card-value">{{ getDisplayValue(lanData.StatusBridgeLan.IPv6Prefix) }}</span>
              </div>
              <div class="card-actions">
                <button class="btn-action" @click="openDetails" :data-testid="qa('lan-cht-mobile-card-details')" title="Details">
                  <span class="material-icons">info</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading-state {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--bg-tertiary);
}

.section-title-sp {
  font-size: var(--font-size-base);
  font-weight: normal;
  color: var(--text-primary);
  padding: 0.5rem 0;
  margin: 0;
  background-color: var(--bg-tertiary);
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-grid {
  display: grid;
  gap: 1rem;
}

.detail-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.detail-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-width: 0;
}

.detail-label {
  flex: 0 0 auto;
  white-space: nowrap;
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.detail-value {
  font-size: 0.875rem;
  color: var(--text-primary);
  flex: 1 1 auto;
  min-width: 0;
  text-align: right;
  overflow-wrap: anywhere; /* IPv6 這種長字串避免撐爆 */
}

.table-container {
  overflow-x: auto;
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

.mobile-cards {
  display: none;
}

.table-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.card-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}

.card-row:last-of-type {
  border-bottom: none;
}

.card-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.card-value {
  font-size: 0.875rem;
  color: var(--text-primary);
  text-align: right;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
}

@media (max-width: 768px) {
  .detail-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .header-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .table-container {
    display: none;
  }

  .mobile-cards {
    display: block;
  }
}
</style>
