import type { LcmMonitorResponse } from '../../types/lcmMonitor';
import { callApi } from '../apiClient';
import { getLcmMonitorMockData } from '../mockData/lcmMonitorMockData';

const isDevelopment = import.meta.env.DEV;

export const getLcmMonitorInfo = async (): Promise<LcmMonitorResponse> => {
  if (isDevelopment) {
    return getLcmMonitorMockData();
  }
  return callApi<LcmMonitorResponse>('/API/info?list=AdvancedLcmMonitor');
};
