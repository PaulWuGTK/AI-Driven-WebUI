<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { NtpResponse, NtpUpdateRequest } from '../../types/ntp';
import type { TimezoneEntry } from '../../types/timezone';
import { getNtpSettings, updateNtpSettings } from '../../services/api';
import TimeZoneSelect from '../../components/management/TimeZoneSelect.vue';

const { t } = useI18n();
const ntpData = ref<NtpResponse | null>(null);
const timeZone = ref('16'); // Default timezone index
const selectedTimezone = ref<TimezoneEntry | null>(null);
const daylightSaving = ref(false);
const ntpEnabled = ref(true);
const ntpServers = ref<string[]>(['', '', '', '', '']);
const loading = ref(false);
const showSuccess = ref(false);

const fetchNtpSettings = async () => {
  loading.value = true;
  try {
    ntpData.value = await getNtpSettings();
    if (ntpData.value) {
      timeZone.value = ntpData.value.Ntp.TimeZones;
      daylightSaving.value = ntpData.value.Ntp.DstEnable === 1;
      ntpEnabled.value = ntpData.value.Ntp.NtpEnable === 1;
      ntpServers.value = [...ntpData.value.Ntp.NtpServers];
    }
  } catch (error) {
    console.error('Error fetching NTP settings:', error);
  } finally {
    loading.value = false;
  }
};

const handleTimezoneChange = (timezone: TimezoneEntry) => {
  selectedTimezone.value = timezone;
};

const showSuccessMessage = () => {
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
  }, 3000);
};

const handleSubmit = async () => {
  if (!selectedTimezone.value) return;

  loading.value = true;
  try {
    const tzValue = (() => {
      const dstSupport = selectedTimezone.value.DstSupport;
      if (dstSupport === 0) {
        return selectedTimezone.value.tzNDST;
      } else if (dstSupport === 1) {
        return daylightSaving.value
          ? selectedTimezone.value.tzDST
          : selectedTimezone.value.tzNDST;
      } else if (dstSupport === 2) {
        return selectedTimezone.value.tzDST || selectedTimezone.value.tzNDST;
      }
      return selectedTimezone.value.tzNDST;
    })();

    const updateData: NtpUpdateRequest = {
      Ntp: {
        SetTZ: tzValue,
        NtpServers: ntpServers.value.filter(Boolean).join(', '),
        NtpEnable: ntpEnabled.value ? 1 : 0,
        REGION: parseInt(timeZone.value, 10)
      }
    };

    const response = await updateNtpSettings(updateData);
    ntpData.value = response;
    showSuccessMessage();
    await fetchNtpSettings(); // Refresh data after successful update
  } catch (error) {
    console.error('Error updating NTP settings:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchNtpSettings);
</script>

<template>
  <div class="ntp-settings">
    <h1 class="page-title">{{ t('ntp.title') }}</h1>

    <div class="settings-content">
      <div class="settings-section" :class="{ 'loading': loading }">
        <div v-if="loading" class="loading-overlay">
          <div class="loading-spinner"></div>
        </div>

        <div v-if="showSuccess" class="success-message">
          {{ t('common.apply') }} successful
        </div>

        <div class="form-group">
          <label>{{ t('ntp.currentTime') }}</label>
          <div class="current-time">{{ ntpData?.Ntp.CurrentLocalTime }}</div>
        </div>

        <div class="form-group">
          <label>{{ t('ntp.timeZoneSelect') }}</label>
          <TimeZoneSelect 
            v-model="timeZone" 
            @timezone-change="handleTimezoneChange"
          />
        </div>

        <div class="form-group" v-if="selectedTimezone?.DstSupport !== 0">
          <label class="switch-label">
            <span>{{ t('ntp.automaticDaylight') }}</span>
            <label class="switch">
              <input
                type="checkbox"
                v-model="daylightSaving"
              >
              <span class="slider"></span>
            </label>
          </label>
        </div>

        <div class="form-group">
          <label class="switch-label">
            <span>{{ t('ntp.enableNtp') }}</span>
            <label class="switch">
              <input
                type="checkbox"
                v-model="ntpEnabled"
              >
              <span class="slider"></span>
            </label>
          </label>
        </div>

        <div v-for="(server, index) in ntpServers" :key="index" class="form-group">
          <label>{{ t('ntp.ntpServer') }}{{ index + 1 }}</label>
          <input
            type="text"
            v-model="ntpServers[index]"
            :placeholder="t('ntp.placeholder')"
          >
        </div>

        <div class="button-group">
          <button class="btn btn-cancel" @click="fetchNtpSettings" :disabled="loading">
            {{ t('ntp.cancel') }}
          </button>
          <button class="btn btn-apply" @click="handleSubmit" :disabled="loading">
            {{ t('ntp.apply') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ntp-settings {
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
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0070BB;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.success-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #4caf50;
  color: white;
  padding: 1rem 2rem;
  border-radius: 4px;
  animation: fadeInOut 3s ease-in-out;
  z-index: 100;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
}

.current-time {
  padding: 0.5rem;
  background-color: #f8f8f8;
  border: 1px solid #ddd;
  border-radius: 4px;
}

input[type="text"] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.switch-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #0070BB;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  transition: opacity 0.2s;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-apply {
  background-color: #0070BB;
  color: white;
}

.btn-cancel {
  background-color: #f0f0f0;
  color: #666;
}

.btn:not(:disabled):hover {
  opacity: 0.9;
}
</style>