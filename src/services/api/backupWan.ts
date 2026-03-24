import { apiClient } from '../apiClient';
import type { BackupWANResponse, BackupWANRequest } from '../../types/backupWan';

const toFlag01 = (value: unknown): 0 | 1 =>
  value === 1 || value === '1' || value === true ? 1 : 0;

export const backupWanApi = {
  getConfig: async () => {
    const response = await apiClient.get<BackupWANResponse>('/API/info?list=BackupWAN');
    if (!response?.BackupWAN) return response;
    return {
      ...response,
      BackupWAN: {
        ...response.BackupWAN,
        Enable: toFlag01(response.BackupWAN.Enable),
        WHCEnable: toFlag01(response.BackupWAN.WHCEnable),
      }
    };
  },

  updateConfig: (data: BackupWANRequest) => {
    const normalized: BackupWANRequest = {
      BackupWAN: {
        ...data.BackupWAN,
        Enable: toFlag01(data.BackupWAN.Enable),
        WHCEnable: toFlag01(data.BackupWAN.WHCEnable),
      }
    };
    return apiClient.post<BackupWANResponse>('/API/info?list=BackupWAN', normalized);
  }
};
