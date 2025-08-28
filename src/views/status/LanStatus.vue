<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { LanStatusResponse } from '../../types/lan';
import { getLanStatus } from '../../services/api';
import { useQA } from '../../utils/qa';
const { isQAMode, qa, slug } = useQA();

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
                <span class="info-label" :data-testid="qa(`lan-mac-label-${slug(iface.Name)}`)">{{ t('lan.macAddress') }}</span>
                <span class="info-value" :data-testid="qa(`lan-mac-value-${slug(iface.Name)}`)">{{ iface.MACAddress }}</span>
              </div>
              <div class="info-row">
                <span class="info-label" :data-testid="qa(`lan-mtu-label-${slug(iface.Name)}`)">{{ t('lan.mtu') }}</span>
                <span class="info-value" :data-testid="qa(`lan-mtu-value-${slug(iface.Name)}`)">{{ iface.MTU }}</span>
              </div>
            </div>

            <!-- IPv4 Section -->
            <div class="ip-section">
              <h3 class="subsection-title" :data-testid="qa(`lan-ipv4-title-${slug(iface.Name)}`)">{{ t('lan.ipv4') }}</h3>
              
              <div class="table-container" :data-testid="qa(`lan-ipv4-table-${slug(iface.Name)}`)">
                <table>
                  <thead>
                    <tr>
                      <th :data-testid="qa('lan-ipv4-header-name')">{{ t('lan.name') }}</th>
                      <th :data-testid="qa('lan-ipv4-header-ip')">{{ t('lan.ipAddress') }}</th>
                      <th :data-testid="qa('lan-ipv4-header-netmask')">{{ t('lan.netmask') }}</th>
                      <th :data-testid="qa('lan-ipv4-header-status')">{{ t('lan.status') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(ip, ipIndex) in iface.ipv4" :key="ip.Name" :data-testid="qa(`lan-ipv4-row-${slug(iface.Name)}-${ipIndex}`)">
                      <td :data-testid="qa(`lan-ipv4-name-${slug(iface.Name)}-${ipIndex}`)">{{ ip.Name }}</td>
                      <td :data-testid="qa(`lan-ipv4-address-${slug(iface.Name)}-${ipIndex}`)">{{ ip.IPv4Address }}</td>
                      <td :data-testid="qa(`lan-ipv4-netmask-${slug(iface.Name)}-${ipIndex}`)">{{ ip.IPv4Netmask }}</td>
                      <td :data-testid="qa(`lan-ipv4-status-${slug(iface.Name)}-${ipIndex}`)">{{ ip.Status }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="mobile-cards" :data-testid="qa(`lan-ipv4-mobile-${slug(iface.Name)}`)">
                <div class="table-card" v-for="(ip, ipIndex) in iface.ipv4" :key="ip.Name" :data-testid="qa(`lan-ipv4-card-${slug(iface.Name)}-${ipIndex}`)">
                  <div class="card-row">
                    <span class="card-label" :data-testid="qa(`lan-ipv4-card-name-label-${slug(iface.Name)}-${ipIndex}`)">{{ t('lan.name') }}</span>
                    <span class="card-value" :data-testid="qa(`lan-ipv4-card-name-value-${slug(iface.Name)}-${ipIndex}`)">{{ ip.Name }}</span>
                  </div>
                  <div class="card-row">
                    <span class="card-label" :data-testid="qa(`lan-ipv4-card-ip-label-${slug(iface.Name)}-${ipIndex}`)">{{ t('lan.ipAddress') }}</span>
                    <span class="card-value" :data-testid="qa(`lan-ipv4-card-ip-value-${slug(iface.Name)}-${ipIndex}`)">{{ ip.IPv4Address }}</span>
                  </div>
                  <div class="card-row">
                    <span class="card-label" :data-testid="qa(`lan-ipv4-card-netmask-label-${slug(iface.Name)}-${ipIndex}`)">{{ t('lan.netmask') }}</span>
                    <span class="card-value" :data-testid="qa(`lan-ipv4-card-netmask-value-${slug(iface.Name)}-${ipIndex}`)">{{ ip.IPv4Netmask }}</span>
                  </div>
                  <div class="card-row">
                    <span class="card-label" :data-testid="qa(`lan-ipv4-card-status-label-${slug(iface.Name)}-${ipIndex}`)">{{ t('lan.status') }}</span>
                    <span class="card-value" :data-testid="qa(`lan-ipv4-card-status-value-${slug(iface.Name)}-${ipIndex}`)">{{ ip.Status }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- IPv6 Section -->
            <div class="ip-section" v-if="iface.ipv6.length > 0">
              <h3 class="subsection-title" :data-testid="qa(`lan-ipv6-title-${slug(iface.Name)}`)">{{ t('lan.ipv6') }}</h3>
              
              <div class="table-container" :data-testid="qa(`lan-ipv6-table-${slug(iface.Name)}`)">
                <table>
                  <thead>
                    <tr>
                      <th :data-testid="qa('lan-ipv6-header-name')">{{ t('lan.name') }}</th>
                      <th :data-testid="qa('lan-ipv6-header-ip')">{{ t('lan.ipAddress') }}</th>
                      <th :data-testid="qa('lan-ipv6-header-status')">{{ t('lan.status') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(ip, ipIndex) in iface.ipv6" :key="ip.Name" :data-testid="qa(`lan-ipv6-row-${slug(iface.Name)}-${ipIndex}`)">
                      <td :data-testid="qa(`lan-ipv6-name-${slug(iface.Name)}-${ipIndex}`)">{{ ip.Name }}</td>
                      <td :data-testid="qa(`lan-ipv6-address-${slug(iface.Name)}-${ipIndex}`)">{{ ip.IPv6Address }}</td>
                      <td :data-testid="qa(`lan-ipv6-status-${slug(iface.Name)}-${ipIndex}`)">{{ ip.Status }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="mobile-cards" :data-testid="qa(`lan-ipv6-mobile-${slug(iface.Name)}`)">
                <div class="table-card" v-for="(ip, ipIndex) in iface.ipv6" :key="ip.Name" :data-testid="qa(`lan-ipv6-card-${slug(iface.Name)}-${ipIndex}`)">
                  <div class="card-row">
                    <span class="card-label" :data-testid="qa(`lan-ipv6-card-name-label-${slug(iface.Name)}-${ipIndex}`)">{{ t('lan.name') }}</span>
                    <span class="card-value" :data-testid="qa(`lan-ipv6-card-name-value-${slug(iface.Name)}-${ipIndex}`)">{{ ip.Name }}</span>
                  </div>
                  <div class="card-row">
                    <span class="card-label" :data-testid="qa(`lan-ipv6-card-ip-label-${slug(iface.Name)}-${ipIndex}`)">{{ t('lan.ipAddress') }}</span>
                    <span class="card-value" :data-testid="qa(`lan-ipv6-card-ip-value-${slug(iface.Name)}-${ipIndex}`)">{{ ip.IPv6Address }}</span>
                  </div>
                  <div class="card-row">
                    <span class="card-label" :data-testid="qa(`lan-ipv6-card-status-label-${slug(iface.Name)}-${ipIndex}`)">{{ t('lan.status') }}</span>
                    <span class="card-value" :data-testid="qa(`lan-ipv6-card-status-value-${slug(iface.Name)}-${ipIndex}`)">{{ ip.Status }}</span>
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