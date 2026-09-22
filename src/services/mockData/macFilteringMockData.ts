import type { MACFilteringResponse, MACFilteringUpdateRequest } from '../../types/macFiltering';

const mockMACFilteringData: MACFilteringResponse = {
  WifiMACFiltering: {
    Interfaces: [
      {
        Alias: "VAP2G0PRIV",
        InstanceIndex: 1,
        OperatingFrequencyBand: "2.4GHz",
        Path: 'WiFi.AccessPoint.1.',
        SSID: 'Gemtek_prplmesh',
        ACLMode: 'Off',
        MACList: '00:11:22:33:44:55, 00:11:22:33:44:66'
      },
      {
        Alias: "VAP2G0GUEST",
        InstanceIndex: 2,
        OperatingFrequencyBand: "2.4GHz",
        Path: 'WiFi.AccessPoint.2.',
        SSID: 'prplOS-guest',
        ACLMode: 'BlackList',
        MACList: ''
      },
      {
        Alias: "VAP5G0PRIV",
        InstanceIndex: 3,
        OperatingFrequencyBand: "5GHz",
        Path: 'WiFi.AccessPoint.3.',
        SSID: 'Gemtek_prplmesh_5GHz',
        ACLMode: 'WhiteList',
        MACList: 'AA:BB:CC:DD:EE:FF'
      },
      {
        Alias: "VAP5G0GUEST",
        InstanceIndex: 4,
        OperatingFrequencyBand: "5GHz",
        Path: 'WiFi.AccessPoint.4.',
        SSID: 'prplOS-guest',
        ACLMode: 'Off',
        MACList: ''
      },
      {
        Alias: "VAP6G0PRIV",
        InstanceIndex: 5,
        OperatingFrequencyBand: "6GHz",
        Path: 'WiFi.AccessPoint.5.',
        SSID: 'Gemtek_prplmesh_6GHz',
        ACLMode: 'Off',
        MACList: ''
      },
      {
        Alias: "VAP6G0GUEST",
        InstanceIndex: 6,
        OperatingFrequencyBand: "6GHz",
        Path: 'WiFi.AccessPoint.6.',
        SSID: 'prplOS-guest',
        ACLMode: 'Off',
        MACList: ''
      }
    ]
  }
};

export const getMACFilteringMockData = (): MACFilteringResponse => mockMACFilteringData;

export const updateMACFilteringMockData = (
  data: MACFilteringUpdateRequest
): MACFilteringResponse => {
  // Update mock entries by matching Alias
  for (const update of data.WifiMACFiltering.Interfaces) {
    const existing = mockMACFilteringData.WifiMACFiltering.Interfaces.find(
      (e) => e.Alias === update.Alias
    );
    if (existing) {
      existing.ACLMode = update.ACLMode;
      existing.MACList = update.MACList;
    }
  }

  return mockMACFilteringData;
};
