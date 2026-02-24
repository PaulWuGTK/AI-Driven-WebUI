import apiClient from '../apiClient';
import type { IpFilteringResponse, IpFilteringRequest } from '../../types/ipFiltering';

export const ipFilteringApi = {
  getConfig: async (): Promise<IpFilteringResponse> => {
    return await apiClient.get<IpFilteringResponse>('/API/info?list=IPFiltering');
  },

  updateConfig: async (config: IpFilteringRequest): Promise<unknown> => {
    return await apiClient.post<unknown>('/API/info?list=IPFiltering', config);
  }
};
