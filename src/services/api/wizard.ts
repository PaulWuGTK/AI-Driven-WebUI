import apiClient from '../apiClient';
import type { WizardData, WizardConfig, WizardSubmitResponse, WizardSubmitData } from '../../types/wizard';
import { wizardMockData } from '../mockData/authMockData';

const isDevelopment = import.meta.env.DEV;

function parseSecurityOptions(optionsString: string): string[] {
  if (!optionsString) return [];
  return optionsString.split(',').map(opt => opt.trim()).filter(opt => opt.length > 0);
}

function transformWizardDataToConfig(data: WizardData): Partial<WizardConfig> {
  const smartConnect = data.wifi.CommonSSIDEnable === 1;
  const mloEnable = data.wifi.MLOEnable === 1;

  return {
    wan: {
      wanMode: data.WANMode || ''
    },
    wifi: {
      smartConnect,
      mloEnable,
      common: {
        ssid: data.wifi.wifimlo.SSID,
        security: data.wifi.wifimlo.SecurityMode,
        password: data.wifi.wifimlo.Password,
        securityOptions: parseSecurityOptions(data.wifi.wifimlo.SecurityModeAvailable)
      },
      bands: {
        '2g': {
          enabled: data.wifi.wifi2g.Enable === 1,
          ssid: data.wifi.wifi2g.SSID,
          security: data.wifi.wifi2g.SecurityMode,
          password: data.wifi.wifi2g.Password,
          securityOptions: parseSecurityOptions(data.wifi.wifi2g.SecurityModeAvailable)
        },
        '5g': {
          enabled: data.wifi.wifi5g.Enable === 1,
          ssid: data.wifi.wifi5g.SSID,
          security: data.wifi.wifi5g.SecurityMode,
          password: data.wifi.wifi5g.Password,
          securityOptions: parseSecurityOptions(data.wifi.wifi5g.SecurityModeAvailable)
        },
        '6g': {
          enabled: data.wifi.wifi6g.Enable === 1,
          ssid: data.wifi.wifi6g.SSID,
          security: data.wifi.wifi6g.SecurityMode,
          password: data.wifi.wifi6g.Password,
          securityOptions: parseSecurityOptions(data.wifi.wifi6g.SecurityModeAvailable)
        }
      }
    },
    mesh: {
      enable: data.MeshEnable === 1
    }
  };
}

function transformConfigToSubmitData(config: WizardConfig): WizardSubmitData {
  return {
    Wizard: {
      mode: config.mode,
      wan: {
        wanMode: config.wan.wanMode
      },
      wifi: {
        smartConnect: config.wifi.smartConnect ? 1 : 0,
        MLOEnable: config.wifi.mloEnable ? 1 : 0,
        common: {
          Enable: config.wifi.smartConnect ? 1 : 0,
          SSID: config.wifi.common.ssid,
          SecurityMode: config.wifi.common.security,
          Password: config.wifi.common.password
        },
        bands: {
          '2g': {
            Enable: config.wifi.bands['2g'].enabled ? 1 : 0,
            SSID: config.wifi.bands['2g'].ssid,
            SecurityMode: config.wifi.bands['2g'].security,
            Password: config.wifi.bands['2g'].password
          },
          '5g': {
            Enable: config.wifi.bands['5g'].enabled ? 1 : 0,
            SSID: config.wifi.bands['5g'].ssid,
            SecurityMode: config.wifi.bands['5g'].security,
            Password: config.wifi.bands['5g'].password
          },
          '6g': {
            Enable: config.wifi.bands['6g'].enabled ? 1 : 0,
            SSID: config.wifi.bands['6g'].ssid,
            SecurityMode: config.wifi.bands['6g'].security,
            Password: config.wifi.bands['6g'].password
          }
        }
      },
      mesh: {
        MeshEnable: config.mesh.enable ? 1 : 0
      },
      admin: {
        username: config.admin.username,
        password: config.admin.password
      }
    }
  };
}

export const wizardApi = {
  async getWizardInfo(): Promise<WizardData> {
    if (isDevelopment) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return wizardMockData.Wizard;
    }
    const response = await apiClient.get<{ Wizard: WizardData }>('/API/info?list=Wizard');
    return response.Wizard;
  },

  transformWizardDataToConfig,

  async submitWizardConfig(config: WizardConfig): Promise<WizardSubmitResponse> {
    const submitData = transformConfigToSubmitData(config);

    if (isDevelopment) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Wizard config submitted:', submitData);
      return {
        Wizard: {
          ok: true,
          message: 'WAN mode applied; Wi-Fi/Mesh/Admin pending (dummy).',
          job_id: 'wiz-' + Date.now(),
          eta_seconds: 120
        }
      };
    }
    return await apiClient.post<WizardSubmitResponse>('/API/info?list=Wizard', submitData);
  }
};
