<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { LanStatusResponse } from '../../types/lan';
import { getLanStatus } from '../../services/api';

const { t } = useI18n();
const lanData = ref<LanStatusResponse | null>(null);

const fetchLanStatus = async () => {
  try {
    lanData.value = await getLanStatus();
  } catch (error) {
    console.error('Error fetching LAN status:', error);
  }
};

onMounted(() => {
  fetchLanStatus();
});
</script>

<template>
  <div class="lan-status">
    <h1 class="page-title">{{ t('lan.title') }}</h1>
    
    <div v-if="lanData" class="interfaces">
      <div v-for="iface in lanData.StatusLan" :key="iface.Name" class="panel-section">
        <div class="interface-header">{{ iface.Name }}</div>
        
        <div class="info-grid">
          <div class="info-row">
            <span class="label">{{ t('lan.macAddress') }}</span>
            <span class="value">{{ iface.MACAddress }}</span>
          </div>
          <div class="info-row">
            <span class="label">{{ t('lan.mtu') }}</span>
            <span class="value">{{ iface.MTU }}</span>
          </div>
        </div>

        <!-- IPv4 Section -->
        <div class="ip-section">
          <div class="ip-header">{{ t('lan.ipv4') }}</div>
          
          <!-- PC版表格 -->
          <table>
            <thead>
              <tr>
                <th>{{ t('lan.name') }}</th>
                <th>{{ t('lan.ipAddress') }}</th>
                <th>{{ t('lan.netmask') }}</th>
                <th>{{ t('lan.status') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ip in iface.ipv4" :key="ip.Name">
                <td>{{ ip.Name }}</td>
                <td>{{ ip.IPv4Address }}</td>
                <td>{{ ip.IPv4Netmask }}</td>
                <td>{{ ip.Status }}</td>
              </tr>
            </tbody>
          </table>

          <!-- 手機版卡片 -->
          <div class="mobile-cards">
            <div class="table-card" v-for="ip in iface.ipv4" :key="ip.Name">
              <div class="card-row">
                <span class="card-label">{{ t('lan.name') }}</span>
                <span class="card-value">{{ ip.Name }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('lan.ipAddress') }}</span>
                <span class="card-value">{{ ip.IPv4Address }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('lan.netmask') }}</span>
                <span class="card-value">{{ ip.IPv4Netmask }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('lan.status') }}</span>
                <span class="card-value">{{ ip.Status }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- IPv6 Section -->
        <div class="ip-section" v-if="iface.ipv6.length > 0">
          <div class="ip-header">{{ t('lan.ipv6') }}</div>
          
          <!-- PC版表格 -->
          <table>
            <thead>
              <tr>
                <th>{{ t('lan.name') }}</th>
                <th>{{ t('lan.ipAddress') }}</th>
                <th>{{ t('lan.status') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ip in iface.ipv6" :key="ip.Name">
                <td>{{ ip.Name }}</td>
                <td>{{ ip.IPv6Address }}</td>
                <td>{{ ip.Status }}</td>
              </tr>
            </tbody>
          </table>

          <!-- 手機版卡片 -->
          <div class="mobile-cards">
            <div class="table-card" v-for="ip in iface.ipv6" :key="ip.Name">
              <div class="card-row">
                <span class="card-label">{{ t('lan.name') }}</span>
                <span class="card-value">{{ ip.Name }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('lan.ipAddress') }}</span>
                <span class="card-value">{{ ip.IPv6Address }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('lan.status') }}</span>
                <span class="card-value">{{ ip.Status }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lan-status {
  flex: 1;
  background-color: #f5f5f5;
  min-height: 100%;
}

.interfaces {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  text-align: left;
}

.interface-header {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  color: #000;
  background-color: #f8f8f8;
  border-bottom: 1px solid #e0e0e0;
}

.info-grid {
  padding: 2rem;
  display: grid;
  gap: 0.75rem;
  border-bottom: 1px solid #e0e0e0;
}

.info-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  align-items: left;
}

.label {
  color: #333;
  font-weight: normal;
}

.value {
  color: #000;
}

.ip-section {
  padding: 0 2rem 2rem;
}

.ip-header {
  padding: 1rem 0;
  color: #333;
  font-size: 1rem;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

/* 手機版卡片樣式 */
.mobile-cards {
  display: grid;
  gap: 1rem;
}

.table-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 1rem;
}

.card-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.card-row:last-child {
  border-bottom: none;
}

.card-label {
  color: #666;
  font-size: 0.9rem;
}

.card-value {
  color: #333;
  font-weight: 500;
  word-break: break-all;
}

/* 響應式設計 */
@media (min-width: 768px) {
  /* PC版表格樣式 */
  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  th {
    background-color: #f8f8f8;
    font-weight: 500;
    color: #333;
  }

  td {
    color: #666;
  }

  /* 設置各欄位的寬度比例 */
  th:nth-child(1), td:nth-child(1) { width: 15%; }
  th:nth-child(2), td:nth-child(2) { width: 35%; }
  th:nth-child(3), td:nth-child(3) { width: 35%; }
  th:nth-child(4), td:nth-child(4) { width: 15%; }

  /* 隱藏手機版卡片 */
  .mobile-cards {
    display: none;
  }
}

@media (max-width: 767px) {
  /* 隱藏PC版表格 */
  table {
    display: none;
  }
}
</style>