<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import BlockingOverlay from '../../../components/BlockingOverlay.vue';
import BaseButton from '../../../components/common/BaseButton.vue';
import BaseCard from '../../../components/common/BaseCard.vue';

import BaseInput from '../../../components/common/BaseInput.vue';
import BaseSelect from '../../../components/common/BaseSelect.vue';
import { BaseSecretInput, BaseSwitch } from '../../../components/common';
import { useQA } from '../../../utils/qa';
import { getWlanBasicMulti, updateWlanBasicMulti, getWlanMesh } from '../../../services/api/wireless';
import { validateSsid, getByteLength, normalizeSsid, truncateToByteLength, SSID_MAX_BYTES } from '../../../utils/ssidValidation';
import type {
  WlanBasicMultiGetResponse,
  WlanBasicMultiPostRequest,
  WlanGroup,
  WlanGroupInterface
} from '../../../types/wlanBasicMulti';

const { t } = useI18n();
const router = useRouter();
const { qa, slug } = useQA();

const loading = ref(false);
const showSuccess = ref(false);
const showBlockingOverlay = ref(false);
const meshEnabled = ref(false);

const data = ref<WlanBasicMultiGetResponse | null>(null);

/**
 * Snapshot of the last successful GET response.
 * Used by non-edit-mode "Cancel" to restore UI to the backend state.
 */
const lastGetSnapshot = ref<WlanBasicMultiGetResponse | null>(null);

const editIndex = ref<number | null>(null);
const draft = ref<WlanGroup | null>(null);
const ssidErrors = reactive<Record<string, string>>({});
const passwordErrors = reactive<Record<string, string>>({});
const ssidByteLengths = reactive<Record<string, number>>({});

// Separate storage for Common SSID configuration
// This prevents Common SSID settings from overwriting per-band settings
const commonSsidConfig = ref<{
  Enable: number;
  SSID: string;
  SecurityMode: string;
  KeyPassPhrase: string;
  SecurityModeAvailable: string;
  SSIDAdvertisementEnabled: number;
  IsolationEnable: number;
} | null>(null);

const bands = ['2.4GHz', '5GHz', '6GHz'] as const;

const normalizeGroup = (group: WlanGroup): WlanGroup => {
  const copy: WlanGroup = JSON.parse(JSON.stringify(group));
  if (copy.IsolationEnable === undefined) {
    copy.IsolationEnable = 0;
  }

  // Ensure Interface array has per-band entries
  if (!copy.Interface) copy.Interface = [];
  copy.Interface = copy.Interface.map((i) => ({
    ...i,
    SSIDAdvertisementEnabled: i.SSIDAdvertisementEnabled ?? 1,
    IsolationEnable: i.IsolationEnable ?? 0
  }));
  for (const b of bands) {
    if (!copy.Interface.some((i) => i.Band === b)) {
      const groupSSID = (copy as any).SSID || copy.Alias || '';
      const groupSecurityMode = (copy as any).SecurityMode || '';
      const groupKeyPassphrase = (copy as any).KeyPassPhrase || '';
      const groupSecurityModeAvailable = (copy as any).SecurityModeAvailable || '';

      copy.Interface.push({
        Band: b,
        Enable: 1,
        SSID: groupSSID,
        SecurityMode: groupSecurityMode,
        SecurityModeAvailable: groupSecurityModeAvailable,
        KeyPassPhrase: groupKeyPassphrase,
        MFPConfig: '',
        SSIDAdvertisementEnabled: 1,
        IsolationEnable: 0
      });
    }
  }

  // Sort Interface array to match bands order (2.4GHz, 5GHz, 6GHz)
  copy.Interface.sort((a, b) => {
    const indexA = bands.indexOf(a.Band as typeof bands[number]);
    const indexB = bands.indexOf(b.Band as typeof bands[number]);
    return indexA - indexB;
  });

  return copy;
};

const fetchConfig = async () => {
  loading.value = true;
  try {
    const resp = await getWlanBasicMulti();
    // Defensive: if backend still returns legacy schema, try to map into WlanGroup list
    if ((resp as any)?.WlanBasic?.WlanGroup) {
      data.value = resp;
    } else {
      // legacy -> wrap single "Home" group from previous schema
      const legacy = resp as any;
      const modes2g = legacy?.WlanBasic?.wifi2g?.SecurityModeAvailable ?? '';
      const modes5g = legacy?.WlanBasic?.wifi5g?.SecurityModeAvailable ?? '';
      const modes6g = legacy?.WlanBasic?.wifi6g?.SecurityModeAvailable ?? '';
      data.value = {
        WlanBasic: {
          WlanGroup: [
            {
              Alias: t('wireless.groupDefaultName'),
              CommonSSIDEnable: legacy?.WlanBasic?.CommonSSIDEnable ?? 0,
              MLOEnable: legacy?.WlanBasic?.MLOEnable ?? 0,
              Interface: [
                {
                  Band: '2.4GHz',
                  Enable: legacy?.WlanBasic?.wifi2g?.Enable ?? 1,
                  SSID: legacy?.WlanBasic?.wifi2g?.SSID ?? '',
                  SecurityMode: legacy?.WlanBasic?.wifi2g?.SecurityMode ?? '',
                  SecurityModeAvailable: modes2g,
                  KeyPassPhrase: legacy?.WlanBasic?.wifi2g?.Password ?? '',
                  MFPConfig: '',
                  IsolationEnable: 0
                },
                {
                  Band: '5GHz',
                  Enable: legacy?.WlanBasic?.wifi5g?.Enable ?? 1,
                  SSID: legacy?.WlanBasic?.wifi5g?.SSID ?? '',
                  SecurityMode: legacy?.WlanBasic?.wifi5g?.SecurityMode ?? '',
                  SecurityModeAvailable: modes5g,
                  KeyPassPhrase: legacy?.WlanBasic?.wifi5g?.Password ?? '',
                  MFPConfig: '',
                  IsolationEnable: 0
                },
                {
                  Band: '6GHz',
                  Enable: legacy?.WlanBasic?.wifi6g?.Enable ?? 1,
                  SSID: legacy?.WlanBasic?.wifi6g?.SSID ?? '',
                  SecurityMode: legacy?.WlanBasic?.wifi6g?.SecurityMode ?? '',
                  SecurityModeAvailable: modes6g,
                  KeyPassPhrase: legacy?.WlanBasic?.wifi6g?.Password ?? '',
                  MFPConfig: '',
                  IsolationEnable: 0
                }
              ]
            }
          ]
        }
      };
    }

    // Capture last successful GET snapshot for non-edit "Cancel"
    lastGetSnapshot.value = JSON.parse(JSON.stringify(data.value));
  } catch (e) {
    console.error('Error fetching WLAN Basic (multi) config:', e);
  } finally {
    loading.value = false;
  }
};

