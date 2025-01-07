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
        </div>

        <!-- IPv6 Section -->
        <div class="ip-section" v-if="iface.ipv6.length > 0">
          <div class="ip-header">{{ t('lan.ipv6') }}</div>
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

.page-title {
  color: #0070BB;
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
  padding: 1rem 2rem;
  text-align: left;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
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

</style>