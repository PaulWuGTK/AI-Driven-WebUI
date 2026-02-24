<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DmzResponse } from '../../../types/dmz';
import { getDmz, updateDmz } from '../../../services/api/dmz';
import { BaseSwitch } from '../../../components/common';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const dmzData = ref<DmzResponse | null>(null);
const loading = ref(false);
const showSuccess = ref(false);
const error = ref<string | null>(null);

const fetchDmz = async () => {
  loading.value = true;
  error.value = null;
  try {
    dmzData.value = await getDmz();
  } catch (err) {
    console.error('Error fetching DMZ settings:', err);
    error.value = 'Failed to fetch DMZ settings';
  } finally {
    loading.value = false;
  }
};

const isValidIPv4 = (ip: string): boolean => {
  if (ip === "0.0.0.0") return true;

  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Regex.test(ip)) return false;

  const parts = ip.split('.');
  return parts.every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
};

const showSuccessMessage = () => {
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
  }, 3000);
};

const handleSubmit = async () => {
  if (!dmzData.value) return;

  error.value = null;

  if (dmzData.value.AdvancedDmz.Enable && !isValidIPv4(dmzData.value.AdvancedDmz.IPAddress)) {
    error.value = 'Invalid IP address format';
    return;
  }

  loading.value = true;
  try {
    await updateDmz({
      AdvancedDmz: {
        Enable: dmzData.value.AdvancedDmz.Enable,
        IPAddress: dmzData.value.AdvancedDmz.Enable ? dmzData.value.AdvancedDmz.IPAddress : "0.0.0.0"
      }
    });
    showSuccessMessage();
    await fetchDmz();
  } catch (err) {
    console.error('Error updating DMZ settings:', err);
    error.value = 'Failed to update DMZ settings';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchDmz);
</script>

<template>
  <div class="status-content" :data-testid="qa('dmz-tab-content')">
    <div v-if="loading && !dmzData" class="loading-state" :data-testid="qa('dmz-loading')">
      <div class="loading-spinner"></div>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="error" class="error-state" :data-testid="qa('dmz-error')">
      {{ error }}
    </div>

    <div v-else-if="dmzData" class="panel-section" :data-testid="qa('dmz-panel')">
      <div class="card-content">
        <div class="form-group">
          <div class="switch-label">
            <span :data-testid="qa('dmz-enable-label')">{{ t('dmz.enable') }}</span>
            <BaseSwitch
              v-model="dmzData.AdvancedDmz.Enable"
              :data-testid="qa('dmz-enable-checkbox')"
              :slider-data-testid="qa('dmz-enable-slider')"
            />
          </div>
        </div>

        <div v-if="dmzData.AdvancedDmz.Enable" class="form-group">
          <label :data-testid="qa('dmz-ip-label')">
            {{ t('dmz.ipAddress') }}
          </label>
          <input
            type="text"
            v-model="dmzData.AdvancedDmz.IPAddress"
            placeholder="192.168.101.168"
            :data-testid="qa('dmz-ip-input')"
          >
        </div>

        <div class="button-group">
          <button
            type="button"
            class="btn btn-secondary"
            @click="fetchDmz"
            :disabled="loading"
            :data-testid="qa('dmz-cancel-button')"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="handleSubmit"
            :disabled="loading"
            :data-testid="qa('dmz-apply-button')"
          >
            {{ t('common.apply') }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showSuccess" class="success-message" :data-testid="qa('dmz-success-message')">
      {{ t('common.apply') }} successful
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
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}

/* Custom switch size (60px × 34px) for larger prominence */
:deep(.switch) {
  width: 60px;
  height: 34px;
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
  margin-top: 1rem;
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

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  padding: 2rem;
  text-align: center;
  color: #dc3545;
  background-color: white;
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
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

@media (max-width: 768px) {
  .button-group {
    flex-direction: column;
  }

  .button-group .btn {
    width: 100%;
  }
}
</style>
