import apiClient from '../apiClient';
import { isOpenWrtWifiLogoMode } from '../../config/runtimeMode';
import type {
  WizardData,
  WizardConfig,
  WizardSubmitResponse,
  WizardSubmitData,
  WizardSkipData,
  WizardAgentOnboardingRequest,
  WizardAgentStatusResponse,
  WizardAgentEndPageRequest,
  AgentSetupMode
} from '../../types/wizard';
import { wizardMockData } from '../mockData/authMockData';

const isDevelopment = import.meta.env.DEV || isOpenWrtWifiLogoMode;
const SECURITY_FALLBACK_PRIORITY = [
  'WPA3-Personal',
  'WPA2-WPA3-Personal',
  'WPA2/WPA3-Personal',
  'WPA2-Personal',
  'OWE',
  'None'
];

function parseSecurityOptions(optionsString: string): string[] {
  if (!optionsString) return [];
  return optionsString.split(',').map(opt => opt.trim()).filter(opt => opt.length > 0);
}

function pickSupportedSecurityMode(requested: string, options: string[]): string {
  if (!options || options.length === 0) {
    return requested;
  }

  if (options.includes(requested)) {
    return requested;
  }

  const priorityMatch = SECURITY_FALLBACK_PRIORITY.find((mode) => options.includes(mode));
  return priorityMatch ?? options[0];
}

function transformWizardDataToConfig(data: WizardData): Partial<WizardConfig> {
  const smartConnect = data.WiFi.CommonSSIDEnable === 1;
  const mloEnable = data.WiFi.MLOEnable === 1;
  const psc = data.WiFi.PSC6g === 1;
  const pmf = data.WiFi.MFPConfig === 1;

  return {
    wan: {
      wanMode: data.Wan.WANMode || ''
    },
    wifi: {
      smartConnect,
      mloEnable,
      psc,
      pmf,
      common: {
        ssid: data.WiFi.wificommon.SSID,
        security: data.WiFi.wificommon.SecurityMode,
        password: data.WiFi.wificommon.Password,
        securityOptions: parseSecurityOptions(data.WiFi.wificommon.SecurityModeAvailable)
      },
      bands: {
        '2g': {
          enabled: data.WiFi.wifi2g.Enable === 1,
          ssid: data.WiFi.wifi2g.SSID,
          security: data.WiFi.wifi2g.SecurityMode,
          password: data.WiFi.wifi2g.Password,
          securityOptions: parseSecurityOptions(data.WiFi.wifi2g.SecurityModeAvailable)
        },
        '5g': {
          enabled: data.WiFi.wifi5g.Enable === 1,
          ssid: data.WiFi.wifi5g.SSID,
          security: data.WiFi.wifi5g.SecurityMode,
          password: data.WiFi.wifi5g.Password,
          securityOptions: parseSecurityOptions(data.WiFi.wifi5g.SecurityModeAvailable)
        },
        '6g': {
          enabled: data.WiFi.wifi6g.Enable === 1,
          ssid: data.WiFi.wifi6g.SSID,
          security: data.WiFi.wifi6g.SecurityMode,
          password: data.WiFi.wifi6g.Password,
          securityOptions: parseSecurityOptions(data.WiFi.wifi6g.SecurityModeAvailable)
        }
      }
    },
    mesh: {
      enable: data.WiFi.MeshEnable === 1
    }
  };
}

