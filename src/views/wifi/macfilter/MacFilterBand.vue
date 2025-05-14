<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { MACFilteringEntry } from '../../../types/macFiltering';

const { t } = useI18n();

const props = defineProps<{
  entries: MACFilteringEntry[];
  band: string;
}>();

const emit = defineEmits<{
  (e: 'update:entries', entries: MACFilteringEntry[]): void;
}>();

// Selected SSID and its corresponding entry
const selectedSSID = ref(props.entries.length > 0 ? props.entries[0].SSID : '');
const selectedEntry = computed(() => {
  return props.entries.find(entry => entry.SSID === selectedSSID.value) || props.entries[0];
});

// MAC address list management
const macAddresses = ref<string[]>([]);
const newMacAddress = ref('');
const editingIndex = ref<number | null>(null);
const error = ref('');

// ACL mode mapping
const aclModeOptions = [
  { label: t('macfilter.disabled'), value: 'Off' },
  { label: t('macfilter.deny'), value: 'BlackList' },
  { label: t('macfilter.allow'), value: 'WhiteList' }
];

// Display ACL mode in user-friendly format
const displayACLMode = (mode: string): string => {
  const option = aclModeOptions.find(opt => opt.value === mode);
  return option ? option.label : mode;
};

// Initialize MAC addresses from selected entry
const initializeMacAddresses = () => {
  if (selectedEntry.value && selectedEntry.value.MACList) {
    macAddresses.value = selectedEntry.value.MACList.split(',')
      .map(mac => mac.trim())
      .filter(mac => mac !== '');
  } else {
    macAddresses.value = [];
  }
};

// Watch for changes in selected entry
watch(selectedEntry, () => {
  initializeMacAddresses();
});

// Watch for changes in selected SSID
watch(selectedSSID, () => {
  initializeMacAddresses();
});

// Validate MAC address format
const isValidMacAddress = (mac: string): boolean => {
  return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(mac);
};

// Add new MAC address
const addMacAddress = () => {
  if (!newMacAddress.value) {
    error.value = t('macfilter.emptyMacError');
    return;
  }

  if (!isValidMacAddress(newMacAddress.value)) {
    error.value = t('macfilter.invalidMacFormat');
    return;
  }

  if (macAddresses.value.includes(newMacAddress.value)) {
    error.value = t('macfilter.duplicateMacError');
    return;
  }

  macAddresses.value.push(newMacAddress.value);
  updateEntryMacList();
  newMacAddress.value = '';
  error.value = '';
};

// Edit MAC address
const startEditMac = (index: number) => {
  editingIndex.value = index;
  newMacAddress.value = macAddresses.value[index];
};

// Delete MAC address
const deleteMacAddress = (index: number) => {
  macAddresses.value.splice(index, 1);
  updateEntryMacList();
};

// Save edited MAC address
const saveEditedMac = () => {
  if (editingIndex.value === null) return;

  if (!isValidMacAddress(newMacAddress.value)) {
    error.value = t('macfilter.invalidMacFormat');
    return;
  }

  const existingIndex = macAddresses.value.findIndex(
    (mac, idx) => mac === newMacAddress.value && idx !== editingIndex.value
  );

  if (existingIndex !== -1) {
    error.value = t('macfilter.duplicateMacError');
    return;
  }

  macAddresses.value[editingIndex.value] = newMacAddress.value;
  updateEntryMacList();
  newMacAddress.value = '';
  editingIndex.value = null;
  error.value = '';
};

// Cancel editing
const cancelEdit = () => {
  newMacAddress.value = '';
  editingIndex.value = null;
  error.value = '';
};

// Update ACL mode
const updateACLMode = (mode: string) => {
  if (!selectedEntry.value) return;
  
  const updatedEntries = props.entries.map(entry => {
    if (entry.SSID === selectedEntry.value.SSID) {
      return { ...entry, ACLMode: mode };
    }
    return entry;
  });
  
  emit('update:entries', updatedEntries);
};

// Update MAC list in the entry
const updateEntryMacList = () => {
  if (!selectedEntry.value) return;
  
  const macList = macAddresses.value.join(',');
  
  const updatedEntries = props.entries.map(entry => {
    if (entry.SSID === selectedEntry.value.SSID) {
      return { ...entry, MACList: macList };
    }
    return entry;
  });
  
  emit('update:entries', updatedEntries);
};

// Initialize on component mount
onMounted(() => {
  initializeMacAddresses();
});

import { watch, onMounted } from 'vue';
</script>

