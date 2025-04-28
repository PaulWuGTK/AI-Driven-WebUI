<script setup lang="ts">
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';

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
  <div class="wan-status" v-if="wanInfo">
    <h2 class="card-title">{{ t('dashboard.wan') }} {{ t('dashboard.status') }}</h2>

    <div class="info-grid">
      <div class="info-row">
        <span class="info-label">{{ t('dashboard.protocol') }}</span>
        <span class="value">{{ wanInfo.Protocol }}</span>
      </div>

      <div class="info-row">
        <span class="info-label">{{ t('dashboard.ipv4Address') }}</span>
        <span class="value" :title="wanInfo.InternetAddress">{{ wanInfo.InternetAddress }}</span>
      </div>

      <div class="info-row">
        <span class="info-label">{{ t('dashboard.subnetMask') }}</span>
        <span class="value" :title="wanInfo.SubnetMask">{{ wanInfo.SubnetMask }}</span>
      </div>

      <div class="info-row">
        <span class="info-label">{{ t('dashboard.defaultGateway') }}</span>
        <span class="value" :title="wanInfo.DefaultGateway">{{ wanInfo.DefaultGateway }}</span>
      </div>

      <div class="info-row">
        <span class="info-label">{{ t('dashboard.primaryDNS') }}</span>
        <span class="value" :title="wanInfo.PrimaryDNS">{{ wanInfo.PrimaryDNS }}</span>
      </div>

      <div class="info-row">
        <span class="info-label">{{ t('dashboard.secondaryDNS') }}</span>
        <span class="value" :title="wanInfo.SecondaryDNS">{{ wanInfo.SecondaryDNS }}</span>
      </div>

      <div class="info-row">
        <span class="info-label">{{ t('dashboard.macAddress') }}</span>
        <span class="value" :title="wanInfo.MacAddress">{{ wanInfo.MacAddress }}</span>
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