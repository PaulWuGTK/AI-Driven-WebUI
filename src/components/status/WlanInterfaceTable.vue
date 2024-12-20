<script setup lang="ts">
import type { WlanInterface } from '../../types/wlan';

defineProps<{
  interfaces: WlanInterface[];
}>();
</script>

<template>
  <div class="interface-section">
    <h3 class="section-title">Interface</h3>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Alias</th>
          <th>Status</th>
          <th>SSID</th>
          <th>Authentication</th>
          <th>Encryption</th>
          <th>Password</th>
          <th>BSSID</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="iface in interfaces" :key="iface.Name">
          <td>{{ iface.Name }}</td>
          <td>{{ iface.Alias }}</td>
          <td>{{ iface.Enable ? 'Enable' : 'Disable' }}</td>
          <td>{{ iface.SSID }}</td>
          <td>{{ iface.Authentication }}</td>
          <td>{{ iface.Encryption }}</td>
          <td>{{ iface.Password }}</td>
          <td>{{ iface.BSSID }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.interface-section {
  margin-top: 1rem;
}

.section-title {
  font-size: 1rem;
  color: #333;
  margin: 0 0 1rem 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border: 1px solid #e0e0e0;
}

th {
  background-color: #f8f8f8;
  font-weight: normal;
  color: #666;
}

td {
  color: #333;
}

tr:hover td {
  background-color: #f5f5f5;
}
</style>