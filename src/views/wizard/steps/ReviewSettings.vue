<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQA } from '../../../utils/qa';
import type { WizardConfig } from '../../../types/wizard';

interface Props {
  config: WizardConfig;
}

defineProps<Props>();
defineEmits(['prev', 'submit']);
const { t } = useI18n();
const { qa } = useQA();

const showCommonPassword = ref(false);
const showAdminPassword = ref(false);
const showBandPasswords = ref({
  '2g': false,
  '5g': false,
  '6g': false
});
</script>

<template>
  <div class="step-container" :data-testid="qa('wizard-review-container')">
    <div class="step-card" :data-testid="qa('wizard-review-card')">
      <h1 class="step-title" :data-testid="qa('wizard-review-title')">{{ t('wizard.reviewTitle') }}</h1>
      <p class="step-subtitle" :data-testid="qa('wizard-review-subtitle')">{{ t('wizard.reviewSubtitle') }}</p>

      <div class="progress-bar" :data-testid="qa('wizard-review-progress')">
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
        <div class="progress-step active"></div>
      </div>

      <div class="review-container" :data-testid="qa('wizard-review-sections')">
        <div class="review-section" :data-testid="qa('wizard-review-mode-section')">
          <h3 :data-testid="qa('wizard-review-mode-title')">{{ t('wizard.reviewDeviceMode') }}</h3>
          <div class="review-item" :data-testid="qa('wizard-review-mode-item')">
            <span class="label">{{ t('wizard.reviewMode') }}</span>
            <span class="value" :data-testid="qa('wizard-review-mode-value')">{{ config.mode === 'router' ? t('wizard.routerModeTitle') : t('wizard.agentModeTitle') }}</span>
          </div>
        </div>

        <div v-if="config.mode === 'router'" class="review-section" :data-testid="qa('wizard-review-wan-section')">
          <h3 :data-testid="qa('wizard-review-wan-title')">{{ t('wizard.reviewWanConnection') }}</h3>
          <div class="review-item" :data-testid="qa('wizard-review-wan-item')">
            <span class="label">{{ t('wizard.reviewConnectionType') }}</span>
            <span class="value" :data-testid="qa('wizard-review-wan-value')">{{ config.wan.wanMode.replace(/_/g, ' ') }}</span>
          </div>
        </div>

        <div v-if="config.mode === 'router'" class="review-section" :data-testid="qa('wizard-review-mesh-section')">
          <h3 :data-testid="qa('wizard-review-mesh-title')">{{ t('wizard.reviewSmartMesh') }}</h3>
          <div class="review-item" :data-testid="qa('wizard-review-mesh-item')">
            <span class="label">{{ t('wizard.reviewStatus') }}</span>
            <span class="value" :data-testid="qa('wizard-review-mesh-value')">{{ config.mesh.enable ? t('wizard.reviewEnabled') : t('wizard.reviewDisabled') }}</span>
          </div>
        </div>

        <div v-if="config.mode === 'router'" class="review-section" :data-testid="qa('wizard-review-wifi-section')">
          <h3 :data-testid="qa('wizard-review-wifi-title')">{{ t('wizard.reviewWifiConfiguration') }}</h3>
          <div class="review-item">
            <span class="label">{{ t('wizard.smartConnect') }}:</span>
            <span class="value">{{ config.wifi.smartConnect ? t('wizard.reviewEnabled') : t('wizard.reviewDisabled') }}</span>
          </div>
          <div class="review-item">
            <span class="label">{{ t('wizard.reviewMloNetwork') }}</span>
            <span class="value">{{ config.wifi.mloEnable ? t('wizard.reviewEnabled') : t('wizard.reviewDisabled') }}</span>
          </div>

          <div v-if="config.wifi.smartConnect">
            <div class="review-item">
              <span class="label">SSID:</span>
              <span class="value">{{ config.wifi.common.ssid }}</span>
            </div>
            <div class="review-item">
              <span class="label">{{ t('wizard.reviewSecurityType') }}</span>
              <span class="value">{{ config.wifi.common.security }}</span>
            </div>
            <div class="review-item password-row">
              <span class="label">{{ t('wizard.reviewPassword') }}</span>
              <span class="value">{{ showCommonPassword ? config.wifi.common.password : '•'.repeat(config.wifi.common.password.length) }}</span>
              <button type="button" class="password-toggle-btn" @click="showCommonPassword = !showCommonPassword">
                <span class="material-icons">{{ showCommonPassword ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
          </div>

          <div v-else >
            <div class="review-item">
              <span class="label">{{ t('wizard.reviewPsc') }}</span>
              <span class="value">{{ config.wifi.psc ? t('wizard.reviewEnabled') : t('wizard.reviewDisabled') }}</span>
            </div>
            <div class="review-item">
              <span class="label">{{ t('wizard.reviewPmf') }}</span>
              <span class="value">{{ config.wifi.pmf ? t('wizard.reviewEnabled') : t('wizard.reviewDisabled') }}</span>
            </div>

            <div v-if="config.wifi.bands['2g'].enabled" class="band-info">
              <h4>2.4GHz Band</h4>
              <div class="review-item">
                <span class="label">SSID:</span>
                <span class="value">{{ config.wifi.bands['2g'].ssid }}</span>
              </div>
              <div class="review-item">
                <span class="label">{{ t('wizard.reviewSecurityType') }}</span>
                <span class="value">{{ config.wifi.bands['2g'].security }}</span>
              </div>
              <div class="review-item password-row">
                <span class="label">{{ t('wizard.reviewPassword') }}</span>
                <span class="value">{{ showBandPasswords['2g'] ? config.wifi.bands['2g'].password : '•'.repeat(config.wifi.bands['2g'].password.length) }}</span>
                <button type="button" class="password-toggle-btn" @click="showBandPasswords['2g'] = !showBandPasswords['2g']">
                  <span class="material-icons">{{ showBandPasswords['2g'] ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>

            <div v-if="config.wifi.bands['5g'].enabled" class="band-info">
              <h4>5GHz Band</h4>
              <div class="review-item">
                <span class="label">SSID:</span>
                <span class="value">{{ config.wifi.bands['5g'].ssid }}</span>
              </div>
              <div class="review-item">
                <span class="label">{{ t('wizard.reviewSecurityType') }}</span>
                <span class="value">{{ config.wifi.bands['5g'].security }}</span>
              </div>
              <div class="review-item password-row">
                <span class="label">{{ t('wizard.reviewPassword') }}</span>
                <span class="value">{{ showBandPasswords['5g'] ? config.wifi.bands['5g'].password : '•'.repeat(config.wifi.bands['5g'].password.length) }}</span>
                <button type="button" class="password-toggle-btn" @click="showBandPasswords['5g'] = !showBandPasswords['5g']">
                  <span class="material-icons">{{ showBandPasswords['5g'] ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>

            <div v-if="config.wifi.bands['6g'].enabled" class="band-info">
              <h4>6GHz Band</h4>
              <div class="review-item">
                <span class="label">SSID:</span>
                <span class="value">{{ config.wifi.bands['6g'].ssid }}</span>
              </div>
              <div class="review-item">
                <span class="label">{{ t('wizard.reviewSecurityType') }}</span>
                <span class="value">{{ config.wifi.bands['6g'].security }}</span>
              </div>
              <div class="review-item password-row">
                <span class="label">{{ t('wizard.reviewPassword') }}</span>
                <span class="value">{{ showBandPasswords['6g'] ? config.wifi.bands['6g'].password : '•'.repeat(config.wifi.bands['6g'].password.length) }}</span>
                <button type="button" class="password-toggle-btn" @click="showBandPasswords['6g'] = !showBandPasswords['6g']">
                  <span class="material-icons">{{ showBandPasswords['6g'] ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="config.mode === 'router'" class="review-section" :data-testid="qa('wizard-review-admin-section')">
          <h3 :data-testid="qa('wizard-review-admin-title')">{{ t('wizard.reviewAdministrator') }}</h3>
          <div class="review-item" :data-testid="qa('wizard-review-admin-username-item')">
            <span class="label">{{ t('wizard.username') }}:</span>
            <span class="value" :data-testid="qa('wizard-review-admin-username-value')">{{ config.admin.username }}</span>
          </div>
          <div class="review-item password-row" :data-testid="qa('wizard-review-admin-password-item')">
            <span class="label">{{ t('wizard.reviewPassword') }}</span>
            <span class="value" :data-testid="qa('wizard-review-admin-password-value')">{{ showAdminPassword ? config.admin.password : '•'.repeat(config.admin.password.length) }}</span>
            <button type="button" class="password-toggle-btn" :data-testid="qa('wizard-review-admin-password-toggle')" @click="showAdminPassword = !showAdminPassword">
              <span class="material-icons">{{ showAdminPassword ? 'visibility_off' : 'visibility' }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="info-box" :data-testid="qa('wizard-review-info-box')">
        <p :data-testid="qa('wizard-review-apply-message')">{{ t('wizard.reviewApplyMessage') }}</p>
      </div>
    </div>

    <div class="button-container">
      <button class="btn-secondary" :data-testid="qa('wizard-review-back-button')" @click="$emit('prev')">{{ t('common.back') }}</button>
      <button class="btn-primary" :data-testid="qa('wizard-review-submit-button')" @click="$emit('submit')">{{ t('common.apply') }}</button>
    </div>
  </div>
</template>

<style scoped>
.step-container {
  width: 100%;
  max-width: 900px;
  min-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.step-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  min-height: 600px;
}

.step-title {
  color: #0078d4;
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.step-subtitle {
  color: #666;
  font-size: 1rem;
  margin-bottom: 2rem;
}

.progress-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 3rem;
}

.progress-step {
  flex: 1;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
}

.progress-step.active {
  background: #0078d4;
}

.review-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.review-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
}

.review-section h3 {
  color: #0078d4;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #0078d4;
}

.review-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.review-item:last-child {
  border-bottom: none;
}

.review-item.password-row {
  align-items: center;
  gap: 0.5rem;
}

.value {
  color: #333;
  font-weight: 500;
  text-align: right;
  flex: 1;
  word-break: break-all;
}

.password-toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: color 0.2s;
}

.password-toggle-btn:hover {
  color: #0078d4;
}

.password-toggle-btn .material-icons {
  font-size: 1.25rem;
}

.band-info {
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 4px;
}

.band-info h4 {
  color: #333;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.info-box {
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 2rem;
}

.info-box p {
  color: #856404;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn-secondary {
  background: white;
  color: #0078d4;
  border: 1px solid #0078d4;
  border-radius: 4px;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f0f8ff;
}

.btn-primary {
  background: #0078d4;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background: #006abd;
}
</style>
