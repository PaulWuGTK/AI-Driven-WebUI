<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DHCPACLConfig } from '../../../types/dhcpAcl';
import { getDHCPACL, updateDHCPACL } from '../../../services/api/dhcpAcl';
import { ActionButtons, BaseSwitch } from '../../../components/common';
import { useQA } from '../../../utils/qa';

const { qa } = useQA();
const { t } = useI18n();

const dhcpAclData = ref<DHCPACLConfig | null>(null);
const loading = ref(false);
const applying = ref(false);
const showSuccess = ref(false);
const error = ref<string | null>(null);

const matchLogicOptions = computed(() => {
  const list = dhcpAclData.value?.ListMatchLogic || 'and,or';
  return list.split(',').map(item => item.trim()).filter(Boolean);
});

const fetchDHCPACL = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getDHCPACL();
    dhcpAclData.value = response.DHCPACL;
  } catch (err) {
    console.error('Error fetching DHCP ACL settings:', err);
    error.value = t('lanBasic.fetchDhcpAclFailed');
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  if (applying.value) return;
  fetchDHCPACL();
};

const handleApply = async () => {
  if (!dhcpAclData.value || applying.value) return;

  applying.value = true;
  error.value = null;
  try {
    const response = await updateDHCPACL({ DHCPACL: dhcpAclData.value });
    dhcpAclData.value = response.DHCPACL;
    showSuccess.value = true;
    setTimeout(() => {
      showSuccess.value = false;
    }, 3000);
  } catch (err) {
    console.error('Error updating DHCP ACL settings:', err);
    error.value = t('lanBasic.updateDhcpAclFailed');
  } finally {
    applying.value = false;
  }
};

onMounted(fetchDHCPACL);
</script>

<template>
  <div class="dhcp-acl" :data-testid="qa('dhcp-acl-content')">
    <div v-if="loading && !dhcpAclData" class="loading-state" :data-testid="qa('dhcp-acl-loading')">
      <div class="loading-spinner"></div>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="error && !dhcpAclData" class="error-state" :data-testid="qa('dhcp-acl-error')">
      {{ error }}
    </div>

    <template v-else-if="dhcpAclData">
      <div class="panel-section dhcp-acl-panel" :data-testid="qa('dhcp-acl-panel')">
        <div v-if="applying" class="applying-overlay" :data-testid="qa('dhcp-acl-applying-overlay')">
          <div class="loading-spinner" :data-testid="qa('dhcp-acl-applying-spinner')"></div>
          <span :data-testid="qa('dhcp-acl-applying-text')">{{ t('lanBasic.applyingDhcpAcl') }}</span>
        </div>

        <div class="card-content" :data-testid="qa('dhcp-acl-form')">
          <div v-if="error" class="inline-error" :data-testid="qa('dhcp-acl-inline-error')">
            {{ error }}
          </div>

          <div class="form-row">
            <label :data-testid="qa('dhcp-acl-enable-label')">{{ t('lanBasic.enable') }}</label>
            <BaseSwitch
              v-model="dhcpAclData.Enable"
              :disabled="applying"
              :data-testid="qa('dhcp-acl-enable-toggle')"
              :slider-data-testid="qa('dhcp-acl-enable-slider')"
            />
          </div>

          <div class="form-row">
            <label for="dhcp-acl-match-logic" :data-testid="qa('dhcp-acl-match-logic-label')">{{ t('lanBasic.matchLogic') }}</label>
            <select
              id="dhcp-acl-match-logic"
              v-model="dhcpAclData.MatchLogic"
              :disabled="!dhcpAclData.Enable || applying"
              :data-testid="qa('dhcp-acl-match-logic-select')"
              class="form-select"
            >
              <option v-for="logic in matchLogicOptions" :key="logic" :value="logic">
                {{ logic }}
              </option>
            </select>
          </div>

          <div class="form-row">
            <label :data-testid="qa('dhcp-acl-option60-label')">{{ t('lanBasic.dhcpOption60') }}</label>
            <BaseSwitch
              v-model="dhcpAclData.Option60"
              :disabled="!dhcpAclData.Enable || applying"
              :data-testid="qa('dhcp-acl-option60-toggle')"
              :slider-data-testid="qa('dhcp-acl-option60-slider')"
            />
          </div>

          <div class="form-row">
            <label for="dhcp-acl-vendor-class-id" :data-testid="qa('dhcp-acl-vendor-class-id-label')">{{ t('lanBasic.vendorClassId') }}</label>
            <input
              id="dhcp-acl-vendor-class-id"
              v-model="dhcpAclData.VendorClassID"
              type="text"
              :disabled="!dhcpAclData.Enable || !dhcpAclData.Option60 || applying"
              :placeholder="t('lanBasic.vendorClassId')"
              :data-testid="qa('dhcp-acl-vendor-class-id-input')"
            />
          </div>

          <div class="form-row">
            <label :data-testid="qa('dhcp-acl-option61-label')">{{ t('lanBasic.dhcpOption61') }}</label>
            <BaseSwitch
              v-model="dhcpAclData.Option61"
              :disabled="!dhcpAclData.Enable || applying"
              :data-testid="qa('dhcp-acl-option61-toggle')"
              :slider-data-testid="qa('dhcp-acl-option61-slider')"
            />
          </div>

          <div class="form-row">
            <label for="dhcp-acl-client-identifier" :data-testid="qa('dhcp-acl-client-identifier-label')">{{ t('lanBasic.clientIdentifier') }}</label>
            <input
              id="dhcp-acl-client-identifier"
              v-model="dhcpAclData.ClientIdentifier"
              type="text"
              :disabled="!dhcpAclData.Enable || !dhcpAclData.Option61 || applying"
              :placeholder="t('lanBasic.clientIdentifier')"
              :data-testid="qa('dhcp-acl-client-identifier-input')"
            />
          </div>
        </div>
      </div>

      <ActionButtons
        class="dhcp-acl-actions"
        :apply-loading="applying"
        :apply-disabled="applying"
        :cancel-disabled="applying"
        :data-testid="qa('dhcp-acl-action-buttons')"
        :cancel-data-testid="qa('dhcp-acl-cancel-button')"
        :apply-data-testid="qa('dhcp-acl-apply-button')"
        @cancel="handleCancel"
        @apply="handleApply"
      />
    </template>

    <div v-if="showSuccess" class="success-message" :data-testid="qa('dhcp-acl-success-message')">
      {{ t('lanBasic.applySuccess') }}
    </div>
  </div>
</template>

<style scoped>
.dhcp-acl {
  padding: 1.5rem;
  position: relative;
}

.dhcp-acl-panel {
  position: relative;
}

.form-row {
  display: grid;
  grid-template-columns: 180px minmax(220px, 360px);
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-row label {
  color: var(--text-primary);
}

input[type="text"],
select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: white;
}

input:disabled,
select:disabled {
  background-color: var(--bg-secondary);
  cursor: not-allowed;
}

.dhcp-acl-actions {
  justify-content: flex-end;
  margin-top: 2rem;
}

.applying-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.72);
  color: var(--text-primary);
}

.loading-state,
.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  background-color: white;
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
}

.error-state,
.inline-error {
  color: #dc3545;
}

.inline-error {
  margin-bottom: 1rem;
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

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
}

@media (max-width: 768px) {
  .dhcp-acl {
    padding: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .dhcp-acl-actions {
    flex-direction: column;
  }
}
</style>
