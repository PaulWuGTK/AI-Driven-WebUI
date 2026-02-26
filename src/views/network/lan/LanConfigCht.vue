<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { BasicBridgeLanResponse, BasicBridgeLanUpdateRequest } from '../../../types/basicBridgeLan';
import { getBasicBridgeLan, updateBasicBridgeLan } from '../../../services/api/basicBridgeLan';
import { ActionButtons, BaseSwitch } from '../../../components/common';
import { useQA } from '../../../utils/qa';

const { isQAMode, qa, slug } = useQA();
const { t } = useI18n();

const lanChtData = ref<BasicBridgeLanResponse | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const showSuccess = ref(false);

const formData = ref({
  IPv4Enable: true,
  IPv4Protocol: 'DHCP',
  IPv4Address: '',
  SubnetMask: '',
  IPv6Enable: true,
  IPv6Protocol: 'AutoConfigured',
  IPv6Address: '',
  IPv6Prefix: ''
});

const showIPv4StaticFields = computed(() => {
  return formData.value.IPv4Enable && formData.value.IPv4Protocol === 'Static';
});

const showIPv6StaticFields = computed(() => {
  return formData.value.IPv6Enable && formData.value.IPv6Protocol === 'Static';
});

const fetchLanChtSettings = async () => {
  loading.value = true;
  error.value = null;
  try {
    lanChtData.value = await getBasicBridgeLan();
    if (lanChtData.value) {
      const config = lanChtData.value.BasicBridgeLan;
      formData.value = {
        IPv4Enable: config.IPv4Enable,
        IPv4Protocol: config.IPv4Protocol,
        IPv4Address: config.IPv4Address,
        SubnetMask: config.SubnetMask,
        IPv6Enable: config.IPv6Enable,
        IPv6Protocol: config.IPv6Protocol,
        IPv6Address: config.IPv6Address,
        IPv6Prefix: config.IPv6Prefix
      };
    }
  } catch (err) {
    console.error('Error fetching LAN CHT settings:', err);
    error.value = 'Failed to fetch LAN CHT settings';
  } finally {
    loading.value = false;
  }
};

const showSuccessMessage = () => {
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
  }, 3000);
};

