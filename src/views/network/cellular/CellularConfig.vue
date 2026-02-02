<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { CellularResponse, CellularConfigRequest } from '../../../types/cellular';
import { getCellularStatus, updateCellularConfig } from '../../../services/api/cellular';
import { useQA } from '../../../utils/qa';
import BaseButton from '../../../components/common/BaseButton.vue';
import BaseSelect from '../../../components/common/BaseSelect.vue';
import BaseInput from '../../../components/common/BaseInput.vue';
import BaseSpinner from '../../../components/common/BaseSpinner.vue';

const { qa } = useQA();
const { t } = useI18n();

const loading = ref(false);
const saving = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const formData = ref({
  roamingEnabled: false,
  interfaceEnable: true,
  ipType: 'ipv4v6',
  apn: 'internet',
  preferredAccessTechnology: '5g'
});

const ipTypeOptions = [
  { value: 'ipv4', label: 'IPv4' },
  { value: 'ipv6', label: 'IPv6' },
  { value: 'ipv4v6', label: 'IPv4/IPv6' }
];

const accessTechnologyOptions = [
  { value: '5g', label: '5G' },
  { value: '4g', label: '4G' },
  { value: '3g', label: '3G' },
  { value: 'Auto', label: 'Auto' }
];

const fetchCellularStatus = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response: CellularResponse = await getCellularStatus();
    if (response.Cellular) {
      formData.value = {
        roamingEnabled: response.Cellular.RoamingEnabled === 1,
        interfaceEnable: response.Cellular.InterfaceEnable === 1,
        ipType: response.Cellular.X_PRPLWARE_COM_IPType || 'ipv4v6',
        apn: response.Cellular.APN || 'internet',
        preferredAccessTechnology: response.Cellular.PreferredAccessTechnology || '5g'
      };
    }
  } catch (err) {
    console.error('Error fetching Cellular status:', err);
    error.value = 'Failed to fetch Cellular configuration';
  } finally {
    loading.value = false;
  }
};

const handleSave = async () => {
  saving.value = true;
  error.value = null;
  successMessage.value = null;

  try {
    const config: CellularConfigRequest = {
      Cellular: {
        RoamingEnabled: formData.value.roamingEnabled,
        InterfaceEnable: formData.value.interfaceEnable,
        X_PRPLWARE_COM_IPType: formData.value.ipType,
        APN: formData.value.apn,
        PreferredAccessTechnology: formData.value.preferredAccessTechnology
      }
    };

    await updateCellularConfig(config);
    successMessage.value = 'Cellular configuration updated successfully';

    setTimeout(() => {
      successMessage.value = null;
    }, 3000);
  } catch (err) {
    console.error('Error updating Cellular configuration:', err);
    error.value = 'Failed to update Cellular configuration';
  } finally {
    saving.value = false;
  }
};

const handleCancel = () => {
  fetchCellularStatus();
};

onMounted(() => {
  fetchCellularStatus();
});
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('cellular-config-title')">{{ t('cellular.title') }}</h1>

    <div class="status-content">
      <div v-if="loading" class="loading-state">
        <BaseSpinner size="lg" />
        <span>{{ t('common.loading') }}</span>
      </div>

      <div v-else class="panel-section">
        <div class="card-content">
          <div v-if="error" class="alert alert-error">
            {{ error }}
          </div>

          <div v-if="successMessage" class="alert alert-success">
            {{ successMessage }}
          </div>

          <form @submit.prevent="handleSave" class="config-form">
            <div class="form-group">
              <div class="switch-label">
                <span>{{ t('cellular.interfaceEnable') }}</span>
                <label class="switch">
                  <input
                    type="checkbox"
                    v-model="formData.interfaceEnable"
                    :data-testid="qa('cellular-interface-enable')"
                  >
                  <span class="slider" :data-testid="qa('cellular-interface-enable-slider')"></span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <div class="switch-label">
                <span>{{ t('cellular.roamingEnabled') }}</span>
                <label class="switch">
                  <input
                    type="checkbox"
                    v-model="formData.roamingEnabled"
                    :data-testid="qa('cellular-roaming-enabled')"
                  >
                  <span class="slider" :data-testid="qa('cellular-roaming-enabled-slider')"></span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="ip-type">
                {{ t('cellular.ipType') }}
              </label>
              <BaseSelect
                id="ip-type"
                v-model="formData.ipType"
                :options="ipTypeOptions"
                :data-testid="qa('cellular-ip-type')"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="apn">
                {{ t('cellular.apn') }}
              </label>
              <BaseInput
                id="apn"
                v-model="formData.apn"
                type="text"
                :placeholder="t('cellular.apn')"
                :data-testid="qa('cellular-apn')"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="access-technology">
                {{ t('cellular.preferredAccessTechnology') }}
              </label>
              <BaseSelect
                id="access-technology"
                v-model="formData.preferredAccessTechnology"
                :options="accessTechnologyOptions"
                :data-testid="qa('cellular-access-technology')"
              />
            </div>

            <div class="form-actions">
              <BaseButton
                type="button"
                variant="secondary"
                @click="handleCancel"
                :disabled="saving"
                :data-testid="qa('cellular-cancel-btn')"
              >
                {{ t('common.cancel') }}
              </BaseButton>
              <BaseButton
                type="submit"
                variant="primary"
                :loading="saving"
                :disabled="saving"
                :data-testid="qa('cellular-save-btn')"
              >
                {{ t('common.apply') }}
              </BaseButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.alert {
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.alert-error {
  background-color: #fee;
  color: #c33;
  border: 1px solid #fcc;
}

.alert-success {
  background-color: #efe;
  color: #3c3;
  border: 1px solid #cfc;
}

.config-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 1.5rem;
}

/* Custom switch size (60px × 34px) for larger prominence */

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}
</style>
