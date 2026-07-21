<template>
  <div class="ip-filtering-tab" :data-testid="qa('ip-filtering-tab')">
    <div class="form-group toggle-group">
      <label :data-testid="qa('ip-filtering-enable-label')">{{ $t('ipFiltering.enableIpFiltering') }}</label>
      <BaseSwitch
        v-model="config.Enable"
        :true-value="1"
        :false-value="0"
        :data-testid="qa('ip-filtering-enable-toggle')"
        :slider-data-testid="qa('ip-filtering-enable-slider')"
        @update:model-value="onEnableChange"
      />
    </div>

    <template v-if="config.Enable">
      <div class="form-group radio-group">
        <label :data-testid="qa('ip-filtering-mode-label')">{{ $t('ipFiltering.ipFilteringMode') }}</label>
        <div class="radio-options">
          <label class="radio-label">
            <input
              type="radio"
              value="Blacklist"
              v-model="filterMode"
              :data-testid="qa('ip-filtering-mode-blacklist')"
            >
            <span>{{ $t('ipFiltering.blacklist') }}</span>
          </label>
          <label class="radio-label">
            <input
              type="radio"
              value="Whitelist"
              v-model="filterMode"
              :data-testid="qa('ip-filtering-mode-whitelist')"
            >
            <span>{{ $t('ipFiltering.whitelist') }}</span>
          </label>
        </div>
      </div>

      <div class="form-group radio-group">
        <label :data-testid="qa('ip-filtering-version-label')">{{ $t('ipFiltering.filterMode') }}</label>
        <div class="radio-options">
          <label class="radio-label">
            <input
              type="radio"
              value="IPv4"
              v-model="ipVersion"
              :data-testid="qa('ip-filtering-version-ipv4')"
            >
            <span>{{ $t('ipFiltering.enableIpv4') }}</span>
          </label>
          <label class="radio-label">
            <input
              type="radio"
              value="IPv6"
              v-model="ipVersion"
              :data-testid="qa('ip-filtering-version-ipv6')"
            >
            <span>{{ $t('ipFiltering.enableIpv6') }}</span>
          </label>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>{{ ipVersion === 'IPv4' ? $t('ipFiltering.localIpv4AddressStart') : $t('ipFiltering.localIpv6AddressStart') }}</label>
          <input
            type="text"
            v-model="newEntry.IPStart"
            :placeholder="ipVersion === 'IPv4' ? '192.168.1.1' : '2001:db8::1'"
            class="form-input"
            :class="{ 'input-error': errorMessage }"
            :data-testid="qa('ip-filtering-ip-start-input')"
          >
        </div>
        <div class="form-group">
          <label>{{ ipVersion === 'IPv4' ? $t('ipFiltering.localIpv4AddressEnd') : $t('ipFiltering.localIpv6AddressEnd') }}</label>
          <input
            type="text"
            v-model="newEntry.IPEnd"
            :placeholder="ipVersion === 'IPv4' ? '192.168.1.10' : '2001:db8::10'"
            class="form-input"
            :class="{ 'input-error': errorMessage }"
            :data-testid="qa('ip-filtering-ip-end-input')"
          >
        </div>
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div class="form-group">
        <label>{{ $t('ipFiltering.protocol') }}</label>
        <select v-model="newEntry.Protocol" class="form-select" :data-testid="qa('ip-filtering-protocol-select')">
          <option v-for="proto in config.ProtoList" :key="proto" :value="proto">
            {{ proto }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>{{ $t('ipFiltering.comment') }}</label>
        <textarea
          v-model="newEntry.Comment"
          :placeholder="$t('ipFiltering.placeholder')"
          class="form-textarea"
          rows="3"
          maxlength="30"
          :data-testid="qa('ip-filtering-comment-textarea')"
        ></textarea>
      </div>

      <div class="form-actions">
        <button @click="addEntry" class="btn btn-add" :data-testid="qa('ip-filtering-add-button')">
          <span class="material-icons">add</span>
          {{ $t('ipFiltering.add') }}
        </button>
      </div>

      <div class="filter-table-section">
        <h3>{{ filterMode === 'Blacklist' ? $t('ipFiltering.currentBlacklistFilterTable') : $t('ipFiltering.currentWhitelistFilterTable') }}</h3>

        <table class="filter-table">
          <thead>
            <tr>
              <th>{{ $t('ipFiltering.number') }}</th>
              <th>{{ $t('ipFiltering.localIpAddressStart') }}</th>
              <th>{{ $t('ipFiltering.localIpAddressEnd') }}</th>
              <th>{{ $t('ipFiltering.protocol') }}</th>
              <th>{{ $t('ipFiltering.comment') }}</th>
              <th>{{ $t('ipFiltering.active') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in currentList" :key="entry.No">
              <td>{{ entry.No }}</td>
              <td>{{ entry.IPStart }}</td>
              <td>{{ entry.IPEnd }}</td>
              <td>{{ entry.Protocol.toLowerCase() }}</td>
              <td>{{ entry.Comment }}</td>
              <td>
                <button @click="deleteEntry(entry.No)" class="btn-icon" :data-testid="qa(`ip-filtering-delete-${entry.No}`)">
                  <span class="material-icons">delete</span>
                </button>
              </td>
            </tr>
            <tr v-if="currentList.length === 0">
              <td colspan="6" class="empty-message">
                {{ $t('ipFiltering.noEntries') }}
              </td>
            </tr>
          </tbody>
        </table>
        <div class="note-text" :data-testid="qa('ip-filtering-max-note')">
          {{ $t('ipFiltering.maxEntriesNote') }}
        </div>
      </div>
    </template>

    <div class="form-footer">
      <button @click="cancel" class="btn btn-outline" :data-testid="qa('ip-filtering-cancel-button')">
        {{ $t('common.cancel') }}
      </button>
      <button @click="apply" class="btn btn-primary" :data-testid="qa('ip-filtering-apply-button')">
        {{ $t('common.apply') }}
      </button>
    </div>

    <BaseToast
      v-model="showSuccessToast"
      :message="successMessage"
      type="success"
      :data-testid="qa('ip-filtering-success')"
    />
    <BaseToast
      v-model="showErrorToast"
      :message="errorToastMessage"
      type="error"
      :data-testid="qa('ip-filtering-error-toast')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ipFilteringApi } from '../../../services/api/ipFiltering';
import type { IpFilteringConfig, IpFilterEntry, IpFilterMode, IpVersion } from '../../../types/ipFiltering';
import { BaseSwitch, BaseToast } from '../../../components/common';
import { useAutoDismiss } from '../../../composables/useAutoDismiss';
import { extractNokMessage } from '../../../utils/apiUtils';
import { useQA } from '../../../utils/qa';

const { qa } = useQA();
const { t } = useI18n();
const toFlag01 = (value: unknown): 0 | 1 => {
  return value === 1 || value === '1' || value === true ? 1 : 0;
};

const config = ref<IpFilteringConfig>({
  Enable: 0,
  ProtoList: ['TCP', 'UDP', 'Both'],
  BlackList: [],
  WhiteList: []
});

const filterMode = ref<IpFilterMode>('Blacklist');
const ipVersion = ref<IpVersion>('IPv4');

const newEntry = ref<Omit<IpFilterEntry, 'No'>>({
  IPStart: '',
  IPEnd: '',
  Protocol: 'Both',
  Comment: ''
});

const errorMessage = ref<string>('');
const originalConfig = ref<IpFilteringConfig | null>(null);
const successMessage = ref('');
const errorToastMessage = ref('');
const { visible: showSuccessToast, show: triggerSuccessToast } = useAutoDismiss();
const { visible: showErrorToast, show: triggerErrorToast } = useAutoDismiss();

const currentList = computed(() => {
  return filterMode.value === 'Blacklist' ? config.value.BlackList : config.value.WhiteList;
});

const showSuccessMessage = (message = t('common.saveSuccess')) => {
  successMessage.value = message;
  triggerSuccessToast();
};

const showErrorMessage = (message: string) => {
  errorToastMessage.value = message;
  triggerErrorToast();
};

const loadConfig = async () => {
  try {
    const response = await ipFilteringApi.getConfig();
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      showErrorMessage(nokMessage);
      return;
    }
    config.value = {
      ...response.IPFiltering,
      Enable: toFlag01(response.IPFiltering.Enable),
    };
    originalConfig.value = JSON.parse(JSON.stringify(config.value));
  } catch (error) {
    console.error('Failed to load IP filtering config:', error);
    showErrorMessage('Failed to load IP filtering config');
  }
};

const isValidIPv4 = (ip: string): boolean => {
  const ipv4Regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Regex.test(ip);
};

const isReservedIPv4 = (ip: string): boolean => {
  const parts = ip.split('.').map(p => parseInt(p, 10));
  if (parts.every(p => p === 0)) return true;
  if (parts.every(p => p === 255)) return true;
  if (parts[0] === 127) return true;
  return false;
};

const isValidIPv6 = (ip: string): boolean => {
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
  return ipv6Regex.test(ip);
};

const onEnableChange = (value?: string | number | boolean) => {
  if (value !== undefined) {
    config.value.Enable = toFlag01(value);
  }
  if (!config.value.Enable) {
    filterMode.value = 'Blacklist';
    ipVersion.value = 'IPv4';
  }
  errorMessage.value = '';
};

const addEntry = () => {
  errorMessage.value = '';

  if (!newEntry.value.IPStart || !newEntry.value.IPEnd) {
    errorMessage.value = t('ipFiltering.ipAddressRequired');
    return;
  }

  // Validate IP format based on selected version
  if (ipVersion.value === 'IPv4') {
    if (!isValidIPv4(newEntry.value.IPStart) || !isValidIPv4(newEntry.value.IPEnd)) {
      errorMessage.value = t('ipFiltering.invalidIpv4Format');
      return;
    }
    if (isReservedIPv4(newEntry.value.IPStart) || isReservedIPv4(newEntry.value.IPEnd)) {
      errorMessage.value = t('ipFiltering.reservedIpNotAllowed');
      return;
    }
  } else {
    if (!isValidIPv6(newEntry.value.IPStart) || !isValidIPv6(newEntry.value.IPEnd)) {
      errorMessage.value = t('ipFiltering.invalidIpv6Format');
      return;
    }
  }

  const list = filterMode.value === 'Blacklist' ? config.value.BlackList : config.value.WhiteList;

  if (list.length >= 32) {
    errorMessage.value = t('ipFiltering.maxEntriesReached');
    return;
  }

  const nextNo = list.length > 0 ? Math.max(...list.map(e => e.No)) + 1 : 1;

  const entry: IpFilterEntry = {
    No: nextNo,
    IPStart: newEntry.value.IPStart,
    IPEnd: newEntry.value.IPEnd,
    Protocol: newEntry.value.Protocol,
    Comment: newEntry.value.Comment
  };

  if (filterMode.value === 'Blacklist') {
    config.value.BlackList.push(entry);
  } else {
    config.value.WhiteList.push(entry);
  }

  newEntry.value = {
    IPStart: '',
    IPEnd: '',
    Protocol: 'Both',
    Comment: ''
  };
};

const deleteEntry = (no: number) => {
  if (filterMode.value === 'Blacklist') {
    config.value.BlackList = config.value.BlackList.filter(e => e.No !== no);
  } else {
    config.value.WhiteList = config.value.WhiteList.filter(e => e.No !== no);
  }
};

const apply = async () => {
  try {
    const response = await ipFilteringApi.updateConfig({
      IPFiltering: {
        Enable: toFlag01(config.value.Enable),
        BlackList: config.value.BlackList,
        WhiteList: config.value.WhiteList
      }
    });
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      showErrorMessage(nokMessage);
      return;
    }
    originalConfig.value = JSON.parse(JSON.stringify(config.value));
    showSuccessMessage();
  } catch (error) {
    console.error('Failed to update IP filtering config:', error);
    showErrorMessage('Failed to update IP filtering config');
  }
};

const cancel = () => {
  if (originalConfig.value) {
    config.value = JSON.parse(JSON.stringify(originalConfig.value));
  }
  newEntry.value = {
    IPStart: '',
    IPEnd: '',
    Protocol: 'Both',
    Comment: ''
  };
  errorMessage.value = '';
};

watch(ipVersion, () => {
  errorMessage.value = '';
  newEntry.value.IPStart = '';
  newEntry.value.IPEnd = '';
});

watch([() => newEntry.value.IPStart, () => newEntry.value.IPEnd], () => {
  errorMessage.value = '';
});

onMounted(() => {
  loadConfig();
});
</script>

<style scoped>
.ip-filtering-tab {
  padding: var(--space-6);
}

.form-group {
  margin-bottom: var(--space-5);
}

.toggle-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) 0;
}

