<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { StaticRouteIPv4, StaticRouteIPv6 } from '../../types/staticRoute';
import { ActionButtons, BaseSwitch } from '../common';
import { useQA } from '../../utils/qa';

interface Props {
  editingItem?: { type: 'IPv4' | 'IPv6'; index: number; data: StaticRouteIPv4 | StaticRouteIPv6 } | null;
  wanIfList: string[];
  ipv4Routes: StaticRouteIPv4[];
  ipv6Routes: StaticRouteIPv6[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  save: [data: StaticRouteIPv4 | StaticRouteIPv6, ipType: 'IPv4' | 'IPv6'];
  close: [];
}>();

const { qa } = useQA();
const { t } = useI18n();

const formData = ref<{
  Enable: boolean;
  Alias: string;
  IpType: 'IPv4' | 'IPv6';
  DestIp: string;
  DestMask: string;
  PrefixLen: number | null;
  GatewayIp: string;
  UsedGWIp: boolean;
  WanIf: string;
}>({
  Enable: true,
  Alias: '',
  IpType: 'IPv4',
  DestIp: '',
  DestMask: '',
  PrefixLen: null,
  GatewayIp: '',
  UsedGWIp: true,
  WanIf: props.wanIfList.length > 0 ? props.wanIfList[0] : ''
});

const formErrors = ref({
  Alias: '',
  DestIp: '',
  DestMask: '',
  GatewayIp: ''
});

const isEditMode = computed(() => props.editingItem !== null);
const modalTitle = computed(() =>
  isEditMode.value ? t('routing.editStaticRoute') : t('routing.addStaticRoute')
);

if (props.editingItem) {
  const data = props.editingItem.data;
  formData.value = {
    Enable: data.Enable,
    Alias: data.Alias,
    IpType: props.editingItem.type,
    DestIp: data.DestIp,
    DestMask: props.editingItem.type === 'IPv4' ? (data as StaticRouteIPv4).DestMask : '',
    PrefixLen: props.editingItem.type === 'IPv6' ? (data as StaticRouteIPv6).PrefixLen : null,
    GatewayIp: data.GatewayIp,
    UsedGWIp: data.UsedGWIp,
    WanIf: data.WanIf
  };
}

watch(() => formData.value.UsedGWIp, (newVal) => {
  if (!newVal) {
    formData.value.GatewayIp = '';
  }
});

const validateIPv4 = (ip: string): boolean => {
  const ipv4Regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Regex.test(ip);
};

const validateIPv6 = (ip: string): boolean => {
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
  return ipv6Regex.test(ip);
};

const validateForm = (): boolean => {
  formErrors.value = {
    Alias: '',
    DestIp: '',
    DestMask: '',
    GatewayIp: ''
  };

  let isValid = true;

  if (!formData.value.Alias.trim()) {
    formErrors.value.Alias = t('routing.routeNameRequired');
    isValid = false;
  } else {
    const alias = formData.value.Alias.trim();
    const allRoutes = [...props.ipv4Routes, ...props.ipv6Routes];

    const isDuplicate = allRoutes.some((route, index) => {
      if (props.editingItem) {
        const editingIndex = props.editingItem.index;
        const editingType = props.editingItem.type;
        const currentIndex = index < props.ipv4Routes.length ? index : index - props.ipv4Routes.length;
        const currentType = index < props.ipv4Routes.length ? 'IPv4' : 'IPv6';

        if (editingType === currentType && editingIndex === currentIndex) {
          return false;
        }
      }

      return route.Alias === alias;
    });

    if (isDuplicate) {
      formErrors.value.Alias = t('routing.duplicateAlias');
      isValid = false;
    }
  }

  if (!formData.value.DestIp.trim()) {
    formErrors.value.DestIp = t('routing.destinationIpRequired');
    isValid = false;
  } else {
    if (formData.value.IpType === 'IPv4') {
      if (!validateIPv4(formData.value.DestIp)) {
        formErrors.value.DestIp = t('routing.invalidIPv4');
        isValid = false;
      }
    } else {
      if (!validateIPv6(formData.value.DestIp)) {
        formErrors.value.DestIp = t('routing.invalidIPv6');
        isValid = false;
      }
    }
  }

  if (formData.value.IpType === 'IPv4') {
    if (!formData.value.DestMask.trim()) {
      formErrors.value.DestMask = t('routing.subnetMaskRequired');
      isValid = false;
    } else if (!validateIPv4(formData.value.DestMask)) {
      formErrors.value.DestMask = t('routing.invalidSubnetMask');
      isValid = false;
    }
  } else {
    if (formData.value.PrefixLen === null || formData.value.PrefixLen === undefined) {
      formErrors.value.DestMask = t('routing.prefixLengthRequired');
      isValid = false;
    } else if (formData.value.PrefixLen < 0 || formData.value.PrefixLen > 128) {
      formErrors.value.DestMask = t('routing.invalidPrefixLength');
      isValid = false;
    }
  }

  if (formData.value.UsedGWIp && formData.value.GatewayIp.trim()) {
    if (formData.value.IpType === 'IPv4') {
      if (!validateIPv4(formData.value.GatewayIp)) {
        formErrors.value.GatewayIp = t('routing.invalidGatewayIPv4');
        isValid = false;
      }
    } else {
      if (!validateIPv6(formData.value.GatewayIp)) {
        formErrors.value.GatewayIp = t('routing.invalidGatewayIPv6');
        isValid = false;
      }
    }
  }

  return isValid;
};

const handleSave = () => {
  if (!validateForm()) {
    return;
  }

  let data: StaticRouteIPv4 | StaticRouteIPv6;

  if (formData.value.IpType === 'IPv4') {
    data = {
      Enable: formData.value.Enable,
      Alias: formData.value.Alias,
      DestIp: formData.value.DestIp,
      DestMask: formData.value.DestMask,
      GatewayIp: formData.value.GatewayIp,
      UsedGWIp: formData.value.UsedGWIp,
      WanIf: formData.value.WanIf
    } as StaticRouteIPv4;
  } else {
    data = {
      Enable: formData.value.Enable,
      Alias: formData.value.Alias,
      DestIp: formData.value.DestIp,
      PrefixLen: formData.value.PrefixLen!,
      GatewayIp: formData.value.GatewayIp,
      UsedGWIp: formData.value.UsedGWIp,
      WanIf: formData.value.WanIf
    } as StaticRouteIPv6;
  }

  emit('save', data, formData.value.IpType);
};

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <div class="modal-overlay" @click.self="handleClose">
    <div class="modal-content" :data-testid="qa('static-route-form-modal')">
      <div class="modal-header">
        <button class="back-btn" @click="handleClose" :data-testid="qa('static-route-form-back')">
          <span class="material-icons">arrow_back</span>
        </button>
        <h2>{{ modalTitle }}</h2>
        <button class="close-btn" @click="handleClose" :data-testid="qa('static-route-form-close')">
          <span class="material-icons">close</span>
        </button>
      </div>

