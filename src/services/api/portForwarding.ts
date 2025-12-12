import apiClient from '../apiClient';
import type { PortForwardingResponse, PortForwardingUpdateRequest, PortForwardingApiResponse } from '../../types/portForwarding';
import { portForwardingMockData } from '../mockData/portForwardingMockData';

const isDevelopment = import.meta.env.DEV;

export const portForwardingApi = {
  async getConfig(): Promise<PortForwardingResponse> {
    if (isDevelopment) {
      return Promise.resolve(portForwardingMockData);
    }
    return apiClient.get<PortForwardingResponse>('/API/info?list=PortForwarding');
  },

  async updateConfig(data: PortForwardingUpdateRequest): Promise<PortForwardingApiResponse> {
    if (isDevelopment) {
      portForwardingMockData.PortForwarding.PortForwardList = data.PortForwarding.PortForwardList;
      return Promise.resolve({ PortForwarding: { OK: 'Success' } });
    }
    return apiClient.post<PortForwardingApiResponse>('/API/info?list=PortForwarding', data);
  }
};
