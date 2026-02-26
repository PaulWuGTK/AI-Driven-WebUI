import apiClient from '../apiClient';
import type { IpFilteringResponse, IpFilteringRequest } from '../../types/ipFiltering';

const isDevelopment = import.meta.env.DEV;

const mockIpFilteringData: IpFilteringResponse = {
  IPFiltering: {
    Enable: false,
    ProtoList: ['TCP', 'UDP', 'Both'],
    BlackList: [
      {
        No: 1,
        IPStart: '192.168.1.100',
        IPEnd: '192.168.1.120',
        Protocol: 'Both',
        Comment: 'Blocked local range',
      },
    ],
    WhiteList: [],
  },
};

const cloneMockData = (): IpFilteringResponse =>
  JSON.parse(JSON.stringify(mockIpFilteringData));

export const ipFilteringApi = {
  getConfig: async (): Promise<IpFilteringResponse> => {
    if (isDevelopment) {
      return cloneMockData();
    }
    return await apiClient.get<IpFilteringResponse>('/API/info?list=IPFiltering');
  },

  updateConfig: async (config: IpFilteringRequest): Promise<unknown> => {
    if (isDevelopment) {
      mockIpFilteringData.IPFiltering = {
        Enable: config.IPFiltering.Enable,
        ProtoList: [...mockIpFilteringData.IPFiltering.ProtoList],
        BlackList: config.IPFiltering.BlackList.map((entry) => ({ ...entry })),
        WhiteList: config.IPFiltering.WhiteList.map((entry) => ({ ...entry })),
      };
      return cloneMockData();
    }
    return await apiClient.post<unknown>('/API/info?list=IPFiltering', config);
  }
};
