<template>
  <h2 class="page-title" :data-testid="qa('basic-wan-cht-title')">{{ $t('basicWanCht.title') }}</h2>
  <div class="status-content" :data-testid="qa('basic-wan-cht-content')">
    <div v-if="showSuccess" class="success-message" :data-testid="qa('basic-wan-cht-success')">
      {{ $t('common.saveSuccess') }}
    </div>
    <div v-if="showFail" class="fail-message" :data-testid="qa('basic-wan-cht-error')">
      {{ $t('common.saveFailed') }}
    </div>
    <div v-if="showLoadFail" class="fail-message" :data-testid="qa('basic-wan-cht-load-error')">
      {{ $t('basicWanCht.loadError') }}
    </div>
    <div v-if="!editMode" class="management-view" :data-testid="qa('basic-wan-cht-management')">
      <div class="panel-section">
        <div class="section-title">{{ $t('basicWanCht.wanManagement') }}</div>
        <div class="card-content">
          <div class="table-container" :data-testid="qa('basic-wan-cht-table-container')">
            <table :data-testid="qa('basic-wan-cht-table')">
              <thead>
                <tr :data-testid="qa('basic-wan-cht-table-header')">
                  <th :data-testid="qa('basic-wan-cht-header-status')">{{ $t('basicWanCht.status') }}</th>
                  <th :data-testid="qa('basic-wan-cht-header-description')">{{ $t('basicWanCht.description') }}</th>
                  <th :data-testid="qa('basic-wan-cht-header-gateway')">{{ $t('basicWanCht.defaultGateway') }}</th>
                  <th :data-testid="qa('basic-wan-cht-header-vlan-type')">{{ $t('basicWanCht.vlanType') }}</th>
                  <th :data-testid="qa('basic-wan-cht-header-vlan-id')">{{ $t('basicWanCht.vlanIdColumn') }}</th>
                  <th :data-testid="qa('basic-wan-cht-header-protocol')">{{ $t('basicWanCht.protocol') }}</th>
                  <th :data-testid="qa('basic-wan-cht-header-action')">{{ $t('basicWanCht.action') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in tableData" :key="row.type" :data-testid="qa(`basic-wan-cht-row-${row.type.toLowerCase()}`)">
                  <td :data-testid="qa(`basic-wan-cht-status-${row.type.toLowerCase()}`)">
                    <BaseBadge :variant="row.status === 'Up' ? 'success' : 'neutral'">
                      {{ row.status }}
                    </BaseBadge>
                  </td>
                  <td :data-testid="qa(`basic-wan-cht-description-${row.type.toLowerCase()}`)">{{ row.description }}</td>
                  <td :data-testid="qa(`basic-wan-cht-gateway-${row.type.toLowerCase()}`)">{{ row.defaultGateway ? $t('common.yes') : $t('common.no') }}</td>
                  <td :data-testid="qa(`basic-wan-cht-vlan-type-${row.type.toLowerCase()}`)">{{ row.vlanType }}</td>
                  <td :data-testid="qa(`basic-wan-cht-vlan-id-${row.type.toLowerCase()}`)">{{ row.vlanId }}</td>
                  <td :data-testid="qa(`basic-wan-cht-protocol-${row.type.toLowerCase()}`)">{{ row.protocol }}</td>
                  <td :data-testid="qa(`basic-wan-cht-actions-${row.type.toLowerCase()}`)">
                    <div class="action-buttons">
                      <button class="btn-action" :data-testid="qa(`basic-wan-cht-edit-${row.type.toLowerCase()}`)" @click="editConnection(row.type)" title="Edit">
                        <span class="material-icons">edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="mobile-cards">
            <div class="table-card" v-for="row in tableData" :key="row.type">
              <div class="card-row">
                <span class="card-label">{{ $t('basicWanCht.status') }}</span>
                <span class="card-value">
                  <BaseBadge :variant="row.status === 'Up' ? 'success' : 'neutral'">
                    {{ row.status }}
                  </BaseBadge>
                </span>
              </div>

              <div class="card-row">
                <span class="card-label">{{ $t('basicWanCht.description') }}</span>
                <span class="card-value">{{ row.description }}</span>
              </div>

              <div class="card-row">
                <span class="card-label">{{ $t('basicWanCht.defaultGateway') }}</span>
                <span class="card-value">{{ row.defaultGateway ? $t('common.yes') : $t('common.no') }}</span>
              </div>

              <div class="card-row">
                <span class="card-label">{{ $t('basicWanCht.vlanType') }}</span>
                <span class="card-value">{{ row.vlanType }}</span>
              </div>

              <div class="card-row">
                <span class="card-label">{{ $t('basicWanCht.vlanIdColumn') }}</span>
                <span class="card-value">{{ row.vlanId }}</span>
              </div>

              <div class="card-row">
                <span class="card-label">{{ $t('basicWanCht.protocol') }}</span>
                <span class="card-value">{{ row.protocol }}</span>
              </div>

              <div class="card-actions">
                <button class="btn-action" @click="editConnection(row.type)" title="Edit">
                  <span class="material-icons">edit</span>
                </button>
              </div>
            </div>
          </div>


          <div class="button-group" :data-testid="qa('basic-wan-cht-button-group')">
            <ActionButtons
              :cancel-data-testid="qa('basic-wan-cht-cancel-button')"
              :apply-data-testid="qa('basic-wan-cht-apply-button')"
              @cancel="handleCancel"
              @apply="handleApply"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-else class="edit-view" :data-testid="qa('basic-wan-cht-edit-view')">
      <PPPoEEditForm
        v-if="editType === 'PPPoE' && editData"
        v-model="editData.PPPoE"
        :data-testid="qa('basic-wan-cht-pppoe-form')"
      />
      <IPoEEditForm
        v-else-if="editType === 'IPoE' && editData"
        v-model="editData.IPoE"
        :data-testid="qa('basic-wan-cht-ipoe-form')"
      />
      <BridgeEditForm
        v-else-if="editType === 'Bridge' && editData"
        v-model="editData.Bridge"
        :data-testid="qa('basic-wan-cht-bridge-form')"
      />

      <div class="button-group" :data-testid="qa('basic-wan-cht-edit-button-group')">
        <ActionButtons
          :cancel-data-testid="qa('basic-wan-cht-edit-cancel-button')"
          :apply-data-testid="qa('basic-wan-cht-edit-save-button')"
          :apply-text="$t('common.save')"
          @cancel="cancelEdit"
          @apply="saveEdit"
        />
      </div>
    </div>

    <!--BlockingOverlay :is-visible="loading" /-->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { basicWanChtApi } from '../../../services/api/basicWanCht';
import type { BasicWanChtConfig, BasicWanChtTableRow } from '../../../types/basicWanCht';
import PPPoEEditForm from '../../../components/basicWanCht/PPPoEEditForm.vue';
import IPoEEditForm from '../../../components/basicWanCht/IPoEEditForm.vue';
import BridgeEditForm from '../../../components/basicWanCht/BridgeEditForm.vue';
import { BaseBadge, ActionButtons } from '../../../components/common';
import { useQA } from '../../../utils/qa';

const { t } = useI18n();
const { qa } = useQA();
const showSuccess = ref(false);
const showFail = ref(false);
const showLoadFail = ref(false);
//const loading = ref(false);
const config = ref<BasicWanChtConfig | null>(null);
const editData = ref<BasicWanChtConfig | null>(null);
const editMode = ref(false);
const editType = ref<'PPPoE' | 'IPoE' | 'Bridge' | null>(null);

const tableData = computed<BasicWanChtTableRow[]>(() => {
  if (!config.value) return [];

  const rows: BasicWanChtTableRow[] = [];

  const pppoe = config.value.PPPoE;
  rows.push({
    type: 'PPPoE',
    status: pppoe.Enable ? 'Up' : 'Down',
    description: 'PPPoE',
    defaultGateway: pppoe.DefaultGateway,
    vlanType: pppoe.VLANEnable ? 'VLAN' : 'Untagged',
    vlanId: pppoe.VLANEnable ? pppoe.VLANID : '-',
    protocol: pppoe.Protocol
  });

  const ipoe = config.value.IPoE;
  rows.push({
    type: 'IPoE',
    status: ipoe.Enable ? 'Up' : 'Down',
    description: 'IPoE',
    defaultGateway: ipoe.DefaultGateway,
    vlanType: ipoe.VLANEnable ? 'VLAN' : 'Untagged',
    vlanId: ipoe.VLANEnable ? ipoe.VLANID : '-',
    protocol: ipoe.Protocol
  });

  const bridge = config.value.Bridge;
  rows.push({
    type: 'Bridge',
    status: bridge.Enable ? 'Up' : 'Down',
    description: 'Bridge',
    defaultGateway: false,
    vlanType: bridge.VLANEnable ? 'VLAN' : 'Untagged',
    vlanId: bridge.VLANEnable ? bridge.VLANID : '-',
    protocol: bridge.Protocol
  });

  return rows;
});

const showSuccessMessage = () => {
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
  }, 3000);
};
const showFailMessage = () => {
  showFail.value = true;
  setTimeout(() => {
    showFail.value = false;
  }, 3000);
};
const showLoadFailMessage = () => {
  showLoadFail.value = true;
  setTimeout(() => {
    showLoadFail.value = false;
  }, 3000);
};