function transformConfigToSubmitData(config: WizardConfig): WizardSubmitData {
  const requestedCommonSecurity = config.wifi.common.security;
  const commonSecurity = pickSupportedSecurityMode(
    requestedCommonSecurity,
    config.wifi.common.securityOptions
  );
  const security2g = pickSupportedSecurityMode(
    config.wifi.smartConnect ? requestedCommonSecurity : config.wifi.bands['2g'].security,
    config.wifi.bands['2g'].securityOptions
  );
  const security5g = pickSupportedSecurityMode(
    config.wifi.smartConnect ? requestedCommonSecurity : config.wifi.bands['5g'].security,
    config.wifi.bands['5g'].securityOptions
  );
  const security6g = pickSupportedSecurityMode(
    config.wifi.smartConnect ? requestedCommonSecurity : config.wifi.bands['6g'].security,
    config.wifi.bands['6g'].securityOptions
  );

  return {
    WizardRouter: {
      Action: 'Config',
      Wan: {
        WANMode: config.wan.wanMode
      },
      WiFi: {
        CommonSSIDEnable: config.wifi.smartConnect ? 1 : 0,
        MLOEnable: config.wifi.mloEnable ? 1 : 0,
        MeshEnable: config.mesh.enable ? 1 : 0,
        MFPConfig: config.wifi.pmf ? 1 : 0,
        PSC6g: config.wifi.psc ? 1 : 0,
        wificommon: {
          Enable: config.wifi.smartConnect ? 1 : 0,
          SSID: config.wifi.common.ssid,
          SecurityMode: commonSecurity,
          Password: config.wifi.common.password
        },
        wifi2g: {
          Enable: config.wifi.bands['2g'].enabled ? 1 : 0,
          SSID: config.wifi.bands['2g'].ssid,
          SecurityMode: security2g,
          Password: config.wifi.bands['2g'].password
        },
        wifi5g: {
          Enable: config.wifi.bands['5g'].enabled ? 1 : 0,
          SSID: config.wifi.bands['5g'].ssid,
          SecurityMode: security5g,
          Password: config.wifi.bands['5g'].password
        },
        wifi6g: {
          Enable: config.wifi.bands['6g'].enabled ? 1 : 0,
          SSID: config.wifi.bands['6g'].ssid,
          SecurityMode: security6g,
          Password: config.wifi.bands['6g'].password
        }
      },
      Admin: {
        Username: config.admin.username,
        Password: config.admin.password
      }
    }
  };
}

export const wizardApi = {
  async getWizardInfo(): Promise<WizardData> {
    if (isDevelopment) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return wizardMockData.WizardRouter;
    }
    const response = await apiClient.get<{ WizardRouter: WizardData }>('/API/info?list=WizardRouter');
    return response.WizardRouter;
  },

  transformWizardDataToConfig,

  async submitWizardConfig(config: WizardConfig): Promise<WizardSubmitResponse> {
    const submitData = transformConfigToSubmitData(config);

    if (isDevelopment) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Wizard config submitted:', submitData);
      return {
        WizardRouter: {
          ok: true,
          message: 'WAN mode applied; Wi-Fi/Mesh/Admin pending (dummy).',
          job_id: 'wiz-' + Date.now(),
          eta_seconds: 120
        }
      };
    }
    return await apiClient.post<WizardSubmitResponse>('/API/info?list=WizardRouter', submitData);
  },

  async skipWizard(): Promise<WizardSubmitResponse> {
    const skipData: WizardSkipData = {
      WizardRouter: {
        Action: 'Skip'
      }
    };

    if (isDevelopment) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Wizard skipped:', skipData);
      return {
        WizardRouter: {
          ok: true,
          message: 'Wizard skipped, switched to Gateway mode.',
          job_id: 'skip-' + Date.now(),
          eta_seconds: 30
        }
      };
    }
    return await apiClient.post<WizardSubmitResponse>('/API/info?list=WizardRouter', skipData);
  },

  async startAgentOnboarding(method: AgentSetupMode): Promise<void> {
    const requestData: WizardAgentOnboardingRequest = {
      WizardAgent: {
        Action: 'Onboarding',
        Method: method === 'wps' ? 'WPS' : 'Ethernet'
      }
    };

    if (isDevelopment) {
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Agent onboarding started:', requestData);
      return;
    }
    await apiClient.post('/API/info?list=WizardAgent', requestData);
  },

  async getAgentStatus(): Promise<WizardAgentStatusResponse> {
    if (isDevelopment) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const statuses: Array<'Success' | 'Inprogress'> = ['Inprogress', 'Inprogress', 'Success'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const linkStatuses: Array<'Up' | 'Down'> = ['Up', 'Down'];
      const randomLink = linkStatuses[Math.floor(Math.random() * linkStatuses.length)];
      return {
        WizardAgent: {
          LinkStatus: randomLink,
          OnboardingStatus: randomStatus
        }
      };
    }
    return await apiClient.get<WizardAgentStatusResponse>('/API/info?list=WizardAgent');
  },

  async completeAgentSetup(): Promise<void> {
    const requestData: WizardAgentEndPageRequest = {
      WizardAgent: {
        Action: 'EndPage'
      }
    };

    if (isDevelopment) {
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Agent setup completed:', requestData);
      return;
    }
    await apiClient.post('/API/info?list=WizardAgent', requestData);
  }
};
