import apiClient from '../apiClient';
import type {
  RemoteSyslogResponse,
  RemoteSyslogUpdateRequest,
  RemoteSyslogApiResponse,
} from '../../types/remoteSyslog';
import { remoteSyslogMockData } from '../mockData/remoteSyslogMockData';

const isDevelopment = import.meta.env.DEV;

export const remoteSyslogApi = {
  async getConfig(): Promise<RemoteSyslogResponse> {
    if (isDevelopment) {
      return Promise.resolve(remoteSyslogMockData);
    }
    return apiClient.get<RemoteSyslogResponse>('/API/info?list=DeviceSyslogAction');
  },

  async updateConfig(data: RemoteSyslogUpdateRequest): Promise<RemoteSyslogApiResponse> {
    if (isDevelopment) {
      // Update mock data in-place for dev mode
      console.log('Mock update:', data);
      // Return unwrapped success response (following Ddns.lua pattern)
      return Promise.resolve({
        messages_remote: { LogRemote: { Enable: 0, Address: '', Port: 514, Protocol: 'UDP', Status: 'Disabled' } },
        wifi: { LogRemote: { Enable: 0, Address: '', Port: 514, Protocol: 'UDP', Status: 'Disabled' } },
        hostapd: { LogRemote: { Enable: 0, Address: '', Port: 514, Protocol: 'UDP', Status: 'Disabled' } },
      });
    }
    return apiClient.post<RemoteSyslogApiResponse>('/API/info?list=DeviceSyslogAction', data);
  },
};
