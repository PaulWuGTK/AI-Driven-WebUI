<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DdnsProvider } from '../../types/ddns';
import { getDdns, updateDdns } from '../../services/api';

const { t } = useI18n();
const providers = ref<DdnsProvider[]>([]);
const selectedProvider = ref('DynDNS');
const username = ref('');
const password = ref('');
const domain = ref('');

const fetchDdns = async () => {
  try {
    const response = await getDdns();
    providers.value = response.Ddns.Providers;
  } catch (error) {
    console.error('Error fetching DDNS settings:', error);
  }
};

const handleSubmit = async () => {
  try {
    await updateDdns({
      Ddns: {
        Provider: selectedProvider.value,
        Username: username.value,
        Password: password.value,
        Domain: domain.value
      }
    });
    await fetchDdns();
  } catch (error) {
    console.error('Error updating DDNS settings:', error);
  }
};

onMounted(fetchDdns);
</script>

<template>
  <div class="ddns-settings">
    <h1 class="page-title">DDNS Settings</h1>

    <div class="settings-content">
      <div class="settings-section">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Provider</label>
            <select v-model="selectedProvider">
              <option value="DynDNS">DynDNS</option>
              <option value="No-IP">No-IP</option>
            </select>
          </div>

          <div class="form-group">
            <label>Username</label>
            <input type="text" v-model="username" required>
          </div>

          <div class="form-group">
            <label>Password</label>
            <input type="password" v-model="password" required>
          </div>

          <div class="form-group">
            <label>Domain</label>
            <input type="text" v-model="domain" required>
          </div>

          <div class="button-group">
            <button type="submit" class="btn btn-primary">Apply</button>
          </div>
        </form>

        <div class="providers-list">
          <h2>Current DDNS Providers</h2>
          <table>
            <thead>
              <tr>
                <th>Provider</th>
                <th>Username</th>
                <th>Domain</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="provider in providers" :key="provider.Name">
                <td>{{ provider.Name }}</td>
                <td>{{ provider.Username }}</td>
                <td>{{ provider.Domain }}</td>
                <td>{{ provider.Status }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ddns-settings {
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

.settings-content {
  padding: 1.5rem;
}

.settings-section {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
}

input, select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.button-group {
  margin-top: 2rem;
  text-align: right;
}

.btn {
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-primary {
  background-color: #0070BB;
  color: white;
}

.providers-list {
  margin-top: 2rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
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
</style>