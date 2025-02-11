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
  <div class="page-container">
    <h1 class="page-title">{{ t('lan.title') }}</h1>
    
    <div v-if="lanData" class="status-content">
      <div v-for="iface in lanData.StatusLan" :key="iface.Name" class="interface-card">
        <div class="interface-header">{{ iface.Name }}</div>
        
        <div class="info-grid">
          <div class="info-row">
            <span class="info-label">{{ t('lan.macAddress') }}</span>
            <span class="info-value">{{ iface.MACAddress }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('lan.mtu') }}</span>
            <span class="info-value">{{ iface.MTU }}</span>
          </div>
        </div>

        <!-- IPv4 Section -->
        <div class="ip-section">
          <div class="ip-header">{{ t('lan.ipv4') }}</div>
          
          <div class="table-container">
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
          
          <div class="table-container">
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

.interface-card {
  background-color: white;
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.interface-header {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  color: var(--text-primary);
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  font-weight: 500;
}

.info-grid {
  padding: 2rem;
  display: grid;
  gap: 0.75rem;
  border-bottom: 1px solid var(--border-color);
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
  padding: 0 2rem 2rem;
}

.ip-header {
  padding: 1rem 0;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 500;
}

.table-container {
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .interfaces {
    padding: 1rem;
    gap: 1rem;
  }

  .interface-header {
    padding: 0.75rem 1rem;
  }

  .info-grid {
    padding: 1rem;
  }

  .info-row {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }

  .info-label {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .ip-section {
    padding: 0 1rem 1rem;
  }

  .table-container {
    display: none;
  }

  .mobile-cards {
    display: block;
  }
}
</style>