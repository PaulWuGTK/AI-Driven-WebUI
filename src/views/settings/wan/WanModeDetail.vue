<script setup lang="ts">
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WanModeConfig } from '../../../types/wanManagement';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

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
  <div class="wan-mode-detail" :data-testid="qa('wan-mode-detail-content')">
    <div class="panel-section" :data-testid="qa('wan-mode-detail-panel')">
      <div class="section-title" :data-testid="qa('wan-mode-detail-title')">{{ mode.WANMode }}</div>
      
      <div class="card-content">
        <div class="cards-grid" :data-testid="qa('wan-mode-detail-cards-grid')">
          <div 
            class="interface-card" 
            v-for="(iface, ifaceIndex) in mode.Interfaces" 
            :key="ifaceIndex"
            :data-testid="qa(`wan-mode-detail-interface-card-${ifaceIndex}`)"
          >
            <div class="card-header" :data-testid="qa(`wan-mode-detail-interface-header-${ifaceIndex}`)">
              <div class="title-with-status">
                <span 
                  class="status-dot"
                  :data-testid="qa(`wan-mode-detail-interface-status-dot-${ifaceIndex}`)"
                  :class="{ active: mode.Status === 'Enabled' }"
                ></span>
                <h3 class="card-title" :data-testid="qa(`wan-mode-detail-interface-title-${ifaceIndex}`)">Interface {{ ifaceIndex + 1 }}</h3>
              </div>
            </div>
            <div class="card-content" :data-testid="qa(`wan-mode-detail-interface-content-${ifaceIndex}`)">
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wan-mode-detail-interface-label-${ifaceIndex}`)">{{ t('wanManagement.interface') }}</span>
                <span class="card-value" :data-testid="qa(`wan-mode-detail-interface-value-${ifaceIndex}`)">{{ iface.Interface }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wan-mode-detail-enable-sensing-label-${ifaceIndex}`)">{{ t('wanManagement.enableSensing') }}</span>
                <span class="card-value" :data-testid="qa(`wan-mode-detail-enable-sensing-value-${ifaceIndex}`)">{{ mode.EnableSensing ? 'True' : 'False' }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wan-mode-detail-ipv4-dns-mode-label-${ifaceIndex}`)">{{ t('wanManagement.ipv4DnsMode') }}</span>
                <span class="card-value" :data-testid="qa(`wan-mode-detail-ipv4-dns-mode-value-${ifaceIndex}`)">{{ mode.DNSMode || 'None' }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wan-mode-detail-ipv6-dns-mode-label-${ifaceIndex}`)">{{ t('wanManagement.ipv6DnsMode') }}</span>
                <span class="card-value" :data-testid="qa(`wan-mode-detail-ipv6-dns-mode-value-${ifaceIndex}`)">{{ mode.IPv6DNSMode || 'None' }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wan-mode-detail-physical-type-label-${ifaceIndex}`)">{{ t('wanManagement.physicalType') }}</span>
                <span class="card-value" :data-testid="qa(`wan-mode-detail-physical-type-value-${ifaceIndex}`)">{{ mode.PhysicalType }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wan-mode-detail-status-label-${ifaceIndex}`)">{{ t('wanManagement.status') }}</span>
                <span class="card-value" :data-testid="qa(`wan-mode-detail-status-value-${ifaceIndex}`)">{{ mode.Status }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wan-mode-detail-ipv4-mode-label-${ifaceIndex}`)">{{ t('wanManagement.ipv4Mode') }}</span>
                <span class="card-value" :data-testid="qa(`wan-mode-detail-ipv4-mode-value-${ifaceIndex}`)">{{ ipv4ModeDisplay[iface.IPv4Mode] }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wan-mode-detail-ipv6-mode-label-${ifaceIndex}`)">{{ t('wanManagement.ipv6Mode') }}</span>
                <span class="card-value" :data-testid="qa(`wan-mode-detail-ipv6-mode-value-${ifaceIndex}`)">{{ ipv6ModeDisplay[iface.IPv6Mode] }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`wan-mode-detail-vlan-type-label-${ifaceIndex}`)">{{ t('wanManagement.vlanType') }}</span>
                <span class="card-value" :data-testid="qa(`wan-mode-detail-vlan-type-value-${ifaceIndex}`)">{{ vlanTypeDisplay[iface.VLANType] }}</span>
              </div>
              <div v-if="iface.VLANType !== 'untagged'" class="card-row" :data-testid="qa(`wan-mode-detail-vlan-id-row-${ifaceIndex}`)">
                <span class="card-label" :data-testid="qa(`wan-mode-detail-vlan-id-label-${ifaceIndex}`)">{{ t('wanManagement.vlanId') }}</span>
                <span class="card-value" :data-testid="qa(`wan-mode-detail-vlan-id-value-${ifaceIndex}`)">{{ iface.VLANID }}</span>
              </div>
              <div v-if="iface.VLANType !== 'untagged'" class="card-row" :data-testid="qa(`wan-mode-detail-vlan-priority-row-${ifaceIndex}`)">
                <span class="card-label" :data-testid="qa(`wan-mode-detail-vlan-priority-label-${ifaceIndex}`)">{{ t('wanManagement.vlanPriority') }}</span>
                <span class="card-value" :data-testid="qa(`wan-mode-detail-vlan-priority-value-${ifaceIndex}`)">{{ iface.VLANPriority }}</span>
              </div>
              <div v-if="iface.IPv4Mode === 'ppp4' || iface.IPv6Mode === 'ppp6'" class="card-row" :data-testid="qa(`wan-mode-detail-pppoe-username-row-${ifaceIndex}`)">
                <span class="card-label" :data-testid="qa(`wan-mode-detail-pppoe-username-label-${ifaceIndex}`)">{{ t('wanManagement.pppoeUsername') }}</span>
                <span class="card-value" :data-testid="qa(`wan-mode-detail-pppoe-username-value-${ifaceIndex}`)">{{ iface.PPPoEUserName }}</span>
              </div>
              <div v-if="iface.IPv4Mode === 'ppp4' || iface.IPv6Mode === 'ppp6'" class="card-row" :data-testid="qa(`wan-mode-detail-pppoe-password-row-${ifaceIndex}`)">
                <span class="card-label" :data-testid="qa(`wan-mode-detail-pppoe-password-label-${ifaceIndex}`)">{{ t('wanManagement.pppoePassword') }}</span>
                <span class="card-value" :data-testid="qa(`wan-mode-detail-pppoe-password-value-${ifaceIndex}`)">{{ iface.PPPoEPassword }}</span>
              </div>

              <!-- Static IPv4 Address Section -->
              <template v-if="iface.IPv4Mode === 'static' && iface.StaticIPv4Address" :data-testid="qa(`wan-mode-detail-static-ipv4-${ifaceIndex}`)">
                <div class="section-divider" :data-testid="qa(`wan-mode-detail-static-ipv4-divider-${ifaceIndex}`)">{{ t('wanManagement.staticIpv4') }}</div>
                <div class="card-row">
                  <span class="card-label" :data-testid="qa(`wan-mode-detail-static-ipv4-address-label-${ifaceIndex}`)">{{ t('wanManagement.ipv4Address') }}</span>
                  <span class="card-value" :data-testid="qa(`wan-mode-detail-static-ipv4-address-value-${ifaceIndex}`)">{{ iface.StaticIPv4Address.IPv4Address }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label" :data-testid="qa(`wan-mode-detail-static-ipv4-router-label-${ifaceIndex}`)">{{ t('wanManagement.defaultRouter') }}</span>
                  <span class="card-value" :data-testid="qa(`wan-mode-detail-static-ipv4-router-value-${ifaceIndex}`)">{{ iface.StaticIPv4Address.DefaultRouter }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label" :data-testid="qa(`wan-mode-detail-static-ipv4-subnet-label-${ifaceIndex}`)">{{ t('wanManagement.subnetMask') }}</span>
                  <span class="card-value" :data-testid="qa(`wan-mode-detail-static-ipv4-subnet-value-${ifaceIndex}`)">{{ iface.StaticIPv4Address.SubnetMask }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label" :data-testid="qa(`wan-mode-detail-static-ipv4-dns-label-${ifaceIndex}`)">{{ t('wanManagement.dnsServers') }}</span>
                  <span class="card-value" :data-testid="qa(`wan-mode-detail-static-ipv4-dns-value-${ifaceIndex}`)">{{ iface.StaticIPv4Address.DNSServers }}</span>
                </div>
              </template>

              <!-- Static IPv6 Address Section -->
              <template v-if="iface.IPv6Mode === 'static' && iface.StaticIPv6Address" :data-testid="qa(`wan-mode-detail-static-ipv6-${ifaceIndex}`)">
                <div class="section-divider" :data-testid="qa(`wan-mode-detail-static-ipv6-divider-${ifaceIndex}`)">{{ t('wanManagement.staticIpv6') }}</div>
                <div class="card-row">
                  <span class="card-label" :data-testid="qa(`wan-mode-detail-static-ipv6-address-label-${ifaceIndex}`)">{{ t('wanManagement.ipv6Address') }}</span>
                  <span class="card-value" :data-testid="qa(`wan-mode-detail-static-ipv6-address-value-${ifaceIndex}`)">{{ iface.StaticIPv6Address.IPv6Address }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label" :data-testid="qa(`wan-mode-detail-static-ipv6-router-label-${ifaceIndex}`)">{{ t('wanManagement.defaultRouter') }}</span>
                  <span class="card-value" :data-testid="qa(`wan-mode-detail-static-ipv6-router-value-${ifaceIndex}`)">{{ iface.StaticIPv6Address.DefaultRouter }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label" :data-testid="qa(`wan-mode-detail-static-ipv6-prefix-label-${ifaceIndex}`)">{{ t('wanManagement.prefixLength') }}</span>
                  <span class="card-value" :data-testid="qa(`wan-mode-detail-static-ipv6-prefix-value-${ifaceIndex}`)">{{ iface.StaticIPv6Address.PrefixLength }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label" :data-testid="qa(`wan-mode-detail-static-ipv6-dns-label-${ifaceIndex}`)">{{ t('wanManagement.dnsServers') }}</span>
                  <span class="card-value" :data-testid="qa(`wan-mode-detail-static-ipv6-dns-value-${ifaceIndex}`)">{{ iface.StaticIPv6Address.DNSServers }}</span>
                </div>
              </template>
            </div>
          </div>
        </div>

        <div class="button-group">
          <button class="btn btn-primary" :data-testid="qa('wan-mode-detail-back-button')" @click="onBack">
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