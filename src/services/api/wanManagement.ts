import type { WanModeManagementResponse, WanModeManagementUpdateRequest } from '../../types/wanManagement';
import { wanManagementMockData } from '../mockData/wanManagementMockData';
import { callApi } from '../apiClient';

const isDevelopment = import.meta.env.DEV;

export async function getWanModeManagement(): Promise<WanModeManagementResponse> {
  if (isDevelopment) {
    return wanManagementMockData;
  }
  return callApi<WanModeManagementResponse>('/API/info?list=WanModeManagement');
}

export async function updateWanModeManagement(data: WanModeManagementUpdateRequest): Promise<WanModeManagementResponse> {
  if (isDevelopment) {
    wanManagementMockData.WanModeManagement.Profiles = data.WanModeManagement.Profiles.map(newConfig => {
      const existingConfig = wanManagementMockData.WanModeManagement.Profiles.find(
        config => config.WANMode === newConfig.WANMode
      );
      return {
        ...newConfig,
        Status: existingConfig?.Status || 'Enabled'
      };
    });
    return wanManagementMockData;
  }

  return callApi<WanModeManagementResponse>('/API/info?list=WanModeManagement', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
