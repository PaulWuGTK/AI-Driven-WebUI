<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <div class="wlan-status">
    <h1 class="page-title">{{ t('wlan.title') }}</h1>
    <div class="content-box">
      <p>Wireless Network Configuration</p>
      <table>
        <thead>
          <tr>
            <th>SSID</th>
            <th>Band</th>
            <th>Channel</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Network_2.4G</td>
            <td>2.4 GHz</td>
            <td>6</td>
            <td>Active</td>
          </tr>
          <tr>
            <td>Network_5G</td>
            <td>5 GHz</td>
            <td>36</td>
            <td>Active</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.wlan-status {
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

.content-box {
  background-color: white;
  border-radius: 4px;
  padding: 1.5rem;
  margin-top: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #333;
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f9f9f9;
  font-weight: 500;
  color: #666;
}

td {
  color: #333;
}
</style>