      <div class="modal-body">
        <div class="form-section">
          <div class="form-group">
            <label class="toggle-label">
              {{ t('routing.enable') }}
              <BaseSwitch
                v-model="formData.Enable"
                :data-testid="qa('static-route-form-enable')"
                :slider-data-testid="qa('static-route-form-enable-slider')"
              />
            </label>
          </div>

          <div class="form-group">
            <label>
              {{ t('routing.routeName') }}
              <span class="required">*</span>
            </label>
            <input
              type="text"
              v-model="formData.Alias"
              :placeholder="t('routing.routeNamePlaceholder')"
              :class="{ error: formErrors.Alias }"
              :data-testid="qa('static-route-form-alias')"
            />
            <span v-if="formErrors.Alias" class="error-message">{{ formErrors.Alias }}</span>
          </div>

          <div class="form-group">
            <label>
              {{ t('routing.ipType') }}
            </label>
            <select
              v-model="formData.IpType"
              :disabled="isEditMode"
              :data-testid="qa('static-route-form-ip-type')"
            >
              <option value="IPv4">IPv4</option>
              <option value="IPv6">IPv6</option>
            </select>
          </div>

          <div class="form-group">
            <label>
              {{ t('routing.destinationIpAddress') }}
              <span class="required">*</span>
            </label>
            <input
              type="text"
              v-model="formData.DestIp"
              :placeholder="formData.IpType === 'IPv4' ? '192.168.0.0' : '2001:db8::'"
              :class="{ error: formErrors.DestIp }"
              :data-testid="qa('static-route-form-dest-ip')"
            />
            <span v-if="formErrors.DestIp" class="error-message">{{ formErrors.DestIp }}</span>
          </div>

