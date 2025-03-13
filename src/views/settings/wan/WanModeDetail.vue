<script setup lang="ts">
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WanModeConfig } from '../../../types/wanManagement';

const { t } = useI18n();

defineProps<{
  mode: WanModeConfig;
  onBack: () => void;
}>();

// Display mappings
const ipv4ModeDisplay = {
  'dhcp4': 'DHCP',
  'ppp4': 'PPPoE',
  'none': 'None',
  'static': 'Static',
  'dslite': 'DS-Lite',
  'link': 'Link'
};

const ipv6ModeDisplay = {
  'dhcp6': 'DHCP',
  'ppp6': 'PPPoE',
  'none': 'None',
  'static': 'Static',
  'link': 'Link'
};

const vlanTypeDisplay = {
  'untagged': 'Untagged',
  'vlan': 'VLAN',
  'atm': 'ATM'
};
</script>

<template>
  <div class="wan-mode-detail">
    <div class="panel-section">
      <div class="section-title">{{ mode.WANMode }}</div>
      
      <div class="card-content">
        <div class="cards-grid">
          <div 
            class="interface-card" 
            v-for="(iface, index) in mode.Interfaces" 
            :key="index"
          >
            <div class="card-header">
              <div class="title-with-status">
                <span 
                  class="status-dot"
                  :class="{ active: mode.Status === 'Enabled' }"
                ></span>
                <h3 class="card-title">Interface {{ index + 1 }}</h3>
              </div>
            </div>
            <div class="card-content">
              <div class="card-row">
                <span class="card-label">{{ t('wanManagement.interface') }}</span>
                <span class="card-value">{{ iface.Interface }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('wanManagement.enableSensing') }}</span>
                <span class="card-value">{{ mode.EnableSensing ? 'True' : 'False' }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('wanManagement.ipv4DnsMode') }}</span>
                <span class="card-value">{{ mode.DNSMode || 'None' }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('wanManagement.ipv6DnsMode') }}</span>
                <span class="card-value">{{ mode.IPv6DNSMode || 'None' }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('wanManagement.physicalType') }}</span>
                <span class="card-value">{{ mode.PhysicalType }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('wanManagement.status') }}</span>
                <span class="card-value">{{ mode.Status }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('wanManagement.ipv4Mode') }}</span>
                <span class="card-value">{{ ipv4ModeDisplay[iface.IPv4Mode] }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('wanManagement.ipv6Mode') }}</span>
                <span class="card-value">{{ ipv6ModeDisplay[iface.IPv6Mode] }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('wanManagement.vlanType') }}</span>
                <span class="card-value">{{ vlanTypeDisplay[iface.VLANType] }}</span>
              </div>
              <div v-if="iface.VLANType !== 'untagged'" class="card-row">
                <span class="card-label">{{ t('wanManagement.vlanId') }}</span>
                <span class="card-value">{{ iface.VLANID }}</span>
              </div>
              <div v-if="iface.VLANType !== 'untagged'" class="card-row">
                <span class="card-label">{{ t('wanManagement.vlanPriority') }}</span>
                <span class="card-value">{{ iface.VLANPriority }}</span>
              </div>
              <div v-if="iface.IPv4Mode === 'ppp4' || iface.IPv6Mode === 'ppp6'" class="card-row">
                <span class="card-label">{{ t('wanManagement.pppoeUsername') }}</span>
                <span class="card-value">{{ iface.PPPoEUserName }}</span>
              </div>
              <div v-if="iface.IPv4Mode === 'ppp4' || iface.IPv6Mode === 'ppp6'" class="card-row">
                <span class="card-label">{{ t('wanManagement.pppoePassword') }}</span>
                <span class="card-value">{{ iface.PPPoEPassword }}</span>
              </div>

              <!-- Static IPv4 Address Section -->
              <template v-if="iface.IPv4Mode === 'static' && iface.StaticIPv4Address">
                <div class="section-divider">{{ t('wanManagement.staticIpv4') }}</div>
                <div class="card-row">
                  <span class="card-label">{{ t('wanManagement.ipv4Address') }}</span>
                  <span class="card-value">{{ iface.StaticIPv4Address.IPv4Address }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">{{ t('wanManagement.defaultRouter') }}</span>
                  <span class="card-value">{{ iface.StaticIPv4Address.DefaultRouter }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">{{ t('wanManagement.subnetMask') }}</span>
                  <span class="card-value">{{ iface.StaticIPv4Address.SubnetMask }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">{{ t('wanManagement.dnsServers') }}</span>
                  <span class="card-value">{{ iface.StaticIPv4Address.DNSServers }}</span>
                </div>
              </template>

              <!-- Static IPv6 Address Section -->
              <template v-if="iface.IPv6Mode === 'static' && iface.StaticIPv6Address">
                <div class="section-divider">{{ t('wanManagement.staticIpv6') }}</div>
                <div class="card-row">
                  <span class="card-label">{{ t('wanManagement.ipv6Address') }}</span>
                  <span class="card-value">{{ iface.StaticIPv6Address.IPv6Address }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">{{ t('wanManagement.defaultRouter') }}</span>
                  <span class="card-value">{{ iface.StaticIPv6Address.DefaultRouter }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">{{ t('wanManagement.prefixLength') }}</span>
                  <span class="card-value">{{ iface.StaticIPv6Address.PrefixLength }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">{{ t('wanManagement.dnsServers') }}</span>
                  <span class="card-value">{{ iface.StaticIPv6Address.DNSServers }}</span>
                </div>
              </template>
            </div>
          </div>
        </div>

        <div class="button-group">
          <button class="btn btn-primary" @click="onBack">
            {{ t('mesh.back') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wan-mode-detail {
  padding: 1.5rem;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.interface-card {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  overflow: hidden;
}

.card-header {
  padding: 1rem;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.title-with-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #dc3545;
}

.status-dot.active {
  background-color: #4caf50;
}

.card-title {
  margin: 0;
  font-size: 1rem;
  color: var(--text-primary);
  font-weight: 500;
}

.card-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.card-row:last-child {
  border-bottom: none;
}

.card-label {
  color: var(--text-secondary);
}

.card-value {
  color: var(--text-primary);
  font-weight: 500;
}

.section-divider {
  padding: 0.75rem;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: 500;
  border-bottom: 1px solid var(--border-color);
  border-top: 1px solid var(--border-color);
}

.button-group {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .wan-mode-detail {
    padding: 1rem;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }

  .button-group {
    flex-direction: column;
  }

  .button-group .btn {
    width: 100%;
  }
}
</style>