const fetchMeshStatus = async () => {
  try {
    const resp = await getWlanMesh();
    meshEnabled.value = Number(resp?.WlanMesh?.MeshEnable) === 1;
  } catch {
    meshEnabled.value = false;
  }
};

const groups = computed(() => {
  const wlanGroups = data.value?.WlanBasic?.WlanGroup ?? [];
  return wlanGroups.slice().sort((a, b) => {
    const indexA = a.Index ?? 0;
    const indexB = b.Index ?? 0;
    return indexA - indexB;
  });
});

// PUBLIC_INTERFACE
const enterEdit = (index: number) => {
  /** Enter edit mode for a given SSID group index. */
  editIndex.value = index;
  draft.value = normalizeGroup(JSON.parse(JSON.stringify(groups.value[index])));

  // When Mesh is enabled, enforce Common SSID on
  if (meshEnabled.value && draft.value) {
    draft.value.CommonSSIDEnable = 1;
  }

  // Initialize commonSsidConfig from group-level data (not from Interface array)
  const group = draft.value;
  if (group) {
    // Common SSID uses WlanGroup-level fields, not Interface-level fields
    // Use first interface's SecurityModeAvailable as fallback if not present at group level
    const firstInterface = group.Interface?.[0];
    commonSsidConfig.value = {
      Enable: (group as any).Enable ?? 1,
      SSID: (group as any).SSID ?? '',
      SecurityMode: (group as any).SecurityMode ?? '',
      KeyPassPhrase: (group as any).KeyPassPhrase ?? '',
      SecurityModeAvailable: (group as any).SecurityModeAvailable ?? firstInterface?.SecurityModeAvailable ?? '',
      SSIDAdvertisementEnabled: (group as any).SSIDAdvertisementEnabled ?? 1,
      IsolationEnable: (group as any).IsolationEnable ?? 0
    };
  }

  // Clear SSID errors and initialize byte lengths
  Object.keys(ssidErrors).forEach(key => delete ssidErrors[key]);
  Object.keys(passwordErrors).forEach(key => delete passwordErrors[key]);
  Object.keys(ssidByteLengths).forEach(key => delete ssidByteLengths[key]);

  // Initialize SSID validation for common SSID
  if (commonSsidConfig.value) {
    validateSsidField(commonSsidConfig.value.SSID, 'CommonSSID');
    validatePasswordField(
      commonSsidConfig.value.KeyPassPhrase || '',
      'CommonSSID',
      commonSsidConfig.value.SecurityMode
    );
  }

  // Initialize SSID validation for per-band interfaces
  if (draft.value?.Interface) {
    draft.value.Interface.forEach((iface) => {
      validateSsidField(iface.SSID || '', iface.Band);
      validatePasswordField((iface.KeyPassPhrase ?? '').toString(), iface.Band, iface.SecurityMode);
    });
  }
};

// PUBLIC_INTERFACE
const cancelEdit = () => {
  /** Exit edit mode and discard draft changes. */
  editIndex.value = null;
  draft.value = null;
  commonSsidConfig.value = null;
};

// PUBLIC_INTERFACE
const updateLocal = () => {
  /**
   * Apply draft changes back to the table/grid view (local state only),
   * without issuing a POST; then exit edit mode.
   */
  if (!data.value || editIndex.value === null || !draft.value) return;
  if (!validateDraftPasswords()) return;
  if (Object.keys(ssidErrors).length > 0) return;

  // Get the edited group from the sorted array
  const editedGroup = groups.value[editIndex.value];
  if (!editedGroup) return;

  // Find the index in the original unsorted array by matching the Index field
  const originalIdx = data.value.WlanBasic.WlanGroup.findIndex(
    (g) => (g as any).Index === (editedGroup as any).Index
  );

  if (originalIdx === -1) return;

  // Normalize to ensure band/interface entries exist
  const normalized = normalizeGroup(JSON.parse(JSON.stringify(draft.value)));

  // If Common SSID is enabled, synchronize commonSsidConfig data to group-level fields and all interfaces
  if (commonSsidConfig.value) {
    // Update group-level fields
    (normalized as any).SSID = commonSsidConfig.value.SSID;
    (normalized as any).SecurityMode = commonSsidConfig.value.SecurityMode;
    (normalized as any).KeyPassPhrase = commonSsidConfig.value.KeyPassPhrase;
    (normalized as any).Enable = commonSsidConfig.value.Enable;
    (normalized as any).SSIDAdvertisementEnabled = commonSsidConfig.value.SSIDAdvertisementEnabled;
    (normalized as any).IsolationEnable = commonSsidConfig.value.IsolationEnable;
  }

  data.value.WlanBasic.WlanGroup[originalIdx] = normalized;
  cancelEdit();
};