<template>
  <div class="mac-filter-band">
    <div class="form-group">
      <label>{{ t('macfilter.ssid') }}</label>
      <select v-model="selectedSSID" class="form-select">
        <option v-for="entry in entries" :key="entry.Path" :value="entry.SSID">
          {{ entry.SSID }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label>{{ t('macfilter.aclMode') }}</label>
      <select 
        :value="selectedEntry?.ACLMode" 
        @change="updateACLMode(($event.target as HTMLSelectElement).value)"
        class="form-select"
      >
        <option v-for="option in aclModeOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>

    <div v-if="selectedEntry?.ACLMode !== 'Off'">
      <div class="mac-list-header">
        <h3>{{ t('macfilter.macAddressList') }}</h3>
        <div v-if="editingIndex === null" class="add-mac-form">
          <input 
            type="text" 
            v-model="newMacAddress" 
            :placeholder="t('macfilter.enterMacAddress')"
            class="mac-input"
          />
          <button 
            type="button" 
            @click="addMacAddress" 
            class="btn btn-primary"
          >
            {{ t('macfilter.add') }}
          </button>
        </div>
      </div>

      <div v-if="error" class="error-message">{{ error }}</div>

      <div class="mac-list">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>{{ t('macfilter.no') }}</th>
                <th>{{ t('macfilter.macAddress') }}</th>
                <th>{{ t('macfilter.action') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(mac, index) in macAddresses" :key="index">
                <td>{{ index + 1 }}</td>
                <td>
                  <div v-if="editingIndex === index" class="edit-form">
                    <input 
                      type="text" 
                      v-model="newMacAddress" 
                      class="mac-input"
                    />
                    <div class="edit-actions">
                      <button 
                        type="button" 
                        @click="saveEditedMac" 
                        class="btn-icon"
                        title="Save"
                      >
                        <span class="material-icons">check</span>
                      </button>
                      <button 
                        type="button" 
                        @click="cancelEdit" 
                        class="btn-icon"
                        title="Cancel"
                      >
                        <span class="material-icons">close</span>
                      </button>
                    </div>
                  </div>
                  <span v-else>{{ mac }}</span>
                </td>
                <td>
                  <div v-if="editingIndex !== index" class="action-buttons">
                    <button 
                      type="button" 
                      @click="startEditMac(index)" 
                      class="btn-icon"
                      title="Edit"
                    >
                      <span class="material-icons">edit</span>
                    </button>
                    <button 
                      type="button" 
                      @click="deleteMacAddress(index)" 
                      class="btn-icon"
                      title="Delete"
                    >
                      <span class="material-icons">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="macAddresses.length === 0">
                <td colspan="3" class="no-data">{{ t('macfilter.noMacAddresses') }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mobile-cards">
          <div v-if="macAddresses.length === 0" class="no-data-mobile">
            {{ t('macfilter.noMacAddresses') }}
          </div>
          <div 
            v-else
            class="table-card" 
            v-for="(mac, index) in macAddresses" 
            :key="index"
          >
            <div class="card-row">
              <span class="card-label">{{ t('macfilter.no') }}</span>
              <span class="card-value">{{ index + 1 }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('macfilter.macAddress') }}</span>
              <span class="card-value">
                <div v-if="editingIndex === index" class="edit-form">
                  <input 
                    type="text" 
                    v-model="newMacAddress" 
                    class="mac-input"
                  />
                  <div class="edit-actions">
                    <button 
                      type="button" 
                      @click="saveEditedMac" 
                      class="btn-icon"
                      title="Save"
                    >
                      <span class="material-icons">check</span>
                    </button>
                    <button 
                      type="button" 
                      @click="cancelEdit" 
                      class="btn-icon"
                      title="Cancel"
                    >
                      <span class="material-icons">close</span>
                    </button>
                  </div>
                </div>
                <span v-else>{{ mac }}</span>
              </span>
            </div>
            <div v-if="editingIndex !== index" class="card-actions">
              <button 
                type="button" 
                @click="startEditMac(index)" 
                class="btn-icon"
                title="Edit"
              >
                <span class="material-icons">edit</span>
              </button>
              <button 
                type="button" 
                @click="deleteMacAddress(index)" 
                class="btn-icon"
                title="Delete"
              >
                <span class="material-icons">delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mac-filter-band {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.form-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}

.mac-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.mac-list-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.add-mac-form {
  display: flex;
  gap: 0.5rem;
  flex-grow: 1;
  max-width: 500px;
}

.mac-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}

.error-message {
  color: #dc3545;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: rgba(220, 53, 69, 0.1);
  border-radius: 4px;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 4px;
}

.btn-icon:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.edit-form {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.edit-actions {
  display: flex;
  gap: 0.25rem;
}

.no-data {
  text-align: center;
  padding: 1rem;
  color: var(--text-secondary);
}

.no-data-mobile {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  background-color: var(--bg-secondary);
  border-radius: 4px;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .mac-filter-band {
    padding: 1rem;
  }

  .mac-list-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .add-mac-form {
    width: 100%;
    max-width: none;
  }

  .table-container {
    display: none;
  }

  .mobile-cards {
    display: block;
  }

  .card-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
  }
}
</style>