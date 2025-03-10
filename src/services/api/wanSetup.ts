import type { WanModeSetupResponse, WanModeSetupUpdateRequest } from '../../types/wanSetup';
import { handleApiResponse } from '../../utils/apiUtils';
import { wanModeSetupMockData } from '../mockData/wanSetupMockData';

const isDevelopment = import.meta.env.DEV;

export async function getWanModeSetup(): Promise<WanModeSetupResponse> {
  if (isDevelopment) {
    return wanModeSetupMockData;
  }
  const response = await fetch('/API/info?list=WanModeSetup');
  return handleApiResponse<WanModeSetupResponse>(response);
}

export async function updateWanModeSetup(data: WanModeSetupUpdateRequest): Promise<WanModeSetupResponse> {
  if (isDevelopment) {
    // Update mock data
    wanModeSetupMockData.WanModeSetup = {
      ...wanModeSetupMockData.WanModeSetup,
      ...data.WanModeSetup
    };
    return wanModeSetupMockData;
  }

  const response = await fetch('/API/info?list=WanModeSetup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleApiResponse<WanModeSetupResponse>(response);
}