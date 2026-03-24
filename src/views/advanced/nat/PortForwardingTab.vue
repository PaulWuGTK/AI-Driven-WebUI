<template>
  <SectionCard
    header-mode="row"
    :title="$t('portForwarding.title')"
    :title-data-testid="qa('port-forwarding-section-title')"
    :content-data-testid="qa('port-forwarding-section-content')"
  >
    <template #actions>
      <button class="btn btn-primary" :data-testid="qa('port-forwarding-add-button')" @click="handleAdd">
        <span class="material-icons">add</span>
        {{ $t('common.add') }}
      </button>
    </template>

    <div v-if="errorMessage" class="error-banner">
      <span class="material-icons">error</span>
      <span>{{ errorMessage }}</span>
      <button class="close-btn" :data-testid="qa('port-forwarding-error-close-button')" @click="errorMessage = ''">
        <span class="material-icons">close</span>
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <span>{{ $t('common.loading') }}</span>
    </div>

    <div v-else class="rule-list">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>{{ $t('portForwarding.number') }}</th>
              <th>{{ $t('portForwarding.enable') }}</th>
              <th>{{ $t('portForwarding.description') }}</th>
              <th>{{ $t('portForwarding.protocol') }}</th>
              <th>{{ $t('portForwarding.externalPortRange') }}</th>
              <th>{{ $t('portForwarding.internalPortRange') }}</th>
              <th>{{ $t('portForwarding.internalIPAddress') }}</th>
              <th>{{ $t('common.action') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(rule, index) in rules" :key="rule.No">
              <td>{{ rule.No }}</td>
              <td>
                <span class="status-badge" :class="rule.Enable ? 'enabled' : 'disabled'">
                  {{ rule.Enable ? '1' : '0' }}
                </span>
              </td>
              <td>{{ rule.Description || '-' }}</td>
              <td>{{ rule.Protocol.toLowerCase() }}</td>
              <td>{{ rule.ExternalPortRange }}</td>
              <td>{{ rule.InternalPort }}</td>
              <td>{{ rule.InternalIPAdress }}</td>
              <td>
                <div class="action-buttons">
                  <button class="btn-action" :data-testid="qa(`port-forwarding-edit-${index}`)" @click="handleEdit(rule)" :title="$t('common.edit')">
                    <span class="material-icons">edit</span>
                  </button>
                  <button class="btn-action" :data-testid="qa(`port-forwarding-delete-${index}`)" @click="handleDelete(rule)" :title="$t('common.delete')">
                    <span class="material-icons">delete</span>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="rules.length === 0">
              <td colspan="8" class="no-data">{{ $t('portForwarding.noRules') }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mobile-cards">
        <div v-if="rules.length === 0" class="no-data-mobile">
          {{ $t('portForwarding.noRules') }}
        </div>
        <div class="table-card" v-else v-for="(rule, index) in rules" :key="rule.No">
          <div class="card-row">
            <span class="card-label">{{ $t('portForwarding.number') }}</span>
            <span class="card-value">{{ rule.No }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">{{ $t('portForwarding.enable') }}</span>
            <span class="card-value">
              <span class="status-badge" :class="rule.Enable ? 'enabled' : 'disabled'">
                {{ rule.Enable ? '1' : '0' }}
              </span>
            </span>
          </div>
          <div class="card-row">
            <span class="card-label">{{ $t('portForwarding.description') }}</span>
            <span class="card-value">{{ rule.Description || '-' }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">{{ $t('portForwarding.protocol') }}</span>
            <span class="card-value">{{ rule.Protocol.toLowerCase() }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">{{ $t('portForwarding.externalPortRange') }}</span>
            <span class="card-value">{{ rule.ExternalPortRange }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">{{ $t('portForwarding.internalPortRange') }}</span>
            <span class="card-value">{{ rule.InternalPort }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">{{ $t('portForwarding.internalIPAddress') }}</span>
            <span class="card-value">{{ rule.InternalIPAdress }}</span>
          </div>
          <div class="card-actions" :data-testid="qa(`port-forwarding-card-actions-row-${index}`)">
            <span class="card-label" :data-testid="qa(`port-forwarding-card-actions-label-${index}`)">{{ $t('common.action') }}</span>
            <div class="action-buttons" :data-testid="qa(`port-forwarding-card-actions-${index}`)">
              <button class="btn-action" :data-testid="qa(`port-forwarding-mobile-edit-${index}`)" @click="handleEdit(rule)" :title="$t('common.edit')">
                <span class="material-icons">edit</span>
              </button>
              <button class="btn-action" :data-testid="qa(`port-forwarding-mobile-delete-${index}`)" @click="handleDelete(rule)" :title="$t('common.delete')">
                <span class="material-icons">delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </SectionCard>

  <BaseModal
    v-model="showModal"
    size="md"
    :close-button-data-testid="qa('port-forwarding-close-button')"
    @close="closeModal"
  >
    <template #header>
      <h3 class="modal-title" :data-testid="qa('port-forwarding-title')">
        {{ isEditMode ? $t('portForwarding.editRule') : $t('portForwarding.addRule') }}
      </h3>
    </template>

    <PortForwardingForm
      v-if="editingRule"
      :rule="editingRule"
      :wan-list="wanList"
      :proto-list="protoList"
      :show-title="false"
      :embedded="true"
      :is-edit="isEditMode"
      @update:rule="handleRuleUpdate"
      @save="handleSave"
      @cancel="closeModal"
    />
  </BaseModal>

  <ConfirmationDialog
    :is-open="showDeleteDialog"
    :title="$t('portForwarding.deleteRule')"
    :message="$t('portForwarding.deleteConfirmMessage')"
    @confirm="confirmDelete"
    @cancel="showDeleteDialog = false"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import PortForwardingForm from '../../../components/nat/PortForwardingForm.vue';
import ConfirmationDialog from '../../../components/ConfirmationDialog.vue';
import { BaseModal, SectionCard } from '../../../components/common';
import { portForwardingApi } from '../../../services/api/portForwarding';
import type { PortForwardRule } from '../../../types/portForwarding';
import { extractNokMessage } from '../../../utils/apiUtils';
import { useQA } from '../../../utils/qa';

const { t } = useI18n();
const { qa } = useQA();

const rules = ref<PortForwardRule[]>([]);
const wanList = ref<string[]>([]);
const protoList = ref<string[]>([]);
const showModal = ref(false);
const editingRule = ref<PortForwardRule | null>(null);
const isEditMode = ref(false);
const showDeleteDialog = ref(false);
const ruleToDelete = ref<PortForwardRule | null>(null);
const loading = ref(true);
const errorMessage = ref('');
const toFlag01 = (value: unknown): 0 | 1 => {
  return value === 1 || value === '1' || value === true ? 1 : 0;
};

const fetchRules = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const response = await portForwardingApi.getConfig();
    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      errorMessage.value = nokMessage;
      rules.value = [];
      wanList.value = [];
      protoList.value = [];
      return;
    }
    rules.value = (response.PortForwarding.PortForwardList || []).map(rule => ({
      ...rule,
      Enable: toFlag01(rule.Enable),
    }));
    wanList.value = response.PortForwarding.WanList || [];
    protoList.value = response.PortForwarding.ProtoList || [];
  } catch (error) {
    console.error('Failed to load port forwarding config:', error);
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
  const maxNo = rules.value.length > 0
    ? Math.max(...rules.value.map(r => r.No))
    : 0;

  editingRule.value = {
    No: maxNo + 1,
    Enable: 1,
    Description: '',
    Protocol: protoList.value[0] || 'Both',
    Interface: wanList.value[0] || '',
    ExternalPortRange: '',
    InternalPort: '',
    InternalIPAdress: ''
  };
  isEditMode.value = false;
  showModal.value = true;
};

const handleEdit = (rule: PortForwardRule) => {
  editingRule.value = { ...rule };
  isEditMode.value = true;
  showModal.value = true;
};

const handleDelete = (rule: PortForwardRule) => {
  ruleToDelete.value = rule;
  showDeleteDialog.value = true;
};

const handleRuleUpdate = (rule: PortForwardRule) => {
  editingRule.value = rule;
};

const closeModal = () => {
  showModal.value = false;
  editingRule.value = null;
  isEditMode.value = false;
};

const handleSave = async () => {
  if (!editingRule.value) return;

  try {
    loading.value = true;
    errorMessage.value = '';

    const existingRule = rules.value.find(r => r.No === editingRule.value!.No);
    let updatedRules: PortForwardRule[];

    if (existingRule) {
      updatedRules = rules.value.map(r => r.No === editingRule.value!.No ? editingRule.value! : r);
    } else {
      updatedRules = [...rules.value, editingRule.value];
    }

    const response = await portForwardingApi.updateConfig({
      PortForwarding: {
        PortForwardList: updatedRules
      }
    });

    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      errorMessage.value = nokMessage;
      return;
    }

    await fetchRules();
    closeModal();
  } catch (error) {
    console.error('Failed to save port forwarding rule:', error);
    errorMessage.value = error instanceof Error ? error.message : 'Failed to save port forwarding rule';
  } finally {
    loading.value = false;
  }
};

const confirmDelete = async () => {
  if (!ruleToDelete.value) return;

  try {
    loading.value = true;
    errorMessage.value = '';
    const updatedRules = rules.value.filter(r => r.No !== ruleToDelete.value!.No);

    const response = await portForwardingApi.updateConfig({
      PortForwarding: {
        PortForwardList: updatedRules
      }
    });

    const nokMessage = extractNokMessage(response);
    if (nokMessage) {
      errorMessage.value = nokMessage;
      showDeleteDialog.value = false;
      return;
    }

    await fetchRules();
    showDeleteDialog.value = false;
    ruleToDelete.value = null;
  } catch (error) {
    console.error('Failed to delete port forwarding rule:', error);
    errorMessage.value = error instanceof Error ? error.message : 'Failed to delete port forwarding rule';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchRules);
</script>

<style scoped>
.rule-list {
  padding: 0;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn .material-icons {
  font-size: 1.25rem;
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

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.enabled {
  color: #2e7d32;
}

.status-badge.disabled {
  color: #c62828;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
  min-width: 4.5rem;
}

.table-container th:last-child,
.table-container td:last-child {
  width: 7rem;
  text-align: center;
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

.error-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  margin: 0 0 1rem;
  background-color: #ffebee;
  border-left: 4px solid #c62828;
  border-radius: 4px;
  color: #c62828;
}

.error-banner .material-icons:first-child {
  font-size: 1.5rem;
}

.error-banner span:not(.material-icons) {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
}

.error-banner .close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  background: none;
  border: none;
  color: #c62828;
  cursor: pointer;
  border-radius: 4px;
}

.error-banner .close-btn:hover {
  background-color: rgba(198, 40, 40, 0.1);
}

.error-banner .close-btn .material-icons {
  font-size: 1.25rem;
}

.mobile-cards {
  display: none;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .rule-list {
    padding: 0;
  }

  :deep(.header-row) {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 1rem !important;
    flex-wrap: nowrap !important;
  }

  :deep(.section-title-sp) {
    flex: 1;
    min-width: 0;
    text-align: left;
  }

  :deep(.header-actions) {
    width: auto !important;
    flex-shrink: 0;
    display: flex !important;
    justify-content: flex-end !important;
    align-items: center !important;
  }

  :deep(.header-actions .btn),
  .btn {
    width: 100%;
    justify-content: center;
  }

  .loading-state {
    padding: 1rem;
  }

  .error-banner {
    margin: 0 0 1rem;
    padding: 0.875rem 1rem;
  }

  .table-container {
    display: none;
  }

  .mobile-cards {
    display: block;
  }

  .card-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 1rem;
  }

  .card-actions .action-buttons {
    display: inline-flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    min-width: 0;
  }
}
</style>
