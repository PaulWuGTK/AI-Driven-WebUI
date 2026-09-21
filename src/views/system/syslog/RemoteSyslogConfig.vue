<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { RemoteSyslogResponse } from '../../../types/remoteSyslog';
import { remoteSyslogApi } from '../../../services/api/remoteSyslog';
import { useQA } from '../../../utils/qa';
import { useAutoDismiss } from '../../../composables/useAutoDismiss';
import { extractNokMessage } from '../../../utils/apiUtils';
import { BaseInput, BaseSelect, BaseSwitch, ActionButtons, BaseToast } from '../../../components/common';

const { qa } = useQA();
const { t } = useI18n();

const successMessage = ref('');
const errorToastMessage = ref('');
const { visible: showSuccessToast, show: triggerSuccessToast } = useAutoDismiss();
const { visible: showErrorToast, show: triggerErrorToast } = useAutoDismiss();

const data = ref<RemoteSyslogResponse | null>(null);
const loading = ref(false);
const saving = ref(false);
const error = ref<string | null>(null);

// System Messages form fields
const messagesEnable = ref<0 | 1>(0);
const messagesAddress = ref('');
const messagesPort = ref(514);
const messagesProtocol = ref<'UDP' | 'TCP' | 'TLS'>('UDP');

// WiFi Logs form fields
const wifiEnable = ref<0 | 1>(0);
const wifiAddress = ref('');
const wifiPort = ref(514);
const wifiProtocol = ref<'UDP' | 'TCP' | 'TLS'>('UDP');

// Hostapd Logs form fields
const hostapdEnable = ref<0 | 1>(0);
const hostapdAddress = ref('');
const hostapdPort = ref(514);
const hostapdProtocol = ref<'UDP' | 'TCP' | 'TLS'>('UDP');

// Protocol options
const protocolOptions = computed(() => [
  { label: t('remoteSyslog.protocolUDP'), value: 'UDP' },
  { label: t('remoteSyslog.protocolTCP'), value: 'TCP' },
  { label: t('remoteSyslog.protocolTLS'), value: 'TLS' },
]);

// Validation
const validationErrors = ref({
  messages: '',
  wifi: '',
  hostapd: '',
});

const validateIPAddressOrHostname = (addr: string): boolean => {
  if (!addr) return false;
  const ipv4 = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const hostname = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?)*$/;
  return ipv4.test(addr) || hostname.test(addr);
};

const validatePort = (port: number): boolean => {
  return port >= 1 && port <= 65535;
};

const showSuccessMessage = (message: string) => {
  successMessage.value = message;
  triggerSuccessToast();
};

const showErrorMessage = (message: string) => {
  errorToastMessage.value = message;
  triggerErrorToast();
};

const validateSection = (
  enable: number,
  address: string,
  port: number,
  section: 'messages' | 'wifi' | 'hostapd'
): boolean => {
  validationErrors.value[section] = '';

  if (enable === 1) {
    if (!address) {
      validationErrors.value[section] = t('remoteSyslog.addressRequired');
      return false;
    }
    if (!validateIPAddressOrHostname(address)) {
      validationErrors.value[section] = t('remoteSyslog.invalidIpAddress');
      return false;
    }
    if (!validatePort(port)) {
      validationErrors.value[section] = t('remoteSyslog.invalidPort');
      return false;
    }
  }

  return true;
};

