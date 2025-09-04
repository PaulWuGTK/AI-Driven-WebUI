<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ServiceControlRule, ServiceControlResponse } from '../../types/serviceControl';
import { getServiceControl, updateServiceControl } from '../../services/api/serviceControl';
import ServiceControlModal from './serviceControl/ServiceControlModal.vue';
import ConfirmationDialog from '../../components/ConfirmationDialog.vue';
import { useQA } from '../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const serviceControlData = ref<ServiceControlResponse | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const showModal = ref(false);
const editingRule = ref<ServiceControlRule | null>(null);
const originalServiceName = ref<string | null>(null);
const showSuccess = ref(false);
const showConfirmDialog = ref(false);
const ruleToDelete = ref<string | null>(null);

// Computed properties for display
const protocolMap = computed(() => {
  if (!serviceControlData.value) return {};
  return Object.fromEntries(
    serviceControlData.value.AdvancedServiceControl.ACLAvailableOptions.Protocols.map(p => [p.value, p.label])
  );
});

const interfaceMap = computed(() => {
  if (!serviceControlData.value) return {};
  return Object.fromEntries(
    serviceControlData.value.AdvancedServiceControl.ACLAvailableOptions.Interfaces.map(i => [i.value, i.label])
  );
});

const ipVersionMap = computed(() => {
  if (!serviceControlData.value) return {};
  const map = Object.fromEntries(
    serviceControlData.value.AdvancedServiceControl.ACLAvailableOptions.IPVersions.map(i => [i.value, i.label])
  );
  map['-1'] = 'Both';
  map['0'] = 'Both';
  return map;
});

// Fetch service control data
const fetchServiceControl = async () => {
  loading.value = true;
  error.value = null;
  try {
    serviceControlData.value = await getServiceControl();
    // 保險：補上 InterfaceOriginal（舊資料或舊後端時）
    const rules = serviceControlData.value.AdvancedServiceControl.Rules || [];
    serviceControlData.value.AdvancedServiceControl.Rules = rules.map(r => ({
      ...r,
      InterfaceOriginal: (r as any).InterfaceOriginal ?? r.Interface,
    }));
  } catch (err) {
    console.error('Error fetching service control data:', err);
    error.value = 'Failed to fetch service control data';
  } finally {
    loading.value = false;
  }
};

// Handle adding a new rule
const handleAddRule = () => {
  if (!serviceControlData.value) return;
  
  const defaultProtocol = serviceControlData.value.AdvancedServiceControl.ACLAvailableOptions.Protocols[0].value;
  const defaultInterface = serviceControlData.value.AdvancedServiceControl.ACLAvailableOptions.Interfaces.find(i => i.label === 'wan')?.value || 
                          serviceControlData.value.AdvancedServiceControl.ACLAvailableOptions.Interfaces[0].value;
  
  editingRule.value = {
    DestPort: "",
    Protocol: defaultProtocol,
    Action: "Accept",
    Enable: true,
    Service: "",
    Interface: defaultInterface,
    InterfaceOriginal: defaultInterface,
    IPVersion: 4
  };
  
  originalServiceName.value = null;
  showModal.value = true;
};

// Handle editing an existing rule
const handleEditRule = (rule: ServiceControlRule) => {
  editingRule.value = { ...rule };
  originalServiceName.value = rule.Service;
  showModal.value = true;
};

// Handle deleting a rule
const handleDeleteRule = async (service: string) => {
  ruleToDelete.value = service;
  showConfirmDialog.value = true;
};

// Confirm delete rule
const confirmDeleteRule = async () => {
  if (!ruleToDelete.value || !serviceControlData.value) return;
  
  try {
    const updatedRules = serviceControlData.value.AdvancedServiceControl.Rules.filter(
      rule => rule.Service !== ruleToDelete.value
    );
    
    await updateServiceControl({
      AdvancedServiceControl: {
        Rules: updatedRules
      }
    });
    
    await fetchServiceControl();
    showSuccessMessage();
  } catch (err) {
    console.error('Error deleting rule:', err);
    error.value = 'Failed to delete rule';
  } finally {
    showConfirmDialog.value = false;
    ruleToDelete.value = null;
  }
};

