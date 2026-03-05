import type {
  ExtenderConnectRequest,
  ExtenderResponse,
  ExtenderScanResponse,
  ExtenderUpdateRequest
} from '../../types/extender';

const mockExtenderData: ExtenderResponse = {
  Extender: {
    ExtenderEnabled: {
      Enabled: 0
    },
    ExtenderRole: {
      Role: 'Repeater'
    },
    ConnectionStatus: {
      '2.4GHz': {
        Status: 'disconnected',
        SSID: '-',
        Security: '-'
      },
      '5GHz': {
        Status: 'connected',
        SSID: 'Gemtek_workshop_2025',
        Security: 'WPA2-WPA3-Personal'
      },
      '6GHz': {
        Status: 'disconnected',
        SSID: '-',
        Security: '-'
      }
    },
    Wps: {
      WpsPinCode: '12345678'
    }
  }
};

const mockExtenderScanData: ExtenderScanResponse = {
  ExtenderScan: [
    {
      SSID: 'GJ1900_5G',
      Channel: 48,
      Band: '5GHz',
      Signal: '-54',
      Security: 'WPA2-Personal'
    },
    {
      SSID: 'GJ1900_2G',
      Channel: 1,
      Band: '2.4GHz',
      Signal: '-54',
      Security: 'WPA2-Personal'
    },
    {
      SSID: 'Gemtek_Wi-Fi7_6G_02918E',
      Channel: 1,
      Band: '6GHz',
      Signal: '-54',
      Security: 'WPA3-Personal'
    }
  ]
};

export const getExtenderMockData = (): ExtenderResponse => mockExtenderData;

export const updateExtenderMockData = (data: ExtenderUpdateRequest): ExtenderResponse => {
  if (data.Extender.Action === 'ExtenderEnable' && data.Extender.Enabled !== undefined) {
    mockExtenderData.Extender.ExtenderEnabled.Enabled = data.Extender.Enabled;
  }

  if (data.Extender.Role) {
    mockExtenderData.Extender.ExtenderRole.Role = data.Extender.Role;
  }

  return mockExtenderData;
};

export const getExtenderScanMockData = (): ExtenderScanResponse => mockExtenderScanData;

export const connectExtenderMockData = (data: ExtenderConnectRequest): ExtenderResponse => {
  const band = data.Extender.Band;
  if (band === '2.4GHz' || band === '5GHz' || band === '6GHz') {
    mockExtenderData.Extender.ConnectionStatus[band] = {
      Status: 'connected',
      SSID: data.Extender.SSID,
      Security: data.Extender.Security
    };
  }

  return mockExtenderData;
};

export const triggerWpsMockData = (): ExtenderResponse => mockExtenderData;
