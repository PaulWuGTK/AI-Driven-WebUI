import apiClient from '../apiClient';
import type {
  WizardData,
  WizardConfig,
  WizardSubmitResponse,
  WizardSubmitData,
  WizardAgentOnboardingRequest,
  WizardAgentStatusResponse,
  WizardAgentEndPageRequest,
  AgentSetupMode
} from '../../types/wizard';
import { wizardMockData } from '../mockData/authMockData';

const isDevelopment = import.meta.env.DEV;

function parseSecurityOptions(optionsString: string): string[] {
  if (!optionsString) return [];
  return optionsString.split(',').map(opt => opt.trim()).filter(opt => opt.length > 0);
}

function transformWizardDataToConfig(data: WizardData): Partial<WizardConfig> {
  const smartConnect = data.WiFi.CommonSSIDEnable === 1;
  const mloEnable = data.WiFi.MLOEnable === 1;

  return {
    wan: {
      wanMode: data.Wan.WANMode || ''
    },
    wifi: {
      smartConnect,
      mloEnable,
      common: {
        ssid: data.WiFi.wifimlo.SSID,
        security: data.WiFi.wifimlo.SecurityMode,
        password: data.WiFi.wifimlo.Password,
        securityOptions: parseSecurityOptions(data.WiFi.wifimlo.SecurityModeAvailable)
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
  return {
    WizardRouter: {
      Wan: {
        WANMode: config.wan.wanMode
      },
      WiFi: {
        CommonSSIDEnable: config.wifi.smartConnect ? 1 : 0,
        MLOEnable: config.wifi.mloEnable ? 1 : 0,
        MeshEnable: config.mesh.enable ? 1 : 0,
        MFPConfig: 1,
        PSC6g: 1,
        wifimlo: {
          Enable: config.wifi.mloEnable ? 1 : 0,
          SSID: config.wifi.common.ssid,
          SecurityMode: config.wifi.common.security,
          Password: config.wifi.common.password
        },
        wifi2g: {
          Enable: config.wifi.bands['2g'].enabled ? 1 : 0,
          SSID: config.wifi.bands['2g'].ssid,
          SecurityMode: config.wifi.bands['2g'].security,
          Password: config.wifi.bands['2g'].password
        },
        wifi5g: {
          Enable: config.wifi.bands['5g'].enabled ? 1 : 0,
          SSID: config.wifi.bands['5g'].ssid,
          SecurityMode: config.wifi.bands['5g'].security,
          Password: config.wifi.bands['5g'].password
        },
        wifi6g: {
          Enable: config.wifi.bands['6g'].enabled ? 1 : 0,
          SSID: config.wifi.bands['6g'].ssid,
          SecurityMode: config.wifi.bands['6g'].security,
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
      const statuses: Array<'Success' | 'Inprogress' | 'Timeout'> = ['Inprogress', 'Inprogress', 'Success'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      return {
        WizardAgent: {
          LinkStatus: randomStatus === 'Success' ? 'Up' : 'Connecting',
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
