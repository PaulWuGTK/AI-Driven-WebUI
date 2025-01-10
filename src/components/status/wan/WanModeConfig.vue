<script setup lang="ts">
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WanModeConfig } from '../../../types/wan';

const { t } = useI18n();

defineProps<{
  config: WanModeConfig;
}>();
</script>

<template>
  <div class="section-title">{{ t('wan.wanModeConfig') }}</div>
  <div class="config-section">
    <!-- PC版表格 -->
    <div class="table-wrapper">
      <table>
        <tbody>
          <tr>
            <td>{{ t('wan.dnsMode') }}</td>
            <td>{{ config.DNSMode }}</td>
          </tr>
          <tr>
            <td>{{ t('wan.physicalType') }}</td>
            <td>{{ config.PhysicalType }}</td>
          </tr>
          <tr>
            <td>{{ t('wan.status') }}</td>
            <td>{{ config.Status }}</td>
          </tr>
          <tr>
            <td>{{ t('wan.origin') }}</td>
            <td>{{ config.Origin }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 手機版卡片 -->
    <div class="mobile-cards">
      <div class="card-row">
        <span class="card-label">{{ t('wan.dnsMode') }}</span>
        <span class="card-value">{{ config.DNSMode }}</span>
      </div>
      <div class="card-row">
        <span class="card-label">{{ t('wan.physicalType') }}</span>
        <span class="card-value">{{ config.PhysicalType }}</span>
      </div>
      <div class="card-row">
        <span class="card-label">{{ t('wan.status') }}</span>
        <span class="card-value">{{ config.Status }}</span>
      </div>
      <div class="card-row">
        <span class="card-label">{{ t('wan.origin') }}</span>
        <span class="card-value">{{ config.Origin }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.config-section {
  background-color: white;
  border-radius: 4px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

/* 手機版卡片樣式 */
.mobile-cards {
  display: none;
  gap: 1rem;
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

  td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
  }

  td:first-child {
    width: 200px;
    color: #666;
  }

  td:last-child {
    color: #333;
  }

  .mobile-cards {
    display: none;
  }
}

@media (max-width: 767px) {
  .table-wrapper {
    display: none;
  }

  .mobile-cards {
    display: block;
  }
}
</style>