const loadData = async () => {
  loading.value = true;
  error.value = null;
  try {
    data.value = await remoteSyslogApi.getConfig();

    // Populate form fields from response
    const { messages_remote, wifi, hostapd } = data.value.DeviceSyslogAction;

    messagesEnable.value = messages_remote.LogRemote.Enable;
    messagesAddress.value = messages_remote.LogRemote.Address;
    messagesPort.value = messages_remote.LogRemote.Port;
    messagesProtocol.value = messages_remote.LogRemote.Protocol;

    wifiEnable.value = wifi.LogRemote.Enable;
    wifiAddress.value = wifi.LogRemote.Address;
    wifiPort.value = wifi.LogRemote.Port;
    wifiProtocol.value = wifi.LogRemote.Protocol;

    hostapdEnable.value = hostapd.LogRemote.Enable;
    hostapdAddress.value = hostapd.LogRemote.Address;
    hostapdPort.value = hostapd.LogRemote.Port;
    hostapdProtocol.value = hostapd.LogRemote.Protocol;
  } catch (err) {
    console.error('Error loading remote syslog config:', err);
    error.value = t('remoteSyslog.loadFailed');
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  // Validate all sections
  const messagesValid = validateSection(messagesEnable.value, messagesAddress.value, messagesPort.value, 'messages');
  const wifiValid = validateSection(wifiEnable.value, wifiAddress.value, wifiPort.value, 'wifi');
  const hostapdValid = validateSection(hostapdEnable.value, hostapdAddress.value, hostapdPort.value, 'hostapd');

  if (!messagesValid || !wifiValid || !hostapdValid) {
    showErrorMessage(t('remoteSyslog.validationFailed'));
    return;
  }

  saving.value = true;
  error.value = null;

  try {
    const result = await remoteSyslogApi.updateConfig({
      DeviceSyslogAction: {
        messages_remote: {
          LogRemote: {
            Enable: messagesEnable.value,
            Address: messagesAddress.value,
            Port: messagesPort.value,
            Protocol: messagesProtocol.value,
          },
        },
        wifi: {
          LogRemote: {
            Enable: wifiEnable.value,
            Address: wifiAddress.value,
            Port: wifiPort.value,
            Protocol: wifiProtocol.value,
          },
        },
        hostapd: {
          LogRemote: {
            Enable: hostapdEnable.value,
            Address: hostapdAddress.value,
            Port: hostapdPort.value,
            Protocol: hostapdProtocol.value,
          },
        },
      },
    });

    // Check for error (NOK at top level, following Ddns.lua pattern)
    if (result.NOK) {
      const errorMsg = extractNokMessage(result.NOK) || t('remoteSyslog.updateFailed');
      showErrorMessage(errorMsg);
    } else {
      // Success - result is unwrapped data
      showSuccessMessage(t('remoteSyslog.updateSuccess'));
      await loadData(); // Refresh data
    }
  } catch (err) {
    console.error('Error saving remote syslog config:', err);
    const errorMsg = err instanceof Error ? err.message : String(err);
    showErrorMessage(errorMsg);
  } finally {
    saving.value = false;
  }
};

const handleCancel = async () => {
  await loadData(); // Reload data to reset form
};

onMounted(loadData);
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('remote-syslog-title')">
      {{ t('remoteSyslog.title') }}
    </h1>

    <div class="page-content" :data-testid="qa('remote-syslog-content')">
      <div v-if="loading" class="loading-state" :data-testid="qa('remote-syslog-loading')">
        <div class="loading-spinner"></div>
        <span>{{ t('common.loading') }}</span>
      </div>

      <div v-else-if="error" class="error-state" :data-testid="qa('remote-syslog-error')">
        {{ error }}
      </div>

      <template v-else-if="data">
        <div class="panel-section" :data-testid="qa('remote-syslog-section')">
          <div class="section-title">{{ t('remoteSyslog.title') }}</div>
          <div class="card-content">
            <p class="section-description">{{ t('remoteSyslog.description') }}</p>

            <form @submit.prevent="handleSubmit">
              <!-- System Messages Subsection -->
              <div class="subsection" :data-testid="qa('remote-syslog-messages-section')">
                <div class="subsection-header">
                  <h3 class="subsection-title">{{ t('remoteSyslog.systemMessages') }}</h3>
                  <span class="subsection-subtitle">{{ t('remoteSyslog.systemMessagesDesc') }}</span>
                </div>

                <div class="form-group">
                  <BaseSwitch
                    v-model="messagesEnable"
                    :true-value="1"
                    :false-value="0"
                    :label="t('remoteSyslog.enableRemoteLogging')"
                    :data-testid="qa('messages-enable-toggle')"
                  />
                </div>

                <div v-if="messagesEnable === 1">
                  <div class="form-group">
                    <BaseInput
                      v-model="messagesAddress"
                      :label="t('remoteSyslog.serverAddress')"
                      :placeholder="t('remoteSyslog.serverAddressPlaceholder')"
                      required
                      :data-testid="qa('messages-address-input')"
                    />
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <BaseInput
                        v-model="messagesPort"
                        type="number"
                        :label="t('remoteSyslog.port')"
                        :placeholder="t('remoteSyslog.portPlaceholder')"
                        :min="1"
                        :max="65535"
                        :data-testid="qa('messages-port-input')"
                      />
                    </div>

                    <div class="form-group">
                      <BaseSelect
                        v-model="messagesProtocol"
                        :label="t('remoteSyslog.protocol')"
                        :options="protocolOptions"
                        :data-testid="qa('messages-protocol-select')"
                      />
                    </div>
                  </div>
                </div>

                <div v-if="validationErrors.messages" class="validation-error">
                  {{ validationErrors.messages }}
                </div>
              </div>

              <!-- WiFi Logs Subsection -->
              <div class="subsection" :data-testid="qa('remote-syslog-wifi-section')">
                <div class="subsection-header">
                  <h3 class="subsection-title">{{ t('remoteSyslog.wifiLogs') }}</h3>
                  <span class="subsection-subtitle">{{ t('remoteSyslog.wifiLogsDesc') }}</span>
                </div>

                <div class="form-group">
                  <BaseSwitch
                    v-model="wifiEnable"
                    :true-value="1"
                    :false-value="0"
                    :label="t('remoteSyslog.enableRemoteLogging')"
                    :data-testid="qa('wifi-enable-toggle')"
                  />
                </div>

                <div v-if="wifiEnable === 1">
                  <div class="form-group">
                    <BaseInput
                      v-model="wifiAddress"
                      :label="t('remoteSyslog.serverAddress')"
                      :placeholder="t('remoteSyslog.serverAddressPlaceholder')"
                      required
                      :data-testid="qa('wifi-address-input')"
                    />
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <BaseInput
                        v-model="wifiPort"
                        type="number"
                        :label="t('remoteSyslog.port')"
                        :placeholder="t('remoteSyslog.portPlaceholder')"
                        :min="1"
                        :max="65535"
                        :data-testid="qa('wifi-port-input')"
                      />
                    </div>

                    <div class="form-group">
                      <BaseSelect
                        v-model="wifiProtocol"
                        :label="t('remoteSyslog.protocol')"
                        :options="protocolOptions"
                        :data-testid="qa('wifi-protocol-select')"
                      />
                    </div>
                  </div>
                </div>

                <div v-if="validationErrors.wifi" class="validation-error">
                  {{ validationErrors.wifi }}
                </div>
              </div>

              <!-- Hostapd Logs Subsection -->
              <div class="subsection" :data-testid="qa('remote-syslog-hostapd-section')">
                <div class="subsection-header">
                  <h3 class="subsection-title">{{ t('remoteSyslog.hostapdLogs') }}</h3>
                  <span class="subsection-subtitle">{{ t('remoteSyslog.hostapdLogsDesc') }}</span>
                </div>

                <div class="form-group">
                  <BaseSwitch
                    v-model="hostapdEnable"
                    :true-value="1"
                    :false-value="0"
                    :label="t('remoteSyslog.enableRemoteLogging')"
                    :data-testid="qa('hostapd-enable-toggle')"
                  />
                </div>

                <div v-if="hostapdEnable === 1">
                  <div class="form-group">
                    <BaseInput
                      v-model="hostapdAddress"
                      :label="t('remoteSyslog.serverAddress')"
                      :placeholder="t('remoteSyslog.serverAddressPlaceholder')"
                      required
                      :data-testid="qa('hostapd-address-input')"
                    />
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <BaseInput
                        v-model="hostapdPort"
                        type="number"
                        :label="t('remoteSyslog.port')"
                        :placeholder="t('remoteSyslog.portPlaceholder')"
                        :min="1"
                        :max="65535"
                        :data-testid="qa('hostapd-port-input')"
                      />
                    </div>

                    <div class="form-group">
                      <BaseSelect
                        v-model="hostapdProtocol"
                        :label="t('remoteSyslog.protocol')"
                        :options="protocolOptions"
                        :data-testid="qa('hostapd-protocol-select')"
                      />
                    </div>
                  </div>
                </div>

                <div v-if="validationErrors.hostapd" class="validation-error">
                  {{ validationErrors.hostapd }}
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="form-actions">
                <ActionButtons
                  :apply-loading="saving"
                  :apply-disabled="saving || loading"
                  :cancel-data-testid="qa('remote-syslog-cancel')"
                  :apply-data-testid="qa('remote-syslog-apply')"
                  @cancel="handleCancel"
                  @apply="handleSubmit"
                />
              </div>
            </form>
          </div>
        </div>
      </template>
    </div>

    <BaseToast
      v-model="showSuccessToast"
      :message="successMessage"
      type="success"
      :data-testid="qa('remote-syslog-success-message')"
    />
    <BaseToast
      v-model="showErrorToast"
      :message="errorToastMessage"
      type="error"
      :data-testid="qa('remote-syslog-error-message')"
    />
  </div>
</template>

<style scoped>
.section-description {
  margin-bottom: var(--space-6);
  color: var(--text-secondary);
  font-size: var(--font-size-base);
}

.subsection {
  padding: var(--space-6) 0;
  border-bottom: 1px solid var(--border-color);
}

.subsection:last-of-type {
  border-bottom: none;
}

.subsection-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
  flex-wrap: wrap;
}

.subsection-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
  flex-shrink: 0;
}

.subsection-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  flex: 1;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: var(--space-6);
  margin-top: var(--space-6);
}

.validation-error {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  margin-top: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-error-light);
  border-radius: var(--radius-md);
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-8);
  background-color: var(--bg-secondary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.error-state {
  padding: var(--space-6);
  text-align: center;
  color: var(--color-error);
  background-color: var(--bg-secondary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
</style>
