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
      console.log('Mock update:', data);
      return Promise.resolve({ ...remoteSyslogMockData.DeviceSyslogAction });
    }
    // Wrap in DeviceSyslogAction for HTTP handler to unwrap before passing to Lua
    return apiClient.post<RemoteSyslogApiResponse>(
      '/API/info?list=DeviceSyslogAction',
      { DeviceSyslogAction: data }
    );
  },
};
