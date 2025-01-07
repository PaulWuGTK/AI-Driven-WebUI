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

    <!-- IPv6 Configuration -->
    <div class="ip-section">
      <h4 class="subsection-title">IPv6</h4>
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
  </div>
</template>

<style scoped>

.interface-section {
  background-color: white;
  border-radius: 4px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.subsection-title {
  font-size: 0.9rem;
  color: #666;
  margin: 1.5rem 0 1rem 0;
}

.info-grid {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
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

</style>