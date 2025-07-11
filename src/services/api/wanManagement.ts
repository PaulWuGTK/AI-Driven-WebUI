import type { WanModeManagementResponse, WanModeManagementUpdateRequest } from '../../types/wanManagement';
import { handleApiResponse } from '../../utils/apiUtils';
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
    // Update mock data while preserving Status
    wanManagementMockData.WanModeManagement = data.WanModeManagement.map(newConfig => {
      const existingConfig = wanManagementMockData.WanModeManagement.find(
        config => config.WANMode === newConfig.WANMode
      );
      return {
        ...newConfig,
        Status: existingConfig?.Status || 'Enabled'
      };
    });
    return wanManagementMockData;
  }

  const response = await fetch('/API/info?list=WanModeManagement', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleApiResponse<WanModeManagementResponse>(response);
}