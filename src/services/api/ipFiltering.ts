import apiClient from '../apiClient';
import type { IpFilteringResponse, IpFilteringRequest } from '../../types/ipFiltering';
import { getIpFilteringMockData, updateIpFilteringMockData } from '../mockData/ipFilteringMockData';

const isDevelopment = import.meta.env.DEV;
const toFlag01 = (value: unknown): 0 | 1 =>
  value === 1 || value === '1' || value === true ? 1 : 0;

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
        Enable: toFlag01(response.IPFiltering.Enable),
      }
    };
  },

  updateConfig: async (config: IpFilteringRequest): Promise<unknown> => {
    const normalized: IpFilteringRequest = {
      IPFiltering: {
        ...config.IPFiltering,
        Enable: toFlag01(config.IPFiltering.Enable),
      }
    };
    if (isDevelopment) {
      return updateIpFilteringMockData(normalized);
    }
    return await apiClient.post<unknown>('/API/info?list=IPFiltering', normalized);
  }
};
