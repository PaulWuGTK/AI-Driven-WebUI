<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { WlanWpsBand } from '../../../../types/wireless';

const { t } = useI18n();
defineProps<{
  bands: WlanWpsBand[];
}>();
</script>

<template>
  <!-- VAP Information Section -->
  <div class="vap-info">
        <div class="section-title">{{ t('wireless.vapInformation') }}</div>
        
        <!-- PC版表格 -->
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>{{ t('wireless.band') }}</th>
                <th>{{ t('wireless.ssid') }}</th>
                <th>{{ t('wireless.authentication') }}</th>
                <th>{{ t('wireless.encryption') }}</th>
                <th>{{ t('wireless.wpsStatus') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="band in bands" :key="band.Band">
                <td>{{ band.Band }}</td>
                <td>{{ band.SSID }}</td>
                <td>{{ band.AuthType }}</td>
                <td>{{ band.EncryType }}</td>
                <td>{{ band.Configured }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 手機版卡片 -->
        <div class="mobile-cards">
          <div class="table-card" v-for="band in bands" :key="band.Band">
            <div class="card-row">
              <span class="card-label">{{ t('wireless.band') }}</span>
              <span class="card-value">{{ band.Band }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('wireless.ssid') }}</span>
              <span class="card-value">{{ band.SSID }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('wireless.authentication') }}</span>
              <span class="card-value">{{ band.AuthType }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('wireless.encryption') }}</span>
              <span class="card-value">{{ band.EncryType }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('wireless.wpsStatus') }}</span>
              <span class="card-value">{{ band.Configured }}</span>
            </div>
          </div>
        </div>
      </div>
</template>

<style scoped>
.vap-info {
  margin-top: 2rem;
}

.wps-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.action-section {
  background-color: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 1.5rem;
}

h3 {
  font-size: 1rem;
  color: #333;
  margin: 0 0 1rem 0;
}

p {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.pin-input {
  display: flex;
  gap: 0.5rem;
}

input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.pin-display {
  padding: 0.5rem;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
  font-size: 1.1rem;
  text-align: center;
}

.vap-info {
  margin-top: 2rem;
}

.section-title {
  padding: 1rem 1.5rem;
  font-size: 1rem;
  color: #333;
  background-color: #f8f8f8;
  border-bottom: 1px solid #e0e0e0;
}

.table-wrapper {
  padding: 1.5rem;
  overflow-x: auto;
}

/* 手機版卡片樣式 */
.mobile-cards {
  display: none;
  padding: 1rem;
  gap: 1rem;
}

.table-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.card-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.card-row:last-child {
  border-bottom: none;
}

.card-label {
  color: #666;
  font-size: 0.9rem;
}

.card-value {
  color: #333;
  font-weight: 500;
  word-break: break-all;
}

/* 響應式設計 */
@media (min-width: 768px) {
  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
    white-space: nowrap;
  }

  th {
    background-color: #f8f8f8;
    font-weight: 500;
    color: #333;
  }

  td {
    color: #666;
  }

  .mobile-cards {
    display: none;
  }
}

@media (max-width: 767px) {
  .wireless-wps-config {
    padding: 1rem;
  }

  .wps-actions {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .pin-input {
    flex-direction: column;
  }

  .pin-input .btn {
    width: 100%;
  }

  .table-wrapper {
    display: none;
  }

  .mobile-cards {
    display: block;
  }

  .action-section {
    padding: 1rem;
  }

  .btn {
    width: 100%;
  }
}

</style>