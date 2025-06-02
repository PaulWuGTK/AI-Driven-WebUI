<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ThreadStatusResponse, ThreadScanResponse, ThreadScanPAN } from '../../../types/thread';
import { getThreadStatus, scanThreadNetworks } from '../../../services/api/thread';

const { t } = useI18n();
const threadStatus = ref<ThreadStatusResponse | null>(null);
const scanData = ref<ThreadScanResponse | null>(null);
const loading = ref(true);
const scanLoading = ref(false);
const error = ref<string | null>(null);
const scanError = ref<string | null>(null);
const refreshInterval = ref<number | null>(null);
const showNetworkKey = ref(false);
const showPSKc = ref(false);

const fetchThreadStatus = async () => {
  loading.value = true;
  error.value = null;
  try {
    threadStatus.value = await getThreadStatus();
  } catch (err) {
    console.error('Error fetching Thread status:', err);
    error.value = 'Failed to fetch Thread status';
  } finally {
    loading.value = false;
  }
};

const handleRefresh = () => {
  fetchThreadStatus();
};

const handleScan = async () => {
  scanLoading.value = true;
  scanError.value = null;
  try {
    scanData.value = await scanThreadNetworks();
  } catch (err) {
    console.error('Error scanning for Thread networks:', err);
    scanError.value = 'Failed to scan for Thread networks';
  } finally {
    scanLoading.value = false;
  }
};

const toggleShowNetworkKey = () => {
  showNetworkKey.value = !showNetworkKey.value;
};

const toggleShowPSKc = () => {
  showPSKc.value = !showPSKc.value;
};

onMounted(() => {
  fetchThreadStatus();
  // Refresh every 30 seconds
  refreshInterval.value = window.setInterval(fetchThreadStatus, 30000);
});

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
});
</script>