// PUBLIC_INTERFACE
const restoreFromGet = () => {
  /**
   * Non-edit-mode "Cancel": restore local UI state to the last successful GET response.
   * Does not call backend.
   */
  if (!lastGetSnapshot.value) return;
  data.value = JSON.parse(JSON.stringify(lastGetSnapshot.value));
};

const securityModeOptionsForInterface = (itf: WlanGroupInterface): string[] => {
  const csv = (itf.SecurityModeAvailable ?? '').trim();
  if (!csv) return [];
  return csv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

const securityModeOptionsForCommonSsid = computed((): string[] => {
  if (!commonSsidConfig.value) return [];
  const csv = (commonSsidConfig.value.SecurityModeAvailable ?? '').trim();
  if (!csv) return [];
  return csv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
});

const getInterfaceByBand = (band: string): WlanGroupInterface | undefined => {
  return draft.value?.Interface?.find((x) => x.Band === band);
};

const validateSsidField = (ssid: string, key: string) => {
  const validation = validateSsid(ssid, t);
  ssidByteLengths[key] = validation.byteLength;

  if (!validation.isValid) {
    ssidErrors[key] = validation.errorMessage || '';
  } else {
    delete ssidErrors[key];
  }

  return validation.isValid;
};

const handleSsidInput = (value: string, key: string, callback: (val: string) => void) => {
  const normalizedValue = normalizeSsid(value);
  const byteLength = getByteLength(normalizedValue);

  if (byteLength <= SSID_MAX_BYTES) {
    callback(normalizedValue);
    validateSsidField(normalizedValue, key);
  } else {
    // Truncate to max bytes and update model
    const truncated = truncateToByteLength(normalizedValue, SSID_MAX_BYTES);
    callback(truncated);
    validateSsidField(truncated, key);
  }
};

const requiresPskValidation = (securityMode: string | undefined): boolean => {
  const mode = String(securityMode ?? '').toUpperCase();
  // Buffalo-like behavior: validate passphrase for PSK/Personal modes only.
  return mode.includes('PSK') || mode.includes('PERSONAL');
};

const shouldShowPasswordField = (securityMode: string | undefined): boolean => {
  return requiresPskValidation(securityMode);
};

const isHex64 = (value: string): boolean => /^[0-9a-fA-F]{64}$/.test(value);
const isPrintableAscii = (value: string): boolean => /^[\x20-\x7E]*$/.test(value);

const validatePasswordField = (password: string, key: string, securityMode?: string) => {
  // No passphrase rule for non-PSK modes.
  if (!requiresPskValidation(securityMode)) {
    delete passwordErrors[key];
    return true;
  }

  const value = String(password ?? '');

  // Reject passwords that start with a space
  if (value.length > 0 && value.charAt(0) === ' ') {
    passwordErrors[key] = t('wireless.passwordLeadingSpace');
    return false;
  }

  // WPA3-Personal follows the same validation as WPA2-Personal:
  // 8-63 printable ASCII characters, or exactly 64 hex characters.
  const valid = isPrintableAscii(value)
    && ((value.length >= 8 && value.length <= 63) || (value.length === 64 && isHex64(value)));

  if (!valid) {
    passwordErrors[key] = t('wireless.passwordInvalidFormat');
    return false;
  }

  delete passwordErrors[key];
  return true;
};

const validateDraftPasswords = () => {
  let valid = true;

  Object.keys(passwordErrors).forEach((key) => delete passwordErrors[key]);

  if (!draft.value) {
    return true;
  }

  if (Number(draft.value.CommonSSIDEnable) === 1 && commonSsidConfig.value && Number(commonSsidConfig.value.Enable) === 1) {
    valid = validatePasswordField(
      commonSsidConfig.value.KeyPassPhrase || '',
      'CommonSSID',
      commonSsidConfig.value.SecurityMode
    ) && valid;
  }

  if (Number(draft.value.CommonSSIDEnable) === 0 && draft.value.Interface) {
    draft.value.Interface.forEach((iface) => {
      if (Number(iface.Enable) === 1) {
        valid = validatePasswordField(
          (iface.KeyPassPhrase ?? '').toString(),
          iface.Band,
          iface.SecurityMode
        ) && valid;
      }
    });
  }

  return valid;
};

const onCommonSsidToggle = () => {
  if (!draft.value) return;
  if (Number(draft.value.CommonSSIDEnable) === 0) {
    // When disabling Common SSID, also disable MLO
    draft.value.MLOEnable = 0;
  }
  // Note: We don't modify Interface data here to preserve per-band settings.
  // Data synchronization happens only when submitting (buildPostPayload).
};

const onCommonSsidSecurityModeChange = () => {
  if (!commonSsidConfig.value || !draft.value) return;
  validatePasswordField(commonSsidConfig.value.KeyPassPhrase, 'CommonSSID', commonSsidConfig.value.SecurityMode);
  // MLO is not supported on open networks (Security: None) – auto-disable
  if (commonSsidConfig.value.SecurityMode === 'None') {
    draft.value.MLOEnable = 0;
  }
};

/**
 * Keep the backend payload shape intact.
 * UI may hide some fields (e.g., MFPConfig), but we still preserve values from the loaded config
 * and post them back unchanged unless the backend chooses to ignore them.
 */
const buildPostPayload = (): WlanBasicMultiPostRequest | null => {
  if (!data.value) return null;

  const postGroups: WlanBasicMultiPostRequest['WlanGroup'] = groups.value.map((g, idx) => {
    const norm = normalizeGroup(g);

    // Determine group-level data based on mode
    let groupSSID = (g as any).SSID;
    let groupKeyPassPhrase = (g as any).KeyPassPhrase;
    let groupSecurityMode = (g as any).SecurityMode;

    // Per-band mode: group-level fields stay as-is, interfaces keep their own values

    return {
      Index: (g as any).Index,
      Enable: (g as any).Enable,
      Alias: (g as any).Alias || norm.Alias,
      SSID: typeof groupSSID === 'string' ? normalizeSsid(groupSSID) : groupSSID,
      KeyPassPhrase: groupKeyPassPhrase,
      SecurityMode: groupSecurityMode,
      CommonSSIDEnable: norm.CommonSSIDEnable,
      MLOEnable: norm.MLOEnable,
      BridgeInterface: (g as any).BridgeInterface,
      MFPConfig: (g as any).MFPConfig,
      SSIDAdvertisementEnabled: (g as any).SSIDAdvertisementEnabled,
      IsolationEnable: (g as any).IsolationEnable,
      Interface: norm.Interface.map((i) => ({
        Enable: i.Enable,
        Band: i.Band,
        Alias: i.Alias,
        SSID: normalizeSsid(i.SSID),
        KeyPassPhrase: (i.KeyPassPhrase ?? i.WpaPreShareKey ?? '').toString(),
        SecurityMode: i.SecurityMode,
        MFPConfig: i.MFPConfig,
        AccessPointReference: (i as any).AccessPointReference,
        SSIDReference: (i as any).SSIDReference,
        SSIDAdvertisementEnabled: i.SSIDAdvertisementEnabled,
        IsolationEnable: i.IsolationEnable
      }))
    };
  });

  return { WlanGroup: postGroups };
};

const showSuccessMessage = () => {
  showSuccess.value = true;
  setTimeout(() => (showSuccess.value = false), 2500);
};

// PUBLIC_INTERFACE
const validateAllSsids = (): boolean => {
  if (!data.value) return false;
  for (const group of data.value.WlanBasic.WlanGroup) {
    const g = group as any;
    // Validate group-level SSID
    if (g.SSID) {
      const result = validateSsid(g.SSID, t);
      if (!result.isValid) return false;
    }
    // Validate per-band SSIDs
    for (const band of ['wifi2g', 'wifi5g', 'wifi6g']) {
      if (g[band]?.SSID) {
        const result = validateSsid(g[band].SSID, t);
        if (!result.isValid) return false;
      }
    }
  }
  return true;
};

const applyPost = async () => {
  /**
   * Non-edit-mode "Apply": POST current local state to backend in WlanGroup + Interface structure.
   * Shows success feedback consistent with the rest of this page.
   */
  if (!validateAllSsids()) return;
  const payload = buildPostPayload();
  if (!payload) return;

  loading.value = true;
  try {
    await updateWlanBasicMulti(payload);
    showSuccessMessage();
    showBlockingOverlay.value = true;

    // After successful apply, treat current state as the new baseline for non-edit cancel.
    lastGetSnapshot.value = JSON.parse(JSON.stringify(data.value));
  } catch (e) {
    console.error('Error updating WLAN Basic (multi) config:', e);
  } finally {
    loading.value = false;
  }
};

const handleBlockingComplete = () => {
  showBlockingOverlay.value = false;
  router.go(0);
};

onMounted(() => {
  fetchConfig();
  fetchMeshStatus();
});
</script>

<template>
  <div class="wlan-basic-multi" :data-testid="qa('wlan-basic-multi-root')">
    <div v-if="loading" class="loading-overlay" :data-testid="qa('wlan-basic-multi-loading')">
      <div class="loading-spinner"></div>
    </div>

    <div v-if="showSuccess" class="success-message" :data-testid="qa('wlan-basic-multi-success')">
      {{ t('common.apply') }} {{ t('common.saveSuccess') }}
    </div>

    <!-- Compact list view (hidden while editing) -->
    <BaseCard
      v-if="editIndex === null"
      class="compact-card"
      :data-testid="qa('wlan-basic-multi-list-card')"
    >
      <template #header>
        <div class="card-header-row">
          <div class="card-title">{{ t('wireless.basicConfig') }}</div>
          <!-- Refresh button removed per requirements -->
        </div>
      </template>

      <div class="group-table" :data-testid="qa('wlan-basic-multi-group-table')">
        <div class="group-table-head">
          <div class="col col-name">{{ t('wireless.ssidGroupName') }}</div>
          <div class="col col-enable">{{ t('wireless.ssidGroupEnable') }}</div>
          <div class="col col-common">{{ t('wireless.commonSsidEnable') }}</div>
          <div class="col col-mlo">{{ t('wireless.mloEnable') }}</div>
          <div class="col col-actions">{{ t('common.action') }}</div>
        </div>

        <div v-for="(g, idx) in groups" :key="`${g.Alias}-${idx}`" class="group-table-row">
          <div class="col col-name">
            <div class="name-line">{{ g.Alias }}</div>
          </div>

          <div class="col col-enable">
            <span class="pill" :class="Number(g.Enable) === 1 ? 'on' : 'off'">
              {{ Number(g.Enable) === 1 ? t('common.enabled') : t('common.disabled') }}
            </span>
          </div>

          <div class="col col-common">
            <span class="pill" :class="Number(g.CommonSSIDEnable) === 1 ? 'on' : 'off'">
              {{ Number(g.CommonSSIDEnable) === 1 ? t('common.enabled') : t('common.disabled') }}
            </span>
          </div>

          <div class="col col-mlo">
            <span class="pill" :class="Number(g.MLOEnable) === 1 ? 'on' : 'off'">
              {{ Number(g.MLOEnable) === 1 ? t('common.enabled') : t('common.disabled') }}
            </span>
          </div>

          <div class="col col-actions">
            <button
              class="btn-action"
              :data-testid="qa(`wlan-basic-multi-edit-${idx}`)"
              :title="t('common.edit')"
              @click="enterEdit(idx)"
            >
              <span class="material-icons">edit</span>
            </button>
          </div>
        </div>

        <div v-if="groups.length === 0" class="empty-row">
          {{ t('wireless.noSsidGroups') }}
        </div>
      </div>

      <!-- Non-edit footer actions: Cancel restores last GET, Apply posts -->

    </BaseCard>
      <div class="footer-actions" v-if="editIndex === null">
        <BaseButton variant="secondary" :data-testid="qa('wlan-basic-multi-view-cancel')" @click="restoreFromGet">
          {{ t('common.cancel') }}
        </BaseButton>
        <BaseButton variant="primary" :disabled="loading" :data-testid="qa('wlan-basic-multi-view-apply')" @click="applyPost">
          {{ t('common.apply') }}
        </BaseButton>
      </div>
    <!-- Edit mode (Basic Config list is hidden while this is shown) -->
    <BaseCard v-if="draft && editIndex !== null" class="compact-card edit-card" :data-testid="qa('wlan-basic-multi-edit-card')">
      <template #header>
        <div class="card-header-row">
          <div class="card-title">
            {{ t('common.edit') }}: {{ draft.Alias }}
          </div>
          <!-- Inline header actions removed per requirements -->
        </div>
      </template>

      <div class="edit-grid" :data-testid="qa('wlan-basic-multi-edit-grid')">
        <!-- Common toggles -->
        <div class="edit-section" :data-testid="qa('wlan-basic-multi-common-section')">
          <div class="section-title">{{ t('wireless.commonSsidSettings') }}</div>
          <div class="fields-grid">
            <div class="field">
              <div class="switch-label" :data-testid="qa('wlan-basic-multi-common-ssid-enable')">
                <span>{{ t('wireless.commonSsidEnable') }}</span>
                <BaseSwitch
                  v-model="draft.CommonSSIDEnable"
                  :true-value="1"
                  :false-value="0"
                  :disabled="meshEnabled"
                  :data-testid="qa('wlan-basic-multi-common-ssid-enable-toggle')"
                  :slider-data-testid="qa('wlan-basic-multi-common-ssid-enable-toggle-slider')"
                  @change="onCommonSsidToggle"
                />
              </div>
              <div v-if="meshEnabled" class="hint mesh-enforce-hint">
                <span class="material-icons mesh-enforce-hint-icon">info</span>
                <span>{{ t('wizard.meshEnforcesCommonSsid') }}</span>
              </div>
            </div>

            <div class="field" v-if="commonSsidConfig?.SecurityMode !== 'None'">
              <div class="switch-label" :data-testid="qa('wlan-basic-multi-mlo-enable')">
                <span>{{ t('wireless.mloEnable') }}</span>
                <BaseSwitch
                  v-model="draft.MLOEnable"
                  class="switch-toggle"
                  :class="{ 'is-disabled': Number(draft.CommonSSIDEnable) === 0 }"
                  :true-value="1"
                  :false-value="0"
                  :disabled="Number(draft.CommonSSIDEnable) === 0"
                  :data-testid="qa('wlan-basic-multi-mlo-enable-toggle')"
                  :slider-data-testid="qa('wlan-basic-multi-mlo-enable-toggle-slider')"
                />
              </div>

              <div v-if="Number(draft.CommonSSIDEnable) === 0" class="hint">
                {{ t('wireless.commonSsidDisabled') }}
              </div>
            </div>
          </div>
        </div>

        <!-- Common SSID band settings (ONLY when Common SSID is ON) -->
        <div
          v-if="Number(draft.CommonSSIDEnable) === 1 && commonSsidConfig"
          class="edit-section"
          :data-testid="qa('wlan-basic-multi-common-band-section')"
        >
          <div class="section-title">{{ t('wireless.commonSsidBandSettings') }}</div>

          <!-- Requirement: In Common SSID mode, this section must have ONLY its own Enable toggle. -->


          <!-- Common SSID fields: single block for SSID/Auth/PSK -->
            <div class="iface-row" :data-testid="qa('wlan-basic-multi-common-ssid-fields')">
                        <div class="row-head">
              <div class="row-title">{{ t('common.enable') }}</div>
              <div class="row-right">
                <div class="switch-label" :data-testid="qa('wlan-basic-multi-common-band-enable')">
                  <BaseSwitch
                    v-model="commonSsidConfig.Enable"
                    :true-value="1"
                    :false-value="0"
                    :data-testid="qa('wlan-basic-multi-common-band-enable-toggle')"
                    :slider-data-testid="qa('wlan-basic-multi-common-band-enable-toggle-slider')"
                  />
                </div>
              </div>
            </div>
            <div
              class="row"
              :class="shouldShowPasswordField(commonSsidConfig.SecurityMode) ? 'row-3' : 'row-2'"
            >
              <div class="cell cell-ssid">
                <BaseInput
                  :modelValue="commonSsidConfig.SSID"
                  :label="t('wireless.ssid')"
                  :disabled="Number(commonSsidConfig.Enable) === 0"
                  :error="!!ssidErrors['CommonSSID']"
                  :errorMessage="ssidErrors['CommonSSID']"
                  :helpText="ssidByteLengths['CommonSSID'] !== undefined ? t('wireless.ssidBytesInfo', { bytes: ssidByteLengths['CommonSSID'] }) : ''"
                  :data-testid="qa('wlan-basic-multi-common-ssid-ssid')"
                  @update:modelValue="(v) => handleSsidInput(String(v), 'CommonSSID', (val) => { commonSsidConfig!.SSID = val; })"
                />
              </div>

              <div class="cell cell-auth">
                <BaseSelect
                  v-model="commonSsidConfig.SecurityMode"
                  :label="t('wireless.authentication')"
                  :options="securityModeOptionsForCommonSsid.map((m) => ({ label: m, value: m }))"
                  :disabled="Number(commonSsidConfig.Enable) === 0"
                  :data-testid="qa('wlan-basic-multi-common-ssid-security')"
                  @update:model-value="onCommonSsidSecurityModeChange"
                />
              </div>

              <div v-if="shouldShowPasswordField(commonSsidConfig.SecurityMode)" class="cell cell-psk">
                <label class="psk-label">{{ t('wireless.password') }}</label>
                <BaseSecretInput
                  :model-value="commonSsidConfig.KeyPassPhrase"
                  :disabled="Number(commonSsidConfig.Enable) === 0"
                  :input-data-testid="qa('wlan-basic-multi-common-ssid-psk')"
                  :toggle-data-testid="qa('wlan-basic-multi-common-ssid-psk-toggle')"
                  :max-length="64"
                  @update:model-value="(v) => { commonSsidConfig!.KeyPassPhrase = String(v ?? ''); validatePasswordField(commonSsidConfig!.KeyPassPhrase, 'CommonSSID', commonSsidConfig!.SecurityMode); }"
                />
                <div
                  v-if="passwordErrors['CommonSSID']"
                  class="field-error"
                  :data-testid="qa('wlan-basic-multi-common-ssid-psk-error')"
                >
                  {{ passwordErrors['CommonSSID'] }}
                </div>
              </div>
            </div>

            <div class="row row-hide-ssid">
              <div class="field">
                <div class="switch-label" :data-testid="qa('wlan-basic-multi-common-hide-ssid')">
                  <span>{{ t('wireless.hideSsid') }}</span>
                  <BaseSwitch
                    v-model="commonSsidConfig.SSIDAdvertisementEnabled"
                    class="switch-toggle"
                    :class="{ 'is-disabled': Number(commonSsidConfig.Enable) === 0 }"
                    :true-value="0"
                    :false-value="1"
                    :disabled="Number(commonSsidConfig.Enable) === 0"
                    :data-testid="qa('wlan-basic-multi-common-hide-ssid-toggle')"
                    :slider-data-testid="qa('wlan-basic-multi-common-hide-ssid-toggle-slider')"
                  />
                </div>
              </div>
            </div>

            <div class="row row-hide-ssid">
              <div class="field">
                <div class="switch-label" :data-testid="qa('wlan-basic-multi-common-client-isolation')">
                  <span>{{ t('wireless.clientIsolation') }}</span>
                  <BaseSwitch
                    v-model="commonSsidConfig.IsolationEnable"
                    class="switch-toggle"
                    :class="{ 'is-disabled': Number(commonSsidConfig.Enable) === 0 }"
                    :true-value="1"
                    :false-value="0"
                    :disabled="Number(commonSsidConfig.Enable) === 0"
                    :data-testid="qa('wlan-basic-multi-common-client-isolation-toggle')"
                    :slider-data-testid="qa('wlan-basic-multi-common-client-isolation-toggle-slider')"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Per-band interface rows (only when Common SSID is OFF) -->
        <div
          v-if="Number(draft.CommonSSIDEnable) === 0"
          class="edit-section"
          :data-testid="qa('wlan-basic-multi-interfaces-section')"
        >
          <div class="section-title">{{ t('wireless.perBandInterfaces') }}</div>

          <div class="interfaces-rows">
            <div v-for="b in bands" :key="b" class="iface-row" :data-testid="qa(`wlan-basic-multi-iface-${slug(b)}`)">
              <div class="row-head">
                <div class="row-title">{{ b }}</div>
                <div class="row-right">
                  <div class="switch-label" :data-testid="qa(`wlan-basic-multi-iface-enable-${slug(b)}`)">
                    <span class="sr-only">{{ t('common.enable') }}</span>
                    <BaseSwitch
                      :model-value="Number(getInterfaceByBand(b)!.Enable)"
                      :true-value="1"
                      :false-value="0"
                      :data-testid="qa(`wlan-basic-multi-iface-enable-toggle-${slug(b)}`)"
                      :slider-data-testid="qa(`wlan-basic-multi-iface-enable-toggle-slider-${slug(b)}`)"
                      @update:model-value="(value) => { getInterfaceByBand(b)!.Enable = value === 1 || value === '1' || value === true ? 1 : 0; }"
                    />
                  </div>
                </div>
              </div>

              <div
                class="row"
                :class="shouldShowPasswordField(getInterfaceByBand(b)!.SecurityMode) ? 'row-3' : 'row-2'"
              >
                <div class="cell cell-ssid">
                  <BaseInput
                    :modelValue="getInterfaceByBand(b)!.SSID"
                    :label="t('wireless.ssid')"
                    :disabled="Number(getInterfaceByBand(b)!.Enable) === 0"
                    :error="!!ssidErrors[b]"
                    :errorMessage="ssidErrors[b]"
                    :helpText="ssidByteLengths[b] !== undefined ? t('wireless.ssidBytesInfo', { bytes: ssidByteLengths[b] }) : ''"
                    :data-testid="qa(`wlan-basic-multi-iface-ssid-${slug(b)}`)"
                    @update:modelValue="(v) => handleSsidInput(String(v), b, (val) => { getInterfaceByBand(b)!.SSID = val; })"
                  />
                </div>

                <div class="cell cell-auth">
                  <BaseSelect
                    v-model="getInterfaceByBand(b)!.SecurityMode"
                    :label="t('wireless.authentication')"
                    :options="securityModeOptionsForInterface(getInterfaceByBand(b)!).map((m) => ({ label: m, value: m }))"
                    :disabled="Number(getInterfaceByBand(b)!.Enable) === 0"
                    :data-testid="qa(`wlan-basic-multi-iface-security-${slug(b)}`)"
                    @update:model-value="() => validatePasswordField(String(getInterfaceByBand(b)!.KeyPassPhrase ?? ''), b, getInterfaceByBand(b)!.SecurityMode)"
                  />
                </div>

                <div v-if="shouldShowPasswordField(getInterfaceByBand(b)!.SecurityMode)" class="cell cell-psk">
                  <label class="psk-label">{{ t('wireless.password') }}</label>
                  <BaseSecretInput
                    :model-value="getInterfaceByBand(b)!.KeyPassPhrase ?? ''"
                    :disabled="Number(getInterfaceByBand(b)!.Enable) === 0"
                    :input-data-testid="qa(`wlan-basic-multi-iface-psk-${slug(b)}`)"
                    :toggle-data-testid="qa(`wlan-basic-multi-iface-psk-toggle-${slug(b)}`)"
                    :max-length="64"
                    @update:model-value="(v) => { const p = String(v ?? ''); getInterfaceByBand(b)!.KeyPassPhrase = p; validatePasswordField(p, b, getInterfaceByBand(b)!.SecurityMode); }"
                  />
                  <div
                    v-if="passwordErrors[b]"
                    class="field-error"
                    :data-testid="qa(`wlan-basic-multi-iface-psk-error-${slug(b)}`)"
                  >
                    {{ passwordErrors[b] }}
                  </div>
                </div>
              </div>

              <div class="row row-hide-ssid">
                <div class="field">
                  <div class="switch-label" :data-testid="qa(`wlan-basic-multi-iface-hide-ssid-${slug(b)}`)">
                    <span>{{ t('wireless.hideSsid') }}</span>
                    <BaseSwitch
                      :model-value="Number(getInterfaceByBand(b)!.SSIDAdvertisementEnabled ?? 1)"
                      class="switch-toggle"
                      :class="{ 'is-disabled': Number(getInterfaceByBand(b)!.Enable) === 0 }"
                      :true-value="0"
                      :false-value="1"
                      :disabled="Number(getInterfaceByBand(b)!.Enable) === 0"
                      :data-testid="qa(`wlan-basic-multi-iface-hide-ssid-toggle-${slug(b)}`)"
                      :slider-data-testid="qa(`wlan-basic-multi-iface-hide-ssid-toggle-slider-${slug(b)}`)"
                      @update:model-value="(value) => { getInterfaceByBand(b)!.SSIDAdvertisementEnabled = value === 1 || value === '1' || value === true ? 1 : 0; }"
                    />
                  </div>
                </div>
              </div>

              <div class="row row-hide-ssid">
                <div class="field">
                  <div class="switch-label" :data-testid="qa(`wlan-basic-multi-iface-client-isolation-${slug(b)}`)">
                    <span>{{ t('wireless.clientIsolation') }}</span>
                    <BaseSwitch
                      :model-value="Number(getInterfaceByBand(b)!.IsolationEnable ?? 0)"
                      class="switch-toggle"
                      :class="{ 'is-disabled': Number(getInterfaceByBand(b)!.Enable) === 0 }"
                      :true-value="1"
                      :false-value="0"
                      :disabled="Number(getInterfaceByBand(b)!.Enable) === 0"
                      :data-testid="qa(`wlan-basic-multi-iface-client-isolation-toggle-${slug(b)}`)"
                      :slider-data-testid="qa(`wlan-basic-multi-iface-client-isolation-toggle-slider-${slug(b)}`)"
                      @update:model-value="(value) => { getInterfaceByBand(b)!.IsolationEnable = value === 1 || value === '1' || value === true ? 1 : 0; }"
                    />
                  </div>
                </div>
              </div>

              <!-- MFPConfig removed from UI intentionally -->
            </div>
          </div>
        </div>
      </div>

      <!-- Edit footer actions: Cancel (discard) + Update (local-only, no POST) -->
      <div class="footer-actions">
        <BaseButton variant="secondary" :data-testid="qa('wlan-basic-multi-edit-cancel')" @click="cancelEdit">
          {{ t('common.cancel') }}
        </BaseButton>
        <BaseButton variant="primary" :data-testid="qa('wlan-basic-multi-edit-update')" @click="updateLocal">
          {{ t('common.update') }}
        </BaseButton>
      </div>
    </BaseCard>

    <BlockingOverlay
      :data-testid="qa('wlan-basic-multi-blocking-overlay')"
      :is-visible="showBlockingOverlay"
      :message="t('wireless.applyingBasicSettings')"
      :description1="t('wireless.applyingDescription')"
      :description2="''"
      :show-countdown="false"
      :duration="30"
      @complete="handleBlockingComplete"
    />
  </div>
</template>

<style scoped>
.wlan-basic-multi {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.compact-card {
  padding: 0;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.75);
  display: grid;
  place-items: center;
  z-index: 10;
  border-radius: 6px;
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0070bb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.success-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #4caf50;
  color: white;
  padding: 10px 14px;
  border-radius: 6px;
  z-index: 100;
}

.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.group-table {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.group-table-head,
.group-table-row {
  display: grid;
  grid-template-columns: 1.6fr 0.8fr 0.6fr 0.6fr 0.5fr;
  gap: 8px;
  padding: 10px 12px;
  align-items: center;
}

.group-table-head {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  font-size: 12px;
  font-weight: 600;
}

.group-table-row {
  border-bottom: 1px solid var(--border-color);
  font-size: 13px;
}

.group-table-row:last-child {
  border-bottom: none;
}

.col-name .name-line {
  font-weight: 600;
}

.pill {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid var(--border-color);
  justify-content: center;
}

.pill.on {
  background: rgba(76, 175, 80, 0.12);
  border-color: rgba(76, 175, 80, 0.4);
  color: #2e7d32;
}

.pill.off {
  background: rgba(0, 0, 0, 0.04);
  color: var(--text-secondary);
}

.empty-row {
  padding: 14px 12px;
  color: var(--text-secondary);
  font-size: 13px;
}

.edit-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
}

.edit-section {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 10px;
}

.fields-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 0 1.5rem 0 1.5rem;
}

