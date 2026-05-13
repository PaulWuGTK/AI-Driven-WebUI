<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useQA } from '../../utils/qa';
import type { OpenWrtHomeSummaryResponse } from '../../types/openwrtHome';
import { getOpenWrtHomeSummary } from '../../services/api-openwrt';

const { qa } = useQA();

const loading = ref(false);
const error = ref<string | null>(null);
const payload = ref<OpenWrtHomeSummaryResponse | null>(null);
const normalizeBoardName = (value?: string): string => {
  if (!value) return '-';
  const trimmed = value.trim();
  if (!trimmed) return '-';

  const boardPart = trimmed.includes(',') ? trimmed.split(',').slice(-1)[0] : trimmed;
  return boardPart.replace(/[_-]+/g, ' ').toUpperCase();
};

const loadSummary = async () => {
  loading.value = true;
  error.value = null;
  try {
    payload.value = await getOpenWrtHomeSummary();
  } catch (err) {
    console.error('Failed to load OpenWrt home summary:', err);
    error.value = 'Failed to load summary data.';
  } finally {
    loading.value = false;
  }
};

onMounted(loadSummary);
</script>

<template>
  <div class="openwrt-page page-container">
    <h1 class="page-title" :data-testid="qa('openwrt-home-title')">OpenWrt Home Summary</h1>

    <div class="status-content" :data-testid="qa('openwrt-home-content')">
      <div v-if="loading" class="loading-state" :data-testid="qa('openwrt-home-loading')">
        <div class="loading-spinner"></div>
        <span>Loading...</span>
      </div>

      <div v-else-if="error" class="error-state" :data-testid="qa('openwrt-home-error')">
        <p>{{ error }}</p>
        <button class="retry-button" type="button" @click="loadSummary">Retry</button>
      </div>

      <template v-else-if="payload">
        <div class="panel-section" :data-testid="qa('openwrt-home-panel-system')">
          <div class="card-content">
            <h3 class="section-title">System</h3>
            <div class="kv-grid">
              <div class="kv-item">
                <span class="kv-label">Firmware Version</span>
                <span class="kv-value">{{ payload.HomeSummary.FirmwareVersion || '-' }}</span>
              </div>
              <div class="kv-item">
                <span class="kv-label">Firmware Revision</span>
                <span class="kv-value">{{ payload.HomeSummary.FirmwareRevision || '-' }}</span>
              </div>
              <div class="kv-item">
                <span class="kv-label">Model</span>
                <span class="kv-value">{{ payload.HomeSummary.ModelName || '-' }}</span>
              </div>
              <div class="kv-item">
                <span class="kv-label">Board Number</span>
                <span class="kv-value">{{ normalizeBoardName(payload.HomeSummary.BoardName) }}</span>
              </div>
              <div class="kv-item">
                <span class="kv-label">LAN IPv4</span>
                <span class="kv-value">{{ payload.HomeSummary.LanIPv4 || '-' }}</span>
              </div>
              <div class="kv-item">
                <span class="kv-label">WAN Link</span>
                <span class="kv-value">{{ payload.HomeSummary.WanLinkUp ? 'Up' : 'Down' }}</span>
              </div>
              <div class="kv-item">
                <span class="kv-label">Uptime (sec)</span>
                <span class="kv-value">{{ payload.HomeSummary.UptimeSec ?? 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="panel-section" :data-testid="qa('openwrt-home-panel-wifi')">
          <div class="card-content">
            <h3 class="section-title">Wi-Fi Status</h3>
            <table class="status-table">
              <thead>
                <tr>
                  <th>Band</th>
                  <th>Radio</th>
                  <th>Enable</th>
                  <th>SSID</th>
                  <th>Encryption</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in payload.HomeSummary.WifiStatus"
                  :key="`${item.Band}-${item.Radio}`"
                >
                  <td>{{ item.Band }}</td>
                  <td>{{ item.Radio }}</td>
                  <td>{{ item.Enable }}</td>
                  <td>{{ item.SSID || '-' }}</td>
                  <td>{{ item.Encryption || '-' }}</td>
                </tr>
                <tr v-if="payload.HomeSummary.WifiStatus.length === 0">
                  <td colspan="5" class="empty-cell">No Wi-Fi status data</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.openwrt-page {
  width: 100%;
}

.section-title {
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.kv-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 0.75rem 1.25rem;
}

.kv-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.kv-label {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.kv-value {
  color: var(--text-primary);
  font-weight: 600;
  word-break: break-word;
}

.status-table {
  width: 100%;
  border-collapse: collapse;
}

.status-table th,
.status-table td {
  border-bottom: 1px solid var(--border-color);
  padding: 0.75rem 0.5rem;
  text-align: left;
  font-size: 0.92rem;
}

.status-table th {
  color: var(--text-secondary);
  font-weight: 600;
}

.empty-cell {
  text-align: center;
  color: var(--text-secondary);
}

.loading-state,
.error-state {
  padding: 1.5rem;
  text-align: center;
}

.retry-button {
  margin-top: 0.75rem;
  border: 0;
  background: var(--color-primary);
  color: var(--text-inverse);
  border-radius: var(--radius-sm);
  padding: 0.45rem 0.9rem;
  cursor: pointer;
}
</style>
