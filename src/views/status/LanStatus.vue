<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { LanStatusResponse } from '../../types/lan';
import { getLanStatus } from '../../services/api';

const { t } = useI18n();
const lanData = ref<LanStatusResponse | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const fetchLanStatus = async () => {
  loading.value = true;
  error.value = null;
  try {
    lanData.value = await getLanStatus();
  } catch (err) {
    console.error('Error fetching LAN status:', err);
    error.value = 'Failed to fetch LAN status';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchLanStatus();
});
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">{{ t('lan.title') }}</h1>
    
    <div class="status-content">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>{{ t('common.loading') }}</span>
      </div>

      <div v-else-if="error" class="error-state">
        {{ error }}
      </div>

      <template v-else-if="lanData">
        <div v-for="iface in lanData.StatusLan" :key="iface.Name" class="panel-section">
          <div class="section-title">{{ iface.Name }}</div>
          
          <div class="card-content">
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
              <h3 class="subsection-title">{{ t('lan.ipv4') }}</h3>
              
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
              <h3 class="subsection-title">{{ t('lan.ipv6') }}</h3>
              
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
      </template>
    </div>
  </div>
</template>

<style scoped>
.ip-section {
  margin-top: 1.5rem;
}

.subsection-title {
  font-size: 1rem;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  font-weight: 500;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  background-color: white;
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
}

.error-state {
  padding: 2rem;
  text-align: center;
  color: #dc3545;
  background-color: white;
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
}

@media (max-width: 768px) {
  .ip-section {
    margin-top: 1rem;
  }
}
</style>