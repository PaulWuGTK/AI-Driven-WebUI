<script setup lang="ts">
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WanInterface } from '../../../types/wan';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();

defineProps<{
  interface: WanInterface;
}>();
</script>

<template>
  <div class="wan-interface" :data-testid="qa('wan-interface-container')">
    <div class="section-title" :data-testid="qa('wan-interface-title')">{{ t('wan.interface') }}</div>
    
    <div class="card-content" :data-testid="qa('wan-interface-content')">
      <!-- Basic Interface Info -->
      <div class="info-grid" :data-testid="qa('wan-interface-basic-grid')">
        <div class="info-row">
          <span class="info-label" :data-testid="qa('wan-interface-name-label')">{{ t('wan.name') }}</span>
          <span class="info-value" :data-testid="qa('wan-interface-name-value')">{{ interface.Name }}</span>
        </div>
        <div class="info-row">
          <span class="info-label" :data-testid="qa('wan-interface-mac-label')">{{ t('wan.macAddress') }}</span>
          <span class="info-value" :data-testid="qa('wan-interface-mac-value')">{{ interface.MACAddress }}</span>
        </div>
        <div class="info-row">
          <span class="info-label" :data-testid="qa('wan-interface-speed-label')">{{ t('wan.speed') }}</span>
          <span class="info-value" :data-testid="qa('wan-interface-speed-value')">{{ interface.Speed }}</span>
        </div>
        <div class="info-row">
          <span class="info-label" :data-testid="qa('wan-interface-duplex-label')">{{ t('wan.duplex') }}</span>
          <span class="info-value" :data-testid="qa('wan-interface-duplex-value')">{{ interface.Duplex }}</span>
        </div>
      </div>

      <!-- IPv4 Configuration -->
      <div class="ip-section" :data-testid="qa('wan-interface-ipv4-section')">
        <h4 class="subsection-title" :data-testid="qa('wan-interface-ipv4-title')">IPv4</h4>
        
        <div class="table-container" :data-testid="qa('wan-interface-ipv4-table-container')">
          <table :data-testid="qa('wan-interface-ipv4-table')">
            <thead>
              <tr>
                <th :data-testid="qa('wan-interface-ipv4-header-mode')">{{ t('wan.mode') }}</th>
                <th :data-testid="qa('wan-interface-ipv4-header-address')">{{ t('wan.address') }}</th>
                <th :data-testid="qa('wan-interface-ipv4-header-gateway')">{{ t('wan.gateway') }}</th>
                <th :data-testid="qa('wan-interface-ipv4-header-dns')">{{ t('wan.dnsServer') }}</th>
                <th :data-testid="qa('wan-interface-ipv4-header-subnet')">{{ t('wan.subnetMask') }}</th>
                <th :data-testid="qa('wan-interface-ipv4-header-status')">{{ t('wan.status') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(ip, ipIndex) in interface.ipv4" :key="ip.IPv4Address" :data-testid="qa(`wan-interface-ipv4-row-${ipIndex}`)">
                <td :data-testid="qa(`wan-interface-ipv4-mode-${ipIndex}`)">{{ ip.IPv4Mode }}</td>
                <td :data-testid="qa(`wan-interface-ipv4-address-${ipIndex}`)">{{ ip.IPv4Address }}</td>
                <td :data-testid="qa(`wan-interface-ipv4-gateway-${ipIndex}`)">{{ ip.Gateway }}</td>
                <td :data-testid="qa(`wan-interface-ipv4-dns-${ipIndex}`)">{{ ip.DNSServer }}</td>
                <td :data-testid="qa(`wan-interface-ipv4-subnet-${ipIndex}`)">{{ ip.SubnetMask }}</td>
                <td :data-testid="qa(`wan-interface-ipv4-status-${ipIndex}`)">{{ ip.Status }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mobile-cards" :data-testid="qa('wan-interface-ipv4-mobile')">
          <div class="table-card" v-for="(ip, ipIndex) in interface.ipv4" :key="ip.IPv4Address" :data-testid="qa(`wan-interface-ipv4-card-${ipIndex}`)">
            <div class="card-row">
              <span class="card-label" :data-testid="qa(`wan-interface-ipv4-card-mode-label-${ipIndex}`)">{{ t('wan.mode') }}</span>
              <span class="card-value" :data-testid="qa(`wan-interface-ipv4-card-mode-value-${ipIndex}`)">{{ ip.IPv4Mode }}</span>
            </div>
            <div class="card-row">
              <span class="card-label" :data-testid="qa(`wan-interface-ipv4-card-address-label-${ipIndex}`)">{{ t('wan.address') }}</span>
              <span class="card-value" :data-testid="qa(`wan-interface-ipv4-card-address-value-${ipIndex}`)">{{ ip.IPv4Address }}</span>
            </div>
            <div class="card-row">
              <span class="card-label" :data-testid="qa(`wan-interface-ipv4-card-gateway-label-${ipIndex}`)">{{ t('wan.gateway') }}</span>
              <span class="card-value" :data-testid="qa(`wan-interface-ipv4-card-gateway-value-${ipIndex}`)">{{ ip.Gateway }}</span>
            </div>
            <div class="card-row">
              <span class="card-label" :data-testid="qa(`wan-interface-ipv4-card-dns-label-${ipIndex}`)">{{ t('wan.dnsServer') }}</span>
              <span class="card-value" :data-testid="qa(`wan-interface-ipv4-card-dns-value-${ipIndex}`)">{{ ip.DNSServer }}</span>
            </div>
            <div class="card-row">
              <span class="card-label" :data-testid="qa(`wan-interface-ipv4-card-subnet-label-${ipIndex}`)">{{ t('wan.subnetMask') }}</span>
              <span class="card-value" :data-testid="qa(`wan-interface-ipv4-card-subnet-value-${ipIndex}`)">{{ ip.SubnetMask }}</span>
            </div>
            <div class="card-row">
              <span class="card-label" :data-testid="qa(`wan-interface-ipv4-card-status-label-${ipIndex}`)">{{ t('wan.status') }}</span>
              <span class="card-value" :data-testid="qa(`wan-interface-ipv4-card-status-value-${ipIndex}`)">{{ ip.Status }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- IPv6 Configuration -->
      <div class="ip-section" v-if="interface.ipv6.length > 0">
        <h4 class="subsection-title" :data-testid="qa('wan-interface-ipv6-title')">IPv6</h4>
        
        <div class="table-container" :data-testid="qa('wan-interface-ipv6-table-container')">
          <table :data-testid="qa('wan-interface-ipv6-table')">
            <thead>
              <tr>
                <th :data-testid="qa('wan-interface-ipv6-header-type')">{{ t('wan.type') }}</th>
                <th :data-testid="qa('wan-interface-ipv6-header-address')">{{ t('wan.address') }}</th>
                <th :data-testid="qa('wan-interface-ipv6-header-prefix')">{{ t('wan.prefix') }}</th>
                <th :data-testid="qa('wan-interface-ipv6-header-gateway')">{{ t('wan.gateway') }}</th>
                <th :data-testid="qa('wan-interface-ipv6-header-dns')">{{ t('wan.dnsServer') }}</th>
                <th :data-testid="qa('wan-interface-ipv6-header-status')">{{ t('wan.status') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(ip, ipIndex) in interface.ipv6" :key="ip.IPv6Type" :data-testid="qa(`wan-interface-ipv6-row-${ipIndex}`)">
                <td :data-testid="qa(`wan-interface-ipv6-type-${ipIndex}`)">{{ ip.IPv6Type }}</td>
                <td :data-testid="qa(`wan-interface-ipv6-address-${ipIndex}`)">{{ ip.IPv6Address || '-' }}</td>
                <td :data-testid="qa(`wan-interface-ipv6-prefix-${ipIndex}`)">{{ ip.Prefix || '-' }}</td>
                <td :data-testid="qa(`wan-interface-ipv6-gateway-${ipIndex}`)">{{ ip.Gateway || '-' }}</td>
                <td :data-testid="qa(`wan-interface-ipv6-dns-${ipIndex}`)">{{ ip.DNSServer || '-' }}</td>
                <td :data-testid="qa(`wan-interface-ipv6-status-${ipIndex}`)">{{ ip.Status }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mobile-cards" :data-testid="qa('wan-interface-ipv6-mobile')">
          <div class="table-card" v-for="(ip, ipIndex) in interface.ipv6" :key="ip.IPv6Type" :data-testid="qa(`wan-interface-ipv6-card-${ipIndex}`)">
            <div class="card-row">
              <span class="card-label" :data-testid="qa(`wan-interface-ipv6-card-type-label-${ipIndex}`)">{{ t('wan.type') }}</span>
              <span class="card-value" :data-testid="qa(`wan-interface-ipv6-card-type-value-${ipIndex}`)">{{ ip.IPv6Type }}</span>
            </div>
            <div class="card-row">
              <span class="card-label" :data-testid="qa(`wan-interface-ipv6-card-address-label-${ipIndex}`)">{{ t('wan.address') }}</span>
              <span class="card-value" :data-testid="qa(`wan-interface-ipv6-card-address-value-${ipIndex}`)">{{ ip.IPv6Address || '-' }}</span>
            </div>
            <div class="card-row">
              <span class="card-label" :data-testid="qa(`wan-interface-ipv6-card-prefix-label-${ipIndex}`)">{{ t('wan.prefix') }}</span>
              <span class="card-value" :data-testid="qa(`wan-interface-ipv6-card-prefix-value-${ipIndex}`)">{{ ip.Prefix || '-' }}</span>
            </div>
            <div class="card-row">
              <span class="card-label" :data-testid="qa(`wan-interface-ipv6-card-gateway-label-${ipIndex}`)">{{ t('wan.gateway') }}</span>
              <span class="card-value" :data-testid="qa(`wan-interface-ipv6-card-gateway-value-${ipIndex}`)">{{ ip.Gateway || '-' }}</span>
            </div>
            <div class="card-row">
              <span class="card-label" :data-testid="qa(`wan-interface-ipv6-card-dns-label-${ipIndex}`)">{{ t('wan.dnsServer') }}</span>
              <span class="card-value" :data-testid="qa(`wan-interface-ipv6-card-dns-value-${ipIndex}`)">{{ ip.DNSServer || '-' }}</span>
            </div>
            <div class="card-row">
              <span class="card-label" :data-testid="qa(`wan-interface-ipv6-card-status-label-${ipIndex}`)">{{ t('wan.status') }}</span>
              <span class="card-value" :data-testid="qa(`wan-interface-ipv6-card-status-value-${ipIndex}`)">{{ ip.Status }}</span>
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