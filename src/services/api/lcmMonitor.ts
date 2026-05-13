import type { LcmMonitorResponse } from '../../types/lcmMonitor';
import { callApi } from '../apiClient';
import { getLcmMonitorMockData } from '../mockData/lcmMonitorMockData';
import { isOpenWrtWifiLogoMode } from '../../config/runtimeMode';

const isDevelopment = import.meta.env.DEV || isOpenWrtWifiLogoMode;

export const getLcmMonitorInfo = async (): Promise<LcmMonitorResponse> => {
  if (isDevelopment) {
    return getLcmMonitorMockData();
  }
  return callApi<LcmMonitorResponse>('/API/info?list=AdvancedLcmMonitor');
};
