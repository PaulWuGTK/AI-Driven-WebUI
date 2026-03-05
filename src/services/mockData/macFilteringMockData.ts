import type { MACFilteringResponse, MACFilteringUpdateRequest } from '../../types/macFiltering';

const mockMACFilteringData: MACFilteringResponse = {
  MACFiltering: {
    wifi2g: [
      {
        Path: 'WiFi.AccessPoint.1.',
        SSID: 'Gemtek_prplmesh',
        ACLMode: 'Off',
        MACList: '00:11:22:33:44:55, 00:11:22:33:44:66'
      },
      {
        Path: 'WiFi.AccessPoint.2.',
        SSID: 'prplOS-guest',
        ACLMode: 'BlackList',
        MACList: ''
      }
    ],
    wifi5g: [
      {
        Path: 'WiFi.AccessPoint.3.',
        SSID: 'Gemtek_prplmesh_5GHz',
        ACLMode: 'WhiteList',
        MACList: 'AA:BB:CC:DD:EE:FF'
      },
      {
        Path: 'WiFi.AccessPoint.4.',
        SSID: 'prplOS-guest',
        ACLMode: 'Off',
        MACList: ''
      }
    ],
    wifi6g: [
      {
        Path: 'WiFi.AccessPoint.5.',
        SSID: 'Gemtek_prplmesh_6GHz',
        ACLMode: 'Off',
        MACList: ''
      },
      {
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
  mockMACFilteringData.MACFiltering = {
    wifi2g: [...data.MACFiltering.wifi2g],
    wifi5g: [...data.MACFiltering.wifi5g],
    wifi6g: [...data.MACFiltering.wifi6g]
  };

  return mockMACFilteringData;
};
