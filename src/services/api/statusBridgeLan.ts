import { callApi } from '../apiClient';
import type { StatusBridgeLanResponse } from '../../types/statusBridgeLan';
import { statusBridgeLanMockData } from '../mockData/statusBridgeLanMockData';

const isDevelopment = import.meta.env.DEV;

export const getStatusBridgeLan = async (): Promise<StatusBridgeLanResponse> => {
  if (isDevelopment) {
    return statusBridgeLanMockData;
  }

  return callApi<StatusBridgeLanResponse>('/API/info?list=StatusBridgeLan');
};
