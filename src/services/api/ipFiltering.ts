import apiClient from '../apiClient';
import type { IpFilteringResponse, IpFilteringRequest } from '../../types/ipFiltering';
import { getIpFilteringMockData, updateIpFilteringMockData } from '../mockData/ipFilteringMockData';

const isDevelopment = import.meta.env.DEV;

export const ipFilteringApi = {
  getConfig: async (): Promise<IpFilteringResponse> => {
    if (isDevelopment) {
      return getIpFilteringMockData();
    }
    return await apiClient.get<IpFilteringResponse>('/API/info?list=IPFiltering');
  },

  updateConfig: async (config: IpFilteringRequest): Promise<unknown> => {
    if (isDevelopment) {
      return updateIpFilteringMockData(config);
    }
    return await apiClient.post<unknown>('/API/info?list=IPFiltering', config);
  }
};
