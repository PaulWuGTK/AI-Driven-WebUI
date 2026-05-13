import apiClient from '../apiClient';
import type { IpFilteringResponse, IpFilteringRequest } from '../../types/ipFiltering';
import { getIpFilteringMockData, updateIpFilteringMockData } from '../mockData/ipFilteringMockData';
import { toFlag01 } from '../flag01';
import { isOpenWrtWifiLogoMode } from '../../config/runtimeMode';

const isDevelopment = import.meta.env.DEV || isOpenWrtWifiLogoMode;

export const ipFilteringApi = {
  getConfig: async (): Promise<IpFilteringResponse> => {
    if (isDevelopment) {
      return getIpFilteringMockData();
    }
    const response = await apiClient.get<IpFilteringResponse>('/API/info?list=IPFiltering');
    return {
      ...response,
      IPFiltering: {
        ...response.IPFiltering,
        Enable: toFlag01(
          response.IPFiltering.Enable,
          0,
          { endpoint: '/API/info?list=IPFiltering', path: 'IPFiltering.Enable' }
        ),
      }
    };
  },

  updateConfig: async (config: IpFilteringRequest): Promise<unknown> => {
    const normalized: IpFilteringRequest = {
      IPFiltering: {
        ...config.IPFiltering,
        Enable: toFlag01(
          config.IPFiltering.Enable,
          0,
          { endpoint: '/API/info?list=IPFiltering', path: 'IPFiltering.Enable' }
        ),
      }
    };
    if (isDevelopment) {
      return updateIpFilteringMockData(normalized);
    }
    return await apiClient.post<unknown>('/API/info?list=IPFiltering', normalized);
  }
};
