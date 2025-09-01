<script setup lang="ts">
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQA } from '../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();

interface DashboardWAN {
  Protocol: string;
  InternetAddress: string;
  SubnetMask: string;
  DefaultGateway: string;
  PrimaryDNS: string;
  SecondaryDNS: string;
  MacAddress: string;
}

const props = defineProps<{
  wanInfo?: DashboardWAN;
}>();
</script>

<template>
  <div class="wan-status" v-if="wanInfo" :data-testid="qa('dashboard-wan-status-content')">
    <h2 class="card-title" :data-testid="qa('dashboard-wan-status-title')">{{ t('dashboard.wan') }} {{ t('dashboard.status') }}</h2>

    <div class="info-grid" :data-testid="qa('dashboard-wan-status-grid')">
      <div class="info-row" :data-testid="qa('dashboard-wan-status-protocol')">
        <span class="info-label" :data-testid="qa('dashboard-wan-status-protocol-label')">{{ t('dashboard.protocol') }}</span>
        <span class="value" :data-testid="qa('dashboard-wan-status-protocol-value')" :title="wanInfo.Protocol">{{ wanInfo.Protocol }}</span>
      </div>

      <div class="info-row" :data-testid="qa('dashboard-wan-status-ipv4-address')">
        <span class="info-label" :data-testid="qa('dashboard-wan-status-ipv4-address-label')">{{ t('dashboard.ipv4Address') }}</span>
        <span class="value" :data-testid="qa('dashboard-wan-status-ipv4-address-value')" :title="wanInfo.InternetAddress">{{ wanInfo.InternetAddress }}</span>
      </div>

      <div class="info-row" :data-testid="qa('dashboard-wan-status-subnet-mask')">
        <span class="info-label" :data-testid="qa('dashboard-wan-status-subnet-mask-label')">{{ t('dashboard.subnetMask') }}</span>
        <span class="value" :data-testid="qa('dashboard-wan-status-subnet-mask-value')" :title="wanInfo.SubnetMask">{{ wanInfo.SubnetMask }}</span>
      </div>

      <div class="info-row" :data-testid="qa('dashboard-wan-status-default-gateway')">
        <span class="info-label" :data-testid="qa('dashboard-wan-status-default-gateway-label')">{{ t('dashboard.defaultGateway') }}</span>
        <span class="value" :data-testid="qa('dashboard-wan-status-default-gateway-value')" :title="wanInfo.DefaultGateway">{{ wanInfo.DefaultGateway }}</span>
      </div>

      <div class="info-row" :data-testid="qa('dashboard-wan-status-primary-dns')">
        <span class="info-label" :data-testid="qa('dashboard-wan-status-primary-dns-label')">{{ t('dashboard.primaryDNS') }}</span>
        <span class="value" :data-testid="qa('dashboard-wan-status-primary-dns-value')" :title="wanInfo.PrimaryDNS">{{ wanInfo.PrimaryDNS }}</span>
      </div>

      <div class="info-row" :data-testid="qa('dashboard-wan-status-secondary-dns')">
        <span class="info-label" :data-testid="qa('dashboard-wan-status-secondary-dns-label')">{{ t('dashboard.secondaryDNS') }}</span>
        <span class="value" :data-testid="qa('dashboard-wan-status-secondary-dns-value')" :title="wanInfo.SecondaryDNS">{{ wanInfo.SecondaryDNS }}</span>
      </div>

      <div class="info-row" :data-testid="qa('dashboard-wan-status-mac-address')">
        <span class="info-label" :data-testid="qa('dashboard-wan-status-mac-address-label')">{{ t('dashboard.macAddress') }}</span>
        <span class="value" :data-testid="qa('dashboard-wan-status-mac-address-value')" :title="wanInfo.MacAddress">{{ wanInfo.MacAddress }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.info-grid {
  display: grid;
  gap: 1rem;
  max-width: 100%;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  overflow: hidden;
}

.info-label {
  flex: 0 0 140px;
  color: var(--text-secondary);
}

.value {
  flex: 1 1 auto;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
  color: var(--text-primary);
}

.card-title {
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 1rem 0;
}
</style>