.hint {
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-secondary);
}

.mesh-enforce-hint {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.5rem;
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 6px;
  color: #856404;
  font-size: 12px;
}

.mesh-enforce-hint-icon {
  font-size: 16px;
  color: #856404;
}

.row-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

/* Right-align header controls (e.g., slide switches) while keeping compact layout. */
.row-right {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
}

.row-title {
  font-size: 13px;
  font-weight: 600;
}

/* Switch styling (matches Advanced Config slide switch pattern) */
.switch-label {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
}

/* In header rows, the switch should size to content so it can sit flush right. */
.row-head .switch-label {
  width: auto;
}

:deep(.switch) {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
  flex-shrink: 0;
}

:deep(.switch input) {
  opacity: 0;
  width: 0;
  height: 0;
}

:deep(.slider) {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #ccc;
  transition: 0.2s;
  border-radius: 999px;
}

:deep(.slider:before) {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  top: 3px;
  background-color: white;
  transition: 0.2s;
  border-radius: 50%;
}

:deep(.switch input:checked + .slider) {
  background-color: #0070BB;
}

:deep(.switch input:checked + .slider:before) {
  transform: translateX(22px);
}

:deep(.switch input:focus + .slider) {
  box-shadow: 0 0 0 2px rgba(0, 112, 187, 0.25);
}