const loadConfig = async () => {
  try {
//    loading.value = true;
    config.value = await basicWanChtApi.getConfig();
  } catch (error) {
    showLoadFailMessage();
    console.error('Failed to load WAN configuration:', error);
//    alert(t('basicWanCht.loadError'));

  } finally {
//    loading.value = false;
  }
};

const editConnection = (type: 'PPPoE' | 'IPoE' | 'Bridge') => {
  editType.value = type;
  editData.value = JSON.parse(JSON.stringify(config.value));
  editMode.value = true;
};

const cancelEdit = () => {
  editMode.value = false;
  editType.value = null;
  editData.value = null;
};

const saveEdit = () => {
  if (editData.value && config.value) {
    config.value = editData.value;
    editMode.value = false;
    editType.value = null;
    editData.value = null;
  }
};

const handleCancel = () => {
  loadConfig();
};

const handleApply = async () => {
  if (!config.value) return;

  try {
//    loading.value = true;
    await basicWanChtApi.updateConfig(config.value);
//    alert(t('basicWanCht.saveSuccess'));
    showSuccessMessage();
  } catch (error) {
    showFailMessage();
    console.error('Failed to save WAN configuration:', error);
//    alert(t('basicWanCht.saveError'));
  } finally {
//    loading.value = false;
  }
};

onMounted(() => {
  loadConfig();
});
</script>

<style scoped>

.action-buttons {
  display: flex;
  gap: 0.5rem;
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

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.edit-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.edit-view .button-group {
  padding: 0 1.5rem;
}

.mobile-cards {
  display: none;
}

.table-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.card-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.35rem 0;
}

.card-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.card-value {
  color: var(--text-primary);
  text-align: right;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.75rem;
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

.fail-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #f11c2e;
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

@media (max-width: 768px) {
  .table-container {
    display: none;
  }

  .mobile-cards {
    display: block;
  }

  .button-group {
    flex-direction: column;
  }

  .button-group :deep(.btn) {
    width: 100%;
  }
}
</style>