// Handle saving a rule
const handleSaveRule = async (rule: ServiceControlRule) => {
  if (!serviceControlData.value) return;
  
  const isNewRule = !originalServiceName.value;
  
  let updatedRules: ServiceControlRule[];
  
  if (isNewRule) {
    // Adding a new rule
    updatedRules = [...serviceControlData.value.AdvancedServiceControl.Rules, rule];
  } else {
    // Editing an existing rule
    updatedRules = serviceControlData.value.AdvancedServiceControl.Rules.filter(
      r => r.Service !== originalServiceName.value
    );
    updatedRules.push(rule);
  }
  
  try {
    await updateServiceControl({
      AdvancedServiceControl: {
        Rules: updatedRules
      }
    });
    
    await fetchServiceControl();
    showModal.value = false;
    editingRule.value = null;
    originalServiceName.value = null;
    showSuccessMessage();
  } catch (err) {
    console.error('Error saving rule:', err);
    error.value = 'Failed to save rule';
  }
};

// Show success message
const showSuccessMessage = () => {
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
  }, 3000);
};

// Format IP version for display
const formatIPVersion = (version: number): string => {
  if (version === -1 || version === 0) return 'Both';
  return `IPv${version}`;
};

onMounted(fetchServiceControl);
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('service-control-title')">{{ t('serviceControl.title') }}</h1>

    <div class="status-content" :data-testid="qa('service-control-content')">
      <div v-if="loading && !serviceControlData" class="loading-state" :data-testid="qa('service-control-loading')">
        <div class="loading-spinner"></div>
        <span>{{ t('common.loading') }}</span>
      </div>

      <div v-else-if="error" class="error-state" :data-testid="qa('service-control-error')">
        {{ error }}
      </div>

      <div v-else-if="serviceControlData" class="panel-section" :data-testid="qa('service-control-panel')">
        <div class="header-row">
          <div class="section-title-sp" :data-testid="qa('service-control-management-title')">{{ t('serviceControl.management') }}</div>
          <button class="btn btn-primary add-rule-btn" :data-testid="qa('service-control-add-rule-button')" @click="handleAddRule">
            <span class="material-icons">add</span>
            <span>{{ t('serviceControl.addRule') }}</span>
          </button>
        </div>

        <div class="card-content">
          <div class="table-container" :data-testid="qa('service-control-table')">
            <table>
              <thead>
                <tr>
                  <th :data-testid="qa('service-control-header-service-type')">{{ t('serviceControl.serviceType') }}</th>
                  <th :data-testid="qa('service-control-header-port')">{{ t('ssh.port') }}</th>
                  <th :data-testid="qa('service-control-header-access-direction')">{{ t('serviceControl.accessDirection') }}</th>
                  <th :data-testid="qa('service-control-header-protocol')">{{ t('serviceControl.protocol') }}</th>
                  <th :data-testid="qa('service-control-header-ip-range')">{{ t('serviceControl.ipRange') }}</th>
                  <th :data-testid="qa('service-control-header-status')">{{ t('serviceControl.status') }}</th>
                  <th :data-testid="qa('service-control-header-action')">{{ t('serviceControl.action') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(rule, ruleIndex) in serviceControlData.AdvancedServiceControl.Rules" :key="rule.Service" :data-testid="qa(`service-control-row-${ruleIndex}`)">
                  <td :data-testid="qa(`service-control-service-${ruleIndex}`)">{{ rule.Service }}</td>
                  <td :data-testid="qa(`service-control-port-${ruleIndex}`)">{{ rule.DestPort }}</td>
                  <td :data-testid="qa(`service-control-access-direction-${ruleIndex}`)">{{ interfaceMap[rule.Interface] || rule.Interface }}</td>
                  <td :data-testid="qa(`service-control-protocol-${ruleIndex}`)">{{ protocolMap[rule.Protocol] || rule.Protocol }}</td>
                  <td>
                    {{ formatIPVersion(rule.IPVersion) }}
                    <span v-if="rule.SourceIPStart && rule.SourceIPEnd">
                      ({{ rule.SourceIPStart }} - {{ rule.SourceIPEnd }})
                    </span>
                  </td>
                  <td>
                    <span :class="rule.Enable ? 'status-enabled' : 'status-disabled'" :data-testid="qa(`service-control-status-${ruleIndex}`)">
                      {{ rule.Enable ? t('serviceControl.enabled') : t('serviceControl.disabled') }}
                    </span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn-action" :data-testid="qa(`service-control-edit-button-${ruleIndex}`)" @click="handleEditRule(rule)" title="Edit">
                        <span class="material-icons">edit</span>
                      </button>
                      <button class="btn-action" :data-testid="qa(`service-control-delete-button-${ruleIndex}`)" @click="handleDeleteRule(rule.Service)" title="Delete">
                        <span class="material-icons">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="serviceControlData.AdvancedServiceControl.Rules.length === 0" :data-testid="qa('service-control-no-data-row')">
                  <td colspan="7" class="no-data" :data-testid="qa('service-control-no-data')">No rules configured</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mobile-cards" :data-testid="qa('service-control-mobile')">
            <div v-if="serviceControlData.AdvancedServiceControl.Rules.length === 0" class="no-data-mobile" :data-testid="qa('service-control-no-data-mobile')">
              No rules configured
            </div>
            <div 
              class="table-card" 
              v-for="(rule, ruleIndex) in serviceControlData.AdvancedServiceControl.Rules" 
              :key="rule.Service"
              :data-testid="qa(`service-control-card-${ruleIndex}`)"
            >
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`service-control-card-service-label-${ruleIndex}`)">{{ t('serviceControl.serviceType') }}</span>
                <span class="card-value" :data-testid="qa(`service-control-card-service-value-${ruleIndex}`)">{{ rule.Service }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`service-control-card-port-label-${ruleIndex}`)">{{ t('ssh.port') }}</span>
                <span class="card-value" :data-testid="qa(`service-control-card-port-value-${ruleIndex}`)">{{ rule.DestPort }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`service-control-card-access-direction-label-${ruleIndex}`)">{{ t('serviceControl.accessDirection') }}</span>
                <span class="card-value" :data-testid="qa(`service-control-card-access-direction-value-${ruleIndex}`)">{{ interfaceMap[rule.Interface] || rule.Interface }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`service-control-card-protocol-label-${ruleIndex}`)">{{ t('serviceControl.protocol') }}</span>
                <span class="card-value" :data-testid="qa(`service-control-card-protocol-value-${ruleIndex}`)">{{ protocolMap[rule.Protocol] || rule.Protocol }}</span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`service-control-card-ip-range-label-${ruleIndex}`)">{{ t('serviceControl.ipRange') }}</span>
                <span class="card-value">
                  {{ formatIPVersion(rule.IPVersion) }}
                  <span v-if="rule.SourceIPStart && rule.SourceIPEnd">
                    ({{ rule.SourceIPStart }} - {{ rule.SourceIPEnd }})
                  </span>
                </span>
              </div>
              <div class="card-row">
                <span class="card-label" :data-testid="qa(`service-control-card-status-label-${ruleIndex}`)">{{ t('serviceControl.status') }}</span>
                <span class="card-value" :class="rule.Enable ? 'status-enabled' : 'status-disabled'" :data-testid="qa(`service-control-card-status-value-${ruleIndex}`)">
                  {{ rule.Enable ? t('serviceControl.enabled') : t('serviceControl.disabled') }}
                </span>
              </div>
              <div class="card-actions">
                <button class="btn-action" :data-testid="qa(`service-control-card-edit-button-${ruleIndex}`)" @click="handleEditRule(rule)" title="Edit">
                  <span class="material-icons">edit</span>
                </button>
                <button class="btn-action" :data-testid="qa(`service-control-card-delete-button-${ruleIndex}`)" @click="handleDeleteRule(rule.Service)" title="Delete">
                  <span class="material-icons">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Success message -->
      <div v-if="showSuccess" class="success-message" :data-testid="qa('service-control-success-message')">
        Operation successful
      </div>

      <!-- Edit/Add Modal -->
      <ServiceControlModal
        v-if="showModal && editingRule && serviceControlData"
        :data-testid="qa('service-control-modal')"
        :rule="editingRule"
        :options="serviceControlData.AdvancedServiceControl.ACLAvailableOptions"
        @save="handleSaveRule"
        @cancel="showModal = false"
      />

      <!-- Confirmation Dialog -->
      <ConfirmationDialog
        :is-open="showConfirmDialog"
        :data-testid="qa('service-control-confirm-dialog')"
        :title="t('serviceControl.confirmDelete')"
        :message="t('serviceControl.confirmDelete')"
        @confirm="confirmDeleteRule"
        @cancel="showConfirmDialog = false"
      />
    </div>
  </div>
</template>

<style scoped>
.section-title-sp {
  font-size: 1rem;
  color: var(--text-primary);
  padding: 0.5rem 0;
}

.status-enabled {
  color: #4caf50;
  font-weight: 500;
}

.status-disabled {
  color: #dc3545;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 4px;
}

.btn-action:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.no-data-mobile {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  background-color: var(--bg-secondary);
  border-radius: 4px;
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

.add-rule-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.add-rule-btn .material-icons {
  font-size: 20px;
  line-height: 1;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
}

@media (max-width: 768px) {
  .header-row {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .section-title-sp {
    padding: 0;
  }

  .btn {
    width: 100%;
    justify-content: center;
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