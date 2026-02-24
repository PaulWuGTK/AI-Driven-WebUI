<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { NtpResponse, NtpUpdateRequest } from '../../../types/ntp';
import type { TimezoneEntry } from '../../../types/timezone';
import { getNtpSettings, updateNtpSettings } from '../../../services/api';
import TimeZoneSelect from '../../../components/management/TimeZoneSelect.vue';
import { ActionButtons, BaseSwitch, BaseToast } from '../../../components/common';
import { useAutoDismiss } from '../../../composables/useAutoDismiss';
import { extractNokMessage } from '../../../utils/apiUtils';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const ntpData = ref<NtpResponse | null>(null);
const timeZone = ref('16'); // Default timezone index
const selectedTimezone = ref<TimezoneEntry | null>(null);
const daylightSaving = ref(false);
const ntpEnabled = ref(true);
const ntpServers = ref<string[]>(['', '', '', '', '']);
const loading = ref(false);
const error = ref<string | null>(null);
const successMessage = ref('');
const errorToastMessage = ref('');
const { visible: showSuccessToast, show: triggerSuccessToast } = useAutoDismiss();
const { visible: showErrorToast, show: triggerErrorToast } = useAutoDismiss();

const fetchNtpSettings = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getNtpSettings();
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      error.value = nokMessage;
      ntpData.value = null;
      return;
    }

    ntpData.value = response;
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

const showSuccessMessage = (message = `${t('common.apply')} successful`) => {
  successMessage.value = message;
  triggerSuccessToast();
};

const showErrorMessage = (message: string) => {
  errorToastMessage.value = message;
  triggerErrorToast();
};

const handleSubmit = async () => {
  if (!selectedTimezone.value) return;
  loading.value = true;
  error.value = null;
  try {
    const tz: any = selectedTimezone.value;

    const dstSupport = tz.DstSupport ?? tz.dst_support;
    const tzNDST = tz.tzNDST ?? tz.tz_ndst;
    const tzDST  = tz.tzDST  ?? tz.tz_dst;

    const tzValue = (() => {
      if (dstSupport === 0) return tzNDST;
      if (dstSupport === 1) return daylightSaving.value ? tzDST : tzNDST;
      if (dstSupport === 2) return tzDST || tzNDST;
      return tzNDST;
    })();

    const updateData: NtpUpdateRequest = {
      Ntp: {
        SetTZ: tzValue,
        NtpServers: ntpServers.value.filter(Boolean).join(', '),
        NtpEnable: ntpEnabled.value ? 1 : 0,
        REGION: parseInt(timeZone.value, 10)
      }
    };
    if (!tzValue) {
      showErrorMessage('SetTZ is empty (timezone data not ready).');
      return;
    }
    const response = await updateNtpSettings(updateData);
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      showErrorMessage(nokMessage);
      return;
    }

    ntpData.value = response;
    showSuccessMessage();
    await fetchNtpSettings(); // Refresh data after successful update
  } catch (err) {
    console.error('Error updating NTP settings:', err);
    showErrorMessage('Failed to update NTP settings');
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
                <BaseSwitch
                  v-model="daylightSaving"
                  :data-testid="qa('ntp-daylight-saving-toggle')"
                  :slider-data-testid="qa('ntp-daylight-saving-slider')"
                />
              </div>
            </div>

            <div class="form-group">
              <div class="switch-label">
                <span :data-testid="qa('ntp-enable-label')">{{ t('ntp.enableNtp') }}</span>
                <BaseSwitch
                  v-model="ntpEnabled"
                  :data-testid="qa('ntp-enable-toggle')"
                  :slider-data-testid="qa('ntp-enable-slider')"
                />
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
              <ActionButtons
                :cancel-data-testid="qa('ntp-cancel-button')"
                :apply-data-testid="qa('ntp-apply-button')"
                :cancel-text="t('ntp.cancel')"
                :apply-text="t('ntp.apply')"
                :cancel-disabled="loading"
                :apply-disabled="loading"
                @cancel="fetchNtpSettings"
                @apply="handleSubmit"
              />
            </div>
          </div>
        </div>
      </template>

      <BaseToast
        v-model="showSuccessToast"
        :message="successMessage"
        type="success"
        :data-testid="qa('ntp-success-message')"
      />
      <BaseToast
        v-model="showErrorToast"
        :message="errorToastMessage"
        type="error"
        :data-testid="qa('ntp-error-toast')"
      />
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

/* Custom switch size (60px × 34px) with left margin for layout */
:deep(.switch) {
  width: 60px;
  height: 34px;
  margin-left: 1rem;
  flex-shrink: 0;
}

:deep(.slider:before) {
  height: 26px;
  width: 26px;
}

:deep(input:checked + .slider:before) {
  transform: translateX(26px);
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
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

@media (max-width: 768px) {
  .button-group {
    flex-direction: column;
  }

  .button-group :deep(.btn) {
    width: 100%;
  }
}
</style>
