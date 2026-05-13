import { callApi } from '../apiClient';
import type { StatusBridgeLanResponse } from '../../types/statusBridgeLan';
import { statusBridgeLanMockData } from '../mockData/statusBridgeLanMockData';
import { isOpenWrtWifiLogoMode } from '../../config/runtimeMode';

const isDevelopment = import.meta.env.DEV || isOpenWrtWifiLogoMode;

export const getStatusBridgeLan = async (): Promise<StatusBridgeLanResponse> => {
  if (isDevelopment) {
    return statusBridgeLanMockData;
  }

  return callApi<StatusBridgeLanResponse>('/API/info?list=StatusBridgeLan');
};
