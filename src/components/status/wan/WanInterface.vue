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
  <div class="wan-interface">
    <div class="section-title">{{ t('wan.interface') }}</div>
    
    <div class="card-content">
      <!-- Basic Interface Info -->
      <div class="info-grid">
        <div class="info-row">
          <span class="info-label">{{ t('wan.name') }}</span>
          <span class="info-value">{{ interface.Name }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">{{ t('wan.macAddress') }}</span>
          <span class="info-value">{{ interface.MACAddress }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">{{ t('wan.speed') }}</span>
          <span class="info-value">{{ interface.Speed }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">{{ t('wan.duplex') }}</span>
          <span class="info-value">{{ interface.Duplex }}</span>
        </div>
      </div>

      <!-- IPv4 Configuration -->
      <div class="ip-section">
        <h4 class="subsection-title">IPv4</h4>
        
        <div class="table-container">
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
        
        <div class="table-container">
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
  </div>
</template>

<style scoped>
.info-grid {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

.info-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  align-items: center;
}

.info-label {
  color: var(--text-secondary);
}

.info-value {
  color: var(--text-primary);
  font-weight: 500;
}

.ip-section {
  margin-top: 2rem;
}

.subsection-title {
  font-size: 1rem;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  font-weight: 500;
}

@media (max-width: 768px) {
  .info-row {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }

  .info-label {
    font-size: 0.9rem;
  }

  .ip-section {
    margin-top: 1.5rem;
  }
}
</style>