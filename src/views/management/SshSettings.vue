<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { SshConfig } from '../../types/ssh';
import { getSsh, updateSsh } from '../../services/api';

const { t } = useI18n();
const sshConfig = ref<SshConfig>({
  Enable: 0,
  Port: '22',
  RootLogin: 0,
  PasswordAuth: 1
});

const fetchSsh = async () => {
  try {
    const response = await getSsh();
    sshConfig.value = response.Ssh;
  } catch (error) {
    console.error('Error fetching SSH settings:', error);
  }
};

const handleSubmit = async () => {
  try {
    await updateSsh({
      Ssh: sshConfig.value
    });
    await fetchSsh();
  } catch (error) {
    console.error('Error updating SSH settings:', error);
  }
};

onMounted(fetchSsh);
</script>

<template>
  <div class="ssh-settings">
    <h1 class="page-title">SSH Settings</h1>

    <div class="settings-content">
      <div class="settings-section">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="sshConfig.Enable"
                :true-value="1"
                :false-value="0"
              >
              Enable SSH Server
            </label>
          </div>

          <div class="form-group">
            <label>Port</label>
            <input 
              type="number" 
              v-model="sshConfig.Port"
              min="1"
              max="65535"
              required
            >
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="sshConfig.RootLogin"
                :true-value="1"
                :false-value="0"
              >
              Allow Root Login
            </label>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="sshConfig.PasswordAuth"
                :true-value="1"
                :false-value="0"
              >
              Enable Password Authentication
            </label>
          </div>

          <div class="button-group">
            <button type="submit" class="btn btn-primary">Apply</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ssh-settings {
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

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

input[type="number"] {
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
</style>