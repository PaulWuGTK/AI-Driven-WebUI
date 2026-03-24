import apiClient from '../apiClient';
import type { PortForwardingResponse, PortForwardingUpdateRequest, PortForwardingApiResponse } from '../../types/portForwarding';
import { portForwardingMockData } from '../mockData/portForwardingMockData';

const isDevelopment = import.meta.env.DEV;
const toFlag01 = (value: unknown): 0 | 1 =>
  value === 1 || value === '1' || value === true ? 1 : 0;

export const portForwardingApi = {
  async getConfig(): Promise<PortForwardingResponse> {
    if (isDevelopment) {
      return Promise.resolve(portForwardingMockData);
    }
    const response = await apiClient.get<PortForwardingResponse>('/API/info?list=PortForwarding');
    return {
      ...response,
      PortForwarding: {
        ...response.PortForwarding,
        PortForwardList: (response.PortForwarding.PortForwardList || []).map(rule => ({
          ...rule,
          Enable: toFlag01(rule.Enable),
        }))
      }
    };
  },

  async updateConfig(data: PortForwardingUpdateRequest): Promise<PortForwardingApiResponse> {
    const normalized: PortForwardingUpdateRequest = {
      PortForwarding: {
        ...data.PortForwarding,
        PortForwardList: (data.PortForwarding.PortForwardList || []).map(rule => ({
          ...rule,
          Enable: toFlag01(rule.Enable),
        }))
      }
    };
    if (isDevelopment) {
      portForwardingMockData.PortForwarding.PortForwardList = normalized.PortForwarding.PortForwardList;
      return Promise.resolve({ PortForwarding: { OK: 'Success' } });
    }
    return apiClient.post<PortForwardingApiResponse>('/API/info?list=PortForwarding', normalized);
  }
};
