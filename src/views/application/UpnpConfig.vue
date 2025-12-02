<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { getUpnpSettings, updateUpnpSettings } from '../../services/api/upnp';
import type { UpnpResponse, UpnpUpdateRequest, PortMapping } from '../../types/upnp';
import BlockingOverlay from '../../components/BlockingOverlay.vue';
import { useQA } from '../../utils/qa';

const { isQAMode, qa } = useQA();
const { t } = useI18n();

const loading = ref(false);
const saving = ref(false);
const error = ref<string | null>(null);
const upnpEnable = ref(false);
const selectedInterface = ref('');
const interfaceOptions = ref<Array<{ value: string; label: string }>>([]);
const portMappings = ref<PortMapping[]>([]);
const totalClients = ref(0);

const loadUpnpSettings = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response: UpnpResponse = await getUpnpSettings();
    upnpEnable.value = response.ApplicationUpnp.Enable;
    selectedInterface.value = response.ApplicationUpnp.Interface;

    if (response.ApplicationUpnp.InterfaceOptions) {
      interfaceOptions.value = response.ApplicationUpnp.InterfaceOptions;
    }

    if (response.ApplicationUpnp.PortMappings) {
      portMappings.value = response.ApplicationUpnp.PortMappings;
    }

    if (response.ApplicationUpnp.PortMappingStats) {
      totalClients.value = response.ApplicationUpnp.PortMappingStats.total;
    }
  } catch (err) {
    console.error('Failed to load UPnP settings:', err);
    error.value = t('upnp.loadError');
  } finally {
    loading.value = false;
  }
};

const handleApply = async () => {
  saving.value = true;
  error.value = null;

  try {
    const updateData: UpnpUpdateRequest = {
      ApplicationUpnp: {
        Enable: upnpEnable.value,
        Interface: selectedInterface.value
      }
    };

    const response = await updateUpnpSettings(updateData);

    if (response.ApplicationUpnp.status === 'success') {
      await loadUpnpSettings();
    } else {
      error.value = t('upnp.updateError');
    }
  } catch (err) {
    console.error('Failed to update UPnP settings:', err);
    error.value = t('upnp.updateError');
  } finally {
    saving.value = false;
  }
};

const handleRefresh = () => {
  loadUpnpSettings();
};

onMounted(() => {
  loadUpnpSettings();
});
</script>