          <div class="form-group" v-if="formData.IpType === 'IPv4'">
            <label>
              {{ t('routing.subnetMask') }}
              <span class="required">*</span>
            </label>
            <input
              type="text"
              v-model="formData.DestMask"
              placeholder="255.255.255.0"
              :class="{ error: formErrors.DestMask }"
              :data-testid="qa('static-route-form-dest-mask')"
            />
            <span v-if="formErrors.DestMask" class="error-message">{{ formErrors.DestMask }}</span>
          </div>

          <div class="form-group" v-else>
            <label>
              {{ t('routing.prefixLength') }}
              <span class="required">*</span>
            </label>
            <input
              type="number"
              v-model.number="formData.PrefixLen"
              placeholder="64"
              min="0"
              max="128"
              :class="{ error: formErrors.DestMask }"
              :data-testid="qa('static-route-form-prefix-len')"
            />
            <span v-if="formErrors.DestMask" class="error-message">{{ formErrors.DestMask }}</span>
          </div>

          <div class="form-group">
            <label class="toggle-label">
              {{ t('routing.useGatewayIpAddress') }}
              <BaseSwitch
                v-model="formData.UsedGWIp"
                :data-testid="qa('static-route-form-use-gw-ip')"
                :slider-data-testid="qa('static-route-form-use-gw-ip-slider')"
              />
            </label>
          </div>

          <div class="form-group" v-if="formData.UsedGWIp">
            <label>
              {{ t('routing.gatewayIpAddress') }}
            </label>
            <input
              type="text"
              v-model="formData.GatewayIp"
              :placeholder="formData.IpType === 'IPv4' ? '192.168.0.1' : 'fe80::1'"
              :class="{ error: formErrors.GatewayIp }"
              :data-testid="qa('static-route-form-gateway-ip')"
            />
            <span v-if="formErrors.GatewayIp" class="error-message">{{ formErrors.GatewayIp }}</span>
          </div>

          <div class="form-group">
            <label>
              {{ t('routing.useInterface') }}
            </label>
            <select
              v-model="formData.WanIf"
              :data-testid="qa('static-route-form-wan-if')"
            >
              <option v-for="iface in wanIfList" :key="iface" :value="iface">
                {{ iface }}
              </option>
            </select>
          </div>

          <div class="note-section">
            <strong>{{ t('routing.note') }}</strong>
            <p>{{ t('routing.gatewayIpNote') }}</p>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <ActionButtons
          :apply-text="t('common.confirm')"
          :cancel-data-testid="qa('static-route-form-cancel')"
          :apply-data-testid="qa('static-route-form-save')"
          @cancel="handleClose"
          @apply="handleSave"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-secondary);
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  position: relative;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-primary);
  flex: 1;
  text-align: center;
}

.back-btn,
.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0.25rem;
  display: flex;
  align-items: center;
}

.back-btn {
  position: absolute;
  left: 1.5rem;
}

.close-btn {
  position: absolute;
  right: 1.5rem;
}

.back-btn:hover,
.close-btn:hover {
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.95rem;
}

.toggle-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row !important;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}


.required {
  color: #dc3545;
}

.form-group input[type='text'],
.form-group input[type='number'],
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.95rem;
}

.form-group input.error,
.form-group select.error {
  border-color: #dc3545;
}

.form-group input:disabled,
.form-group select:disabled {
  background-color: var(--bg-primary);
  cursor: not-allowed;
  opacity: 0.6;
}

.error-message {
  color: #dc3545;
  font-size: 0.85rem;
}

.note-section {
  background-color: var(--bg-info);
  border-left: 4px solid var(--info-color);
  padding: 1rem;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.note-section strong {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.note-section p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-height: 95vh;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-footer :deep(.btn) {
    width: 100%;
  }
}
</style>
