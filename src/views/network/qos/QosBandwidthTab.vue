<template>
  <div class="qos-bandwidth-tab">
    <BaseCard>
      <div class="form-section">
        <div class="form-row enable-row">
          <label class="form-label">{{ t('qos.enableQos') }}</label>
          <label class="switch">
            <input
              type="checkbox"
              v-model="formData.Enable"
            />
            <span class="slider"></span>
          </label>
        </div>

        <template v-if="formData.Enable">
          <div class="bandwidth-inputs">
            <div class="bandwidth-field">
              <label class="form-label">{{ t('qos.downloadBandwidth') }}</label>
              <div class="input-group">
                <BaseInput
                  v-model="formData.Bandwidth.Download"
                  type="number"
                  :min="1"
                />
                <span class="unit">Mb/s</span>
              </div>
            </div>

            <div class="bandwidth-field">
              <label class="form-label">{{ t('qos.uploadBandwidth') }}</label>
              <div class="input-group">
                <BaseInput
                  v-model="formData.Bandwidth.Upload"
                  type="number"
                  :min="1"
                />
                <span class="unit">Mb/s</span>
              </div>
            </div>
          </div>

          <div class="priority-table-container">
            <table class="priority-table">
              <thead>
                <tr>
                  <th>{{ t('qos.priority') }}</th>
                  <th>{{ t('qos.minimumReserve') }}</th>
                  <th>{{ t('qos.maximumAllowed') }}</th>
                  <th>{{ t('qos.actualSpeedRange') }}</th>
                  <th>{{ t('qos.whatThisDoes') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="priority-label">{{ t('qos.high') }}</td>
                  <td>
                    <div class="percent-input" :class="{ 'has-error': validationErrors.High?.min }">
                      <span>{{ t('qos.atLeast') }}</span>
                      <BaseInput
                        v-model.number="formData.Bandwidth.Priority.High.Min"
                        type="number"
                        :min="0"
                        :max="100"
                        class="small-input"
                        @blur="validateMinMax('High', 'Min')"
                        @input="validateMinMax('High', 'Min')"
                      />
                      <span>%</span>
                    </div>
                    <div v-if="validationErrors.High?.min" class="error-message">{{ validationErrors.High.min }}</div>
                  </td>
                  <td>
                    <div class="percent-input" :class="{ 'has-error': validationErrors.High?.max }">
                      <span>{{ t('qos.upTo') }}</span>
                      <BaseInput
                        v-model.number="formData.Bandwidth.Priority.High.Max"
                        type="number"
                        :min="0"
                        :max="100"
                        class="small-input"
                        @blur="validateMinMax('High', 'Max')"
                        @input="validateMinMax('High', 'Max')"
                      />
                      <span>%</span>
                    </div>
                    <div v-if="validationErrors.High?.max" class="error-message">{{ validationErrors.High.max }}</div>
                  </td>
                  <td>{{ calculateSpeed('High') }}</td>
                  <td>{{ t('qos.goesFirst') }}</td>
                </tr>
                <tr>
                  <td class="priority-label">{{ t('qos.medium') }}</td>
                  <td>
                    <div class="percent-input" :class="{ 'has-error': validationErrors.Medium?.min }">
                      <span>{{ t('qos.atLeast') }}</span>
                      <BaseInput
                        v-model.number="formData.Bandwidth.Priority.Medium.Min"
                        type="number"
                        :min="0"
                        :max="100"
                        class="small-input"
                        @blur="validateMinMax('Medium', 'Min')"
                        @input="validateMinMax('Medium', 'Min')"
                      />
                      <span>%</span>
                    </div>
                    <div v-if="validationErrors.Medium?.min" class="error-message">{{ validationErrors.Medium.min }}</div>
                  </td>
                  <td>
                    <div class="percent-input" :class="{ 'has-error': validationErrors.Medium?.max }">
                      <span>{{ t('qos.upTo') }}</span>
                      <BaseInput
                        v-model.number="formData.Bandwidth.Priority.Medium.Max"
                        type="number"
                        :min="0"
                        :max="100"
                        class="small-input"
                        @blur="validateMinMax('Medium', 'Max')"
                        @input="validateMinMax('Medium', 'Max')"
                      />
                      <span>%</span>
                    </div>
                    <div v-if="validationErrors.Medium?.max" class="error-message">{{ validationErrors.Medium.max }}</div>
                  </td>
                  <td>{{ calculateSpeed('Medium') }}</td>
                  <td>{{ t('qos.normalLane') }}</td>
                </tr>
                <tr>
                  <td class="priority-label">{{ t('qos.low') }}</td>
                  <td>
                    <div class="percent-input" :class="{ 'has-error': validationErrors.Low?.min }">
                      <span>{{ t('qos.atLeast') }}</span>
                      <BaseInput
                        v-model.number="formData.Bandwidth.Priority.Low.Min"
                        type="number"
                        :min="0"
                        :max="100"
                        class="small-input"
                        @blur="validateMinMax('Low', 'Min')"
                        @input="validateMinMax('Low', 'Min')"
                      />
                      <span>%</span>
                    </div>
                    <div v-if="validationErrors.Low?.min" class="error-message">{{ validationErrors.Low.min }}</div>
                  </td>
                  <td>
                    <div class="percent-input" :class="{ 'has-error': validationErrors.Low?.max }">
                      <span>{{ t('qos.upTo') }}</span>
                      <BaseInput
                        v-model.number="formData.Bandwidth.Priority.Low.Max"
                        type="number"
                        :min="0"
                        :max="100"
                        class="small-input"
                        @blur="validateMinMax('Low', 'Max')"
                        @input="validateMinMax('Low', 'Max')"
                      />
                      <span>%</span>
                    </div>
                    <div v-if="validationErrors.Low?.max" class="error-message">{{ validationErrors.Low.max }}</div>
                  </td>
                  <td>{{ calculateSpeed('Low') }}</td>
                  <td>{{ t('qos.yieldsWhenBusy') }}</td>
                </tr>
                <tr>
                  <td class="priority-label">{{ t('qos.lowLatency') }}</td>
                  <td>
                    <div class="percent-input" :class="{ 'has-error': validationErrors['Low-latency']?.min }">
                      <span>{{ t('qos.atLeast') }}</span>
                      <BaseInput
                        v-model.number="formData.Bandwidth.Priority['Low-latency'].Min"
                        type="number"
                        :min="0"
                        :max="100"
                        class="small-input"
                        @blur="validateMinMax('Low-latency', 'Min')"
                        @input="validateMinMax('Low-latency', 'Min')"
                      />
                      <span>%</span>
                    </div>
                    <div v-if="validationErrors['Low-latency']?.min" class="error-message">{{ validationErrors['Low-latency'].min }}</div>
                  </td>
                  <td>
                    <div class="percent-input" :class="{ 'has-error': validationErrors['Low-latency']?.max }">
                      <span>{{ t('qos.upTo') }}</span>
                      <BaseInput
                        v-model.number="formData.Bandwidth.Priority['Low-latency'].Max"
                        type="number"
                        :min="0"
                        :max="100"
                        class="small-input"
                        @blur="validateMinMax('Low-latency', 'Max')"
                        @input="validateMinMax('Low-latency', 'Max')"
                      />
                      <span>%</span>
                    </div>
                    <div v-if="validationErrors['Low-latency']?.max" class="error-message">{{ validationErrors['Low-latency'].max }}</div>
                  </td>
                  <td>{{ calculateSpeed('Low-latency') }}</td>
                  <td>{{ t('qos.lowDelayFirst') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <div class="button-group">
          <BaseButton @click="handleCancel" variant="secondary">
            {{ t('common.cancel') }}
          </BaseButton>
          <BaseButton @click="handleSave" variant="primary">
            {{ t('common.apply') }}
          </BaseButton>
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseCard from '../../../components/common/BaseCard.vue';
import BaseInput from '../../../components/common/BaseInput.vue';
import BaseButton from '../../../components/common/BaseButton.vue';
import { qosApi } from '../../../services/api/qos';
import type { QosBandwidthConfig } from '../../../types/qos';

const { t } = useI18n();

const formData = ref<QosBandwidthConfig>({
  Enable: false,
  Bandwidth: {
    Download: 1000,
    Upload: 1000,
    Priority: {
      High: { Min: 20, Max: 60 },
      Medium: { Min: 60, Max: 100 },
      Low: { Min: 5, Max: 40 },
      'Low-latency': { Min: 15, Max: 100 }
    }
  }
});

const originalData = ref<QosBandwidthConfig | null>(null);
const loading = ref(false);

type PriorityKey = 'High' | 'Medium' | 'Low' | 'Low-latency';
type ValidationErrors = {
  [K in PriorityKey]?: {
    min?: string;
    max?: string;
  };
};

const validationErrors = ref<ValidationErrors>({});

const calculateSpeed = (priority: keyof typeof formData.value.Bandwidth.Priority) => {
  const upload = formData.value.Bandwidth.Upload;
  const config = formData.value.Bandwidth.Priority[priority];
  const min = Math.round(upload * config.Min / 100);
  const max = Math.round(upload * config.Max / 100);
  return `${min}-${max} Mbps`;
};

const validateMinMax = (priorityKey: PriorityKey, field: 'Min' | 'Max') => {
  const priority = formData.value.Bandwidth.Priority[priorityKey];
  const priorityName = priorityKey === 'High' ? t('qos.high') :
                       priorityKey === 'Medium' ? t('qos.medium') :
                       priorityKey === 'Low' ? t('qos.low') :
                       t('qos.lowLatency');

  if (!validationErrors.value[priorityKey]) {
    validationErrors.value[priorityKey] = {};
  }

  if (field === 'Min') {
    if (priority.Min > 100) {
      priority.Min = 100;
      validationErrors.value[priorityKey]!.min = t('qos.validation2');
    } else if (priority.Min > priority.Max) {
      priority.Min = priority.Max;
      validationErrors.value[priorityKey]!.min = `${t('qos.minimumReserve')} <= ${t('qos.maximumAllowed')}`;
    } else {
      validationErrors.value[priorityKey]!.min = undefined;
    }
  } else {
    if (priority.Max > 100) {
      priority.Max = 100;
      validationErrors.value[priorityKey]!.max = 'Cannot exceed 100%';
    } else if (priority.Min > priority.Max) {
      validationErrors.value[priorityKey]!.max = `${t('qos.minimumReserve')} <= ${t('qos.maximumAllowed')}`;
    } else {
      validationErrors.value[priorityKey]!.max = undefined;
    }
  }

  if (!validationErrors.value[priorityKey]!.min && !validationErrors.value[priorityKey]!.max) {
    delete validationErrors.value[priorityKey];
  }
};

const validateForm = (): boolean => {
  if (!formData.value.Enable) {
    return true;
  }

  validationErrors.value = {};
  let hasError = false;

  const priorityKeys: PriorityKey[] = ['High', 'Medium', 'Low', 'Low-latency'];

  for (const key of priorityKeys) {
    const priority = formData.value.Bandwidth.Priority[key];

    if (priority.Min > 100) {
      if (!validationErrors.value[key]) validationErrors.value[key] = {};
      validationErrors.value[key]!.min = t('qos.validation2');
      hasError = true;
    }

    if (priority.Max > 100) {
      if (!validationErrors.value[key]) validationErrors.value[key] = {};
      validationErrors.value[key]!.max = 'Cannot exceed 100%';
      hasError = true;
    }

    if (priority.Min > priority.Max) {
      if (!validationErrors.value[key]) validationErrors.value[key] = {};
      validationErrors.value[key]!.min = `${t('qos.minimumReserve')} <= ${t('qos.maximumAllowed')}`;
      hasError = true;
    }
  }

  if (hasError) {
    alert(t('qos.validation1'));
    return false;
  }

  return true;
};

const handleSave = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    loading.value = true;
    await qosApi.updateBandwidth({ QosBandwidth: formData.value });
    originalData.value = JSON.parse(JSON.stringify(formData.value));
    alert(t('common.saveSuccess'));
  } catch (error) {
    console.error('Failed to save QoS bandwidth:', error);
    alert(t('common.saveFailed'));
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  if (originalData.value) {
    formData.value = JSON.parse(JSON.stringify(originalData.value));
  }
};

const loadData = async () => {
  try {
    loading.value = true;
    const response = await qosApi.getBandwidth();
    formData.value = response.QosBandwidth;
    originalData.value = JSON.parse(JSON.stringify(response.QosBandwidth));
  } catch (error) {
    console.error('Failed to load QoS bandwidth:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.qos-bandwidth-tab {
  padding: 20px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.enable-row {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.form-label {
  font-weight: 500;
  color: var(--text-primary, #1f2937);
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
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
  transition: 0.4s;
  border-radius: 26px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:checked + .slider:before {
  transform: translateX(24px);
}

.bandwidth-inputs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.bandwidth-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.unit {
  font-weight: 500;
  color: var(--text-secondary, #6b7280);
  white-space: nowrap;
}

.priority-table-container {
  width: 100%;
  overflow-x: auto;
}

.priority-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.priority-table th,
.priority-table td {
  padding: 12px;
  text-align: left;
  border: 1px solid var(--border-color, #e5e7eb);
}

.priority-table th {
  background-color: var(--background-secondary, #f9fafb);
  font-weight: 600;
  color: var(--text-primary, #1f2937);
}

.priority-label {
  font-weight: 500;
}

.percent-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.small-input {
  width: 80px;
}

.percent-input.has-error {
  border: 1px solid var(--color-error, #ef4444);
  padding: 4px;
  border-radius: 4px;
  background-color: #fee;
}

.error-message {
  color: var(--color-error, #ef4444);
  font-size: 12px;
  margin-top: 4px;
  min-height: 16px;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .bandwidth-inputs {
    grid-template-columns: 1fr;
  }

  .priority-table {
    font-size: 14px;
  }

  .priority-table th,
  .priority-table td {
    padding: 8px;
  }
}
</style>