const handleCancel = () => {
  fetchLanChtSettings();
};

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;
  try {
    const updateData: BasicBridgeLanUpdateRequest = {
      BasicBridgeLan: {
        IPv4Enable: formData.value.IPv4Enable,
        IPv4Protocol: formData.value.IPv4Protocol,
        IPv4Address: formData.value.IPv4Address,
        SubnetMask: formData.value.SubnetMask,
        IPv6Enable: formData.value.IPv6Enable,
        IPv6Protocol: formData.value.IPv6Protocol,
        IPv6Address: formData.value.IPv6Address,
        IPv6Prefix: formData.value.IPv6Prefix
      }
    };

    const response = await updateBasicBridgeLan(updateData);
    lanChtData.value = response;
    showSuccessMessage();
    await fetchLanChtSettings();
  } catch (err) {
    console.error('Error updating LAN CHT settings:', err);
    error.value = 'Failed to update LAN CHT settings';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchLanChtSettings);
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('lan-cht-title')">{{ t('basicBridgeLan.title') }}</h1>

    <div class="status-content" :data-testid="qa('lan-cht-content')">
      <div v-if="loading" class="loading-state" :data-testid="qa('lan-cht-loading')">
        <div class="loading-spinner"></div>
        <span>{{ t('common.loading') }}</span>
      </div>

      <div v-else-if="error" class="error-state" :data-testid="qa('lan-cht-error')">
        {{ error }}
      </div>

      <template v-else>
        <div class="panel-section" :data-testid="qa('lan-cht-panel')">
          <div class="card-content">
            <!-- IPv4 Section -->
            <div class="section-header">
              <h3 :data-testid="qa('lan-cht-ipv4-header')">{{ t('basicBridgeLan.ipv4Section') }}</h3>
            </div>

            <div class="form-group">
              <div class="switch-label">
                <span :data-testid="qa('lan-cht-ipv4-enable-label')">{{ t('basicBridgeLan.ipv4Enable') }}</span>
                <BaseSwitch
                  v-model="formData.IPv4Enable"
                  :data-testid="qa('lan-cht-ipv4-enable-toggle')"
                  :slider-data-testid="qa('lan-cht-ipv4-enable-slider')"
                />
              </div>
            </div>

            <div v-if="formData.IPv4Enable" class="nested-fields">
              <div class="form-group">
                <label :data-testid="qa('lan-cht-ipv4-protocol-label')">{{ t('basicBridgeLan.ipv4Protocol') }}</label>
                <select
                  v-model="formData.IPv4Protocol"
                  :data-testid="qa('lan-cht-ipv4-protocol-select')"
                  class="form-select"
                >
                  <option
                    v-for="protocol in lanChtData?.BasicBridgeLan.ListIPv4Protocol"
                    :key="protocol"
                    :value="protocol"
                    :data-testid="qa(`lan-cht-ipv4-protocol-option-${protocol.toLowerCase()}`)"
                  >
                    {{ protocol }}
                  </option>
                </select>
              </div>

              <div v-if="showIPv4StaticFields" class="static-fields">
                <div class="form-group">
                  <label :data-testid="qa('lan-cht-ipv4-address-label')">{{ t('basicBridgeLan.ipv4Address') }}</label>
                  <input
                    type="text"
                    :data-testid="qa('lan-cht-ipv4-address-input')"
                    v-model="formData.IPv4Address"
                    :placeholder="t('common.placeholder')"
                  >
                </div>

                <div class="form-group">
                  <label :data-testid="qa('lan-cht-subnet-mask-label')">{{ t('basicBridgeLan.subnetMask') }}</label>
                  <input
                    type="text"
                    :data-testid="qa('lan-cht-subnet-mask-input')"
                    v-model="formData.SubnetMask"
                    :placeholder="t('common.placeholder')"
                  >
                </div>
              </div>
            </div>

            <!-- IPv6 Section -->
            <div class="section-header">
              <h3 :data-testid="qa('lan-cht-ipv6-header')">{{ t('basicBridgeLan.ipv6Section') }}</h3>
            </div>

            <div class="form-group">
              <div class="switch-label">
                <span :data-testid="qa('lan-cht-ipv6-enable-label')">{{ t('basicBridgeLan.ipv6Enable') }}</span>
                <BaseSwitch
                  v-model="formData.IPv6Enable"
                  :data-testid="qa('lan-cht-ipv6-enable-toggle')"
                  :slider-data-testid="qa('lan-cht-ipv6-enable-slider')"
                />
              </div>
            </div>

            <div v-if="formData.IPv6Enable" class="nested-fields">
              <div class="form-group">
                <label :data-testid="qa('lan-cht-ipv6-protocol-label')">{{ t('basicBridgeLan.ipv6Protocol') }}</label>
                <select
                  v-model="formData.IPv6Protocol"
                  :data-testid="qa('lan-cht-ipv6-protocol-select')"
                  class="form-select"
                >
                  <option
                    v-for="protocol in lanChtData?.BasicBridgeLan.ListIPv6Protocol"
                    :key="protocol"
                    :value="protocol"
                    :data-testid="qa(`lan-cht-ipv6-protocol-option-${protocol.toLowerCase()}`)"
                  >
                    {{ protocol }}
                  </option>
                </select>
              </div>

              <div v-if="showIPv6StaticFields" class="static-fields">
                <div class="form-group">
                  <label :data-testid="qa('lan-cht-ipv6-address-label')">{{ t('basicBridgeLan.ipv6Address') }}</label>
                  <input
                    type="text"
                    :data-testid="qa('lan-cht-ipv6-address-input')"
                    v-model="formData.IPv6Address"
                    :placeholder="t('common.placeholder')"
                  >
                </div>

                <div class="form-group">
                  <label :data-testid="qa('lan-cht-ipv6-prefix-label')">{{ t('basicBridgeLan.ipv6Prefix') }}</label>
                  <input
                    type="text"
                    :data-testid="qa('lan-cht-ipv6-prefix-input')"
                    v-model="formData.IPv6Prefix"
                    :placeholder="t('common.placeholder')"
                  >
                </div>
              </div>
            </div>

            <div class="button-group">
              <ActionButtons
                :cancel-disabled="loading"
                :apply-disabled="loading"
                :cancel-data-testid="qa('lan-cht-cancel-button')"
                :apply-data-testid="qa('lan-cht-apply-button')"
                @cancel="handleCancel"
                @apply="handleSubmit"
              />
            </div>
          </div>
        </div>
      </template>

      <div v-if="showSuccess" class="success-message" :data-testid="qa('lan-cht-success-message')">
        {{ t('common.saveSuccess') }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
}

input,
.form-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}

.form-select {
  background-color: white;
  cursor: pointer;
}

.section-header {
  margin: 2rem 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--border-color);
}

.section-header:first-child {
  margin-top: 0;
}

.section-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-primary);
  font-weight: 600;
}

.nested-fields {
  padding-left: 1rem;
}

.static-fields {
  margin-top: 1rem;
}

:deep(.switch) {
  width: 60px;
  height: 34px;
  margin-left: 1rem;
  flex-shrink: 0;
}

:deep(.slider:before) {
  height: 26px;
  width: 26px;
}

:deep(input:checked + .slider:before) {
  transform: translateX(26px);
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
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

.error-state {
  padding: 2rem;
  text-align: center;
  color: #dc3545;
  background-color: white;
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
}

@media (max-width: 768px) {
  .button-group {
    flex-direction: column;
  }

  .button-group :deep(.btn) {
    width: 100%;
  }

  .nested-fields {
    margin-left: 1rem;
  }
}
</style>
