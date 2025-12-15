import { apiClient } from '../apiClient';
import type { BackupWANResponse, BackupWANRequest } from '../../types/backupWan';

export const backupWanApi = {
  getConfig: () =>
    apiClient.get<BackupWANResponse>('/API/info?list=BackupWAN'),

  updateConfig: (data: BackupWANRequest) =>
    apiClient.post<BackupWANResponse>('/API/info?list=BackupWAN', data)
};
