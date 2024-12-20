<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WanStatusResponse } from '../../types/wan';
import { getMockWanStatus } from '../../services/mockApi';

const { t } = useI18n();
const wanData = ref<WanStatusResponse | null>(null);

const fetchWanStatus = async () => {
  try {
    // In production, this would be a real API call
    //const response = await fetch('/API/info?list=StatusWan');
    //wanData.value = await response.json();
    
    // Using mock data for development
    wanData.value = getMockWanStatus();
  } catch (error) {
    console.error('Error fetching WAN status:', error);
  }
};

onMounted(() => {
  fetchWanStatus();
});
</script>

<template>
  <div class="wan-status">
    <h1 class="page-title">{{ t('wan.title') }}</h1>

    <div class="status-section">
      <div class="status-grid" v-if="wanData?.StatusWan">
        <div class="status-row">
          <div class="label">{{ t('wan.operationMode') }}</div>
          <div class="value">{{ wanData.StatusWan.OperationMode }}</div>
        </div>
        <div class="status-row">
          <div class="label">{{ t('wan.sensingPolicy') }}</div>
          <div class="value">{{ wanData.StatusWan.SensingPolicy }}</div>
        </div>
        <div class="status-row">
          <div class="label">{{ t('wan.sensingTimeout') }}</div>
          <div class="value">{{ wanData.StatusWan.SensingTimeout }}</div>
        </div>
        <div class="status-row">
          <div class="label">{{ t('wan.wanMode') }}</div>
          <div class="value">{{ wanData.StatusWan.WANMode }}</div>
        </div>
      </div>
    </div>

    <div class="config-section">
      <div class="config-details" v-if="wanData?.StatusWan?.WANModeConfig">
        <table>
          <thead>
            <tr>
              <th>{{ t('wan.interface') }}</th>
              <th>{{ t('wan.macAddress') }}</th>
              <th>{{ t('wan.speed') }}</th>
              <th>{{ t('wan.duplex') }}</th>
              <th>{{ t('wan.ipv4Address') }}</th>
              <th>{{ t('wan.status') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="iface in wanData.StatusWan.WANModeConfig.Interfaces" :key="iface.Name">
              <td>{{ iface.Name }}</td>
              <td>{{ iface.MACAddress }}</td>
              <td>{{ iface.Speed }}</td>
              <td>{{ iface.Duplex }}</td>
              <td>{{ iface.ipv4[0]?.IPv4Address || '-' }}</td>
              <td>{{ iface.ipv4[0]?.Status || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wan-status {
  flex: 1;
  background-color: #f5f5f5;
  min-height: 100%;
}

.page-title {
  color: #0070BB;
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0;
  padding: 1rem 2rem;
  text-align: left;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.status-section, .config-section {
  background-color: white;
  border-radius: 4px;
  padding: 1.5rem;
  margin: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.status-grid {
  display: grid;
  gap: 1rem;
}

.status-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.label {
  color: #333;
  font-weight: normal;
}

.value {
  color: #000;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border: 1px solid #e0e0e0;
}

th {
  background-color: #f8f8f8;
  font-weight: normal;
  color: #333;
}

td {
  color: #000;
  background-color: #fff;
}

tr:hover td {
  background-color: #f5f5f5;
}
</style>