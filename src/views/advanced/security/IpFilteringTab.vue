<template>
  <div class="ip-filtering-tab">
    <div v-if="showSuccess" class="success-message">
      {{ $t('common.apply') }} successful
    </div>

    <div class="form-group toggle-group">
      <label>{{ $t('ipFiltering.enableIpFiltering') }}</label>
      <label class="switch">
        <input type="checkbox" v-model="config.Enable" @change="onEnableChange">
        <span class="slider"></span>
      </label>
    </div>

    <template v-if="config.Enable">
      <div class="form-group radio-group">
        <label>{{ $t('ipFiltering.ipFilteringMode') }}</label>
        <div class="radio-options">
          <label class="radio-label">
            <input type="radio" value="Blacklist" v-model="filterMode">
            <span>{{ $t('ipFiltering.blacklist') }}</span>
          </label>
          <label class="radio-label">
            <input type="radio" value="Whitelist" v-model="filterMode">
            <span>{{ $t('ipFiltering.whitelist') }}</span>
          </label>
        </div>
      </div>

      <div class="form-group radio-group">
        <label>{{ $t('ipFiltering.filterMode') }}</label>
        <div class="radio-options">
          <label class="radio-label">
            <input type="radio" value="IPv4" v-model="ipVersion">
            <span>{{ $t('ipFiltering.enableIpv4') }}</span>
          </label>
          <label class="radio-label">
            <input type="radio" value="IPv6" v-model="ipVersion">
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
          >
        </div>
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div class="form-group">
        <label>{{ $t('ipFiltering.protocol') }}</label>
        <select v-model="newEntry.Protocol" class="form-select">
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
        ></textarea>
      </div>

      <div class="form-actions">
        <button @click="addEntry" class="btn btn-add">
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
                <button @click="deleteEntry(entry.No)" class="btn-icon">
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
      </div>
    </template>

    <div class="form-footer">
      <button @click="cancel" class="btn btn-outline">
        {{ $t('common.cancel') }}
      </button>
      <button @click="apply" class="btn btn-primary">
        {{ $t('common.apply') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { ipFilteringApi } from '../../../services/api/ipFiltering';
import type { IpFilteringConfig, IpFilterEntry, IpFilterMode, IpVersion } from '../../../types/ipFiltering';

const config = ref<IpFilteringConfig>({
  Enable: false,
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
const showSuccess = ref(false);

const currentList = computed(() => {
  return filterMode.value === 'Blacklist' ? config.value.BlackList : config.value.WhiteList;
});

const showSuccessMessage = () => {
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
  }, 3000);
};

const loadConfig = async () => {
  try {
    const response = await ipFilteringApi.getConfig();
    config.value = response.IPFiltering;
    originalConfig.value = JSON.parse(JSON.stringify(response.IPFiltering));
  } catch (error) {
    console.error('Failed to load IP filtering config:', error);
  }
};

const isValidIPv4 = (ip: string): boolean => {
  const ipv4Regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Regex.test(ip);
};

const isValidIPv6 = (ip: string): boolean => {
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
  return ipv6Regex.test(ip);
};

const onEnableChange = () => {
  if (!config.value.Enable) {
    filterMode.value = 'Blacklist';
    ipVersion.value = 'IPv4';
  }
  errorMessage.value = '';
};

const addEntry = () => {
  errorMessage.value = '';

  if (!newEntry.value.IPStart || !newEntry.value.IPEnd) {
    errorMessage.value = 'Please enter both start and end IP addresses';
    return;
  }

  // Validate IP format based on selected version
  if (ipVersion.value === 'IPv4') {
    if (!isValidIPv4(newEntry.value.IPStart) || !isValidIPv4(newEntry.value.IPEnd)) {
      errorMessage.value = 'The local IP start format is incorrect.';
      return;
    }
  } else {
    if (!isValidIPv6(newEntry.value.IPStart) || !isValidIPv6(newEntry.value.IPEnd)) {
      errorMessage.value = 'The local IP start format is incorrect.';
      return;
    }
  }

  const list = filterMode.value === 'Blacklist' ? config.value.BlackList : config.value.WhiteList;
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
    await ipFilteringApi.updateConfig({
      IPFiltering: {
        Enable: config.value.Enable,
        BlackList: config.value.BlackList,
        WhiteList: config.value.WhiteList
      }
    });
    originalConfig.value = JSON.parse(JSON.stringify(config.value));
    showSuccessMessage();
  } catch (error) {
    console.error('Failed to update IP filtering config:', error);
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

.form-group label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: var(--font-weight-normal);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
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

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
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

.switch input:checked + .slider {
  background-color: var(--primary-color);
}

.switch input:checked + .slider:before {
  transform: translateX(26px);
}

.radio-group .radio-options {
  display: flex;
  gap: var(--space-6);
}

.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: var(--font-weight-normal);
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

.success-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #4caf50;
  color: white;
  padding: 1rem 2rem;
  border-radius: 4px;
  animation: fadeInOut 3s ease-in-out;
  z-index: 1100;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
}
</style>
