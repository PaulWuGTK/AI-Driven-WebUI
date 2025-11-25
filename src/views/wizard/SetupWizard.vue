<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { wizardApi } from '../../services/api/wizard';
import type { WizardData, WizardConfig, AgentSetupMode } from '../../types/wizard';
import PrivacyPolicy from './steps/PrivacyPolicy.vue';
import ModeSelect from './steps/ModeSelect.vue';
import AgentSetup from './steps/AgentSetup.vue';
import AgentProcessing from './steps/AgentProcessing.vue';
import AgentComplete from './steps/AgentComplete.vue';
import RouterEnvironment from './steps/RouterEnvironment.vue';
import WanModeSelect from './steps/WanModeSelect.vue';
import MeshSetup from './steps/MeshSetup.vue';
import WifiSetup from './steps/WifiSetup.vue';
import AdminPassword from './steps/AdminPassword.vue';
import ReviewSettings from './steps/ReviewSettings.vue';
import ApplyingSettings from './steps/ApplyingSettings.vue';
import WizardComplete from './steps/WizardComplete.vue';

const { locale, t } = useI18n();

const availableLanguages = ref([
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'ja', label: '日本語' },
  { code: 'de', label: 'Deutsch' },
  { code: 'zh_TW', label: '繁體中文' },
  { code: 'zh_CN', label: '简体中文' },
  { code: 'ko', label: '한국어' }
]);

const username = ref(localStorage.getItem('username') || 'admin');

const handleLanguageChange = (event: Event) => {
  const newLocale = (event.target as HTMLSelectElement).value;
  locale.value = newLocale;
};

const handleLogout = async () => {
  const authService = (await import('../../services/auth')).AuthService.getInstance();
  authService.clearSession();
  router.push('/login');
};

const router = useRouter();
const currentStep = ref(1);
const wizardData = ref<WizardData | null>(null);
const loading = ref(true);
const isApplying = ref(false);
const isComplete = ref(false);
const isAgentComplete = ref(false);
const etaSeconds = ref(120);

const config = ref<WizardConfig>({
  mode: 'router',
  wan: {
    wanMode: ''
  },
  wifi: {
    smartConnect: true,
    mloEnable: true,
    psc: true,
    pmf: false,
    common: {
      ssid: '',
      security: 'WPA3-Personal',
      password: '',
      securityOptions: []
    },
    bands: {
      '2g': { enabled: true, ssid: '', security: 'WPA3-Personal', password: '', securityOptions: [] },
      '5g': { enabled: true, ssid: '', security: 'WPA3-Personal', password: '', securityOptions: [] },
      '6g': { enabled: true, ssid: '', security: 'WPA3-Personal', password: '', securityOptions: [] }
    }
  },
  mesh: {
    enable: true
  },
  admin: {
    username: 'admin',
    password: ''
  }
});

const agentSetupMode = ref<AgentSetupMode>('wps');

const maxSteps = computed(() => {
  if (config.value.mode === 'agent') {
    return 5;
  }
  return 8;
});

onMounted(async () => {
  try {
    wizardData.value = await wizardApi.getWizardInfo();

    const autoFillConfig = wizardApi.transformWizardDataToConfig(wizardData.value);

    if (autoFillConfig.wan) {
      config.value.wan = autoFillConfig.wan;
    }
    if (autoFillConfig.wifi) {
      config.value.wifi = autoFillConfig.wifi;
    }
    if (autoFillConfig.mesh) {
      config.value.mesh = autoFillConfig.mesh;
    }
  } catch (error) {
    console.error('Failed to load wizard data:', error);
  } finally {
    loading.value = false;
  }
});

