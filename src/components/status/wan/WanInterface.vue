<script setup lang="ts">
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WanInterface } from '../../../types/wan';

const { t } = useI18n();

defineProps<{
  interface: WanInterface;
}>();
</script>

<template>
  <div class="section-title">{{ t('wan.interface') }}</div>
  <div class="interface-section">
    <!-- Basic Interface Info -->
    <div class="info-grid">
      <div class="info-row">
        <span class="label">{{ t('wan.name') }}</span>
        <span class="value">{{ interface.Name }}</span>
      </div>
      <div class="info-row">
        <span class="label">{{ t('wan.macAddress') }}</span>
        <span class="value">{{ interface.MACAddress }}</span>
      </div>
      <div class="info-row">
        <span class="label">{{ t('wan.speed') }}</span>
        <span class="value">{{ interface.Speed }}</span>
      </div>
      <div class="info-row">
        <span class="label">{{ t('wan.duplex') }}</span>
        <span class="value">{{ interface.Duplex }}</span>
      </div>
    </div>

    <!-- IPv4 Configuration -->
    <div class="ip-section">
      <h4 class="subsection-title">IPv4</h4>
      
      <!-- PC版表格 -->
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>{{ t('wan.mode') }}</th>
              <th>{{ t('wan.address') }}</th>
              <th>{{ t('wan.gateway') }}</th>
              <th>{{ t('wan.dnsServer') }}</th>
              <th>{{ t('wan.subnetMask') }}</th>
              <th>{{ t('wan.status') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ip in interface.ipv4" :key="ip.IPv4Address">
              <td>{{ ip.IPv4Mode }}</td>
              <td>{{ ip.IPv4Address }}</td>
              <td>{{ ip.Gateway }}</td>
              <td>{{ ip.DNSServer }}</td>
              <td>{{ ip.SubnetMask }}</td>
              <td>{{ ip.Status }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 手機版卡片 -->
      <div class="mobile-cards">
        <div class="table-card" v-for="ip in interface.ipv4" :key="ip.IPv4Address">
          <div class="card-row">
            <span class="card-label">{{ t('wan.mode') }}</span>
            <span class="card-value">{{ ip.IPv4Mode }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">{{ t('wan.address') }}</span>
            <span class="card-value">{{ ip.IPv4Address }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">{{ t('wan.gateway') }}</span>
            <span class="card-value">{{ ip.Gateway }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">{{ t('wan.dnsServer') }}</span>
            <span class="card-value">{{ ip.DNSServer }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">{{ t('wan.subnetMask') }}</span>
            <span class="card-value">{{ ip.SubnetMask }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">{{ t('wan.status') }}</span>
            <span class="card-value">{{ ip.Status }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- IPv6 Configuration -->
    <div class="ip-section" v-if="interface.ipv6.length > 0">
      <h4 class="subsection-title">IPv6</h4>
      
      <!-- PC版表格 -->
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>{{ t('wan.type') }}</th>
              <th>{{ t('wan.address') }}</th>
              <th>{{ t('wan.prefix') }}</th>
              <th>{{ t('wan.gateway') }}</th>
              <th>{{ t('wan.dnsServer') }}</th>
              <th>{{ t('wan.status') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ip in interface.ipv6" :key="ip.IPv6Type">
              <td>{{ ip.IPv6Type }}</td>
              <td>{{ ip.IPv6Address || '-' }}</td>
              <td>{{ ip.Prefix || '-' }}</td>
              <td>{{ ip.Gateway || '-' }}</td>
              <td>{{ ip.DNSServer || '-' }}</td>
              <td>{{ ip.Status }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 手機版卡片 -->
      <div class="mobile-cards">
        <div class="table-card" v-for="ip in interface.ipv6" :key="ip.IPv6Type">
          <div class="card-row">
            <span class="card-label">{{ t('wan.type') }}</span>
            <span class="card-value">{{ ip.IPv6Type }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">{{ t('wan.address') }}</span>
            <span class="card-value">{{ ip.IPv6Address || '-' }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">{{ t('wan.prefix') }}</span>
            <span class="card-value">{{ ip.Prefix || '-' }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">{{ t('wan.gateway') }}</span>
            <span class="card-value">{{ ip.Gateway || '-' }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">{{ t('wan.dnsServer') }}</span>
            <span class="card-value">{{ ip.DNSServer || '-' }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">{{ t('wan.status') }}</span>
            <span class="card-value">{{ ip.Status }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.interface-section {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
  align-items: center;
}

.label {
  color: #666;
}

.value {
  color: #333;
}

.ip-section {
  padding: 0 2rem 2rem;
}

.subsection-title {
  padding: 1rem 0;
  color: #333;
  font-size: 1rem;
  margin: 0;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

/* 手機版卡片樣式 */
.mobile-cards {
  display: none;
  gap: 1rem;
}

.table-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
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
  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
    white-space: nowrap;
  }

  th {
    background-color: #f8f8f8;
    font-weight: 500;
    color: #333;
  }

  td {
    color: #666;
  }

  .mobile-cards {
    display: none;
  }
}

@media (max-width: 767px) {
  .info-grid {
    padding: 1rem;
  }

  .info-row {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }

  .ip-section {
    padding: 0 1rem 1rem;
  }

  .table-wrapper {
    display: none;
  }

  .mobile-cards {
    display: block;
  }
}
</style>