<template>
  <div class="page-container">
    <BlockingOverlay :isVisible="saving" :message="t('common.loading')" />

    <h1 class="page-title" :data-testid="qa('upnp-title')">{{ t('upnp.title') }}</h1>

    <div v-if="error" class="error-message" :data-testid="qa('upnp-error')">
      {{ error }}
    </div>

    <div v-if="loading" class="loading-container" :data-testid="qa('upnp-loading')">
      {{ t('common.loading') }}
    </div>

    <div v-else class="status-content">
      <div class="panel-section" :data-testid="qa('upnp-panel')">
        <div class="card-content">
          <div class="form-row" :data-testid="qa('upnp-enable-row')">
            <label class="form-label" :data-testid="qa('upnp-enable-label')">{{ t('upnp.enable') }}</label>
            <div class="form-control">
              <label class="switch" :data-testid="qa('upnp-enable-switch')">
                <input
                  type="checkbox"
                  v-model="upnpEnable"
                  :data-testid="qa('upnp-enable-input')"
                />
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <div v-if="0" class="form-row" :data-testid="qa('upnp-interface-row')">
            <label class="form-label" :data-testid="qa('upnp-interface-label')">{{ t('upnp.interfaceSelection') }}</label>
            <div class="form-control">
              <select
                v-model="selectedInterface"
                class="form-select"
                :data-testid="qa('upnp-interface-select')"
              >
                <option
                  v-for="option in interfaceOptions"
                  :key="option.value"
                  :value="option.value"
                  :data-testid="qa(`upnp-interface-option-${option.label}`)"
                >
                  {{ option.label.toUpperCase() }}
                </option>
              </select>
            </div>
          </div>

          <div class="service-list-container" :data-testid="qa('upnp-service-list')">
            <div class="header-row">
              <div class="section-title-sp" :data-testid="qa('upnp-service-list-title')">{{ t('upnp.serviceList') }}</div>
              <button
                class="btn btn-primary"
                @click="handleRefresh"
                :disabled="loading"
                :data-testid="qa('upnp-refresh-button')"
              >
                <span class="material-icons">refresh</span>
                {{ t('upnp.refresh') }}
              </button>
            </div>

            <div class="service-list-content">
              <div class="clients-info">
                <span class="clients-count">{{ t('upnp.totalClients') }}: {{ totalClients }}</span>
              </div>

            <!-- PC版表格 -->
            <div class="table-container">
              <table class="upnp-table" :data-testid="qa('upnp-service-table')">
                <thead>
                  <tr>
                    <th>{{ t('upnp.id') }}</th>
                    <th>{{ t('upnp.serviceDescription') }}</th>
                    <th>{{ t('upnp.externalPort') }}</th>
                    <th>{{ t('upnp.protocol') }}</th>
                    <th>{{ t('upnp.internalIpAddress') }}</th>
                    <th>{{ t('upnp.internalPort') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="portMappings.length === 0">
                    <td colspan="6" class="no-data">{{ t('upnp.noServices') }}</td>
                  </tr>
                  <tr
                    v-else
                    v-for="mapping in portMappings"
                    :key="mapping.Id"
                    :data-testid="qa(`upnp-service-row-${mapping.Id}`)"
                  >
                    <td>{{ mapping.Id }}</td>
                    <td>{{ mapping.Description || '--' }}</td>
                    <td>{{ mapping.ExternalPort || '--' }}</td>
                    <td>{{ mapping.Protocol || '--' }}</td>
                    <td>{{ mapping.InternalClient || '--' }}</td>
                    <td>{{ mapping.InternalPort || '--' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 手機版卡片 -->
            <div class="mobile-cards" :data-testid="qa('upnp-mobile-cards')">
              <div v-if="portMappings.length === 0" class="no-data-mobile" :data-testid="qa('upnp-no-data-mobile')">
                {{ t('upnp.noServices') }}
              </div>
              <div
                class="table-card"
                v-else
                v-for="mapping in portMappings"
                :key="mapping.Id"
                :data-testid="qa(`upnp-card-${mapping.Id}`)"
              >
                <div class="card-row">
                  <span class="card-label">{{ t('upnp.id') }}</span>
                  <span class="card-value">{{ mapping.Id }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">{{ t('upnp.serviceDescription') }}</span>
                  <span class="card-value">{{ mapping.Description || '--' }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">{{ t('upnp.externalPort') }}</span>
                  <span class="card-value">{{ mapping.ExternalPort || '--' }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">{{ t('upnp.protocol') }}</span>
                  <span class="card-value">{{ mapping.Protocol || '--' }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">{{ t('upnp.internalIpAddress') }}</span>
                  <span class="card-value">{{ mapping.InternalClient || '--' }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">{{ t('upnp.internalPort') }}</span>
                  <span class="card-value">{{ mapping.InternalPort || '--' }}</span>
                </div>
              </div>
            </div>
            </div>
          </div>

          <div class="form-actions" :data-testid="qa('upnp-actions')">
            <button
              class="btn btn-primary"
              @click="handleApply"
              :disabled="saving"
              :data-testid="qa('upnp-apply-button')"
            >
              {{ t('upnp.apply') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading-container {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.error-message {
  padding: 1rem;
  background-color: #fee;
  color: #dc3545;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 1rem;
  align-items: center;
  padding: 1rem 0;
}

.form-label {
  font-weight: 500;
  color: var(--text-primary);
}

.form-control {
  display: flex;
  align-items: center;
}

.form-select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
  min-width: 200px;
}

.form-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
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
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--color-primary);
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  min-width: 120px;
}

.service-list-container {
  margin-top: 2rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: white;
  overflow: hidden;
}

.service-list-container .header-row {
  padding: var(--space-4) var(--space-6);
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.section-title-sp {
  font-size: 1rem;
  color: var(--text-primary);
  padding: 0.5rem 0;
}

.service-list-content {
  padding: 1.5rem;
}

.clients-info {
  margin-bottom: 1.5rem;
}

.clients-count {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.table-container {
  overflow-x: auto;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.upnp-table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--bg-primary);
}

.upnp-table thead {
  background-color: #f8f9fa;
}

.upnp-table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  font-size: 0.9rem;
}

.upnp-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  font-size: 0.9rem;
}

.upnp-table tbody tr:last-child td {
  border-bottom: none;
}

.upnp-table tbody tr:hover {
  background-color: #f8f9fa;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.mobile-cards {
  display: none;
}

.no-data-mobile {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  background-color: var(--bg-secondary);
  border-radius: 4px;
}

.table-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.table-card:last-child {
  margin-bottom: 0;
}

.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}

.card-row:last-child {
  border-bottom: none;
}

.card-label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.card-value {
  color: var(--text-primary);
  font-size: 0.9rem;
  text-align: right;
  word-break: break-word;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .form-label {
    margin-bottom: 0.5rem;
  }

  .service-list-container {
    margin-top: 1rem;
  }

  .service-list-container .header-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
  }

  .section-title-sp {
    padding: 0;
  }

  .service-list-content {
    padding: 1rem;
  }

  .table-container {
    display: none;
  }

  .mobile-cards {
    display: block;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