.toggle-group label:first-child {
  margin-bottom: 0;
}


.radio-group .radio-options {
  display: flex;
  gap: var(--space-6);
}

.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.radio-label input[type="radio"] {
  margin-right: var(--space-2);
  cursor: pointer;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--border-color-focus);
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--space-8);
}

.btn-add {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-6);
  background-color: var(--bg-secondary);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-add:hover {
  background-color: var(--color-primary-light);
}

.btn-add .material-icons {
  font-size: 18px;
}

.filter-table-section {
  margin-top: var(--space-8);
  margin-bottom: var(--space-8);
}

.filter-table-section h3 {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--space-3);
  font-weight: var(--font-weight-normal);
}

.filter-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
}

.filter-table th,
.filter-table td {
  padding: var(--space-3);
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.filter-table th {
  background-color: var(--bg-tertiary);
  font-weight: var(--font-weight-normal);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.filter-table td {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.filter-table tbody tr:hover {
  background-color: var(--color-gray-50);
}

.empty-message {
  text-align: center;
  color: var(--text-tertiary);
  padding: var(--space-8);
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-1);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--transition-fast);
}

.btn-icon:hover {
  color: var(--color-error);
}

.btn-icon .material-icons {
  font-size: 20px;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding-top: var(--space-6);
  border-top: 1px solid var(--border-color);
}

.error-message {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  margin-top: var(--space-2);
  margin-bottom: var(--space-4);
}

.input-error {
  border-color: var(--color-error) !important;
}

.input-error:focus {
  border-color: var(--color-error) !important;
}

.note-text {
  margin-top: 1.25rem;
  font-size: 0.95rem;
  color: var(--text-secondary);
}

</style>