:deep(.switch input:disabled + .slider) {
  cursor: not-allowed;
  opacity: 0.5;
}

.switch-toggle.is-disabled {
  opacity: 0.8;
}

/* Screen-reader only utility for unlabeled switches */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.compact-rows {
  margin-top: 10px;
}

.interfaces-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.iface-row {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  background: #fff;
}

/* Row layout: SSID | Authentication | Enabled (toggle is in header) */
.row {
  display: grid;
  gap: 10px;
  align-items: start;
}

.row-3 {
  grid-template-columns: 1.6fr 1fr 1.1fr;
}

.row-2 {
  grid-template-columns: 1.6fr 1fr;
}

.cell {
  min-width: 0;
}

/* Ensure form groups in grid cells align properly */
.cell :deep(.form-group) {
  margin-bottom: 0;
}

.psk-label {
  display: block;
  margin-bottom: var(--space-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.field-error {
  margin-top: 6px;
  font-size: 12px;
  color: #dc3545;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 0 12px 12px;
}

/* Match Port Forwarding action icon button exactly */
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

.row-hide-ssid {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--border-color);
}

@media (max-width: 960px) {
  .group-table-head,
  .group-table-row {
    grid-template-columns: 1fr 0.8fr 0.6fr 0.6fr 0.6fr;
  }

  .fields-grid {
    grid-template-columns: 1fr;
  }

  .row-3 {
    grid-template-columns: 1fr;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