<template>
  <div class="thread-content">
    <div v-if="loading && !threadStatus" class="loading-state">
      <div class="loading-spinner"></div>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>

    <template v-else-if="threadStatus">
      <!-- Border Router Section -->
      <div class="panel-section">
        <div class="section-title">{{ t('thread.borderRouter') }}</div>
        
        <div class="card-content">
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">{{ t('thread.status') }}</span>
              <span class="info-value" :class="{ 'status-running': threadStatus.ThreadStatus['Border Router'].Status === 'Running' }">
                {{ threadStatus.ThreadStatus['Border Router'].Status }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ t('thread.borderAgentId') }}</span>
              <span class="info-value">{{ threadStatus.ThreadStatus['Border Router'].BorderAgentID }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- MLE Section -->
      <div class="panel-section">
        <div class="section-title">{{ t('thread.mle') }}</div>
        
        <div class="card-content">
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">{{ t('thread.extendedMac') }}</span>
              <span class="info-value">{{ threadStatus.ThreadStatus['Border Router'].MLE.ExtendedMAC }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ t('thread.role') }}</span>
              <span class="info-value">{{ threadStatus.ThreadStatus['Border Router'].MLE.Role || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ t('thread.rloc16') }}</span>
              <span class="info-value">{{ threadStatus.ThreadStatus['Border Router'].MLE.Rloc16 || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ t('thread.interface') }}</span>
              <span class="info-value">{{ threadStatus.ThreadStatus['Border Router'].MLE.Interface }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ t('thread.firmwareVersion') }}</span>
              <span class="info-value">{{ threadStatus.ThreadStatus['Border Router'].MLE.FirmwareVersion }}</span>
            </div>
          </div>

          <!-- Dataset Section -->
          <div class="dataset-section">
            <h3 class="subsection-title">{{ t('thread.dataset') }}</h3>
            
            <div class="info-grid">
              <div class="info-row">
                <span class="info-label">{{ t('thread.channel') }}</span>
                <span class="info-value">{{ threadStatus.ThreadStatus['Border Router'].MLE.Dataset.Channel || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('thread.channelMask') }}</span>
                <span class="info-value">{{ 
                  Array.isArray(threadStatus.ThreadStatus['Border Router'].MLE.Dataset.ChannelMask) 
                    ? threadStatus.ThreadStatus['Border Router'].MLE.Dataset.ChannelMask.join(', ') 
                    : threadStatus.ThreadStatus['Border Router'].MLE.Dataset.ChannelMask || '-' 
                }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('thread.extendedPanId') }}</span>
                <span class="info-value">{{ threadStatus.ThreadStatus['Border Router'].MLE.Dataset.ExtendedPanId || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('thread.meshLocalPrefix') }}</span>
                <span class="info-value">{{ threadStatus.ThreadStatus['Border Router'].MLE.Dataset.MeshLocalPrefix || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('thread.networkKey') }}</span>
                <div class="password-value">
                  <span v-if="showNetworkKey">{{ threadStatus.ThreadStatus['Border Router'].MLE.Dataset.NetworkKey || '-' }}</span>
                  <span v-else>••••••••••••••••••••••••••••••••</span>
                  <button 
                    type="button" 
                    class="toggle-password"
                    @click="toggleShowNetworkKey"
                  >
                    <span class="material-icons">
                      {{ showNetworkKey ? 'visibility_off' : 'visibility' }}
                    </span>
                  </button>
                </div>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('thread.networkName') }}</span>
                <span class="info-value">{{ threadStatus.ThreadStatus['Border Router'].MLE.Dataset.NetworkName || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('thread.pskc') }}</span>
                <div class="password-value">
                  <span v-if="showPSKc">{{ threadStatus.ThreadStatus['Border Router'].MLE.Dataset.PSKc || '-' }}</span>
                  <span v-else>••••••••••••••••••••••••••••••••</span>
                  <button 
                    type="button" 
                    class="toggle-password"
                    @click="toggleShowPSKc"
                  >
                    <span class="material-icons">
                      {{ showPSKc ? 'visibility_off' : 'visibility' }}
                    </span>
                  </button>
                </div>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('thread.panId') }}</span>
                <span class="info-value">{{ threadStatus.ThreadStatus['Border Router'].MLE.Dataset.PanId || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('thread.securityPolicy') }}</span>
                <span class="info-value">{{ threadStatus.ThreadStatus['Border Router'].MLE.Dataset.SecurityPolicy || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('thread.hexEncodedTlv') }}</span>
                <span class="info-value tlv-value">{{ threadStatus.ThreadStatus['Border Router'].MLE.Dataset['Hex-encoded'] || '-' }}</span>
              </div>
            </div>
          </div>

          <!-- Leader Data Section -->
          <div class="leader-data-section">
            <h3 class="subsection-title">{{ t('thread.leaderData') }}</h3>
            
            <div class="info-grid">
              <div class="info-row">
                <span class="info-label">{{ t('thread.dataVersion') }}</span>
                <span class="info-value">{{ threadStatus.ThreadStatus['Border Router'].MLE.LeaderData.DataVersion }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('thread.leaderRouterId') }}</span>
                <span class="info-value">{{ threadStatus.ThreadStatus['Border Router'].MLE.LeaderData.LeaderRouterID }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('thread.stableDataVersion') }}</span>
                <span class="info-value">{{ threadStatus.ThreadStatus['Border Router'].MLE.LeaderData.StableDataVersion }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('thread.partitionId') }}</span>
                <span class="info-value">{{ threadStatus.ThreadStatus['Border Router'].MLE.LeaderData.PartitionID }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('thread.weighting') }}</span>
                <span class="info-value">{{ threadStatus.ThreadStatus['Border Router'].MLE.LeaderData.Weighting }}</span>
              </div>
            </div>
          </div>

          <!-- Stats Section -->
          <div class="stats-section">
            <h3 class="subsection-title">{{ t('thread.stats') }}</h3>
            
            <div class="stats-grid">
              <div class="stats-column">
                <div class="stats-header">TX</div>
                <div class="stats-row">
                  <span class="stats-label">{{ t('thread.txBytes') }}</span>
                  <span class="stats-value">{{ threadStatus.ThreadStatus['Border Router'].MLE.Stats['TX Bytes'] }}</span>
                </div>
                <div class="stats-row">
                  <span class="stats-label">{{ t('thread.txPackets') }}</span>
                  <span class="stats-value">{{ threadStatus.ThreadStatus['Border Router'].MLE.Stats['TX Packets'] }}</span>
                </div>
                <div class="stats-row">
                  <span class="stats-label">{{ t('thread.txDropped') }}</span>
                  <span class="stats-value">{{ threadStatus.ThreadStatus['Border Router'].MLE.Stats['TX Dropped'] }}</span>
                </div>
                <div class="stats-row">
                  <span class="stats-label">{{ t('thread.txErrors') }}</span>
                  <span class="stats-value">{{ threadStatus.ThreadStatus['Border Router'].MLE.Stats['TX Errors'] }}</span>
                </div>
              </div>
              
              <div class="stats-column">
                <div class="stats-header">RX</div>
                <div class="stats-row">
                  <span class="stats-label">{{ t('thread.rxBytes') }}</span>
                  <span class="stats-value">{{ threadStatus.ThreadStatus['Border Router'].MLE.Stats['RX Bytes'] }}</span>
                </div>
                <div class="stats-row">
                  <span class="stats-label">{{ t('thread.rxPackets') }}</span>
                  <span class="stats-value">{{ threadStatus.ThreadStatus['Border Router'].MLE.Stats['RX Packets'] }}</span>
                </div>
                <div class="stats-row">
                  <span class="stats-label">{{ t('thread.rxDropped') }}</span>
                  <span class="stats-value">{{ threadStatus.ThreadStatus['Border Router'].MLE.Stats['RX Dropped'] }}</span>
                </div>
                <div class="stats-row">
                  <span class="stats-label">{{ t('thread.rxErrors') }}</span>
                  <span class="stats-value">{{ threadStatus.ThreadStatus['Border Router'].MLE.Stats['RX Errors'] }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Available PANs Section -->
      <div class="panel-section">
        <div class="header-row">
          <div class="section-title-sp">{{ t('thread.availablePans') }}</div>
          <button 
            class="btn btn-primary" 
            @click="handleScan"
            :disabled="scanLoading"
          >
            <span class="material-icons">search</span>
            {{ scanLoading ? t('diagnostics.processing') : t('thread.scan') }}
          </button>
        </div>
        
        <div class="card-content">
          <div v-if="scanError" class="error-message">
            {{ scanError }}
          </div>

          <div v-if="scanLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <span>{{ t('diagnostics.processing') }}</span>
          </div>

          <div v-else-if="scanData && scanData.ThreadScan.PANs.length > 0" class="table-container">
            <table>
              <thead>
                <tr>
                  <th>{{ t('thread.no') }}</th>
                  <th>{{ t('thread.panId') }}</th>
                  <th>{{ t('thread.extendedPanId') }}</th>
                  <th>{{ t('thread.channel') }}</th>
                  <th>{{ t('thread.rssi') }}</th>
                  <th>{{ t('thread.lqi') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(pan, index) in scanData.ThreadScan.PANs" :key="index">
                  <td>{{ index + 1 }}</td>
                  <td>{{ pan.PanId }}</td>
                  <td>{{ pan.ExtendedMAC }}</td>
                  <td>{{ pan.Channel }}</td>
                  <td>{{ pan.RSSI }}</td>
                  <td>{{ pan.LQI }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else-if="scanData" class="no-data-mobile">
            No PANs available
          </div>

          <div v-else-if="!scanLoading" class="no-data-mobile">
            Click scan to search for available Thread networks
          </div>

          <div class="mobile-cards" v-if="scanData && scanData.ThreadScan.PANs.length > 0">
            <div 
              class="table-card" 
              v-for="(pan, index) in scanData.ThreadScan.PANs" 
              :key="index"
            >
              <div class="card-row">
                <span class="card-label">{{ t('thread.no') }}</span>
                <span class="card-value">{{ index + 1 }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('thread.panId') }}</span>
                <span class="card-value">{{ pan.PanId }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('thread.extendedPanId') }}</span>
                <span class="card-value">{{ pan.ExtendedMAC }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('thread.channel') }}</span>
                <span class="card-value">{{ pan.Channel }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('thread.rssi') }}</span>
                <span class="card-value">{{ pan.RSSI }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('thread.lqi') }}</span>
                <span class="card-value">{{ pan.LQI }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Refresh Button -->
      <div class="button-container">
        <button class="btn btn-primary" @click="handleRefresh">
          <span class="material-icons">refresh</span>
          {{ t('common.refresh') }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.thread-content {
  padding: 1.5rem;
}

.panel-section {
  margin-bottom: 1.5rem;
}

.dataset-section, .leader-data-section, .stats-section {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.subsection-title {
  font-size: 1.1rem;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  font-weight: 500;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.stats-column {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stats-header {
  font-weight: 500;
  color: var(--text-primary);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.stats-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
}

.stats-label {
  color: var(--text-secondary);
}

.stats-value {
  color: var(--text-primary);
  font-weight: 500;
}

.section-title-sp {
  font-size: 1rem;
  color: var(--text-primary);
  padding: 0.5rem 0;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-running {
  color: #4caf50;
  font-weight: 500;
}

.tlv-value {
  word-break: break-all;
  font-family: monospace;
  font-size: 0.9rem;
}

.no-data {
  text-align: center;
  padding: 1rem;
  color: var(--text-secondary);
}

.no-data-mobile {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  background-color: var(--bg-secondary);
  border-radius: 4px;
  margin-bottom: 1rem;
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

.error-state, .error-message {
  padding: 1rem;
  text-align: center;
  color: #dc3545;
  background-color: #fee;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.password-value {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--text-primary);
  font-weight: 500;
}

.toggle-password {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0.25rem;
}

.toggle-password:hover {
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .thread-content {
    padding: 1rem;
  }
  
  .panel-section {
    margin-bottom: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .header-row {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .section-title-sp {
    padding: 0;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .table-container {
    display: none;
  }

  .mobile-cards {
    display: block;
  }
}
</style>