const nextStep = () => {
  if (currentStep.value < maxSteps.value) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const backToAgentSetup = () => {
  currentStep.value = 3;
};

const handleAgentSuccess = () => {
  isAgentComplete.value = true;
};

const handleModeChange = (mode: 'router' | 'agent') => {
  config.value.mode = mode;
  currentStep.value = 2;
};

const handleAgentSetupModeChange = (mode: AgentSetupMode) => {
  agentSetupMode.value = mode;
};

const submitWizard = async () => {
  try {
    loading.value = true;
    const response = await wizardApi.submitWizardConfig(config.value);

    if (response.WizardRouter.ok) {
      etaSeconds.value = response.WizardRouter.eta_seconds;
      loading.value = false;
      isApplying.value = true;
    } else {
      throw new Error(response.WizardRouter.message);
    }
  } catch (error) {
    console.error('Failed to submit wizard configuration:', error);
    alert('Failed to save configuration. Please try again.');
    loading.value = false;
  }
};

const handleApplyComplete = () => {
  isApplying.value = false;
  isComplete.value = true;
};

const handleFinish = async () => {
  const authService = (await import('../../services/auth')).AuthService.getInstance();
  authService.clearWizardFlag();
  router.push('/dashboard');
};

const getStepComponent = () => {
  if (currentStep.value === 1) return PrivacyPolicy;
  if (currentStep.value === 2) return ModeSelect;

  if (config.value.mode === 'router') {
    switch (currentStep.value) {
      case 3: return RouterEnvironment;
      case 4: return WanModeSelect;
      case 5: return MeshSetup;
      case 6: return WifiSetup;
      case 7: return AdminPassword;
      case 8: return ReviewSettings;
      default: return PrivacyPolicy;
    }
  } else {
    switch (currentStep.value) {
      case 3: return AgentSetup;
      case 4: return AgentProcessing;
      default: return PrivacyPolicy;
    }
  }
};
</script>

<template>
  <div class="wizard-container">
    <header class="wizard-header">
      <div class="logo">Gemtek</div>
      <div class="header-controls">
        <div class="language-select-container">
          <span class="material-icons">language</span>
          <select
            class="language-select"
            :value="locale"
            @change="handleLanguageChange"
          >
            <option v-for="lang in availableLanguages" :key="lang.code" :value="lang.code">
              {{ lang.label }}
            </option>
          </select>
        </div>
        <button class="header-btn">
          <span class="material-icons">person</span>
          {{ username }}
        </button>
        <button class="header-btn" @click="handleLogout">
          <span class="material-icons">logout</span>
          {{ t('header.logout') }}
        </button>
      </div>
    </header>

    <div v-if="loading" class="loading">Loading...</div>

    <div v-else-if="isApplying" class="wizard-content">
      <ApplyingSettings
        :eta-seconds="etaSeconds"
        @complete="handleApplyComplete"
      />
    </div>

    <div v-else-if="isAgentComplete" class="wizard-content">
      <AgentComplete
        :wizard-data="wizardData"
      />
    </div>

    <div v-else-if="isComplete" class="wizard-content">
      <WizardComplete
        :ssid="config.wifi.smartConnect ? config.wifi.common.ssid : config.wifi.bands['2g'].ssid"
        :device-model="wizardData?.ModelName"
        @finish="handleFinish"
      />
    </div>

    <div v-else class="wizard-content">
      <component
        :is="getStepComponent()"
        :config="config"
        :wizard-data="wizardData"
        :agent-setup-mode="agentSetupMode"
        :current-step="currentStep"
        :max-steps="maxSteps"
        @next="nextStep"
        @prev="prevStep"
        @mode-change="handleModeChange"
        @agent-mode-change="handleAgentSetupModeChange"
        @back-to-agent-setup="backToAgentSetup"
        @agent-success="handleAgentSuccess"
        @submit="submitWizard"
      />
    </div>
  </div>
</template>

<style scoped>
.wizard-container {
  width: 100vw;
  height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.wizard-header {
  background: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  flex-shrink: 0;
}

.logo {
  font-size: 1.8rem;
  font-weight: bold;
  color: #0078d4;
}

.header-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.language-select-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
}

.language-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 0.9rem;
  cursor: pointer;
}

.language-select:focus {
  outline: none;
  border-color: #0078d4;
}

.header-btn {
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.header-btn:hover {
  color: #333;
  background-color: #f5f5f5;
}

.material-icons {
  font-size: 20px;
}

.wizard-content {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem;
  overflow-y: auto;
  min-height: 0;
}

.loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #666;
}
</style>
