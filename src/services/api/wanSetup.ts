import type { WanModeSetupResponse, WanModeSetupUpdateRequest } from '../../types/wanSetup';
import { callApi } from '../apiClient';
import { wanModeSetupMockData } from '../mockData/wanSetupMockData';
import { isOpenWrtWifiLogoMode } from '../../config/runtimeMode';

const isDevelopment = import.meta.env.DEV || isOpenWrtWifiLogoMode;

export async function getWanModeSetup(): Promise<WanModeSetupResponse> {
  if (isDevelopment) {
    return wanModeSetupMockData;
  }
  return callApi<WanModeSetupResponse>('/API/info?list=WanModeSetup');
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

  return callApi<WanModeSetupResponse>('/API/info?list=WanModeSetup', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
