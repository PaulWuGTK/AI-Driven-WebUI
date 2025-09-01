<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { NtpResponse, NtpUpdateRequest } from '../../types/ntp';
import type { TimezoneEntry } from '../../types/timezone';
import { getNtpSettings, updateNtpSettings } from '../../services/api';
import TimeZoneSelect from '../../components/management/TimeZoneSelect.vue';
import { useQA } from '../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const ntpData = ref<NtpResponse | null>(null);
const timeZone = ref('16'); // Default timezone index
const selectedTimezone = ref<TimezoneEntry | null>(null);
const daylightSaving = ref(false);
const ntpEnabled = ref(true);
const ntpServers = ref<string[]>(['', '', '', '', '']);
const loading = ref(false);
const showSuccess = ref(false);
const error = ref<string | null>(null);

const fetchNtpSettings = async () => {
  loading.value = true;
  error.value = null;
  try {
    ntpData.value = await getNtpSettings();
    if (ntpData.value) {
      timeZone.value = ntpData.value.Ntp.TimeZones;
      daylightSaving.value = ntpData.value.Ntp.DstEnable === 1;
      ntpEnabled.value = ntpData.value.Ntp.NtpEnable === 1;
      ntpServers.value = [...ntpData.value.Ntp.NtpServers];
    }
  } catch (err) {
    console.error('Error fetching NTP settings:', err);
    error.value = 'Failed to fetch NTP settings';
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
  } catch (err) {
    console.error('Error updating NTP settings:', err);
    error.value = 'Failed to update NTP settings';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchNtpSettings);
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('ntp-title')">{{ t('ntp.title') }}</h1>

    <div class="status-content" :data-testid="qa('ntp-content')">
      <div v-if="loading" class="loading-state" :data-testid="qa('ntp-loading')">
        <div class="loading-spinner"></div>
        <span>{{ t('common.loading') }}</span>
      </div>

      <div v-else-if="error" class="error-state" :data-testid="qa('ntp-error')">
        {{ error }}
      </div>

      <template v-else>
        <div class="panel-section" :data-testid="qa('ntp-panel')">
          <div class="card-content">
            <div class="form-group">
              <label :data-testid="qa('ntp-current-time-label')">{{ t('ntp.currentTime') }}</label>
              <div class="current-time" :data-testid="qa('ntp-current-time-value')">{{ ntpData?.Ntp.CurrentLocalTime.split('.')[0] }}</div>
            </div>

            <div class="form-group">
              <label :data-testid="qa('ntp-timezone-label')">{{ t('ntp.timeZoneSelect') }}</label>
              <TimeZoneSelect 
                v-model="timeZone" 
                :data-testid="qa('ntp-timezone-select')"
                @timezone-change="handleTimezoneChange"
              />
            </div>

            <div class="form-group" v-if="selectedTimezone?.DstSupport !== 0">
              <div class="switch-label">
                <span :data-testid="qa('ntp-daylight-saving-label')">{{ t('ntp.automaticDaylight') }}</span>
                <label class="switch">
                  <input
                    type="checkbox"
                    :data-testid="qa('ntp-daylight-saving-toggle')"
                    v-model="daylightSaving"
                  >
                  <span class="slider"></span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <div class="switch-label">
                <span :data-testid="qa('ntp-enable-label')">{{ t('ntp.enableNtp') }}</span>
                <label class="switch">
                  <input
                    type="checkbox"
                    :data-testid="qa('ntp-enable-toggle')"
                    v-model="ntpEnabled"
                  >
                  <span class="slider"></span>
                </label>
              </div>
            </div>

            <div v-for="(server, index) in ntpServers" :key="index" class="form-group" :data-testid="qa(`ntp-server-group-${index}`)">
              <label :data-testid="qa(`ntp-server-label-${index}`)">{{ t('ntp.ntpServer') }}{{ index + 1 }}</label>
              <input
                type="text"
                :data-testid="qa(`ntp-server-input-${index}`)"
                v-model="ntpServers[index]"
                :placeholder="t('ntp.placeholder')"
              >
            </div>

            <div class="button-group">
              <button class="btn btn-secondary" :data-testid="qa('ntp-cancel-button')" @click="fetchNtpSettings" :disabled="loading">
                {{ t('ntp.cancel') }}
              </button>
              <button class="btn btn-primary" :data-testid="qa('ntp-apply-button')" @click="handleSubmit" :disabled="loading">
                {{ t('ntp.apply') }}
              </button>
            </div>
          </div>
        </div>
      </template>

      <div v-if="showSuccess" class="success-message" :data-testid="qa('ntp-success-message')">
        {{ t('common.apply') }} successful
      </div>
    </div>
  </div>
</template>

<style scoped>
.current-time {
  padding: 0.5rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}

.switch-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-primary);
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  margin-left: 1rem;
  flex-shrink: 0;
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
  background-color: var(--primary-color);
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

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  background-color: white;
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
}

.error-state {
  padding: 2rem;
  text-align: center;
  color: #dc3545;
  background-color: white;
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
}

@media (max-width: 768px) {
  .button-group {
    flex-direction: column;
  }

  .button-group .btn {
    width: 100%;
  }
}
</style>