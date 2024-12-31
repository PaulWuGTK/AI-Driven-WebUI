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

const fetchNtpSettings = async () => {
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
  }
};

const handleTimezoneChange = (timezone: TimezoneEntry) => {
  selectedTimezone.value = timezone;
};

const handleSubmit = async () => {
  if (!selectedTimezone.value) return;

  try {
    const tzValue = selectedTimezone.value.DstSupport === 2 && daylightSaving.value
      ? selectedTimezone.value.tzDST
      : selectedTimezone.value.tzNDST;

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
  } catch (error) {
    console.error('Error updating NTP settings:', error);
  }
};

onMounted(fetchNtpSettings);
</script>

<template>
  <div class="ntp-settings">
    <h1 class="page-title">{{ t('ntp.title') }}</h1>

    <div class="settings-content">
      <div class="settings-section">
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
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="daylightSaving"
            >
            {{ t('ntp.automaticDaylight') }}
          </label>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="ntpEnabled"
            >
            {{ t('ntp.enableNtp') }}
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
          <button class="btn btn-cancel" @click="fetchNtpSettings">
            {{ t('ntp.cancel') }}
          </button>
          <button class="btn btn-apply" @click="handleSubmit">
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

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
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
}

.btn-cancel {
  background-color: #f0f0f0;
  color: #666;
}

.btn-apply {
  background-color: #0070BB;
  color: white;
}

.btn:hover {
  opacity: 0.9;
}
</style>