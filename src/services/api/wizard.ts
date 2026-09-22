import apiClient from '../apiClient';
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

const isDevelopment = import.meta.env.DEV;
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
  const group = data.WiFi.IntfGroup?.[0];
  const smartConnect = group?.CommonSSIDEnable === 1;
  const mloEnable = group?.MLOEnable === 1;
  const psc = data.WiFi.PSC6g === 1;
  const pmf = data.WiFi.MFPConfig === 1;

  const findIface = (freq: string) => group?.Interface?.find(i => i.OperatingFrequencyBand === freq);
  const iface2g = findIface('2.4GHz');
  const iface5g = findIface('5GHz');
  const iface6g = findIface('6GHz');

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
        ssid: group?.SSID ?? '',
        security: group?.SecurityMode ?? '',
        password: group?.KeyPassPhrase ?? '',
        securityOptions: parseSecurityOptions(group?.SecurityModeAvailable ?? '')
      },
      bands: {
        '2g': {
          enabled: iface2g?.Enable === 1,
          ssid: iface2g?.SSID ?? '',
          security: iface2g?.SecurityMode ?? '',
          password: iface2g?.KeyPassPhrase ?? '',
          securityOptions: parseSecurityOptions(iface2g?.SecurityModeAvailable ?? '')
        },
        '5g': {
          enabled: iface5g?.Enable === 1,
          ssid: iface5g?.SSID ?? '',
          security: iface5g?.SecurityMode ?? '',
          password: iface5g?.KeyPassPhrase ?? '',
          securityOptions: parseSecurityOptions(iface5g?.SecurityModeAvailable ?? '')
        },
        '6g': {
          enabled: iface6g?.Enable === 1,
          ssid: iface6g?.SSID ?? '',
          security: iface6g?.SecurityMode ?? '',
          password: iface6g?.KeyPassPhrase ?? '',
          securityOptions: parseSecurityOptions(iface6g?.SecurityModeAvailable ?? '')
        }
      }
    },
    mesh: {
      enable: data.WiFi.MeshEnable === 1
    },
    timezone: {
      currentTimezone: data.TimeZone?.CurrentTimezone || ''
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
        MeshEnable: config.mesh.enable ? 1 : 0,
        MFPConfig: config.wifi.pmf ? 1 : 0,
        PSC6g: config.wifi.psc ? 1 : 0,
        IntfGroup: [{
          Enable: config.wifi.smartConnect ? 1 : 0,
          SSID: config.wifi.common.ssid,
          SecurityMode: commonSecurity,
          KeyPassPhrase: config.wifi.common.password,
          CommonSSIDEnable: config.wifi.smartConnect ? 1 : 0,
          MLOEnable: config.wifi.mloEnable ? 1 : 0,
          Interface: [
            {
              Alias: 'WIFI_2G',
              Enable: config.wifi.bands['2g'].enabled ? 1 : 0,
              SSID: config.wifi.bands['2g'].ssid,
              SecurityMode: security2g,
              KeyPassPhrase: config.wifi.bands['2g'].password
            },
            {
              Alias: 'WIFI_5G',
              Enable: config.wifi.bands['5g'].enabled ? 1 : 0,
              SSID: config.wifi.bands['5g'].ssid,
              SecurityMode: security5g,
              KeyPassPhrase: config.wifi.bands['5g'].password
            },
            {
              Alias: 'WIFI_6G',
              Enable: config.wifi.bands['6g'].enabled ? 1 : 0,
              SSID: config.wifi.bands['6g'].ssid,
              SecurityMode: security6g,
              KeyPassPhrase: config.wifi.bands['6g'].password
            }
          ]
        }]
      },
      Admin: {
        Username: config.admin.username,
        Password: config.admin.password
      },
      TimeZone: {
        CurrentTimezone: config.timezone.currentTimezone
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
